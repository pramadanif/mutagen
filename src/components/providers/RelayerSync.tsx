"use client";

import { useRelayerSync } from "@/lib/hooks";

export function RelayerSync({ children }: { children: React.ReactNode }) {
  useRelayerSync(15_000);
  return <>{children}</>;
}
