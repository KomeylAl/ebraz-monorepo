import { prisma } from "@ebraz/database";
import type { UpsertAboutInput } from "@ebraz/validation/cms/about";
import { toAboutProfile } from "../domain/about.mapper";

export async function findAbout() {
  return prisma.about.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertAboutRecord(input: UpsertAboutInput, actorId: string) {
  const existing = await findAbout();

  if (existing) {
    const about = await prisma.about.update({
      where: { id: existing.id },
      data: {
        title: input.title.trim(),
        about: input.about,
        address: input.address.trim(),
        phones: input.phones.trim(),
        mobilePhones: input.mobilePhones.trim(),
        logoPath: input.logoPath.trim(),
        lat: input.lat.trim(),
        longitude: input.longitude.trim(),
        updatedBy: actorId,
      },
    });
    return toAboutProfile(about);
  }

  const about = await prisma.about.create({
    data: {
      title: input.title.trim(),
      about: input.about,
      address: input.address.trim(),
      phones: input.phones.trim(),
      mobilePhones: input.mobilePhones.trim(),
      logoPath: input.logoPath.trim(),
      lat: input.lat.trim(),
      longitude: input.longitude.trim(),
      createdBy: actorId,
      updatedBy: actorId,
    },
  });
  return toAboutProfile(about);
}
