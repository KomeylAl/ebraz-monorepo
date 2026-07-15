import type { Prisma } from "@ebraz/database";
import type { AdminProfile } from "@ebraz/types/admins";
import { toISODate } from "@ebraz/utils/date";

type AdminRecord = Prisma.AdminGetPayload<Record<string, never>>;

export function toAdminProfile(admin: AdminRecord): AdminProfile {
  return {
    id: admin.id,
    name: admin.name,
    phone: admin.phone,
    subRole: admin.subRole,
    birthDate: toISODate(admin.birthDate),
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}
