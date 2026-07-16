import { hashPassword } from "@ebraz/auth/server";
import type {
  CreateTherapistInput,
  ListTherapistsQuery,
  ReorderTherapistsInput,
  SetTherapistPasswordInput,
  UpdateTherapistInput,
} from "@ebraz/validation/therapists";
import { toTherapistProfile } from "../domain/therapist.mapper";
import { TherapistError } from "../domain/therapists.errors";
import {
  createTherapistRecord,
  findTherapistByCardNumber,
  findTherapistById,
  findTherapistByMedicalNumber,
  findTherapistByNationalCode,
  findTherapistByPhone,
  listPublicTherapists,
  listTherapists,
  findPublicTherapistDetail,
  reorderTherapists,
  setTherapistPasswordRecord,
  softDeleteTherapistRecord,
  updateTherapistRecord,
} from "../infrastructure/therapists.repository";

async function assertUniqueTherapistFields(
  input: {
    phone?: string;
    nationalCode?: string;
    cardNumber?: string;
    medicalNumber?: string | null;
  },
  excludeId?: string,
) {
  if (input.phone) {
    const existing = await findTherapistByPhone(input.phone, excludeId);
    if (existing) throw new TherapistError("Phone already registered", "PHONE_EXISTS");
  }

  if (input.nationalCode) {
    const existing = await findTherapistByNationalCode(input.nationalCode, excludeId);
    if (existing) {
      throw new TherapistError("National code already registered", "NATIONAL_CODE_EXISTS");
    }
  }

  if (input.cardNumber) {
    const existing = await findTherapistByCardNumber(input.cardNumber, excludeId);
    if (existing) throw new TherapistError("Card number already registered", "CARD_NUMBER_EXISTS");
  }

  if (input.medicalNumber) {
    const existing = await findTherapistByMedicalNumber(input.medicalNumber, excludeId);
    if (existing) {
      throw new TherapistError("Medical number already registered", "MEDICAL_NUMBER_EXISTS");
    }
  }
}

export async function getTherapists(query: ListTherapistsQuery) {
  return listTherapists(query);
}

export async function getPublicTherapists(query: ListTherapistsQuery) {
  return listPublicTherapists(query);
}

export async function getPublicTherapist(id: string) {
  const therapist = await findPublicTherapistDetail(id);
  if (!therapist) {
    throw new TherapistError("Therapist not found", "THERAPIST_NOT_FOUND");
  }

  const resume = therapist.therapistResume;
  const resources = therapist.resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    type: resource.type,
    description: resource.description,
    url: resource.type === "link" ? resource.link : resource.filePath,
  }));

  return {
    id: therapist.id,
    name: therapist.name,
    avatar: therapist.avatar ?? undefined,
    times: therapist.times ?? undefined,
    days: therapist.days ?? undefined,
    profilePath: therapist.profilePath ?? undefined,
    resume: resume
      ? {
          title: resume.title,
          bio: resume.bio,
          specialization: resume.specialization,
          educations: resume.educations,
          experiences: resume.experiences,
          skills: resume.skills,
          certifications: resume.certifications,
          content: resume.content,
          social_links: resume.socialLinks,
          filePath: resume.filePath,
          resources,
        }
      : { resources },
  };
}

export async function getTherapist(id: string) {
  const therapist = await findTherapistById(id);
  if (!therapist) {
    throw new TherapistError("Therapist not found", "THERAPIST_NOT_FOUND");
  }

  return toTherapistProfile(therapist);
}

export async function createTherapist(input: CreateTherapistInput, actorId: string) {
  await assertUniqueTherapistFields(input);

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  return createTherapistRecord(input, actorId, passwordHash);
}

export async function updateTherapist(
  id: string,
  input: UpdateTherapistInput,
  actorId: string,
) {
  const therapist = await findTherapistById(id);
  if (!therapist) {
    throw new TherapistError("Therapist not found", "THERAPIST_NOT_FOUND");
  }

  await assertUniqueTherapistFields(input, id);
  return updateTherapistRecord(id, input, actorId);
}

export async function setTherapistPassword(
  id: string,
  input: SetTherapistPasswordInput,
  actorId: string,
) {
  const therapist = await findTherapistById(id);
  if (!therapist) {
    throw new TherapistError("Therapist not found", "THERAPIST_NOT_FOUND");
  }

  const passwordHash = await hashPassword(input.password);
  return setTherapistPasswordRecord(id, passwordHash, actorId);
}

export async function reorderTherapistsOrder(
  input: ReorderTherapistsInput,
  actorId: string,
) {
  return reorderTherapists(input.orderedIds, actorId);
}

export async function deleteTherapist(id: string, actorId: string) {
  const therapist = await findTherapistById(id);
  if (!therapist) {
    throw new TherapistError("Therapist not found", "THERAPIST_NOT_FOUND");
  }

  await softDeleteTherapistRecord(id, actorId);
}
