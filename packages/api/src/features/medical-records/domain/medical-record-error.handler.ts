import { MedicalRecordError } from "../domain/medical-records.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleMedicalRecordError(err: unknown): Response {
  if (err instanceof MedicalRecordError) {
    switch (err.code) {
      case "MEDICAL_RECORD_NOT_FOUND":
      case "CLIENT_NOT_FOUND":
      case "THERAPIST_NOT_FOUND":
      case "SUPERVISOR_NOT_FOUND":
      case "ADMIN_NOT_FOUND":
        return notFound(err.message);
      case "RECORD_NUMBER_EXISTS":
        return error(err.code, err.message, 409);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
