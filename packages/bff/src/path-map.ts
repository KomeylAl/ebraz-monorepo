import type { BffAppKind } from "./config";
import { mapLegacyQuery } from "./query-map";

const THERAPIST_PANEL_ROOTS = new Set([
  "appointments",
  "resume",
  "resources",
  "assessments",
  "notifications",
  "dashboard",
  "clients",
  "me",
  "password",
]);

const SEGMENT_MAP: Record<string, string | string[]> = {
  doctors: "therapists",
  "doctor-resumes": "therapist-resumes",
  sevenDays: ["panel", "seven-days"],
  thirtyDays: ["panel", "thirty-days"],
  todaySms: ["panel", "today-sms"],
  tomorrowSms: ["panel", "tomorrow-sms"],
};

function expandSegment(segment: string): string[] {
  const mapped = SEGMENT_MAP[segment];
  if (!mapped) return [segment];
  return Array.isArray(mapped) ? mapped : [mapped];
}

const PUBLIC_WEBSITE_ROOTS: Record<string, string> = {
  doctors: "therapists",
  posts: "posts",
  categories: "categories",
  tags: "tags",
  departments: "departments",
  workshops: "workshops",
  about: "about",
  assessments: "assessments",
};

export function mapLegacyPath(
  segments: string[],
  app: BffAppKind,
  options?: { hasToken?: boolean },
): string {
  if (app === "therapist" && segments[0] && THERAPIST_PANEL_ROOTS.has(segments[0])) {
    return `/api/v1/therapist-panel/${segments.join("/")}`;
  }

  if (app === "website" && !options?.hasToken && segments[0] && segments[0] in PUBLIC_WEBSITE_ROOTS) {
    const apiRoot = PUBLIC_WEBSITE_ROOTS[segments[0]!]!;
    if (segments.length === 1) return `/api/v1/${apiRoot}/public`;
    if (segments.length === 2) return `/api/v1/${apiRoot}/public/${segments[1]}`;
  }

  const mapped = segments.flatMap((segment) => expandSegment(segment));
  return `/api/v1/${mapped.join("/")}`;
}

const PUBLIC_LEGACY_PATH_RULES: Array<{ legacy: RegExp; v1: string }> = [
  { legacy: /^api\/doctors\/([^/?]+)$/, v1: "api/v1/therapists/public/$1" },
  { legacy: /^api\/doctors$/, v1: "api/v1/therapists/public" },
  { legacy: /^api\/posts\/([^/?]+)$/, v1: "api/v1/posts/public/$1" },
  { legacy: /^api\/posts$/, v1: "api/v1/posts/public" },
  { legacy: /^api\/categories\/([^/?]+)$/, v1: "api/v1/categories/public/$1" },
  { legacy: /^api\/categories$/, v1: "api/v1/categories/public" },
  { legacy: /^api\/tags\/([^/?]+)$/, v1: "api/v1/tags/public/$1" },
  { legacy: /^api\/tags$/, v1: "api/v1/tags/public" },
  { legacy: /^api\/departments\/([^/?]+)$/, v1: "api/v1/departments/public/$1" },
  { legacy: /^api\/departments$/, v1: "api/v1/departments/public" },
  { legacy: /^api\/workshops\/([^/?]+)$/, v1: "api/v1/workshops/public/$1" },
  { legacy: /^api\/workshops$/, v1: "api/v1/workshops/public" },
  { legacy: /^api\/about$/, v1: "api/v1/about/public" },
  { legacy: /^api\/assessments$/, v1: "api/v1/assessments/public" },
];

export function mapPublicLegacyUrl(legacyPath: string, baseUrl?: string): string {
  const base = (baseUrl ?? "").replace(/\/$/, "");
  const raw = legacyPath.replace(/^\//, "");
  const queryIndex = raw.indexOf("?");
  const pathOnly = queryIndex >= 0 ? raw.slice(0, queryIndex) : raw;
  const queryString = queryIndex >= 0 ? raw.slice(queryIndex + 1) : "";

  let mappedPath = pathOnly;
  for (const rule of PUBLIC_LEGACY_PATH_RULES) {
    const match = mappedPath.match(rule.legacy);
    if (match) {
      mappedPath = mappedPath.replace(
        rule.legacy,
        rule.v1.replace(/\$(\d+)/g, (_, n) => match[Number(n)] ?? ""),
      );
      break;
    }
  }

  if (!mappedPath.startsWith("api/v1/")) {
    mappedPath = mappedPath.replace(/^api\//, "api/v1/");
  }

  const mappedQuery = mapLegacyQuery(new URLSearchParams(queryString));
  const qs = mappedQuery.toString();
  return qs ? `${base}/${mappedPath}?${qs}` : `${base}/${mappedPath}`;
}
