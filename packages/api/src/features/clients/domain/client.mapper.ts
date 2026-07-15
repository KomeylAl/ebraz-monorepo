import type { Prisma } from "@ebraz/database";
import type { ClientProfile } from "@ebraz/types/clients";
import { toISODate } from "@ebraz/utils/date";

type ClientRecord = Prisma.ClientGetPayload<Record<string, never>>;

function optionalString(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

export function toClientProfile(client: ClientRecord): ClientProfile {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    birthDate: client.birthDate ? toISODate(client.birthDate) : undefined,
    address: optionalString(client.address),
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}
