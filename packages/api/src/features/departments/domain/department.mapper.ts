import type { Prisma } from "@ebraz/database";
import type { DepartmentProfile, DepartmentPublicProfile } from "@ebraz/types/cms";

export const departmentInclude = {
  therapists: { select: { therapistId: true } },
} satisfies Prisma.DepartmentInclude;

type DepartmentRecord = Prisma.DepartmentGetPayload<{ include: typeof departmentInclude }>;

export function toDepartmentProfile(department: DepartmentRecord): DepartmentProfile {
  return {
    id: department.id,
    title: department.title,
    slug: department.slug,
    excerpt: department.excerpt ?? undefined,
    content: department.content,
    thumbnail: department.thumbnail ?? undefined,
    therapistIds: department.therapists.map((item) => item.therapistId),
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
  };
}

export function toDepartmentPublicProfile(
  department: DepartmentRecord,
): DepartmentPublicProfile {
  return {
    id: department.id,
    title: department.title,
    slug: department.slug,
    excerpt: department.excerpt ?? undefined,
    content: department.content,
    thumbnail: department.thumbnail ?? undefined,
  };
}

export function buildDepartmentData(
  input: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    thumbnail?: string | null;
  },
  actorId: string,
) {
  return {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
    updatedBy: actorId,
  };
}
