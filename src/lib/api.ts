// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  role?: "admin" | "user" | "manager";
  team_id?: string | null;
}

// 로그인/회원가입 응답 타입
export interface AuthResponse {
  user: User;
  token: string;
}

// 보고서 관련 타입들
export interface Task {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed" | "delayed";
  startDate: string;
  dueDate: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  status: "in-progress" | "completed" | "delayed";
  tasks: Task[];
}

export interface Achievement {
  id: string;
  project: string; // 업무 항목
  issue: string; // 이슈 설명
  dueDate: string; // 목표 완료일
}

export interface IssueRisk {
  id: string;
  issueDescription: string; // 발생한 문제
  mitigationPlan: string; // 대응 방안
}

export interface Report {
  id: string;
  weekStart: string; // API에서는 ISO 문자열로 전송
  weekEnd: string;
  projects: Project[];
  issuesRisks: IssueRisk[];
  createdAt: string;
  updatedAt: string;
}

// 클라이언트에서 사용할 Report 타입 (Date 객체 사용)
export interface ClientReport {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  projects: Project[];
  issuesRisks: IssueRisk[];
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// API 에러 클래스
export class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// 재시도 옵션
interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
}

// API 클라이언트 클래스
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<ApiResponse<T>> {
    const { maxRetries = 3, retryDelay = 1000, retryCondition } = retryOptions;
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // 인증 토큰이 있으면 헤더에 추가
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    let lastError: ApiError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          const error = new ApiError(
            data.message || `HTTP error! status: ${response.status}`,
            response.status,
            data
          );

          // 재시도 조건 확인
          if (
            attempt < maxRetries &&
            (!retryCondition || retryCondition(error))
          ) {
            lastError = error;
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
            continue;
          }

          throw error;
        }

        return data;
      } catch (error) {
        if (error instanceof ApiError) {
          lastError = error;
          if (
            attempt < maxRetries &&
            (!retryCondition || retryCondition(error))
          ) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
            continue;
          }
          throw error;
        }

        const networkError = new ApiError("Network error", 0, error);
        if (attempt < maxRetries) {
          lastError = networkError;
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
          continue;
        }
        throw networkError;
      }
    }

    throw lastError!;
  }

  // GET 요청
  async get<T>(
    endpoint: string,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" }, retryOptions);
  }

  // POST 요청
  async post<T>(
    endpoint: string,
    data?: any,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      retryOptions
    );
  }

  // PUT 요청
  async put<T>(
    endpoint: string,
    data?: any,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      retryOptions
    );
  }

  // DELETE 요청
  async delete<T>(
    endpoint: string,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, retryOptions);
  }
}

// API 클라이언트 인스턴스
export const api = new ApiClient();

// 인증 관련 API
export const authApi = {
  login: (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  register: (
    email: string,
    password: string,
    name: string,
    teamId?: string
  ): Promise<ApiResponse<AuthResponse>> =>
    api.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
      teamId: teamId || null,
    }),

  logout: (): Promise<ApiResponse<void>> => api.post<void>("/auth/logout"),

  me: (): Promise<ApiResponse<User>> => api.get<User>("/auth/me"),
};

// 보고서 관련 API (재시도 로직 포함)
export const reportsApi = {
  getAll: (): Promise<ApiResponse<Report[]>> =>
    api.get<Report[]>("/reports", {
      retryCondition: (error) => error.status >= 500,
    }),

  getById: (id: string): Promise<ApiResponse<Report>> =>
    api.get<Report>(`/reports/${id}`, {
      retryCondition: (error) => error.status >= 500,
    }),

  create: (
    data: Omit<Report, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Report>> => api.post<Report>("/reports", data),

  update: (id: string, data: Partial<Report>): Promise<ApiResponse<Report>> =>
    api.put<Report>(`/reports/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete<void>(`/reports/${id}`),

  getByDateRange: (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Report[]>> =>
    api.get<Report[]>(`/reports?start_date=${startDate}&end_date=${endDate}`, {
      retryCondition: (error) => error.status >= 500,
    }),
};
