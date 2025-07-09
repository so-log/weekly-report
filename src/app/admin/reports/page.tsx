"use client";

import { useAuth } from "@/hooks/use-auth";
import AdminPersonalDashboard from "@/components/AdminPersonalDashboard";
import AuthPage from "@/components/AuthPage";
import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // 관리자가 아닌 경우 사용자 대시보드로 리다이렉트
  if (user.role !== "admin" && user.role !== "manager") {
    return <AuthPage />;
  }

  // 관리자인 경우 개인 보고서 대시보드 표시
  return <AdminPersonalDashboard />;
}
