"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const isPrivyConfigured = Boolean(appId);
export function Providers({ children }: { children: ReactNode }) {
  if (!appId) return <>{children}</>;
  return <PrivyProvider appId={appId} config={{ loginMethods: ["email"], embeddedWallets: { ethereum: { createOnLogin: "all-users" } } }}>{children}</PrivyProvider>;
}
