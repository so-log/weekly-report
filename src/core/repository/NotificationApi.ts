import { 
  CreateNotificationRequestType,
  UpdateNotificationRequestType,
  NotificationsResponseType,
  CreateNotificationResponseType,
  UpdateNotificationResponseType
} from "../entity/NotificationTypes";

export interface NotificationApi {
  getNotifications(): Promise<NotificationsResponseType>;
  createNotification(request: CreateNotificationRequestType): Promise<CreateNotificationResponseType>;
  updateNotification(request: UpdateNotificationRequestType): Promise<UpdateNotificationResponseType>;
}