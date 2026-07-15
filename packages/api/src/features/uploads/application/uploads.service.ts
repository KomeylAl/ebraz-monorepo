import type { AccessTokenPayload } from "@ebraz/types";
import type { UploadCategory } from "@ebraz/validation/uploads";
import type { UploadResult } from "@ebraz/types/uploads";
import { MedicalRecordError } from "@/features/medical-records/domain/medical-records.errors";
import { appendRecordImageForClient } from "@/features/medical-records/infrastructure/medical-records.repository";
import { upsertTherapistResumeRecord } from "@/features/therapist-panel/infrastructure/therapist-panel.repository";
import { TherapistError } from "@/features/therapists/domain/therapists.errors";
import {
  findTherapistById,
  updateTherapistAvatarRecord,
} from "@/features/therapists/infrastructure/therapists.repository";
import { assertCanUpload, saveUploadedFile } from "@/lib/upload";

export async function processUpload(
  auth: AccessTokenPayload,
  file: File,
  category: UploadCategory,
  options?: { subfolder?: string; targetId?: string },
): Promise<UploadResult> {
  assertCanUpload(auth, category, options?.targetId);
  return saveUploadedFile(file, category, options?.subfolder);
}

export async function uploadTherapistAvatar(
  auth: AccessTokenPayload,
  file: File,
  therapistId: string,
) {
  assertCanUpload(auth, "therapist_avatar", therapistId);

  const therapist = await findTherapistById(therapistId);
  if (!therapist) {
    throw new TherapistError("Therapist not found", "THERAPIST_NOT_FOUND");
  }

  const upload = await saveUploadedFile(file, "therapist_avatar");
  const updated = await updateTherapistAvatarRecord(therapistId, upload.path, auth.sub);

  return { upload, therapist: updated };
}

export async function uploadTherapistResumeFile(auth: AccessTokenPayload, file: File) {
  if (auth.role !== "THERAPIST") {
    throw new TherapistError("Therapist access only", "FORBIDDEN");
  }

  const upload = await saveUploadedFile(file, "therapist_resume_pdf");
  const resume = await upsertTherapistResumeRecord(auth.sub, { filePath: upload.path });

  return { upload, resume };
}

export async function uploadMedicalRecordImage(
  auth: AccessTokenPayload,
  clientId: string,
  file: File,
) {
  assertCanUpload(auth, "medical_record_image");

  const upload = await saveUploadedFile(file, "medical_record_image", clientId);
  const image = await appendRecordImageForClient(clientId, upload.path, auth.sub);

  if (!image) {
    throw new MedicalRecordError("Medical record not found", "MEDICAL_RECORD_NOT_FOUND");
  }

  return { upload, image };
}
