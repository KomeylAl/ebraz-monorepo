import { AuthError } from "@ebraz/auth/server";
import { error } from "@/lib/http/response";

export function handleAuthError(err: unknown): Response {
  if (err instanceof AuthError) {
    const status = err.code === "PHONE_EXISTS" ? 409 : 401;
    return error(err.code, err.message, status);
  }
  return error("INTERNAL_ERROR", "Something went wrong", 500);
}
