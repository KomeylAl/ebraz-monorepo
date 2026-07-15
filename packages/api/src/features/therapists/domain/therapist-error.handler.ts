import { TherapistError } from "../domain/therapists.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleTherapistError(err: unknown): Response {
  if (err instanceof TherapistError) {
    switch (err.code) {
      case "THERAPIST_NOT_FOUND":
        return notFound(err.message);
      case "PHONE_EXISTS":
      case "NATIONAL_CODE_EXISTS":
      case "CARD_NUMBER_EXISTS":
      case "MEDICAL_NUMBER_EXISTS":
        return error(err.code, err.message, 409);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
