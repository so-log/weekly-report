"use client";

import { useAuth } from "../provider/AuthProvider";
import { ReportsMain } from "../view/ReportsMain";
import { ReportApiImpl } from "../../core/repository/ReportApiImpl";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const reportApi = new ReportApiImpl();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    // 인증되지 않은 사용자는 auth 페이지로 리디렉트
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    return null;
  }

  return <ReportsMain reportApi={reportApi} />;
}