"use client";

import { useAuth } from "@/hooks/use-auth";
import WeeklyReportDashboard from "@/components/WeeklyReportDashboard";
import AuthPage from "@/components/AuthPage";
import { useEffect, useState } from "react";

export default function Page() {
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

  return <WeeklyReportDashboard />;
}
