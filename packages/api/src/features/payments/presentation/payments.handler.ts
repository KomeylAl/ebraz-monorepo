import {
  listPaymentsQuerySchema,
  updatePaymentSchema,
  type UpdatePaymentInput,
} from "@ebraz/validation/payments";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import { getPaymentById, getPayments, updatePayment } from "../application/payments.service";
import { handlePaymentError } from "../domain/payment-error.handler";

async function getId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Payment id is required", 400);
  return id;
}

export const listPaymentsHandler = withPermission("payments.read", async (request) => {
  const query = parseQuery(request.nextUrl, listPaymentsQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getPayments(query));
  } catch (err) {
    return handlePaymentError(err);
  }
});

export const getPaymentHandler = withPermission("payments.read", async (_request, context) => {
  const id = await getId(context);
  if (id instanceof Response) return id;
  try {
    return success(await getPaymentById(id));
  } catch (err) {
    return handlePaymentError(err);
  }
});

export const updatePaymentHandler = withPermission(
  "payments.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getId(context);
    if (id instanceof Response) return id;
    const input = await parseBody<UpdatePaymentInput>(request, updatePaymentSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await updatePayment(id, input, request.auth.sub));
    } catch (err) {
      return handlePaymentError(err);
    }
  },
);
