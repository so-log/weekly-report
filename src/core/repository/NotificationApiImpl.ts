import { NotificationApi } from "./NotificationApi";
import { 
  CreateNotificationRequestType,
  UpdateNotificationRequestType,
  NotificationsResponseType,
  CreateNotificationResponseType,
  UpdateNotificationResponseType
} from "../entity/NotificationTypes";

export class NotificationApiImpl implements NotificationApi {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getNotifications(): Promise<NotificationsResponseType> {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: "알림 목록을 불러오는 중 오류가 발생했습니다."
      };
    }
  }

  async createNotification(request: CreateNotificationRequestType): Promise<CreateNotificationResponseType> {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: "알림 생성 중 오류가 발생했습니다."
      };
    }
  }

  async updateNotification(request: UpdateNotificationRequestType): Promise<UpdateNotificationResponseType> {
    try {
      const { id, ...updateData } = request;
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: "알림 수정 중 오류가 발생했습니다."
      };
    }
  }
}