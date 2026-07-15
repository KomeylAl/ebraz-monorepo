import type { Prisma } from "@ebraz/database";
import type { AboutProfile } from "@ebraz/types/cms";

type AboutRecord = Prisma.AboutGetPayload<Record<string, never>>;

export function toAboutProfile(about: AboutRecord): AboutProfile {
  return {
    id: about.id,
    title: about.title,
    about: about.about,
    address: about.address,
    phones: about.phones,
    mobilePhones: about.mobilePhones,
    logoPath: about.logoPath,
    lat: about.lat,
    longitude: about.longitude,
    createdAt: about.createdAt.toISOString(),
    updatedAt: about.updatedAt.toISOString(),
  };
}
