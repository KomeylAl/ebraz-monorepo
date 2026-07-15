"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { UserProvider } from "@/context/UserContext";
import { Providers as ReduxProviders } from "@/store/provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProviders>
        <UserProvider>{children}</UserProvider>
      </ReduxProviders>
    </QueryClientProvider>
  );
}
