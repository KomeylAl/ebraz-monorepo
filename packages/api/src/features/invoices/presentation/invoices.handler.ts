import {
  createInvoiceSchema,
  listInvoicesQuerySchema,
  type CreateInvoiceInput,
} from "@ebraz/validation/payments";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { parseQuery } from "@/lib/http/parse-query";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
} from "../application/invoices.service";
import { handleInvoiceError } from "../domain/invoice-error.handler";

async function getId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", "Invoice id is required", 400);
  return id;
}

export const listInvoicesHandler = withPermission("payments.read", async (request) => {
  const query = parseQuery(request.nextUrl, listInvoicesQuerySchema);
  if (isErrorResponse(query)) return query;
  try {
    return success(await getInvoices(query));
  } catch (err) {
    return handleInvoiceError(err);
  }
});

export const createInvoiceHandler = withPermission(
  "payments.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<CreateInvoiceInput>(request, createInvoiceSchema);
    if (isErrorResponse(input)) return input;
    try {
      const invoice = await createInvoice(input, request.auth.sub, request.auth.sub);
      return success(invoice, 201);
    } catch (err) {
      return handleInvoiceError(err);
    }
  },
);

export const getInvoiceHandler = withPermission("payments.read", async (_request, context) => {
  const id = await getId(context);
  if (id instanceof Response) return id;
  try {
    return success(await getInvoiceById(id));
  } catch (err) {
    return handleInvoiceError(err);
  }
});

export const deleteInvoiceHandler = withPermission(
  "payments.write",
  async (request: AuthenticatedRequest, context) => {
    const id = await getId(context);
    if (id instanceof Response) return id;
    try {
      await deleteInvoice(id, request.auth.sub);
      return success({ message: "Invoice deleted" });
    } catch (err) {
      return handleInvoiceError(err);
    }
  },
);
