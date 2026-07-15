// store/provider.tsx
"use client";

import { Provider } from "react-redux";
import { makeStore } from "./";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const store = makeStore(); // یا اگر خواستی از `useStore()` استفاده کن از next-redux-wrapper
  return <Provider store={store}>{children}</Provider>;
}
