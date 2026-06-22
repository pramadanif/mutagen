"use client";

import { ChainProvider } from "@cosmos-kit/react";
import type { MainWalletBase } from "@cosmos-kit/core";
import { wallets } from "@cosmos-kit/keplr-extension";
import {
  providerTestnetAssetList,
  providerTestnetChain,
  PROVIDER_RPC,
  PROVIDER_REST,
} from "@/lib/cosmoshub-testnet-chain";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChainProvider
      chains={[providerTestnetChain as never]}
      assetLists={[providerTestnetAssetList as never]}
      wallets={wallets as unknown as MainWalletBase[]}
      throwErrors={false}
      endpointOptions={{
        endpoints: {
          cosmoshub: {
            rpc: [PROVIDER_RPC],
            rest: [PROVIDER_REST],
          },
          "cosmoshub-testnet": {
            rpc: [PROVIDER_RPC],
            rest: [PROVIDER_REST],
          },
          provider: {
            rpc: [PROVIDER_RPC],
            rest: [PROVIDER_REST],
          },
        },
      }}
    >
      {children}
    </ChainProvider>
  );
}
