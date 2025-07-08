import { api, type ApiResponse } from "./api";

// 관리자용 타입 정의
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
  joinedAt: string;
}

export interface AdminReport {
  id: string;
  member: TeamMember;
  title: string;
  content: string;
  weekStart: string;
  weekEnd: string;
  submittedAt: string | null;
  status: "submitted" | "missing" | "review" | "approved";
  projects: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
  achievements: Array<{
    id: string;
    project: string;
    description: string;
    priority: string;
  }>;
}

export interface AdminStatistics {
  totalReports: number;
  submittedReports: number;
  missingReports: number;
  reviewReports: number;
  approvedReports: number;
  submissionRate: number;
  departments: Array<{
    name: string;
    totalMembers: number;
    submittedReports: number;
    submissionRate: number;
  }>;
}

// 관리자 API
export const adminApi = {
  // 전체 보고서 조회
  getAllReports: (filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    teamId?: string;
    departmentId?: string;
  }): Promise<ApiResponse<AdminReport[]>> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.teamId) params.append("team_id", filters.teamId);
    if (filters?.departmentId)
      params.append("department_id", filters.departmentId);

    const queryString = params.toString();
    return api.get<AdminReport[]>(
      `/admin/reports${queryString ? `?${queryString}` : ""}`
    );
  },

  // 특정 보고서 상세 조회
  getReportDetail: (reportId: string): Promise<ApiResponse<AdminReport>> =>
    api.get<AdminReport>(`/admin/reports/${reportId}`),

  // 보고서 상태 업데이트
  updateReportStatus: (
    reportId: string,
    status: string,
    comment?: string
  ): Promise<ApiResponse<AdminReport>> =>
    api.put<AdminReport>(`/admin/reports/${reportId}/status`, {
      status,
      comment,
    }),

  // 팀원 목록 조회
  getTeamMembers: (): Promise<ApiResponse<TeamMember[]>> =>
    api.get<TeamMember[]>("/admin/team-members"),

  // 특정 팀원 정보 조회
  getTeamMember: (memberId: string): Promise<ApiResponse<TeamMember>> =>
    api.get<TeamMember>(`/admin/team-members/${memberId}`),

  // 팀원 보고서 히스토리 조회
  getMemberReportHistory: (
    memberId: string,
    limit?: number
  ): Promise<ApiResponse<AdminReport[]>> =>
    api.get<AdminReport[]>(
      `/admin/team-members/${memberId}/reports${limit ? `?limit=${limit}` : ""}`
    ),

  // 통계 데이터 조회
  getStatistics: (filters?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Promise<ApiResponse<AdminStatistics>> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);
    if (filters?.departmentId)
      params.append("department_id", filters.departmentId);

    const queryString = params.toString();
    return api.get<AdminStatistics>(
      `/admin/statistics${queryString ? `?${queryString}` : ""}`
    );
  },

  // 알림 발송
  sendNotification: (
    memberIds: string[],
    message: string,
    type?: string
  ): Promise<ApiResponse<void>> =>
    api.post<void>("/admin/notifications", { memberIds, message, type }),

  // 보고서 일괄 승인
  bulkApproveReports: (reportIds: string[]): Promise<ApiResponse<void>> =>
    api.post<void>("/admin/reports/bulk-approve", { reportIds }),

  // 미제출자 알림 발송
  sendMissingReportNotification: (
    weekStart: string,
    weekEnd: string
  ): Promise<ApiResponse<void>> =>
    api.post<void>("/admin/notifications/missing-reports", {
      weekStart,
      weekEnd,
    }),

  // 보고서 엑셀 다운로드
  exportReports: (filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    departmentId?: string;
  }): Promise<Blob> => {
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
  },

  // 부서별 통계
  getDepartmentStatistics: (): Promise<
    ApiResponse<
      Array<{
        department: string;
        totalMembers: number;
        submittedReports: number;
        missingReports: number;
        submissionRate: number;
      }>
    >
  > => api.get("/admin/statistics/departments"),
};
