import { fetchPublicLegacy, publicApiUrl } from "@ebraz/bff/public";
import { ensurePaginated, type LegacyPaginated } from "@ebraz/bff";

export { fetchPublicLegacy, publicApiUrl, ensurePaginated };
export type { LegacyPaginated };

function unwrapLegacyPayload(result: unknown): unknown {
  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    !("meta" in result) &&
    !Array.isArray((result as { data: unknown }).data)
  ) {
    return (result as { data: unknown }).data;
  }
  return result;
}

/** Server-side fetch for public CMS pages during SSG/SSR */
export async function fetchSiteLegacy(path: string, init?: RequestInit) {
  const legacyPath = path.startsWith("api/")
    ? path
    : `api/${path.replace(/^\//, "").replace(/^api\//, "")}`;
  try {
    const result = await fetchPublicLegacy(legacyPath, init);
    return unwrapLegacyPayload(result);
  } catch (error) {
    console.error(`fetchSiteLegacy failed for ${legacyPath}:`, error);
    return null;
  }
}

/** List endpoints — always returns a safe paginated object */
export async function fetchSiteList<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<LegacyPaginated<T>> {
  const result = await fetchSiteLegacy(path, init);
  return ensurePaginated<T>(result);
}
