import { prisma, type Prisma } from "@ebraz/database";
import type {
  CreateClientInput,
  ListClientsQuery,
  UpdateClientInput,
} from "@ebraz/validation/clients";
import { buildPaginationMeta, getSkipTake } from "@ebraz/utils/pagination";
import { normalizePhone } from "@ebraz/utils/phone";
import { toClientProfile } from "../domain/client.mapper";

function buildSearchFilter(search?: string): Prisma.ClientWhereInput | undefined {
  if (!search?.trim()) return undefined;

  const term = search.trim();
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { address: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listClients(query: ListClientsQuery) {
  const where: Prisma.ClientWhereInput = {
    deletedAt: null,
    ...(buildSearchFilter(query.search) ?? {}),
  };

  const { skip, take } = getSkipTake(query);
  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data: items.map(toClientProfile),
    meta: buildPaginationMeta(total, query.page, query.pageSize),
  };
}

export async function findClientById(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function findClientByPhone(phone: string, excludeId?: string) {
  return prisma.client.findFirst({
    where: {
      phone: normalizePhone(phone),
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function createClientRecord(
  input: CreateClientInput,
  actorId: string,
  passwordHash?: string,
) {
  const client = await prisma.client.create({
    data: {
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      birthDate: input.birthDate,
      address: input.address,
      password: passwordHash,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  return toClientProfile(client);
}

export async function updateClientRecord(
  id: string,
  input: UpdateClientInput,
  actorId: string,
) {
  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
      ...(input.birthDate !== undefined ? { birthDate: input.birthDate } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      updatedBy: actorId,
    },
  });

  return toClientProfile(client);
}

export async function setClientPasswordRecord(
  id: string,
  passwordHash: string,
  actorId: string,
) {
  const client = await prisma.client.update({
    where: { id },
    data: {
      password: passwordHash,
      updatedBy: actorId,
    },
  });

  return toClientProfile(client);
}

export async function softDeleteClientRecord(id: string, actorId: string) {
  await prisma.client.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: actorId,
    },
  });
}
