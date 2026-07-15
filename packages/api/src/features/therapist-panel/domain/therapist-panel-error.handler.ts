import { TherapistPanelError } from "./therapist-panel.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleTherapistPanelError(err: unknown): Response {
  if (err instanceof TherapistPanelError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      case "FORBIDDEN":
        return error(err.code, err.message, 403);
      case "PHONE_EXISTS":
        return error(err.code, err.message, 409);
      case "OTP_RATE_LIMITED":
        return error(err.code, err.message, 429);
      case "OTP_NOT_FOUND":
      case "OTP_INVALID":
      case "OTP_MAX_ATTEMPTS":
      case "PHONE_MISSING":
      case "SMS_FAILED":
        return error(err.code, err.message, 400);
      default:
        return error(err.code, err.message, 400);
    }
  }
  console.error("[therapist-panel]", err);
  return serverError();
}
