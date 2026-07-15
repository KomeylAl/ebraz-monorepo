import type { UpsertMedicalRecordInput } from "@ebraz/validation/medical-records";
import { toMedicalRecordProfile } from "../domain/medical-record.mapper";
import { MedicalRecordError } from "../domain/medical-records.errors";
import {
  findAdminById,
  findClientById,
  findRecordByClientId,
  findRecordByNumber,
  findTherapistById,
  softDeleteMedicalRecordForClient,
  upsertMedicalRecordForClient,
} from "../infrastructure/medical-records.repository";

async function assertReferences(input: UpsertMedicalRecordInput) {
  if (input.therapistId) {
    const therapist = await findTherapistById(input.therapistId);
    if (!therapist) {
      throw new MedicalRecordError("Therapist not found", "THERAPIST_NOT_FOUND");
    }
  }

  if (input.supervisorId) {
    const supervisor = await findTherapistById(input.supervisorId);
    if (!supervisor) {
      throw new MedicalRecordError("Supervisor not found", "SUPERVISOR_NOT_FOUND");
    }
  }

  if (input.adminId) {
    const admin = await findAdminById(input.adminId);
    if (!admin) {
      throw new MedicalRecordError("Admin not found", "ADMIN_NOT_FOUND");
    }
  }
}

export async function getMedicalRecordByClientId(clientId: string) {
  const client = await findClientById(clientId);
  if (!client) {
    throw new MedicalRecordError("Client not found", "CLIENT_NOT_FOUND");
  }

  const record = await findRecordByClientId(clientId);
  if (!record) {
    throw new MedicalRecordError("Medical record not found", "MEDICAL_RECORD_NOT_FOUND");
  }

  return toMedicalRecordProfile(record);
}

export async function upsertMedicalRecord(
  clientId: string,
  input: UpsertMedicalRecordInput,
  actorId: string,
) {
  const client = await findClientById(clientId);
  if (!client) {
    throw new MedicalRecordError("Client not found", "CLIENT_NOT_FOUND");
  }

  const existing = await findRecordByClientId(clientId);
  const duplicateNumber = await findRecordByNumber(
    input.recordNumber.trim(),
    existing?.id,
  );
  if (duplicateNumber) {
    throw new MedicalRecordError("Record number already exists", "RECORD_NUMBER_EXISTS");
  }

  await assertReferences(input);
  return upsertMedicalRecordForClient(clientId, input, actorId);
}

export async function deleteMedicalRecord(clientId: string, actorId: string) {
  const client = await findClientById(clientId);
  if (!client) {
    throw new MedicalRecordError("Client not found", "CLIENT_NOT_FOUND");
  }

  const record = await findRecordByClientId(clientId);
  if (!record) {
    throw new MedicalRecordError("Medical record not found", "MEDICAL_RECORD_NOT_FOUND");
  }

  await softDeleteMedicalRecordForClient(clientId, actorId);
}
