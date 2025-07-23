import { apiClient, type ApiResponse } from "../../infrastructure/api/ApiClient";
import type { AdminReport, AdminStatistics, TeamMember } from "../entity/ApiTypes";

// Admin API Repository Implementation
export class AdminApiImpl {
  // 전체 보고서 조회
  async getAllReports(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    teamId?: string;
    departmentId?: string;
  }): Promise<ApiResponse<AdminReport[]>> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.teamId) params.append("team_id", filters.teamId);
    if (filters?.departmentId)
      params.append("department_id", filters.departmentId);

    const queryString = params.toString();
    return apiClient.get<AdminReport[]>(
      `/admin/reports${queryString ? `?${queryString}` : ""}`
    );
  }

  // 특정 보고서 상세 조회
  async getReportDetail(reportId: string): Promise<ApiResponse<AdminReport>> {
    return apiClient.get<AdminReport>(`/admin/reports/${reportId}`);
  }

  // 보고서 상태 업데이트
  async updateReportStatus(
    reportId: string,
    status: string,
    comment?: string
  ): Promise<ApiResponse<AdminReport>> {
    return apiClient.put<AdminReport>(`/admin/reports/${reportId}/status`, {
      status,
      comment,
    });
  }

  // 팀원 목록 조회
  async getTeamMembers(): Promise<ApiResponse<TeamMember[]>> {
    return apiClient.get<TeamMember[]>("/admin/team-members");
  }

  // 특정 팀원 정보 조회
  async getTeamMember(memberId: string): Promise<ApiResponse<TeamMember>> {
    return apiClient.get<TeamMember>(`/admin/team-members/${memberId}`);
  }

  // 팀원 보고서 히스토리 조회
  async getMemberReportHistory(
    memberId: string,
    limit?: number
  ): Promise<ApiResponse<AdminReport[]>> {
    return apiClient.get<AdminReport[]>(
      `/admin/team-members/${memberId}/reports${limit ? `?limit=${limit}` : ""}`
    );
  }

  // 통계 데이터 조회
  async getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Promise<ApiResponse<AdminStatistics>> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);
    if (filters?.departmentId)
      params.append("department_id", filters.departmentId);

    const queryString = params.toString();
    return apiClient.get<AdminStatistics>(
      `/admin/statistics${queryString ? `?${queryString}` : ""}`
    );
  }

  // 알림 발송
  async sendNotification(
    memberIds: string[],
    message: string,
    type?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/admin/notifications", { memberIds, message, type });
  }

  // 보고서 일괄 승인
  async bulkApproveReports(reportIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/admin/reports/bulk-approve", { reportIds });
  }

  // 미제출자 알림 발송
  async sendMissingReportNotification(
    weekStart: string,
    weekEnd: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/admin/notifications/missing-reports", {
      weekStart,
      weekEnd,
    });
  }

  // 보고서 엑셀 다운로드
  async exportReports(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    departmentId?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.departmentId)
      params.append("department_id", filters.departmentId);

    const queryString = params.toString();
    return fetch(
      `/api/admin/reports/export${queryString ? `?${queryString}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    ).then((response) => response.blob());
  }

  // 부서별 통계
  async getDepartmentStatistics(): Promise<
    ApiResponse<
      Array<{
        department: string;
        totalMembers: number;
        submittedReports: number;
        missingReports: number;
        submissionRate: number;
      }>
    >
  > {
    return apiClient.get("/admin/statistics/departments");
  }
}