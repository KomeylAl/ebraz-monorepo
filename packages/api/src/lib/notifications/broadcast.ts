import type { NotificationProfile } from "@ebraz/types/notifications";

export function broadcastNotificationCreated(notification: NotificationProfile): void {
  if (process.env.NOTIFICATIONS_REALTIME_ENABLED === "true") {
    console.log("[notifications] realtime broadcast", notification.id);
    return;
  }

  console.log("[notifications] broadcast placeholder", {
    id: notification.id,
    title: notification.title,
    type: notification.type,
  });
}
