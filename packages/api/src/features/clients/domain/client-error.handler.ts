import { ClientError } from "../domain/clients.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleClientError(err: unknown): Response {
  if (err instanceof ClientError) {
    switch (err.code) {
      case "CLIENT_NOT_FOUND":
        return notFound(err.message);
      case "PHONE_EXISTS":
        return error(err.code, err.message, 409);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
