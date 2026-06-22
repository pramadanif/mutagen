"use client";

import { useRelayerSync, useContractSync } from "@/lib/hooks";

export function RelayerSync({ children }: { children: React.ReactNode }) {
  useRelayerSync(15_000);
  useContractSync(20_000);
  return <>{children}</>;
}
