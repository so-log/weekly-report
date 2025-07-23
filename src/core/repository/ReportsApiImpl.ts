import { apiClient, type ApiResponse } from "../../infrastructure/api/ApiClient";
import type { Report, ClientReport } from "../entity/ApiTypes";

// Reports API Repository Implementation
export class ReportsApiImpl {
  async getAll(): Promise<ApiResponse<Report[]>> {
    return apiClient.get<Report[]>("/reports", {
      retryCondition: (error) => error.status >= 500,
    });
  }

  async getById(id: string): Promise<ApiResponse<Report>> {
    return apiClient.get<Report>(`/reports/${id}`, {
      retryCondition: (error) => error.status >= 500,
    });
  }

  async create(
    data: Omit<ClientReport, "id" | "createdAt" | "updatedAt" | "user">
  ): Promise<ApiResponse<Report>> {
    return apiClient.post<Report>("/reports", data);
  }

  async update(id: string, data: Partial<Report>): Promise<ApiResponse<Report>> {
    return apiClient.put<Report>(`/reports/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reports/${id}`);
  }

  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Report[]>> {
    return apiClient.get<Report[]>(
      `/reports?start_date=${startDate}&end_date=${endDate}`,
      {
        retryCondition: (error) => error.status >= 500,
      }
    );
  }
}