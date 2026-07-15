import type { DbUserRole } from "@ebraz/types";
import type { AccessTokenPayload } from "@ebraz/types";
import type {
  CreateNotificationInput,
  ListNotificationsQuery,
} from "@ebraz/validation/notifications";
import { broadcastNotificationCreated } from "@/lib/notifications/broadcast";
import {
  toCreatedNotificationProfile,
} from "../domain/notification.mapper";
import { NotificationError } from "../domain/notifications.errors";
import {
  createAppointmentNotification,
  createNotificationRecord,
  listNotifications,
  listUnreadNotifications,
  markNotificationReadRecord,
} from "../infrastructure/notifications.repository";

function toReceiver(auth: AccessTokenPayload): { role: DbUserRole; id: string } {
  if (auth.role === "PUBLIC") {
    throw new NotificationError("Authenticated user required", "FORBIDDEN");
  }
  return { role: auth.role, id: auth.sub };
}

export async function getNotifications(auth: AccessTokenPayload, query: ListNotificationsQuery) {
  return listNotifications(toReceiver(auth), query);
}

export async function getUnreadNotifications(
  auth: AccessTokenPayload,
  query: ListNotificationsQuery,
) {
  return listUnreadNotifications(toReceiver(auth), query);
}

export async function getMyNotifications(auth: AccessTokenPayload, query: ListNotificationsQuery) {
  return listNotifications(toReceiver(auth), query);
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await createNotificationRecord(input);
  if (!notification) {
    throw new NotificationError("Notification target not found", "NOT_FOUND");
  }

  const profile = toCreatedNotificationProfile(notification);

  broadcastNotificationCreated(profile);
  return profile;
}

export async function markNotificationRead(notificationId: string, auth: AccessTokenPayload) {
  const result = await markNotificationReadRecord(notificationId, toReceiver(auth));
  if (!result) {
    throw new NotificationError("Notification not found", "NOT_FOUND");
  }
  return result;
}

export async function notifyTherapistAppointmentCreated(input: {
  therapistId: string;
  clientName: string;
  date: string;
  time: string;
  appointmentId: string;
}) {
  const notification = await createAppointmentNotification({
    therapistId: input.therapistId,
    title: "نوبت جدید",
    message: `مراجع ${input.clientName} برای ${input.date} ساعت ${input.time} نوبت جدید دارد.`,
    meta: { appointmentId: input.appointmentId },
  });

  broadcastNotificationCreated(toCreatedNotificationProfile(notification));
}
