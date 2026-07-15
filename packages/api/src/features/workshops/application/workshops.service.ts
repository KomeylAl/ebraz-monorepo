import type {
  CreateWorkshopInput,
  CreateWorkshopSessionInput,
  ListWorkshopsQuery,
  ParticipantInput,
  RegisterWorkshopInput,
  UpdateParticipantInput,
  UpdateWorkshopInput,
  UpdateWorkshopSessionInput,
} from "@ebraz/validation/workshops";
import { prisma } from "@ebraz/database";
import { isRegistrationOpen, normalizeParticipantPhone } from "../domain/workshop.mapper";
import { WorkshopError } from "../domain/workshops.errors";
import {
  createSessionRecord,
  createWorkshopRecord,
  enrollParticipant,
  findEnrollment,
  findSessionById,
  findWorkshopById,
  findWorkshopBySlug,
  listWorkshops,
  mapWorkshopAdmin,
  mapWorkshopPublic,
  removeEnrollment,
  setEnrollmentApproval,
  softDeleteSessionRecord,
  softDeleteWorkshopRecord,
  updateEnrollmentParticipant,
  updateSessionRecord,
  updateWorkshopRecord,
} from "../infrastructure/workshops.repository";

export async function getWorkshops(query: ListWorkshopsQuery) {
  return listWorkshops(query);
}

export async function getPublicWorkshops(query: ListWorkshopsQuery) {
  return listWorkshops(query);
}

export async function getWorkshopById(id: string) {
  const workshop = await findWorkshopById(id);
  if (!workshop) throw new WorkshopError("Workshop not found", "NOT_FOUND");
  return mapWorkshopAdmin(workshop);
}

export async function getPublicWorkshopById(id: string) {
  const workshop = await findWorkshopById(id);
  if (!workshop) throw new WorkshopError("Workshop not found", "NOT_FOUND");
  return mapWorkshopPublic(workshop);
}

export async function createWorkshop(input: CreateWorkshopInput, actorId: string) {
  const duplicate = await findWorkshopBySlug(input.slug.trim());
  if (duplicate) throw new WorkshopError("Workshop slug already exists", "SLUG_EXISTS");
  return createWorkshopRecord(input, actorId);
}

export async function updateWorkshop(id: string, input: UpdateWorkshopInput, actorId: string) {
  const existing = await findWorkshopById(id);
  if (!existing) throw new WorkshopError("Workshop not found", "NOT_FOUND");
  if (input.slug) {
    const duplicate = await findWorkshopBySlug(input.slug.trim(), existing.id);
    if (duplicate) throw new WorkshopError("Workshop slug already exists", "SLUG_EXISTS");
  }
  return updateWorkshopRecord(existing.id, input, actorId);
}

export async function deleteWorkshop(id: string, actorId: string) {
  const existing = await findWorkshopById(id);
  if (!existing) throw new WorkshopError("Workshop not found", "NOT_FOUND");
  await softDeleteWorkshopRecord(existing.id, actorId);
}

export async function createWorkshopSession(
  workshopId: string,
  input: CreateWorkshopSessionInput,
  actorId: string,
) {
  const workshop = await findWorkshopById(workshopId);
  if (!workshop) throw new WorkshopError("Workshop not found", "NOT_FOUND");
  return createSessionRecord(workshop.id, input, actorId);
}

export async function updateWorkshopSession(
  workshopId: string,
  sessionId: string,
  input: UpdateWorkshopSessionInput,
  actorId: string,
) {
  const session = await findSessionById(workshopId, sessionId);
  if (!session) throw new WorkshopError("Session not found", "NOT_FOUND");
  return updateSessionRecord(session.id, input, actorId);
}

export async function deleteWorkshopSession(
  workshopId: string,
  sessionId: string,
  actorId: string,
) {
  const session = await findSessionById(workshopId, sessionId);
  if (!session) throw new WorkshopError("Session not found", "NOT_FOUND");
  await softDeleteSessionRecord(session.id, actorId);
}

export async function addWorkshopParticipant(
  workshopId: string,
  input: ParticipantInput,
  actorId: string,
) {
  const workshop = await findWorkshopById(workshopId);
  if (!workshop) throw new WorkshopError("Workshop not found", "NOT_FOUND");

  const normalizedPhone = normalizeParticipantPhone(input.phone);
  const existing = await prisma.participant.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { phone: normalizedPhone },
        ...(input.nationalCode ? [{ nationalCode: input.nationalCode }] : []),
      ],
    },
  });
  if (existing) {
    const enrolled = await findEnrollment(workshopId, existing.id);
    if (enrolled) {
      throw new WorkshopError("Already registered for this workshop", "ALREADY_REGISTERED");
    }
  }

  return enrollParticipant(workshopId, input, actorId);
}

export async function registerForWorkshop(workshopId: string, input: RegisterWorkshopInput) {
  const workshop = await findWorkshopById(workshopId);
  if (!workshop) throw new WorkshopError("Workshop not found", "NOT_FOUND");
  if (!isRegistrationOpen(workshop.endDate)) {
    throw new WorkshopError("Workshop registration is closed", "REGISTRATION_CLOSED");
  }

  const normalizedPhone = normalizeParticipantPhone(input.phone);
  const participant = await prisma.participant.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { phone: normalizedPhone },
        ...(input.nationalCode ? [{ nationalCode: input.nationalCode }] : []),
      ],
    },
  });
  if (participant) {
    const enrolled = await findEnrollment(workshopId, participant.id);
    if (enrolled) {
      throw new WorkshopError("Already registered for this workshop", "ALREADY_REGISTERED");
    }
  }

  return enrollParticipant(workshopId, { ...input, approved: false });
}

export async function updateWorkshopParticipant(
  workshopId: string,
  participantId: string,
  input: UpdateParticipantInput,
  actorId: string,
) {
  const updated = await updateEnrollmentParticipant(workshopId, participantId, input, actorId);
  if (!updated) throw new WorkshopError("Participant not found", "NOT_FOUND");
  return updated;
}

export async function approveWorkshopParticipant(workshopId: string, participantId: string) {
  const updated = await setEnrollmentApproval(workshopId, participantId, true);
  if (!updated) throw new WorkshopError("Participant not found", "NOT_FOUND");
  return updated;
}

export async function unapproveWorkshopParticipant(workshopId: string, participantId: string) {
  const updated = await setEnrollmentApproval(workshopId, participantId, false);
  if (!updated) throw new WorkshopError("Participant not found", "NOT_FOUND");
  return updated;
}

export async function removeWorkshopParticipant(workshopId: string, participantId: string) {
  const enrollment = await findEnrollment(workshopId, participantId);
  if (!enrollment) throw new WorkshopError("Participant not found", "NOT_FOUND");
  await removeEnrollment(workshopId, participantId);
}
