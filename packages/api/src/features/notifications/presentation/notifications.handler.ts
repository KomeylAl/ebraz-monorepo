import {
  createNotificationSchema,
  listNotificationsQuerySchema,
  type CreateNotificationInput,
} from "@ebraz/validation/notifications";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withAuth, withPermission } from "@/lib/http/with-auth";
import {
  createNotification,
  getMyNotifications,
  getNotifications,
  getUnreadNotifications,
  markNotificationRead,
} from "../application/notifications.service";
import { handleNotificationError } from "../domain/notification-error.handler";

async function getNotificationId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Notification id is required", 400);
  return id;
}

export const listNotificationsHandler = withAuth(async (request: AuthenticatedRequest) => {
  const query = parseQuery(request.nextUrl, listNotificationsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getNotifications(request.auth, query));
  } catch (err) {
    return handleNotificationError(err);
  }
});

export const listUnreadNotificationsHandler = withAuth(async (request: AuthenticatedRequest) => {
  const query = parseQuery(request.nextUrl, listNotificationsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getUnreadNotifications(request.auth, query));
  } catch (err) {
    return handleNotificationError(err);
  }
});

export const getMyNotificationsHandler = withAuth(async (request: AuthenticatedRequest) => {
  const query = parseQuery(request.nextUrl, listNotificationsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getMyNotifications(request.auth, query));
  } catch (err) {
    return handleNotificationError(err);
  }
});

export const createNotificationHandler = withPermission(
  "settings.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateNotificationInput>(request, createNotificationSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await createNotification(input), 201);
    } catch (err) {
      return handleNotificationError(err);
    }
  },
);

export const markNotificationReadHandler = withAuth(
  async (request: AuthenticatedRequest, context) => {
    const id = await getNotificationId(context);
    if (id instanceof Response) return id;
    try {
      return success(await markNotificationRead(id, request.auth));
    } catch (err) {
      return handleNotificationError(err);
    }
  },
);
