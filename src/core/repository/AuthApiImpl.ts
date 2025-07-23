import { apiClient, type ApiResponse } from "../../infrastructure/api/ApiClient";
import type { User } from "../entity/ApiTypes";

// 로그인/회원가입 응답 타입
export interface AuthResponse {
  user: User;
  token: string;
}

// Auth API Repository Implementation
export class AuthApiImpl {
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>("/auth/login", { email, password });
  }

  async register(
    email: string,
    password: string,
    name: string,
    teamId?: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
      teamId: teamId || null,
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/logout");
  }

  async me(): Promise<ApiResponse<User>> {
    return apiClient.get<User>("/auth/me");
  }
}