import { hashPassword } from "@ebraz/auth/server";
import type { CreateAdminInput, ListAdminsQuery, UpdateAdminInput } from "@ebraz/validation/admins";
import { toAdminProfile } from "../domain/admin.mapper";
import { AdminError } from "../domain/admins.errors";
import {
  createAdminRecord,
  findAdminById,
  findAdminByPhone,
  listAdmins,
  listReceptionAdmins,
  softDeleteAdminRecord,
  updateAdminRecord,
} from "../infrastructure/admins.repository";

export async function getAdmins(query: ListAdminsQuery) {
  return listAdmins(query);
}

export async function getReceptionAdmins() {
  return listReceptionAdmins();
}

export async function getAdmin(id: string) {
  const admin = await findAdminById(id);
  if (!admin) {
    throw new AdminError("Admin not found", "ADMIN_NOT_FOUND");
  }

  return toAdminProfile(admin);
}

export async function createAdmin(input: CreateAdminInput, actorId: string) {
  const existing = await findAdminByPhone(input.phone);
  if (existing) {
    throw new AdminError("Phone already registered", "PHONE_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);
  return createAdminRecord(input, passwordHash, actorId);
}

export async function updateAdmin(
  id: string,
  input: UpdateAdminInput,
  actorId: string,
) {
  const admin = await findAdminById(id);
  if (!admin) {
    throw new AdminError("Admin not found", "ADMIN_NOT_FOUND");
  }

  if (input.phone) {
    const existing = await findAdminByPhone(input.phone, id);
    if (existing) {
      throw new AdminError("Phone already registered", "PHONE_EXISTS");
    }
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  return updateAdminRecord(id, input, actorId, passwordHash);
}

export async function deleteAdmin(id: string, actorId: string) {
  if (id === actorId) {
    throw new AdminError("Cannot delete your own account", "CANNOT_DELETE_SELF");
  }

  const admin = await findAdminById(id);
  if (!admin) {
    throw new AdminError("Admin not found", "ADMIN_NOT_FOUND");
  }

  await softDeleteAdminRecord(id, actorId);
}
