"use client";

import { ChainProvider } from "@cosmos-kit/react";
import type { MainWalletBase } from "@cosmos-kit/core";
import { wallets } from "@cosmos-kit/keplr-extension";
import { cosmoshubChain, cosmoshubAssetList } from "@/lib/cosmoshub-chain";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChainProvider
      chains={[cosmoshubChain as never]}
      assetLists={[cosmoshubAssetList as never]}
      wallets={wallets as unknown as MainWalletBase[]}
      throwErrors={false}
      endpointOptions={{
        endpoints: {
          cosmoshub: {
            rpc: ["https://rpc.cosmos.directory/cosmoshub"],
            rest: ["https://rest.cosmos.directory/cosmoshub"],
          },
        },
      }}
    >
      {children}
    </ChainProvider>
  );
}
