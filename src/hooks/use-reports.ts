"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  reportsApi,
  ApiError,
  type Report,
  type ClientReport,
  type Task,
  type Project,
  type Achievement,
} from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

// 서버 Report를 클라이언트 Report로 변환하는 헬퍼 함수
const convertToClientReport = (report: Report): ClientReport => ({
  ...report,
  weekStart: new Date(report.weekStart),
  weekEnd: new Date(report.weekEnd),
  createdAt: new Date(report.createdAt),
  updatedAt: new Date(report.updatedAt),
  user: (report as any).user,
});

// 클라이언트 Report를 서버 Report로 변환하는 헬퍼 함수
const convertToServerReport = (
  report: Partial<ClientReport>
): Partial<Report> => ({
  ...report,
  weekStart: report.weekStart
    ? format(report.weekStart, "yyyy-MM-dd")
    : undefined,
  weekEnd: report.weekEnd ? format(report.weekEnd, "yyyy-MM-dd") : undefined,
  createdAt: report.createdAt?.toISOString(),
  updatedAt: report.updatedAt?.toISOString(),
});

export function useReports() {
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 보고서 목록 로드
  const loadReports = async () => {
    // 사용자가 인증되지 않은 경우 API 호출하지 않음
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await reportsApi.getAll();

      if (response.success && response.data && Array.isArray(response.data)) {
        const parsedReports = response.data.map(convertToClientReport);
        setReports(parsedReports);
      } else {
        // API 응답이 예상과 다를 때 빈 배열로 초기화
        setReports([]);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
      // 에러 시 로컬스토리지 폴백
      try {
        const savedReports = localStorage.getItem("reports");
        if (savedReports) {
          const parsedReports = JSON.parse(savedReports).map((report: any) => ({
            ...report,
            weekStart: new Date(report.weekStart),
            weekEnd: new Date(report.weekEnd),
            createdAt: new Date(report.createdAt),
            updatedAt: new Date(report.updatedAt),
          }));
          setReports(parsedReports);
        } else {
          setReports([]);
        }
      } catch (localError) {
        console.error("Failed to load from localStorage:", localError);
        setReports([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 사용자가 변경될 때마다 보고서 다시 로드
    loadReports();
  }, [user]);

  const createReport = async (
    reportData: Omit<ClientReport, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const serverData = convertToServerReport(reportData);
      const response = await reportsApi.create(
        serverData as Omit<Report, "id" | "createdAt" | "updatedAt">
      );

      if (response.success && response.data) {
        const newReport = convertToClientReport(response.data);
        setReports((prev) => [...prev, newReport]);

        // 로컬스토리지에도 저장 (폴백용)
        const updatedReports = [...reports, newReport];
        localStorage.setItem("reports", JSON.stringify(updatedReports));

        return newReport;
      }

      throw new Error(response.message || "보고서 생성에 실패했습니다.");
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const updateReport = async (
    id: string,
    reportData: Partial<ClientReport>
  ) => {
    try {
      const serverData = convertToServerReport(reportData);
      const response = await reportsApi.update(id, serverData);

      if (response.success && response.data) {
        const updatedReport = convertToClientReport(response.data);
        setReports((prev) =>
          prev.map((report) => (report.id === id ? updatedReport : report))
        );

        // 로컬스토리지 업데이트
        const updatedReports = reports.map((report) =>
          report.id === id ? updatedReport : report
        );
        localStorage.setItem("reports", JSON.stringify(updatedReports));

        return updatedReport;
      }

      throw new Error(response.message || "보고서 수정에 실패했습니다.");
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const response = await reportsApi.delete(id);

      if (response.success) {
        setReports((prev) => prev.filter((report) => report.id !== id));

        // 로컬스토리지 업데이트
        const updatedReports = reports.filter((report) => report.id !== id);
        localStorage.setItem("reports", JSON.stringify(updatedReports));

        return true;
      }

      throw new Error(response.message || "보고서 삭제에 실패했습니다.");
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const getReport = async (id: string): Promise<ClientReport | null> => {
    try {
      const response = await reportsApi.getById(id);

      if (response.success && response.data) {
        return convertToClientReport(response.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to get report:", error);
      return reports.find((report) => report.id === id) || null;
    }
  };

  const getReportsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const response = await reportsApi.getByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (response.success && response.data && Array.isArray(response.data)) {
        return response.data.map(convertToClientReport);
      }

      return [];
    } catch (error) {
      console.error("Failed to get reports by date range:", error);
      return reports.filter((report) => {
        return report.weekStart >= startDate && report.weekEnd <= endDate;
      });
    }
  };

  return {
    reports,
    loading,
    createReport,
    updateReport,
    deleteReport,
    getReport,
    getReportsByDateRange,
    refreshReports: loadReports,
  };
}

// 타입들을 export (ClientReport를 기본으로 사용)
export type { ClientReport as Report, Project, Task, Achievement };
