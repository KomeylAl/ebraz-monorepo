import { uploadFormSchema, type UploadCategory } from "@ebraz/validation/uploads";
import { error } from "./response";

export interface ParsedMultipartUpload {
  file: File;
  category: UploadCategory;
  subfolder?: string;
}

export async function parseMultipartUpload(
  request: Request,
): Promise<ParsedMultipartUpload | Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return error("VALIDATION_ERROR", "File is required", 400);
    }

    const categoryRaw = formData.get("category");
    const subfolderRaw = formData.get("subfolder");

    const parsed = uploadFormSchema.safeParse({
      category: typeof categoryRaw === "string" ? categoryRaw : undefined,
      subfolder:
        typeof subfolderRaw === "string" && subfolderRaw.trim()
          ? subfolderRaw.trim()
          : undefined,
    });

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid upload metadata", 400);
    }

    return {
      file,
      category: parsed.data.category,
      subfolder: parsed.data.subfolder,
    };
  } catch {
    return error("VALIDATION_ERROR", "Invalid multipart form data", 400);
  }
}

export function isErrorResponse<T>(result: T | Response): result is Response {
  return result instanceof Response;
}
