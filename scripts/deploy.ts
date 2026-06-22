/**
 * Deploy MUTAGEN contract to Cosmos Hub provider testnet.
 * Usage: MNEMONIC="..." npx tsx scripts/deploy.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, calculateFee } from "@cosmjs/stargate";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";

const RPC =
  process.env.RPC_URL ??
  "https://rpc.provider-sentry-02.ics-testnet.polypore.xyz";
const CHAIN_ID = process.env.CHAIN_ID ?? "provider";
const MNEMONIC =
  process.env.MNEMONIC ??
  "order crucial rail crazy web follow tired hunt belt morning family bless panic face bag orient injury web fat universe you poem enact topple";
const RELAYER =
  process.env.RELAYER_ADDRESS ??
  "cosmos18tl6csmj6meh3t4u5zpvkjd78un4mwf6sz27kr";

const WASM_PATH = join(
  process.cwd(),
  "mutagen-contract/artifacts/mutagen_contract.wasm"
);

async function main() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "cosmos",
  });
  const [account] = await wallet.getAccounts();
  console.log("Deployer:", account.address);

  const client = await SigningCosmWasmClient.connectWithSigner(RPC, wallet, {
    gasPrice: GasPrice.fromString("0.025uatom") as never,
  });

  const gasPrice = GasPrice.fromString("0.025uatom");
  const uploadFee = calculateFee(3_000_000, gasPrice);

  const wasm = readFileSync(WASM_PATH);
  console.log("Uploading WASM...", wasm.length, "bytes");
  const upload = await client.upload(
    account.address,
    wasm,
    uploadFee,
    "MUTAGEN upload",
    {
      permission: AccessType.ACCESS_TYPE_EVERYBODY,
      addresses: [],
    }
  );
  console.log("Code ID:", upload.codeId, "tx:", upload.transactionHash);

  const initMsg = { relayer: RELAYER };
  const instantiateFee = calculateFee(500_000, gasPrice);
  const instantiate = await client.instantiate(
    account.address,
    upload.codeId,
    initMsg,
    "MUTAGEN",
    instantiateFee,
    { admin: account.address, memo: "MUTAGEN instantiate" }
  );
  const contractAddress = instantiate.contractAddress;
  console.log("Contract:", contractAddress, "tx:", instantiate.transactionHash);

  // Seed contract bank for payouts (1 ATOM)
  const seedFee = calculateFee(200_000, gasPrice);
  const seed = await client.sendTokens(
    account.address,
    contractAddress,
    [{ denom: "uatom", amount: "1000000" }],
    seedFee,
    "MUTAGEN seed pool"
  );
  console.log("Seeded 1 ATOM to contract:", seed.transactionHash);

  const deployment = {
    chainId: CHAIN_ID,
    rpc: RPC,
    codeId: upload.codeId,
    contractAddress,
    relayer: RELAYER,
    deployedAt: new Date().toISOString(),
    uploadTx: upload.transactionHash,
    instantiateTx: instantiate.transactionHash,
  };

  mkdirSync(join(process.cwd(), "public"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "public/contract.json"),
    JSON.stringify(deployment, null, 2)
  );
  writeFileSync(
    join(process.cwd(), ".env.local"),
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\nNEXT_PUBLIC_CHAIN_ID=${CHAIN_ID}\nNEXT_PUBLIC_RPC_URL=${RPC}\nNEXT_PUBLIC_REST_URL=https://rest.provider-sentry-02.ics-testnet.polypore.xyz\n`
  );

  const relayerEnv = `CONTRACT_ADDRESS=${contractAddress}\nRPC_URL=${RPC}\nREST_URL=https://rest.provider-sentry-02.ics-testnet.polypore.xyz\nMNEMONIC=${MNEMONIC}\n`;
  writeFileSync(join(process.cwd(), "relayer/.env"), relayerEnv);

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
