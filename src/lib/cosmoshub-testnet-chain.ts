import { chain, assetList } from "chain-registry/testnet/cosmosicsprovidertestnet";

/** Cosmos Kit registry name — must match useChain() exactly */
export const CHAIN_NAME = "cosmosicsprovidertestnet";

/** Cosmos Kit expects snake_case fields from chain-registry schema */
export const providerTestnetChain = {
  ...chain,
  chain_name: chain.chainName,
  chain_id: chain.chainId,
  chain_type: chain.chainType,
  bech32_prefix: chain.bech32Prefix,
  pretty_name: chain.prettyName,
  network_type: chain.networkType,
} as const;

export const providerTestnetAssetList = {
  ...assetList,
  chain_name: assetList.chainName,
} as const;

export const PROVIDER_RPC =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://rpc.provider-sentry-02.ics-testnet.polypore.xyz";

export const PROVIDER_REST =
  process.env.NEXT_PUBLIC_REST_URL ??
  "https://rest.provider-sentry-02.ics-testnet.polypore.xyz";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "cosmos1cegnz6mmj94vwtvyhm3ev44cqrsh3ft44rf28d08hdd9eft6t2kqsldh3g";
