import { getApiBaseUrl } from "./config";
import { mapPublicLegacyUrl } from "./path-map";
import { transformApiJson } from "./transform";

export async function fetchPublicLegacy(
  legacyPath: string,
  init?: RequestInit,
): Promise<unknown> {
  const base = getApiBaseUrl();
  const url = mapPublicLegacyUrl(legacyPath, base);
  const response = await fetch(url, init);
  const json = await response.json().catch(() => ({}));
  const transformed = transformApiJson(json, legacyPath);
  if (!transformed.ok) {
    throw new Error(
      typeof transformed.body === "object" &&
        transformed.body &&
        "message" in (transformed.body as object)
        ? String((transformed.body as { message?: string }).message)
        : "Public API request failed",
    );
  }
  return transformed.body;
}

export function publicApiUrl(legacyPath: string): string {
  return mapPublicLegacyUrl(legacyPath, getApiBaseUrl());
}
