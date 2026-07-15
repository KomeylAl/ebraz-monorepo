import {
  upsertMedicalRecordSchema,
  type UpsertMedicalRecordInput,
} from "@ebraz/validation/medical-records";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import {
  deleteMedicalRecord,
  getMedicalRecordByClientId,
  upsertMedicalRecord,
} from "../application/medical-records.service";
import { handleMedicalRecordError } from "../domain/medical-record-error.handler";

async function getClientId(context: { params: Promise<Record<string, string>> }) {
  const { id } = await context.params;
  if (!id) {
    return error("VALIDATION_ERROR", "Client id is required", 400);
  }
  return id;
}

export const getMedicalRecordHandler = withPermission(
  "clients.read",
  async (_request, context) => {
    const clientId = await getClientId(context);
    if (clientId instanceof Response) return clientId;

    try {
      const record = await getMedicalRecordByClientId(clientId);
      return success(record);
    } catch (err) {
      return handleMedicalRecordError(err);
    }
  },
);

export const upsertMedicalRecordHandler = withPermission(
  "clients.write",
  async (request: AuthenticatedRequest, context) => {
    const clientId = await getClientId(context);
    if (clientId instanceof Response) return clientId;

    const input = await parseBody<UpsertMedicalRecordInput>(
      request,
      upsertMedicalRecordSchema,
    );
    if (isErrorResponse(input)) return input;

    try {
      const record = await upsertMedicalRecord(clientId, input, request.auth.sub);
      return success(record);
    } catch (err) {
      return handleMedicalRecordError(err);
    }
  },
);

export const deleteMedicalRecordHandler = withPermission(
  "clients.delete",
  async (request: AuthenticatedRequest, context) => {
    const clientId = await getClientId(context);
    if (clientId instanceof Response) return clientId;

    try {
      await deleteMedicalRecord(clientId, request.auth.sub);
      return success({ message: "Medical record deleted" });
    } catch (err) {
      return handleMedicalRecordError(err);
    }
  },
);
