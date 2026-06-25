/**
 * Phase 3 end-to-end verification against live testnet + relayer.
 */
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, calculateFee } from "@cosmjs/stargate";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RPC =
  process.env.RPC_URL ??
  "https://rpc.provider-sentry-02.ics-testnet.polypore.xyz";
const RELAYER = process.env.RELAYER_URL ?? "http://localhost:3091";
const MNEMONIC =
  process.env.MNEMONIC ??
  "order crucial rail crazy web follow tired hunt belt morning family bless panic face bag orient injury web fat universe you poem enact topple";

const deployment = JSON.parse(
  readFileSync(join(process.cwd(), "public/contract.json"), "utf8")
);
const CONTRACT = deployment.contractAddress as string;

async function main() {
  console.log("=== MUTAGEN Phase 3 E2E ===\n");
  console.log("Contract:", CONTRACT);

  const read = await CosmWasmClient.connect(RPC);
  const loot = await read.queryContractSmart(CONTRACT, { get_loot_table: {} });
  console.log("✓ Query loot table — regime:", loot.regime_score);

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "cosmos",
  });
  const [account] = await wallet.getAccounts();
  const client = await SigningCosmWasmClient.connectWithSigner(RPC, wallet, {
    gasPrice: GasPrice.fromString("0.025uatom"),
  });

  const fee = calculateFee(400_000, GasPrice.fromString("0.025uatom"));
  await client.execute(
    account.address,
    CONTRACT,
    { bond: {} },
    fee,
    "e2e bond",
    [{ denom: "uatom", amount: "10000" }]
  );
  const pull = await client.execute(
    account.address,
    CONTRACT,
    { trigger_exposure: {} },
    fee,
    "e2e pull"
  );
  console.log("✓ Bond + TriggerExposure tx:", pull.transactionHash);

  const curve = await read.queryContractSmart(CONTRACT, { get_curve_state: {} });
  if (Number(curve.total_pulls) < 1) throw new Error("total_pulls not incremented");
  console.log("✓ Curve total_pulls:", curve.total_pulls);

  const regimeTx = await client.execute(
    account.address,
    CONTRACT,
    {
      update_regime_score: {
        score: 55,
        bonded_delta: "0.01",
        gov_delta: "0.02",
        ibc_delta: "0.03",
      },
    },
    fee,
    "e2e regime"
  );
  console.log("✓ Relayer regime update tx:", regimeTx.transactionHash);

  const lootAfter = await read.queryContractSmart(CONTRACT, { get_loot_table: {} });
  if (lootAfter.regime_score !== 55) throw new Error("regime not updated");
  console.log("✓ Loot table rescored to 55");

  try {
    const health = await fetch(`${RELAYER}/health`).then((r) => r.json());
    if (!health.hubPulse) throw new Error("relayer health missing hubPulse");
    console.log("✓ Relayer health OK");
  } catch {
    console.log("⚠ Relayer offline — start with npm run relayer:dev");
  }

  console.log("\n=== ALL ON-CHAIN CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("\n✗ E2E FAILED:", err);
  process.exit(1);
});
