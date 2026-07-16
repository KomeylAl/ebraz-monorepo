import { NextRequest, NextResponse } from "next/server";
import type { BffAppKind } from "./config";
import { getApiBaseUrl, getAuthLoginPath } from "./config";
import {
  mapLegacyRoleCookie,
  toLegacyUser,
  transformApiJson,
  transformLegacyCreateMessage,
  transformLoginResponse,
} from "./transform";

const TOKEN_MAX_AGE = 7200;

function setAuthCookies(headers: Headers, accessToken: string, roleCookie: string) {
  headers.append("Set-Cookie", `token=${accessToken}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}`);
  headers.append("Set-Cookie", `role=${roleCookie}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}`);
}

function clearAuthCookies(headers: Headers) {
  headers.append("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
  headers.append("Set-Cookie", "role=; HttpOnly; Path=/; Max-Age=0");
}

export async function handleLogin(request: NextRequest, app: BffAppKind) {
  const { phone, password } = await request.json();
  const apiBase = getApiBaseUrl();

  try {
    const response = await fetch(`${apiBase}${getAuthLoginPath(app)}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });

    const json = await response.json();
    if (!response.ok || json?.success === false) {
      return NextResponse.json(
        { message: json?.error?.message ?? "Invalid credentials" },
        { status: response.status === 200 ? 401 : response.status },
      );
    }

    const legacy = transformLoginResponse(json.data);
    const headers = new Headers();
    const roleCookie =
      app === "admin" || app === "website"
        ? mapLegacyRoleCookie(json.data.user.subRole)
        : app;
    setAuthCookies(headers, legacy.access_token, roleCookie);

    return NextResponse.json(legacy, { headers });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: `Something went wrong ${message}` }, { status: 500 });
  }
}

export async function handleLogout() {
  const apiBase = getApiBaseUrl();
  const headers = new Headers();
  clearAuthCookies(headers);

  try {
    await fetch(`${apiBase}/api/v1/auth/logout`, { method: "POST" });
  } catch {
    // ignore upstream logout errors — cookies are cleared locally
  }

  return NextResponse.json({ message: "Logged out" }, { headers });
}

export async function handleToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ access_token: token });
}

export async function handleUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apiBase = getApiBaseUrl();
  try {
    const response = await fetch(`${apiBase}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    if (!response.ok || json?.success === false) {
      return NextResponse.json(
        { message: json?.error?.message ?? "Error getting user" },
        { status: response.status },
      );
    }
    return NextResponse.json(toLegacyUser(json.data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: `Something went wrong: ${message}` }, { status: 500 });
  }
}

export { setAuthCookies, clearAuthCookies, transformLoginResponse };
