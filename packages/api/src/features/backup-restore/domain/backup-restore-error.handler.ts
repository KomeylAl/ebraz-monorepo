import { BackupRestoreError } from "./backup-restore.errors";
import { error, notFound, serverError } from "@/lib/http/response";

function isPrismaKnownError(err: unknown): err is { code: string; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string" &&
    (err as { code: string }).code.startsWith("P")
  );
}

export function handleBackupRestoreError(err: unknown): Response {
  if (err instanceof BackupRestoreError) {
    switch (err.code) {
      case "ENTITY_NOT_FOUND":
        return notFound(err.message);
      case "INVALID_PAYLOAD":
        return error(err.code, err.message, 400);
      default:
        return error(err.code, err.message, 400);
    }
  }

  if (isPrismaKnownError(err)) {
    return error(err.code, err.message, 400);
  }

  if (err instanceof Error) {
    return error("RESTORE_FAILED", err.message, 400);
  }

  return serverError();
}
