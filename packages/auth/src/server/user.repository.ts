import { prisma } from "@ebraz/database";
import type { AdminSubRole, DbUserRole, Permission, UserRole } from "@ebraz/types";
import { normalizePhone } from "@ebraz/utils/phone";

export async function findUserByPhone(phone: string, role: DbUserRole) {
  const normalizedPhone = normalizePhone(phone);

  switch (role) {
    case "ADMIN":
      return prisma.admin.findFirst({
        where: { phone: normalizedPhone, deletedAt: null },
      });
    case "THERAPIST":
      return prisma.therapist.findFirst({
        where: { phone: normalizedPhone, deletedAt: null },
      });
    case "CLIENT":
      return prisma.client.findFirst({
        where: { phone: normalizedPhone, deletedAt: null },
      });
    default:
      return null;
  }
}

export async function findUserById(userId: string, role: DbUserRole) {
  switch (role) {
    case "ADMIN":
      return prisma.admin.findFirst({
        where: { id: userId, deletedAt: null },
      });
    case "THERAPIST":
      return prisma.therapist.findFirst({
        where: { id: userId, deletedAt: null },
      });
    case "CLIENT":
      return prisma.client.findFirst({
        where: { id: userId, deletedAt: null },
      });
    default:
      return null;
  }
}

export function toUserRole(role: DbUserRole): UserRole {
  return role;
}

export function formatDate(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
}

export type SafeUserRecord = {
  id: string;
  name: string;
  phone: string;
  subRole?: AdminSubRole;
  birthDate?: Date | null;
  nationalCode?: string;
  address?: string | null;
  password?: string | null;
};

export function mapToSafeUser(
  user: SafeUserRecord,
  role: DbUserRole,
  permissions: Permission[],
) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: toUserRole(role),
    subRole: user.subRole,
    permissions,
    birthDate: formatDate(user.birthDate),
    nationalCode: user.nationalCode,
    address: user.address ?? undefined,
  };
}
