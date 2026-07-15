import { WorkshopError } from "./workshops.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleWorkshopError(err: unknown): Response {
  if (err instanceof WorkshopError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      case "SLUG_EXISTS":
      case "ALREADY_REGISTERED":
      case "REGISTRATION_CLOSED":
        return error(err.code, err.message, 409);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
