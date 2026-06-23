import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice, calculateFee } from "@cosmjs/stargate";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import type { Tier, Experiment, ResonanceStatus } from "./types";
import {
  CONTRACT_ADDRESS,
  PROVIDER_RPC,
} from "./cosmoshub-testnet-chain";

const GAS_PRICE = GasPrice.fromString("0.025uatom");

export interface OnChainExperiment {
  id: number;
  player: string;
  bonded_amount: string;
  bonded_denom: string;
  regime_score_at_pull: number;
  outcome_tier: string;
  payout_amount: string;
  exposure_score: string;
  timestamp: { seconds: string; nanos: number };
}

export interface AuditorStateResponse {
  zero_sum_index: string;
  intervention_count: number;
  intervention_log: {
    timestamp: { seconds: string };
    pull_number: number;
    gini_before: string;
    threshold: string;
    action: string;
    param_after: string;
  }[];
}

export interface LootTableResponse {
  regime_score: number;
  tiers: {
    name: string;
    current_weight: number;
    payout_multiplier: string;
  }[];
}

export async function getReadClient(): Promise<CosmWasmClient> {
  return CosmWasmClient.connect(PROVIDER_RPC);
}

export async function getSigningClient(
  signer: OfflineSigner
): Promise<SigningCosmWasmClient> {
  return SigningCosmWasmClient.connectWithSigner(PROVIDER_RPC, signer, {
    gasPrice: GAS_PRICE as never,
  });
}

export async function bondTokens(
  client: SigningCosmWasmClient,
  sender: string,
  amountUatom: string
): Promise<string> {
  const fee = calculateFee(250_000, GAS_PRICE);
  const result = await client.execute(
    sender,
    CONTRACT_ADDRESS,
    { bond: {} },
    fee,
    "MUTAGEN bond",
    [{ denom: "uatom", amount: amountUatom }]
  );
  return result.transactionHash;
}

export async function triggerExposure(
  client: SigningCosmWasmClient,
  sender: string
): Promise<{ txHash: string; tier: Tier; payoutMultiplier: number }> {
  const fee = calculateFee(350_000, GAS_PRICE);
  const result = await client.execute(
    sender,
    CONTRACT_ADDRESS,
    { trigger_exposure: {} },
    fee,
    "MUTAGEN pull"
  );

  const tierAttr = result.events
    .flatMap((e) => e.attributes)
    .find((a) => a.key === "tier")?.value as Tier | undefined;

  const loot = await queryLootTable();
  const tier = tierAttr ?? "COMMON";
  const mult = loot.tiers.find((t) => t.name === tier)?.payout_multiplier ?? "1";

  return {
    txHash: result.transactionHash,
    tier,
    payoutMultiplier: parseFloat(mult),
  };
}

export async function queryLootTable(): Promise<LootTableResponse> {
  const client = await getReadClient();
  return client.queryContractSmart(CONTRACT_ADDRESS, { get_loot_table: {} });
}

export async function queryAuditorState(): Promise<AuditorStateResponse> {
  const client = await getReadClient();
  return client.queryContractSmart(CONTRACT_ADDRESS, { get_auditor_state: {} });
}

export async function queryListExperiments(
  limit = 50
): Promise<OnChainExperiment[]> {
  const client = await getReadClient();
  const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
    list_experiments: { limit },
  });
  return res.experiments ?? [];
}

export async function queryPlayerExperiments(
  player: string
): Promise<OnChainExperiment[]> {
  const client = await getReadClient();
  const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
    get_player_experiments: { player },
  });
  return res.experiments ?? [];
}

export async function queryResonanceBonus(
  address: string
): Promise<ResonanceStatus & { bonusMultiplier: number }> {
  const client = await getReadClient();
  const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
    check_resonance_bonus: { address },
  });
  return {
    hubStaker: Boolean(res.hub_staker),
    nftHolder: Boolean(res.nft_holder),
    labHolder: Boolean(res.lab_holder),
    bonusMultiplier: parseFloat(res.bonus_multiplier ?? "1"),
  };
}

export function mapOnChainExperiment(exp: OnChainExperiment): Experiment {
  return {
    id: exp.id,
    wallet: exp.player,
    bondAmount: Number(exp.bonded_amount) / 1_000_000,
    denom: exp.bonded_denom,
    exposureScore: parseFloat(exp.exposure_score),
    tier: exp.outcome_tier as Tier,
    txHash: `onchain-${exp.id}`,
    timestamp: Number(exp.timestamp.seconds) * 1000,
  };
}
