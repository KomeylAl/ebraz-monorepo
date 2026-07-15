import { hashPassword } from "@ebraz/auth/server";
import type {
  CreateClientInput,
  ListClientsQuery,
  SetClientPasswordInput,
  UpdateClientInput,
} from "@ebraz/validation/clients";
import { toClientProfile } from "../domain/client.mapper";
import { ClientError } from "../domain/clients.errors";
import {
  createClientRecord,
  findClientById,
  findClientByPhone,
  listClients,
  setClientPasswordRecord,
  softDeleteClientRecord,
  updateClientRecord,
} from "../infrastructure/clients.repository";

export async function getClients(query: ListClientsQuery) {
  return listClients(query);
}

export async function getClient(id: string) {
  const client = await findClientById(id);
  if (!client) {
    throw new ClientError("Client not found", "CLIENT_NOT_FOUND");
  }

  return toClientProfile(client);
}

export async function createClient(input: CreateClientInput, actorId: string) {
  const existing = await findClientByPhone(input.phone);
  if (existing) {
    throw new ClientError("Phone already registered", "PHONE_EXISTS");
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  return createClientRecord(input, actorId, passwordHash);
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
  actorId: string,
) {
  const client = await findClientById(id);
  if (!client) {
    throw new ClientError("Client not found", "CLIENT_NOT_FOUND");
  }

  if (input.phone) {
    const existing = await findClientByPhone(input.phone, id);
    if (existing) {
      throw new ClientError("Phone already registered", "PHONE_EXISTS");
    }
  }

  return updateClientRecord(id, input, actorId);
}

export async function setClientPassword(
  id: string,
  input: SetClientPasswordInput,
  actorId: string,
) {
  const client = await findClientById(id);
  if (!client) {
    throw new ClientError("Client not found", "CLIENT_NOT_FOUND");
  }

  const passwordHash = await hashPassword(input.password);
  return setClientPasswordRecord(id, passwordHash, actorId);
}

export async function deleteClient(id: string, actorId: string) {
  const client = await findClientById(id);
  if (!client) {
    throw new ClientError("Client not found", "CLIENT_NOT_FOUND");
  }

  await softDeleteClientRecord(id, actorId);
}
