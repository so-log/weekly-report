"use client";

import type React from "react";
import { createContext, useEffect, useState } from "react";
import { authApi, ApiError } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "manager";
  team_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    teamId?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<
  (AuthContextType & { setUser: (user: User) => void }) | undefined
>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 인증 데이터 정리 함수
  const clearAuth = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("login_time");
    localStorage.removeItem("last_notification_check");
    setUser(null);
  };

  useEffect(() => {
    // 최초 마운트 시에만 실행
    if (user === null) {
      const token = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          clearAuth();
        }
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // 기본값 설정
        const userWithDefaults = {
          ...userData,
          role: userData.role || "user",
          team_id: userData.team_id || null,
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(userWithDefaults));
        localStorage.setItem("login_time", Date.now().toString());
        setUser(userWithDefaults);
      } else {
        throw new Error(response.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // API 응답에서 메시지를 가져오거나 기본 메시지 사용
        const message =
          error.response?.message || error.message || "로그인에 실패했습니다.";
        throw new Error(message);
      }
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    teamId?: string
  ) => {
    try {
      const response = await authApi.register(email, password, name, teamId);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // 기본값 설정
        const userWithDefaults = {
          ...userData,
          role: userData.role || "user",
          team_id: userData.team_id || null,
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(userWithDefaults));
        setUser(userWithDefaults);
      } else {
        throw new Error(response.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // API 응답에서 메시지를 가져오거나 기본 메시지 사용
        const message =
          error.response?.message ||
          error.message ||
          "회원가입에 실패했습니다.";
        throw new Error(message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // 로그아웃 API 실패해도 로컬 데이터는 정리
      console.error("Logout API failed:", error);
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, clearAuth, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
