"use client";

import { useState, useEffect } from "react";
import { AdminApiImpl } from "../../core/repository/AdminApiImpl";
import type { AdminReport, TeamMember } from "../../core/entity/ApiTypes";

const adminApi = new AdminApiImpl();

export function useAdmin() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 전체 보고서 로드
  const loadReports = async (filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    teamId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllReports(filters);

      if (response.success && response.data) {
        setReports(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "보고서를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 팀원 목록 로드
  const loadTeamMembers = async () => {
    try {
      const response = await adminApi.getTeamMembers();

      if (response.success && response.data) {
        setTeamMembers(response.data);
      }
    } catch (err) {
      console.error("Failed to load team members:", err);
    }
  };

  // 보고서 상태 업데이트
  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await adminApi.updateReportStatus(reportId, status);

      if (response.success) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? { ...report, status: status as any }
              : report
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "상태 업데이트 중 오류가 발생했습니다."
      );
      return false;
    }
  };

  // 알림 발송
  const sendNotification = async (memberIds: string[], message: string) => {
    try {
      const response = await adminApi.sendNotification(memberIds, message);
      return response.success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알림 발송 중 오류가 발생했습니다."
      );
      return false;
    }
  };

  // 통계 데이터 계산
  const getStatistics = () => {
    const total = reports.length;
    const submitted = reports.filter((r) => r.status === "submitted").length;
    const missing = reports.filter((r) => r.status === "missing").length;
    const review = reports.filter((r) => r.status === "review").length;

    return {
      total,
      submitted,
      missing,
      review,
      submittedPercentage:
        total > 0 ? Math.round((submitted / total) * 100) : 0,
      missingPercentage: total > 0 ? Math.round((missing / total) * 100) : 0,
      reviewPercentage: total > 0 ? Math.round((review / total) * 100) : 0,
    };
  };

  useEffect(() => {
    loadReports();
    loadTeamMembers();
  }, []);

  return {
    reports,
    teamMembers,
    loading,
    error,
    loadReports,
    loadTeamMembers,
    updateReportStatus,
    sendNotification,
    getStatistics,
  };
}
