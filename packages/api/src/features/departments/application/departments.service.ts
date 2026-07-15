import type {
  CreateDepartmentInput,
  ListDepartmentsQuery,
  UpdateDepartmentInput,
} from "@ebraz/validation/cms/departments";
import { CmsError } from "@/features/cms/domain/cms.errors";
import { toDepartmentProfile, toDepartmentPublicProfile } from "../domain/department.mapper";
import {
  createDepartmentRecord,
  findDepartmentBySlug,
  findDepartmentBySlugExcluding,
  findTherapistsByIds,
  listDepartments,
  listPublicDepartments,
  softDeleteDepartmentRecord,
  updateDepartmentRecord,
} from "../infrastructure/departments.repository";

async function assertTherapists(therapistIds: string[] | undefined) {
  if (!therapistIds?.length) return;
  const therapists = await findTherapistsByIds(therapistIds);
  if (therapists.length !== therapistIds.length) {
    throw new CmsError("One or more therapists not found", "NOT_FOUND");
  }
}

export async function getDepartments(query: ListDepartmentsQuery) {
  return listDepartments(query);
}

export async function getPublicDepartments(query: ListDepartmentsQuery) {
  return listPublicDepartments(query);
}

export async function getDepartmentBySlug(slug: string) {
  const department = await findDepartmentBySlug(slug);
  if (!department) throw new CmsError("Department not found", "NOT_FOUND");
  return toDepartmentProfile(department);
}

export async function getPublicDepartmentBySlug(slug: string) {
  const department = await findDepartmentBySlug(slug);
  if (!department) throw new CmsError("Department not found", "NOT_FOUND");
  return toDepartmentPublicProfile(department);
}

export async function createDepartment(input: CreateDepartmentInput, actorId: string) {
  const duplicate = await findDepartmentBySlug(input.slug.trim());
  if (duplicate) throw new CmsError("Department slug already exists", "SLUG_EXISTS");
  await assertTherapists(input.therapistIds);
  return createDepartmentRecord(input, actorId);
}

export async function updateDepartment(
  slug: string,
  input: UpdateDepartmentInput,
  actorId: string,
) {
  const existing = await findDepartmentBySlug(slug);
  if (!existing) throw new CmsError("Department not found", "NOT_FOUND");
  if (input.slug) {
    const duplicate = await findDepartmentBySlugExcluding(input.slug.trim(), existing.id);
    if (duplicate) throw new CmsError("Department slug already exists", "SLUG_EXISTS");
  }
  await assertTherapists(input.therapistIds);
  return updateDepartmentRecord(existing.id, input, actorId);
}

export async function deleteDepartment(slug: string, actorId: string) {
  const existing = await findDepartmentBySlug(slug);
  if (!existing) throw new CmsError("Department not found", "NOT_FOUND");
  await softDeleteDepartmentRecord(existing.id, actorId);
}
