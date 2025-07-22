export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNotificationRequestType {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  userId: string;
}

export interface UpdateNotificationRequestType {
  id: string;
  isRead?: boolean;
}

export interface NotificationsResponseType {
  success: boolean;
  data?: Notification[];
  message?: string;
}

export interface CreateNotificationResponseType {
  success: boolean;
  data?: Notification;
  message?: string;
}

export interface UpdateNotificationResponseType {
  success: boolean;
  data?: Notification;
  message?: string;
}