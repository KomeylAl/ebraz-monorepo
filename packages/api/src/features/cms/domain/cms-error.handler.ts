import { CmsError } from "../domain/cms.errors";
import { error, notFound, serverError } from "@/lib/http/response";

export function handleCmsError(err: unknown): Response {
  if (err instanceof CmsError) {
    switch (err.code) {
      case "NOT_FOUND":
        return notFound(err.message);
      case "SLUG_EXISTS":
        return error(err.code, err.message, 409);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
