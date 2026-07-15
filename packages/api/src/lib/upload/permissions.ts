import type { AccessTokenPayload, Permission } from "@ebraz/types";
import type { UploadCategory } from "@ebraz/validation/uploads";
import { UploadError } from "./errors";

type CategoryPermissionRule =
  | { type: "permission"; permission: Permission }
  | { type: "therapist_or_permission"; permission: Permission }
  | { type: "therapist_self" }
  | { type: "authenticated" };

const CATEGORY_RULES: Record<UploadCategory, CategoryPermissionRule> = {
  therapist_avatar: { type: "therapist_or_permission", permission: "therapists.write" },
  therapist_resume_pdf: { type: "therapist_self" },
  post_image: { type: "permission", permission: "cms.write" },
  category_image: { type: "permission", permission: "cms.write" },
  tag_image: { type: "permission", permission: "cms.write" },
  department_image: { type: "permission", permission: "cms.write" },
  workshop_image: { type: "permission", permission: "workshops.write" },
  about_logo: { type: "permission", permission: "cms.write" },
  invoice_pdf: { type: "permission", permission: "payments.write" },
  medical_record_image: { type: "permission", permission: "clients.write" },
  assessment_file: { type: "permission", permission: "appointments.write" },
  resource_file: { type: "therapist_self" },
};

function hasPermission(auth: AccessTokenPayload, permission: Permission): boolean {
  return auth.permissions.includes(permission);
}

export function assertCanUpload(
  auth: AccessTokenPayload,
  category: UploadCategory,
  targetId?: string,
): void {
  if (auth.role === "PUBLIC") {
    throw new UploadError("Authentication required", "UNAUTHORIZED");
  }

  const rule = CATEGORY_RULES[category];

  switch (rule.type) {
    case "authenticated":
      return;
    case "therapist_self":
      if (auth.role === "THERAPIST") return;
      throw new UploadError("Therapist access only", "FORBIDDEN");
    case "permission":
      if (hasPermission(auth, rule.permission)) return;
      throw new UploadError("Insufficient permissions", "FORBIDDEN");
    case "therapist_or_permission": {
      if (auth.role === "THERAPIST" && (!targetId || targetId === auth.sub)) return;
      if (hasPermission(auth, rule.permission)) return;
      throw new UploadError("Insufficient permissions", "FORBIDDEN");
    }
  }
}
