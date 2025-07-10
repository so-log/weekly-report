"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bell, X, Check } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "manual" | "system";
  sub_type: "report_request" | "announcement" | "report_reminder";
  is_read: boolean;
  created_at: string;
}

interface NotificationPopupProps {
  userId: string;
  onClose: () => void;
}

export default function NotificationPopup({
  userId,
  onClose,
}: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const unreadNotifications = data.filter(
          (n: Notification) => !n.is_read
        );
        setNotifications(unreadNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getTypeLabel = (type: string, subType: string) => {
    if (type === "manual") {
      switch (subType) {
        case "report_request":
          return "보고서 요청";
        case "announcement":
          return "공지사항";
        case "report_reminder":
          return "보고서 알림";
        default:
          return "수동 알림";
      }
    } else if (type === "system") {
      switch (subType) {
        case "report_reminder":
          return "자동 알림";
        default:
          return "시스템 알림";
      }
    }
    return "알림";
  };

  const getTypeColor = (type: string) => {
    if (type === "manual") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else {
      return "bg-green-100 text-green-800 border-green-200";
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                알림을 불러오는 중...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              알림
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">새로운 알림이 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            새로운 알림 ({notifications.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getTypeColor(notification.type)}`}
                      >
                        {getTypeLabel(notification.type, notification.sub_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(
                        new Date(notification.created_at),
                        "yyyy.MM.dd HH:mm",
                        {
                          locale: ko,
                        }
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="ml-2"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
