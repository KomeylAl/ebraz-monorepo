import { prisma } from "@ebraz/database";
import type { AdminSubRole, DbUserRole, Permission, UserRole } from "@ebraz/types";

const KNOWN_PERMISSIONS = new Set<string>([
  "appointments.read",
  "appointments.write",
  "appointments.delete",
  "clients.read",
  "clients.write",
  "clients.delete",
  "therapists.read",
  "therapists.write",
  "therapists.delete",
  "admins.read",
  "admins.write",
  "admins.delete",
  "cms.read",
  "cms.write",
  "cms.delete",
  "workshops.read",
  "workshops.write",
  "workshops.delete",
  "payments.read",
  "payments.write",
  "settings.read",
  "settings.write",
]);

function toPermission(key: string): Permission | null {
  return KNOWN_PERMISSIONS.has(key) ? (key as Permission) : null;
}

export async function resolvePermissionsFromDb(
  role: UserRole,
  subRole?: AdminSubRole,
): Promise<Permission[]> {
  if (role === "PUBLIC") return [];

  const records = await prisma.rolePermission.findMany({
    where: {
      role: role as DbUserRole,
      subRole: role === "ADMIN" ? subRole : null,
      deletedAt: null,
      permission: { deletedAt: null },
    },
    include: { permission: true },
  });

  const permissions = records
    .map((record) => toPermission(record.permission.key))
    .filter((permission): permission is Permission => permission !== null);

  return [...new Set(permissions)];
}
