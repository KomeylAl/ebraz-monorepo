import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import type { UploadCategory } from "@ebraz/validation/uploads";
import { sanitizeFilename } from "@ebraz/utils/file";
import type { UploadResult } from "@ebraz/types/uploads";
import { UPLOAD_CATEGORIES, resolveExtension } from "./config";
import { UploadError } from "./errors";

export function getUploadRoot(): string {
  if (process.env.UPLOAD_ROOT) {
    return process.env.UPLOAD_ROOT;
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");
}

export function toPublicPath(relativePath: string): string {
  return `/uploads/${relativePath.replace(/\\/g, "/")}`;
}

export async function saveUploadedFile(
  file: File,
  category: UploadCategory,
  subfolder?: string,
): Promise<UploadResult> {
  const config = UPLOAD_CATEGORIES[category];

  if (config.requiresSubfolder && !subfolder?.trim()) {
    throw new UploadError("Subfolder is required for this category", "SUBFOLDER_REQUIRED");
  }

  if (file.size > config.maxBytes) {
    throw new UploadError("File exceeds maximum allowed size", "FILE_TOO_LARGE");
  }

  if (!config.mimeTypes.includes(file.type)) {
    throw new UploadError("File type is not allowed", "INVALID_MIME_TYPE");
  }

  const safeSubfolder = subfolder?.trim()
    ? sanitizeFilename(subfolder.trim()).replace(/\./g, "_")
    : undefined;

  const ext = resolveExtension(file.type, file.name);
  const filename = `${randomUUID()}.${ext}`;
  const relativeDir = safeSubfolder
    ? path.posix.join(config.folder, safeSubfolder)
    : config.folder;
  const diskDir = path.join(getUploadRoot(), relativeDir);

  await mkdir(diskDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(diskDir, filename), buffer);

  const relativePath = path.posix.join(relativeDir, filename);

  return {
    path: toPublicPath(relativePath),
    filename,
    size: file.size,
    mimeType: file.type,
    category,
  };
}
