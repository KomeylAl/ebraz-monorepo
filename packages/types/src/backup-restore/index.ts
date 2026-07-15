export type BackupType =
  | "ADMIN"
  | "THERAPIST"
  | "THERAPIST_RESUME"
  | "CLIENT"
  | "CLIENT_RECORD"
  | "ASSESSMENT"
  | "APPOINTMENT"
  | "PAYMENT"
  | "DEPARTMENT"
  | "POST"
  | "CATEGORY"
  | "TAG"
  | "WORKSHOP"
  | "ABOUT";

export type BackupEntitySlug =
  | "admins"
  | "therapists"
  | "doctors"
  | "therapist-resumes"
  | "doctor-resumes"
  | "clients"
  | "posts"
  | "categories"
  | "tags"
  | "workshops"
  | "about"
  | "departments"
  | "client-records"
  | "appointments"
  | "assessments"
  | "payments";

export interface BackupFileResult {
  path: string;
  url: string;
  filename: string;
  count: number;
}

export interface BackupOperationResult extends BackupFileResult {
  backupId: string;
}

export interface RestoreOperationResult {
  restoreId: string;
  type: BackupType;
  restored: number;
}

export const BACKUP_SLUG_TO_TYPE: Record<BackupEntitySlug, BackupType> = {
  admins: "ADMIN",
  therapists: "THERAPIST",
  doctors: "THERAPIST",
  "therapist-resumes": "THERAPIST_RESUME",
  "doctor-resumes": "THERAPIST_RESUME",
  clients: "CLIENT",
  posts: "POST",
  categories: "CATEGORY",
  tags: "TAG",
  workshops: "WORKSHOP",
  about: "ABOUT",
  departments: "DEPARTMENT",
  "client-records": "CLIENT_RECORD",
  appointments: "APPOINTMENT",
  assessments: "ASSESSMENT",
  payments: "PAYMENT",
};

export const BACKUP_TYPE_LABELS: Record<BackupType, string> = {
  ADMIN: "admins",
  THERAPIST: "therapists",
  THERAPIST_RESUME: "therapist-resumes",
  CLIENT: "clients",
  CLIENT_RECORD: "client-records",
  ASSESSMENT: "assessments",
  APPOINTMENT: "appointments",
  PAYMENT: "payments",
  DEPARTMENT: "departments",
  POST: "posts",
  CATEGORY: "categories",
  TAG: "tags",
  WORKSHOP: "workshops",
  ABOUT: "about",
};
