import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import type { BackupType } from "@ebraz/types/backup-restore";
import { BACKUP_TYPE_LABELS } from "@ebraz/types/backup-restore";

export function getBackupRoot(): string {
  if (process.env.BACKUP_ROOT) {
    return process.env.BACKUP_ROOT;
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", "backups");
}

export function toBackupPublicPath(relativePath: string): string {
  return `/backups/${relativePath.replace(/\\/g, "/")}`;
}

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? process.env.APP_URL ?? "http://localhost:4000";
  return base.replace(/\/$/, "");
}

export async function saveBackupJson(type: BackupType, data: unknown) {
  const label = BACKUP_TYPE_LABELS[type];
  const filename = `${label}_${Date.now()}_${randomUUID()}.json`;
  const diskDir = getBackupRoot();

  await mkdir(diskDir, { recursive: true });

  const json = JSON.stringify(data, null, 2);
  await writeFile(path.join(diskDir, filename), json, "utf8");

  const relativePath = filename;
  const publicPath = toBackupPublicPath(relativePath);

  return {
    filename,
    path: publicPath,
    url: `${getApiBaseUrl()}${publicPath}`,
    count: Array.isArray(data) ? data.length : 1,
  };
}
