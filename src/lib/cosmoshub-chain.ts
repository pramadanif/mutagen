import { chain, assetList } from "chain-registry/mainnet/cosmoshub";

/** Cosmos Kit expects snake_case fields from older chain-registry schema. */
export const cosmoshubChain = {
  ...chain,
  chain_name: chain.chainName,
  chain_id: chain.chainId,
  chain_type: chain.chainType,
  bech32_prefix: chain.bech32Prefix,
  pretty_name: chain.prettyName,
  network_type: chain.networkType,
} as const;

export const cosmoshubAssetList = {
  ...assetList,
  chain_name: assetList.chainName,
} as const;
