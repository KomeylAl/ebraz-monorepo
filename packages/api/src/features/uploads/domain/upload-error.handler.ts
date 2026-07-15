import { UploadError } from "@/lib/upload";
import { error, forbidden, serverError, unauthorized } from "@/lib/http/response";

export function handleUploadError(err: unknown): Response {
  if (err instanceof UploadError) {
    switch (err.code) {
      case "UNAUTHORIZED":
        return unauthorized(err.message);
      case "FORBIDDEN":
        return forbidden(err.message);
      case "FILE_TOO_LARGE":
      case "INVALID_MIME_TYPE":
      case "SUBFOLDER_REQUIRED":
        return error(err.code, err.message, 400);
      default:
        return error(err.code, err.message, 400);
    }
  }
  return serverError();
}
