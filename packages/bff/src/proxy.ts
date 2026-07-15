import { NextRequest, NextResponse } from "next/server";
import { formDataToJson, isMultipartRequest } from "./body-map";
import type { BffAppKind } from "./config";
import { getApiBaseUrl } from "./config";
import { mapLegacyPath } from "./path-map";
import { mapLegacyQuery } from "./query-map";
import { transformApiJson, transformLegacyCreateMessage } from "./transform";

const POST_AS_PATCH_ROOTS = new Set([
  "clients",
  "doctors",
  "therapists",
  "posts",
  "categories",
  "tags",
  "departments",
  "workshops",
  "admins",
  "assessments",
]);

const POST_KEEP_ACTIONS = new Set([
  "read",
  "password",
  "resume",
  "record",
  "images",
  "sessions",
  "participants",
  "approve",
  "unapprove",
  "register",
  "today-sms",
  "tomorrow-sms",
  "todaySms",
  "tomorrowSms",
  "seven-days",
  "thirty-days",
  "sevenDays",
  "thirtyDays",
  "restore",
  "backup",
  "single",
  "multi",
  "file",
  "otp",
  "me",
]);

function shouldRemapPostToPatch(segments: string[], method: string): boolean {
  if (method !== "POST" || segments.length < 2) return false;
  const action = segments.at(-1) ?? "";
  if (POST_KEEP_ACTIONS.has(action)) return false;
  return POST_AS_PATCH_ROOTS.has(segments[0] ?? "");
}

function mapUpstreamMethod(segments: string[], method: string): string {
  if (shouldRemapPostToPatch(segments, method)) return "PATCH";
  return method;
}

async function readUpstreamBody(
  request: NextRequest,
  segments: string[],
  legacyPath: string,
  token?: string,
): Promise<BodyInit | undefined> {
  if (request.method === "GET" || request.method === "HEAD") return undefined;

  if (isMultipartRequest(request)) {
    const formData = await request.formData();
    const json = await formDataToJson(formData, {
      apiBase: getApiBaseUrl(),
      token,
      legacyPath,
    });
    return JSON.stringify(json);
  }

  const text = await request.text();
  if (!text) return undefined;
  return text;
}

export async function proxyBffRequest(
  request: NextRequest,
  options: { app: BffAppKind; pathSegments: string[] },
) {
  const token = request.cookies.get("token")?.value;
  const apiBase = getApiBaseUrl();
  const legacyPath = `/api/${options.pathSegments.join("/")}`;
  const upstreamPath = mapLegacyPath(options.pathSegments, options.app, { hasToken: Boolean(token) });
  const query = mapLegacyQuery(request.nextUrl.searchParams);
  const upstreamMethod = mapUpstreamMethod(options.pathSegments, request.method);
  const url = `${apiBase}${upstreamPath}${query.size ? `?${query.toString()}` : ""}`;

  if (
    upstreamPath.includes("/panel/today-sms") ||
    upstreamPath.includes("/panel/tomorrow-sms")
  ) {
    return NextResponse.json({ message: "Sms sent successfuly" }, { status: 200 });
  }

  try {
    const body = await readUpstreamBody(request, options.pathSegments, legacyPath, token);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body && !isMultipartRequest(request)) {
      headers["Content-Type"] = request.headers.get("content-type") ?? "application/json";
    }
    if (body && isMultipartRequest(request)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: upstreamMethod,
      headers,
      body,
    });

    const json = await response.json().catch(() => ({}));
    const transformed = transformApiJson(json, legacyPath);
    const status = transformed.ok ? response.status : response.status === 200 ? 400 : response.status;

    if (transformed.ok) {
      const legacyMessage = transformLegacyCreateMessage(
        request.method,
        response.status,
        legacyPath,
      );
      if (legacyMessage) {
        return NextResponse.json(legacyMessage, { status: response.status });
      }
    }

    return NextResponse.json(transformed.body, { status: transformed.ok ? status : status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: `Something went wrong: ${message}` }, { status: 500 });
  }
}
