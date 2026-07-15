const SNAKE_TO_CAMEL: Record<string, string> = {
  national_code: "nationalCode",
  medical_number: "medicalNumber",
  card_number: "cardNumber",
  birth_date: "birthDate",
  social_links: "socialLinks",
  file_path: "filePath",
  category_id: "categoryId",
  tag_ids: "tagIds",
  published_at: "publishedAt",
  client_id: "clientId",
  therapist_id: "therapistId",
  doctor_id: "therapistId",
};

const JSON_FIELDS = new Set([
  "educations",
  "experiences",
  "skills",
  "certifications",
  "social_links",
  "socialLinks",
  "tag_ids",
  "tagIds",
  "department_ids",
]);

const FILE_FIELD_CATEGORIES: Record<string, string> = {
  image: "category_image",
  avatar: "therapist_avatar",
  resume: "therapist_resume_pdf",
  file: "therapist_resume_pdf",
  thumbnail: "post_image",
  logo: "about_logo",
};

function camelCaseKey(key: string): string {
  if (SNAKE_TO_CAMEL[key]) return SNAKE_TO_CAMEL[key];
  if (key.endsWith("[]")) {
    const base = key.slice(0, -2);
    return SNAKE_TO_CAMEL[base] ?? base;
  }
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function parseFieldValue(key: string, value: string): unknown {
  const normalizedKey = camelCaseKey(key);
  if (JSON_FIELDS.has(key) || JSON_FIELDS.has(normalizedKey)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

async function uploadFile(
  apiBase: string,
  token: string | undefined,
  file: File,
  category: string,
  subfolder?: string,
): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  form.set("category", category);
  if (subfolder) form.set("subfolder", subfolder);

  const response = await fetch(`${apiBase}/api/v1/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const json = await response.json();
  if (!response.ok || json?.success === false) {
    throw new Error(json?.error?.message ?? "File upload failed");
  }
  return json.data.path as string;
}

export async function formDataToJson(
  formData: FormData,
  options: { apiBase: string; token?: string; legacyPath: string },
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const category =
        options.legacyPath.includes("/resources") && key === "file"
          ? "resource_file"
          : (FILE_FIELD_CATEGORIES[key] ?? "post_image");
      const subfolder =
        options.legacyPath.includes("/clients/") && key === "file"
          ? options.legacyPath.split("/clients/")[1]?.split("/")[0]
          : undefined;
      const path = await uploadFile(options.apiBase, options.token, value, category, subfolder);
      const normalizedKey = camelCaseKey(key);
      if (normalizedKey === "file") {
        result.filePath = path;
      } else {
        result[normalizedKey] = path;
      }
      continue;
    }

    const normalizedKey = camelCaseKey(key);
    const parsed = parseFieldValue(key, value);

    if (key.endsWith("[]")) {
      const existing = result[normalizedKey];
      if (Array.isArray(existing)) {
        existing.push(parsed);
      } else {
        result[normalizedKey] = [parsed];
      }
      continue;
    }

    result[normalizedKey] = parsed;
  }

  if (result.social_links && !result.socialLinks) {
    result.socialLinks = result.social_links;
    delete result.social_links;
  }

  return result;
}

export function isMultipartRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("multipart/form-data");
}
