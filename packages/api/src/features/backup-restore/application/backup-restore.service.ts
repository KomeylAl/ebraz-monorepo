import type { BackupType } from "@ebraz/types/backup-restore";
import {
  BACKUP_SLUG_TO_TYPE,
  type BackupEntitySlug,
} from "@ebraz/types/backup-restore";
import {
  backupEntitySlugSchema,
  normalizeRestoreItems,
  restorePayloadSchema,
} from "@ebraz/validation/backup-restore";
import { BackupRestoreError } from "../domain/backup-restore.errors";
import {
  exportAndStoreBackup,
  restoreFromPayload,
} from "../infrastructure/backup-restore.repository";

export function resolveBackupType(slug: string): BackupType {
  const parsed = backupEntitySlugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new BackupRestoreError("Unknown backup entity", "ENTITY_NOT_FOUND");
  }
  return BACKUP_SLUG_TO_TYPE[parsed.data as BackupEntitySlug];
}

export async function backupEntity(slug: string, actorId: string) {
  const type = resolveBackupType(slug);
  return exportAndStoreBackup(type, actorId);
}

export async function restoreEntity(slug: string, payload: unknown, actorId: string) {
  const type = resolveBackupType(slug);
  const parsed = restorePayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new BackupRestoreError("Invalid restore payload", "INVALID_PAYLOAD");
  }

  const items = normalizeRestoreItems(parsed.data);
  if (items.length === 0) {
    throw new BackupRestoreError("Restore payload is empty", "INVALID_PAYLOAD");
  }

  return restoreFromPayload(type, items, actorId);
}
