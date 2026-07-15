import type { CreateInvoiceInput, ListInvoicesQuery } from "@ebraz/validation/payments";
import { InvoiceError } from "../domain/invoices.errors";
import {
  createInvoiceRecord,
  findClientById,
  findInvoiceById,
  getInvoiceWithLineItems,
  listInvoices,
  softDeleteInvoiceRecord,
} from "../infrastructure/invoices.repository";

export async function getInvoices(query: ListInvoicesQuery) {
  return listInvoices(query);
}

export async function getInvoiceById(id: string) {
  const invoice = await getInvoiceWithLineItems(id);
  if (!invoice) throw new InvoiceError("Invoice not found", "NOT_FOUND");
  return invoice;
}

export async function createInvoice(
  input: CreateInvoiceInput,
  adminId: string,
  actorId: string,
) {
  const client = await findClientById(input.clientId);
  if (!client) throw new InvoiceError("Client not found", "NOT_FOUND");

  const invoice = await createInvoiceRecord(input, adminId, actorId);
  if (!invoice) {
    throw new InvoiceError(
      "No appointments found in the selected date range",
      "NO_APPOINTMENTS",
    );
  }
  return invoice;
}

export async function deleteInvoice(id: string, actorId: string) {
  const existing = await findInvoiceById(id);
  if (!existing) throw new InvoiceError("Invoice not found", "NOT_FOUND");
  await softDeleteInvoiceRecord(id, actorId);
}
