"use client";

import { useAuth } from "../provider/AuthProvider";
import AdminDashboard from "../component/AdminDashboard";
import { useEffect, useState } from "react";

export default function AdminPage() {
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
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    return null;
  }

  // 관리자 권한 체크
  if (user.role !== "admin" && user.role !== "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">
        관리자 권한이 필요합니다.
      </div>
    );
  }

  return <AdminDashboard />;
}