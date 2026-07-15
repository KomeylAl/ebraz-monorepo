export type NotificationType = "system" | "reminder" | "appointment" | "message";
export type NotificationPriority = "low" | "medium" | "high";
export type NotificationStatus = "pending" | "sent" | "failed";
export type NotificationTargetRole = "ADMIN" | "THERAPIST" | "CLIENT";

export interface NotificationProfile {
  id: string;
  title: string;
  message: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  meta: Record<string, unknown> | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export interface NotificationListResult {
  data: NotificationProfile[];
  meta: NotificationListMeta;
}
