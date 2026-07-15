import { z } from "zod";

export const backupEntitySlugSchema = z.enum([
  "admins",
  "therapists",
  "doctors",
  "therapist-resumes",
  "doctor-resumes",
  "clients",
  "posts",
  "categories",
  "tags",
  "workshops",
  "about",
  "departments",
  "client-records",
  "appointments",
  "assessments",
  "payments",
]);

export type BackupEntitySlug = z.infer<typeof backupEntitySlugSchema>;

export const restorePayloadSchema = z.union([
  z.array(z.record(z.unknown())),
  z.object({
    data: z.array(z.record(z.unknown())),
  }),
]);

export type RestorePayload = z.infer<typeof restorePayloadSchema>;

export function normalizeRestoreItems(payload: RestorePayload): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload;
  return payload.data;
}
