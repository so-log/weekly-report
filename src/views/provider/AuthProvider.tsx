"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { AuthViewModel, AuthState, User } from "../viewmodel/AuthViewModel";
import { LoginDomain } from "../../core/domain/LoginDomain";
import { RegisterDomain } from "../../core/domain/RegisterDomain";
import { LoginUseCase } from "../../core/usecase/LoginUseCase";
import { RegisterUseCase } from "../../core/usecase/RegisterUseCase";
import { LoginApiImpl } from "../../core/repository/LoginApiImpl";
import { RegisterApiImpl } from "../../core/repository/RegisterApiImpl";
import { useAuthViewModel } from "../viewmodel/AuthViewModel";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, teamId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 인프라스트럭처 레이어 인스턴스 생성
  const loginApi = new LoginApiImpl();
  const registerApi = new RegisterApiImpl();

  // 유스케이스와 도메인 레이어 인스턴스 생성
  const loginUseCase = new LoginUseCase(loginApi);
  const registerUseCase = new RegisterUseCase(registerApi);
  const loginDomain = new LoginDomain(loginUseCase);
  const registerDomain = new RegisterDomain(registerUseCase);

  // 뷰모델 사용
  const { viewModel, state } = useAuthViewModel(loginDomain, registerDomain);

  const contextValue: AuthContextType = {
    user: state.user,
    loading: state.isLoading,
    error: state.error,
    signIn: (email: string, password: string) => viewModel.signIn(email, password),
    signUp: (email: string, password: string, name: string, teamId?: string) => 
      viewModel.signUp(email, password, name, teamId),
    signOut: () => viewModel.signOut(),
    clearError: () => viewModel.clearError(),
    updateUser: (user: User) => viewModel.updateUser(user),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}