import type { Prisma } from "@ebraz/database";
import type { DbUserRole } from "@ebraz/types";
import type { NotificationProfile } from "@ebraz/types/notifications";

type NotificationRecord = Prisma.NotificationGetPayload<{
  include: { reads: true };
}>;

export function toNotificationProfile(
  notification: NotificationRecord,
  receiver: { role: DbUserRole; id: string },
): NotificationProfile {
  const read = notification.reads.find(
    (item) => item.receiverRole === receiver.role && item.receiverId === receiver.id,
  );

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    status: notification.status,
    meta: (notification.meta as Record<string, unknown> | null) ?? null,
    read: Boolean(read?.readAt),
    readAt: read?.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function toCreatedNotificationProfile(
  notification: Pick<
    NotificationRecord,
    | "id"
    | "title"
    | "message"
    | "type"
    | "priority"
    | "status"
    | "meta"
    | "createdAt"
  >,
): NotificationProfile {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    status: notification.status,
    meta: (notification.meta as Record<string, unknown> | null) ?? null,
    read: false,
    readAt: null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export const notificationReadsInclude = {
  reads: true,
} as const;

export function buildVisibleWhere(
  role: DbUserRole,
  userId: string,
): Prisma.NotificationWhereInput {
  return {
    status: "sent",
    OR: [
      { targetRole: null, targetId: null },
      { targetRole: role, targetId: null },
      { targetRole: role, targetId: userId },
    ],
  };
}

export function buildUnreadWhere(
  role: DbUserRole,
  userId: string,
): Prisma.NotificationWhereInput {
  return {
    ...buildVisibleWhere(role, userId),
    NOT: {
      reads: {
        some: {
          receiverRole: role,
          receiverId: userId,
          readAt: { not: null },
        },
      },
    },
  };
}

export function buildSearchFilter(search?: string): Prisma.NotificationWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { message: { contains: term, mode: "insensitive" } },
    ],
  };
}
