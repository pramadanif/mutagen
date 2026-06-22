import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3001),
  rpcUrl: process.env.RPC_URL ?? "https://rpc.cosmos.directory/cosmoshub",
  restUrl: process.env.REST_URL ?? "https://rest.cosmos.directory/cosmoshub",
  intervalMs: Number(process.env.INTERVAL_MS ?? 300_000),
  contractAddress: process.env.CONTRACT_ADDRESS ?? "",
  mnemonic: process.env.MNEMONIC ?? "",
  auditorK: Number(process.env.AUDITOR_K ?? 10),
  giniThreshold: Number(process.env.GINI_THRESHOLD ?? 0.6),
  giniTarget: Number(process.env.GINI_TARGET ?? 0.4),
};
