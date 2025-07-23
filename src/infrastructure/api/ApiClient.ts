// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// API Error Class
export class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Retry Options
interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
}

// API Client Class (Infrastructure Layer)
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

          // 401 에러(인증 실패) 시 자동 로그아웃
          if (response.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            localStorage.removeItem("login_time");
            localStorage.removeItem("last_notification_check");
            window.location.href = "/";
          }

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
export const apiClient = new ApiClient();