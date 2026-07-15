import { PaymentError } from "./payments.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handlePaymentError(err: unknown): Response {
  if (err instanceof PaymentError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
