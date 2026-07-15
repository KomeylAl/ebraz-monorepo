import { isErrorResponse, parseMultipartUpload } from "@/lib/http/parse-multipart";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withAuth, withTherapist } from "@/lib/http/with-auth";
import { MedicalRecordError } from "@/features/medical-records/domain/medical-records.errors";
import { handleMedicalRecordError } from "@/features/medical-records/domain/medical-record-error.handler";
import { TherapistError } from "@/features/therapists/domain/therapists.errors";
import { handleTherapistError } from "@/features/therapists/domain/therapist-error.handler";
import { TherapistPanelError } from "@/features/therapist-panel/domain/therapist-panel.errors";
import { handleTherapistPanelError } from "@/features/therapist-panel/domain/therapist-panel-error.handler";
import {
  processUpload,
  uploadMedicalRecordImage,
  uploadTherapistAvatar,
  uploadTherapistResumeFile,
} from "../application/uploads.service";
import { handleUploadError } from "../domain/upload-error.handler";

async function getRouteId(context: { params: Promise<Record<string, string>> }, label: string) {
  const { id } = await context.params;
  if (!id) return error("VALIDATION_ERROR", `${label} is required`, 400);
  return id;
}

async function parseFileOnly(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return error("VALIDATION_ERROR", "File is required", 400);
    }
    return file;
  } catch {
    return error("VALIDATION_ERROR", "Invalid multipart form data", 400);
  }
}

export const uploadFileHandler = withAuth(async (request: AuthenticatedRequest) => {
  const parsed = await parseMultipartUpload(request);
  if (isErrorResponse(parsed)) return parsed;

  try {
    const result = await processUpload(request.auth, parsed.file, parsed.category, {
      subfolder: parsed.subfolder,
    });
    return success(result, 201);
  } catch (err) {
    return handleUploadError(err);
  }
});

export const uploadMyAvatarHandler = withTherapist(async (request) => {
  const file = await parseFileOnly(request);
  if (file instanceof Response) return file;

  try {
    const result = await uploadTherapistAvatar(request.auth, file, request.auth.sub);
    return success(result, 201);
  } catch (err) {
    if (err instanceof TherapistError) return handleTherapistError(err);
    return handleUploadError(err);
  }
});

export const uploadTherapistAvatarHandler = withAuth(
  async (request: AuthenticatedRequest, context) => {
    const therapistId = await getRouteId(context, "Therapist id");
    if (therapistId instanceof Response) return therapistId;

    const file = await parseFileOnly(request);
    if (file instanceof Response) return file;

    try {
      const result = await uploadTherapistAvatar(request.auth, file, therapistId);
      return success(result, 201);
    } catch (err) {
      if (err instanceof TherapistError) return handleTherapistError(err);
      return handleUploadError(err);
    }
  },
);

export const uploadResumeFileHandler = withTherapist(async (request) => {
  const file = await parseFileOnly(request);
  if (file instanceof Response) return file;

  try {
    const result = await uploadTherapistResumeFile(request.auth, file);
    return success(result, 201);
  } catch (err) {
    if (err instanceof TherapistPanelError) return handleTherapistPanelError(err);
    return handleUploadError(err);
  }
});

export const uploadMedicalRecordImageHandler = withAuth(
  async (request: AuthenticatedRequest, context) => {
    const clientId = await getRouteId(context, "Client id");
    if (clientId instanceof Response) return clientId;

    const file = await parseFileOnly(request);
    if (file instanceof Response) return file;

    try {
      const result = await uploadMedicalRecordImage(request.auth, clientId, file);
      return success(result, 201);
    } catch (err) {
      if (err instanceof MedicalRecordError) return handleMedicalRecordError(err);
      return handleUploadError(err);
    }
  },
);
