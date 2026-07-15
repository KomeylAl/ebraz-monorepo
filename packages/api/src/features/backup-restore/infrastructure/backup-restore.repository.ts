import { prisma, type BackupType as DbBackupType } from "@ebraz/database";
import type { BackupType } from "@ebraz/types/backup-restore";
import { saveBackupJson } from "@/lib/backup";
import { exportEntityData, restoreEntityData } from "./entity-handlers";

export async function createBackupRecord(
  type: BackupType,
  filePath: string,
  fileUrl: string,
  createdBy: string,
) {
  return prisma.backup.create({
    data: {
      type: type as DbBackupType,
      filePath,
      fileUrl,
      createdBy,
    },
  });
}

export async function createRestoreRecord(
  type: BackupType,
  itemCount: number,
  createdBy: string,
) {
  return prisma.restore.create({
    data: {
      type: type as DbBackupType,
      itemCount,
      createdBy,
    },
  });
}

export async function exportAndStoreBackup(type: BackupType, actorId: string) {
  const data = await exportEntityData(type);
  const file = await saveBackupJson(type, data);
  const backup = await createBackupRecord(type, file.path, file.url, actorId);

  return {
    backupId: backup.id,
    ...file,
  };
}

export async function restoreFromPayload(
  type: BackupType,
  items: Record<string, unknown>[],
  actorId: string,
) {
  const restored = await restoreEntityData(type, items);
  const restore = await createRestoreRecord(type, restored, actorId);

  return {
    restoreId: restore.id,
    type,
    restored,
  };
}
