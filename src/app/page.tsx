"use client";

import { useAuth } from "@/hooks/use-auth";
import WeeklyReportDashboard from "@/components/WeeklyReportDashboard";
import AuthPage from "@/components/AuthPage";
import NotificationPopup from "@/components/NotificationPopup";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "manager")) {
      router.replace("/admin");
    }
  }, [user, router]);

  // 사용자 로그인 시 알림 팝업 표시
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "manager") {
      // 로그인 시간 확인
      const loginTime = localStorage.getItem("login_time");
      const lastNotificationCheck = localStorage.getItem(
        "last_notification_check"
      );

      if (
        loginTime &&
        (!lastNotificationCheck ||
          parseInt(loginTime) > parseInt(lastNotificationCheck))
      ) {
        // 잠시 후 알림 팝업 표시
        const timer = setTimeout(() => {
          setShowNotificationPopup(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

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

  // 관리자가 아닌 경우에만 사용자 대시보드 표시
  if (user.role !== "admin" && user.role !== "manager") {
    return (
      <>
        <WeeklyReportDashboard />
        {showNotificationPopup && (
          <NotificationPopup
            userId={user.id}
            onClose={() => {
              setShowNotificationPopup(false);
              localStorage.setItem(
                "last_notification_check",
                Date.now().toString()
              );
            }}
          />
        )}
      </>
    );
  }

  // 관리자인 경우 로딩 표시 (리다이렉트 중)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
  );
}
