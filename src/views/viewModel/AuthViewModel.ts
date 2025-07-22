"use client";

import { useState, useEffect } from "react";
import { LoginDomain } from "../../core/domain/LoginDomain";
import { RegisterDomain } from "../../core/domain/RegisterDomain";
import { LoginRequestType } from "../../core/entity/LoginTypes";
import { RegisterRequestType } from "../../core/entity/RegisterTypes";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "manager";
  team_id: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export class AuthViewModel {
  private _state: AuthState = {
    user: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  };

  private _setState: React.Dispatch<React.SetStateAction<AuthState>> | null = null;

  constructor(
    private loginDomain: LoginDomain,
    private registerDomain: RegisterDomain
  ) {}

  get state(): AuthState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<AuthState>>): void {
    this._setState = setState;
    this.initializeAuth();
  }

  private updateState(newState: Partial<AuthState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  private async initializeAuth(): Promise<void> {
    if (this._state.isInitialized) return;

    try {
      const token = this.getStoredToken();
      const savedUser = this.getStoredUser();

      if (token && savedUser) {
        // 토큰 유효성 검사는 나중에 구현
        this.updateState({
          user: savedUser,
          isLoading: false,
          isInitialized: true
        });
      } else {
        this.updateState({
          isLoading: false,
          isInitialized: true
        });
      }
    } catch (error) {
      this.clearAuthData();
      this.updateState({
        isLoading: false,
        isInitialized: true,
        error: "인증 초기화 중 오류가 발생했습니다."
      });
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    const request: LoginRequestType = { email, password };

    try {
      const response = await this.loginDomain.login(request);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        const userWithDefaults: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: (userData.role as "admin" | "user" | "manager") || "user",
          team_id: userData.team_id || null,
        };

        this.storeAuthData(token, userWithDefaults);
        this.updateState({
          user: userWithDefaults,
          isLoading: false,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "로그인에 실패했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }

  async signUp(
    email: string,
    password: string,
    name: string,
    teamId?: string
  ): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    const request: RegisterRequestType = {
      email,
      password,
      name,
      teamId
    };

    try {
      const response = await this.registerDomain.register(request);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        const userWithDefaults: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: (userData.role as "admin" | "user" | "manager") || "user",
          team_id: userData.team_id || null,
        };

        this.storeAuthData(token, userWithDefaults);
        this.updateState({
          user: userWithDefaults,
          isLoading: false,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "회원가입에 실패했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }

  async signOut(): Promise<void> {
    this.clearAuthData();
    this.updateState({
      user: null,
      isLoading: false,
      error: null
    });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  updateUser(user: User): void {
    this.storeUser(user);
    this.updateState({ user });
  }

  private getStoredToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  private getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private storeAuthData(token: string, user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("login_time", Date.now().toString());
    }
  }

  private storeUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  private clearAuthData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("login_time");
      localStorage.removeItem("last_notification_check");
    }
  }
}

export function useAuthViewModel(
  loginDomain: LoginDomain,
  registerDomain: RegisterDomain
) {
  const [viewModel] = useState(() => new AuthViewModel(loginDomain, registerDomain));
  const [state, setState] = useState<AuthState>(viewModel.state);

  useEffect(() => {
    if (!viewModel["_setState"]) {
      viewModel.init(setState);
    }
  }, [viewModel]);

  return { viewModel, state };
}