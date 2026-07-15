import { prisma } from "@ebraz/database";
import type { Prisma } from "@ebraz/database";
import type { DbUserRole } from "@ebraz/types";
import type {
  CreateNotificationInput,
  ListNotificationsQuery,
} from "@ebraz/validation/notifications";
import { resolveDeliveryChannels } from "@ebraz/validation/notifications";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import {
  buildSearchFilter,
  buildUnreadWhere,
  buildVisibleWhere,
  notificationReadsInclude,
  toNotificationProfile,
} from "../domain/notification.mapper";

type Receiver = { role: DbUserRole; id: string };

async function assertTargetExists(targetRole: DbUserRole, targetId: string) {
  switch (targetRole) {
    case "ADMIN":
      return prisma.admin.findFirst({ where: { id: targetId, deletedAt: null }, select: { id: true } });
    case "THERAPIST":
      return prisma.therapist.findFirst({
        where: { id: targetId, deletedAt: null },
        select: { id: true },
      });
    case "CLIENT":
      return prisma.client.findFirst({ where: { id: targetId, deletedAt: null }, select: { id: true } });
  }
}

export async function countUnreadNotifications(receiver: Receiver) {
  return prisma.notification.count({
    where: buildUnreadWhere(receiver.role, receiver.id),
  });
}

async function listNotificationsForReceiver(
  receiver: Receiver,
  query: ListNotificationsQuery,
  unreadOnly: boolean,
) {
  const where = {
    ...(unreadOnly
      ? buildUnreadWhere(receiver.role, receiver.id)
      : buildVisibleWhere(receiver.role, receiver.id)),
    ...(buildSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: notificationReadsInclude,
    }),
    prisma.notification.count({ where }),
    countUnreadNotifications(receiver),
  ]);

  return {
    data: items.map((item) => toNotificationProfile(item, receiver)),
    meta: {
      ...buildPaginationMeta(total, query.page, query.pageSize),
      unreadCount,
    },
  };
}

export async function listNotifications(receiver: Receiver, query: ListNotificationsQuery) {
  return listNotificationsForReceiver(receiver, query, false);
}

export async function listUnreadNotifications(receiver: Receiver, query: ListNotificationsQuery) {
  return listNotificationsForReceiver(receiver, query, true);
}

export async function findVisibleNotification(id: string, receiver: Receiver) {
  return prisma.notification.findFirst({
    where: {
      id,
      ...buildVisibleWhere(receiver.role, receiver.id),
    },
    include: notificationReadsInclude,
  });
}

export async function createNotificationRecord(input: CreateNotificationInput) {
  if (input.targetRole && input.targetId) {
    const target = await assertTargetExists(input.targetRole, input.targetId);
    if (!target) return null;
  }

  const priority = input.priority ?? "medium";
  const scheduledAt = input.scheduledAt ?? null;
  const status = scheduledAt && scheduledAt > new Date() ? "pending" : "sent";

  return prisma.notification.create({
    data: {
      title: input.title.trim(),
      message: input.message?.trim(),
      type: input.type ?? "system",
      targetRole: input.targetRole ?? null,
      targetId: input.targetId ?? null,
      priority,
      deliveryChannels: resolveDeliveryChannels(priority),
      status,
      meta: input.meta as Prisma.InputJsonValue | undefined,
      scheduledAt,
    },
    include: notificationReadsInclude,
  });
}

export async function markNotificationReadRecord(
  notificationId: string,
  receiver: Receiver,
) {
  const notification = await findVisibleNotification(notificationId, receiver);
  if (!notification) return null;

  await prisma.notificationRead.upsert({
    where: {
      notificationId_receiverRole_receiverId: {
        notificationId,
        receiverRole: receiver.role,
        receiverId: receiver.id,
      },
    },
    update: {
      readAt: new Date(),
    },
    create: {
      notificationId,
      receiverRole: receiver.role,
      receiverId: receiver.id,
      readAt: new Date(),
    },
  });

  const updated = await findVisibleNotification(notificationId, receiver);
  if (!updated) return null;

  return toNotificationProfile(updated, receiver);
}

export async function createAppointmentNotification(input: {
  therapistId: string;
  title: string;
  message: string;
  meta?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      title: input.title,
      message: input.message,
      type: "appointment",
      priority: "medium",
      targetRole: "THERAPIST",
      targetId: input.therapistId,
      deliveryChannels: resolveDeliveryChannels("medium"),
      status: "sent",
      meta: input.meta as Prisma.InputJsonValue | undefined,
    },
    include: notificationReadsInclude,
  });
}
