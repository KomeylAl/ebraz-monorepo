import { InvoiceError } from "./invoices.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleInvoiceError(err: unknown): Response {
  if (err instanceof InvoiceError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      case "NO_APPOINTMENTS":
        return error(err.code, err.message, 404);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
