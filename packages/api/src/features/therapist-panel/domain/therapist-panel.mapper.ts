import type { Prisma } from "@ebraz/database";
import type {
  ResumeEducation,
  ResumeExperience,
  ResumeSocialLinks,
  TherapistResourceProfile,
  TherapistResumeProfile,
} from "@ebraz/types/therapist-panel";

type TherapistResumeRecord = Prisma.TherapistResumeGetPayload<object>;
type TherapistResourceRecord = Prisma.TherapistResourceGetPayload<object>;

function parseJsonArray<T>(value: Prisma.JsonValue | null | undefined, fallback: T[]): T[] {
  if (!value || !Array.isArray(value)) return fallback;
  return value as T[];
}

function parseSocialLinks(value: Prisma.JsonValue | null | undefined): ResumeSocialLinks | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as ResumeSocialLinks;
}

export function toTherapistResumeProfile(record: TherapistResumeRecord): TherapistResumeProfile {
  return {
    id: record.id,
    therapistId: record.therapistId,
    title: record.title,
    bio: record.bio,
    specialization: record.specialization,
    educations: parseJsonArray<ResumeEducation>(record.educations, []),
    experiences: parseJsonArray<ResumeExperience>(record.experiences, []),
    skills: parseJsonArray<string>(record.skills, []),
    certifications: parseJsonArray<string>(record.certifications, []),
    content: record.content,
    socialLinks: parseSocialLinks(record.socialLinks),
    filePath: record.filePath,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toTherapistResourceProfile(
  record: TherapistResourceRecord,
): TherapistResourceProfile {
  return {
    id: record.id,
    therapistId: record.therapistId,
    title: record.title,
    type: record.type,
    description: record.description,
    link: record.link,
    filePath: record.filePath,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function emptyTherapistResumeProfile(therapistId: string): TherapistResumeProfile {
  return {
    id: "",
    therapistId,
    title: null,
    bio: null,
    specialization: null,
    educations: [],
    experiences: [],
    skills: [],
    certifications: [],
    content: null,
    socialLinks: null,
    filePath: null,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}
