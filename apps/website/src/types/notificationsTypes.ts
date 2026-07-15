// types/notification.ts

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "system" | "reminder" | "appointment" | "message";
  priority: "low" | "medium" | "high";
  meta?: Record<string, any>;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  type: "Admin" | "Doctor" | "Client";
}

export interface AuthTokens {
  access_token: string;
  user: User;
}

export interface NotificationEvent {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  meta: Record<string, any> | null;
  created_at: string;
}
