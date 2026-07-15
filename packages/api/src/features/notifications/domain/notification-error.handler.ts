import { NotificationError } from "./notifications.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleNotificationError(err: unknown): Response {
  if (err instanceof NotificationError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      case "FORBIDDEN":
        return error(err.code, err.message, 403);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
