const ACCESS_TOKEN_KEY = "ebraz_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
  apiBaseUrl: string,
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshed = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      const data = (await refreshed.json()) as { data: { accessToken: string } };
      setAccessToken(data.data.accessToken);
      headers.set("Authorization", `Bearer ${data.data.accessToken}`);
      return fetch(`${apiBaseUrl}${url}`, { ...options, headers, credentials: "include" });
    }

    clearAccessToken();
  }

  return response;
}
