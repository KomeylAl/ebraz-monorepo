import { SmsError } from "./sms.errors";
import { error, serverError } from "@/lib/http/response";

export function handleSmsError(err: unknown): Response {
  if (err instanceof SmsError) {
    switch (err.code) {
      case "PROVIDER_ERROR":
        return error(err.code, err.message, 502);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
