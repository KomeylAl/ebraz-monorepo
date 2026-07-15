import { AssessmentError } from "./assessments.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleAssessmentError(err: unknown): Response {
  if (err instanceof AssessmentError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      case "THERAPIST_NOT_FOUND":
        return notFound(err.message);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
