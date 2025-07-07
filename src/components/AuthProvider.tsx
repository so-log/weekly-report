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
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 토큰이 있으면 사용자 정보 확인
    const token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
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
        setUser(userWithDefaults);
      } else {
        throw new Error(response.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register(email, password, name);

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
        throw new Error(error.message);
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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
