"use client";

import { clearAccessToken, setAccessToken } from "@ebraz/auth/client";
import type { ApiClient, AuthRole } from "@ebraz/api-client";
import { ApiError } from "@ebraz/api-client";
import type { AuthUserProfile } from "@ebraz/types";
import type { LoginInput } from "@ebraz/validation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearAuthCookie, setAuthCookie } from "./auth-cookie";

interface AuthContextValue {
  user: AuthUserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  api: ApiClient;
  role: AuthRole;
  loginPath: string;
  children: ReactNode;
}

export function AuthProvider({ api, role, children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
      setAuthCookie();
    } catch {
      setUser(null);
      clearAccessToken();
      clearAuthCookie();
    }
  }, [api]);

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await api.auth.login(role, input);
      setAccessToken(result.accessToken);
      setAuthCookie();
      setUser(result.user);
    },
    [api, role],
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        throw err;
      }
    } finally {
      clearAccessToken();
      clearAuthCookie();
      setUser(null);
    }
  }, [api]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
