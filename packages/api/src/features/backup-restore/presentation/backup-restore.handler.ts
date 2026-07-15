import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission } from "@/lib/http/with-auth";
import { restorePayloadSchema } from "@ebraz/validation/backup-restore";
import { backupEntity, restoreEntity } from "../application/backup-restore.service";
import { handleBackupRestoreError } from "../domain/backup-restore-error.handler";

async function getEntitySlug(context: { params: Promise<Record<string, string>> }) {
  const { entity } = await context.params;
  if (!entity) return error("VALIDATION_ERROR", "Entity is required", 400);
  return entity;
}

export const backupEntityHandler = withPermission(
  "settings.write",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getEntitySlug(context);
    if (slug instanceof Response) return slug;

    try {
      const result = await backupEntity(slug, request.auth.sub);
      return success({
        url: result.url,
        path: result.path,
        filename: result.filename,
        count: result.count,
        backupId: result.backupId,
      });
    } catch (err) {
      return handleBackupRestoreError(err);
    }
  },
);

export const restoreEntityHandler = withPermission(
  "settings.write",
  async (request: AuthenticatedRequest, context) => {
    const slug = await getEntitySlug(context);
    if (slug instanceof Response) return slug;

    const payload = await parseBody(request, restorePayloadSchema);
    if (isErrorResponse(payload)) return payload;

    try {
      const result = await restoreEntity(slug, payload, request.auth.sub);
      return success(result);
    } catch (err) {
      return handleBackupRestoreError(err);
    }
  },
);
