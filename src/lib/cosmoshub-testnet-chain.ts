/** Cosmos Hub provider testnet for MUTAGEN hackathon demo */
export const providerTestnetChain = {
  chainId: "provider",
  chainName: "cosmoshub-testnet",
  chain_name: "cosmoshub-testnet",
  chain_id: "provider",
  chain_type: "cosmos",
  bech32_prefix: "cosmos",
  pretty_name: "Cosmos Hub Testnet",
  prettyName: "Cosmos Hub Testnet",
  network_type: "testnet",
  status: "live",
  apis: {
    rpc: [
      {
        address: "https://rpc.provider-sentry-02.ics-testnet.polypore.xyz",
        provider: "hypha",
      },
    ],
    rest: [
      {
        address: "https://rest.provider-sentry-02.ics-testnet.polypore.xyz",
        provider: "hypha",
      },
    ],
  },
  staking: {
    staking_tokens: [{ denom: "uatom" }],
  },
  fees: {
    fee_tokens: [{ denom: "uatom", fixed_min_gas_price: 0.025, low_gas_price: 0.025, average_gas_price: 0.025, high_gas_price: 0.04 }],
  },
  slip44: 118,
  currencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
    },
  ],
} as const;

export const providerTestnetAssetList = {
  chainName: "cosmoshub-testnet",
  chain_name: "cosmoshub-testnet",
  assets: [
    {
      name: "Cosmos Hub Testnet Atom",
      display: "ATOM",
      symbol: "ATOM",
      denom_units: [
        { denom: "uatom", exponent: 0 },
        { denom: "atom", exponent: 6 },
      ],
      base: "uatom",
      type_asset: "sdk.coin",
    },
  ],
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
