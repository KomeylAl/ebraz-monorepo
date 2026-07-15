import { AdminError } from "../domain/admins.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleAdminError(err: unknown): Response {
  if (err instanceof AdminError) {
    switch (err.code) {
      case "ADMIN_NOT_FOUND":
        return notFound(err.message);
      case "PHONE_EXISTS":
        return error(err.code, err.message, 409);
      case "CANNOT_DELETE_SELF":
        return error(err.code, err.message, 400);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
