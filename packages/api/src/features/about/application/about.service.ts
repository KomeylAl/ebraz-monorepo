import type { UpsertAboutInput } from "@ebraz/validation/cms/about";
import { CmsError } from "@/features/cms/domain/cms.errors";
import { toAboutProfile } from "../domain/about.mapper";
import { findAbout, upsertAboutRecord } from "../infrastructure/about.repository";

export async function getAbout() {
  const about = await findAbout();
  if (!about) throw new CmsError("About not found", "NOT_FOUND");
  return toAboutProfile(about);
}

export async function upsertAbout(input: UpsertAboutInput, actorId: string) {
  return upsertAboutRecord(input, actorId);
}
