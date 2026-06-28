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

// ─── Raid Boss contract helpers ──────────────────────────────────────────────

import type { Specimen, BossState, LeaderboardResponse } from "./types";

export async function mergeSpecimen(
  client: SigningCosmWasmClient,
  sender: string,
  experimentIds: [number, number, number, number]
): Promise<{ txHash: string; specimenId: number; archetype: string; power: number }> {
  const fee = calculateFee(400_000, GAS_PRICE);
  const result = await client.execute(
    sender,
    CONTRACT_ADDRESS,
    { merge_specimen: { experiment_ids: experimentIds } },
    fee,
    "MUTAGEN merge specimen"
  );
  const attrs = result.events.flatMap((e) => e.attributes);
  const specimenId = Number(attrs.find((a) => a.key === "specimen_id")?.value ?? "0");
  const archetype = attrs.find((a) => a.key === "archetype")?.value ?? "Hybrid";
  const power = Number(attrs.find((a) => a.key === "power")?.value ?? "0");
  return { txHash: result.transactionHash, specimenId, archetype, power };
}

export async function attackBoss(
  client: SigningCosmWasmClient,
  sender: string,
  specimenId: number
): Promise<{ txHash: string; damage: number; bossHp: number; defeated: boolean }> {
  const fee = calculateFee(350_000, GAS_PRICE);
  const result = await client.execute(
    sender,
    CONTRACT_ADDRESS,
    { attack_boss: { specimen_id: specimenId } },
    fee,
    "MUTAGEN attack boss"
  );
  const attrs = result.events.flatMap((e) => e.attributes);
  const damage = Number(attrs.find((a) => a.key === "damage")?.value ?? "0");
  const bossHp = Number(attrs.find((a) => a.key === "boss_hp")?.value ?? "0");
  const defeated = attrs.some((a) => a.key === "boss_defeated" && a.value === "true");
  return { txHash: result.transactionHash, damage, bossHp, defeated };
}

export async function claimReward(
  client: SigningCosmWasmClient,
  sender: string
): Promise<{ txHash: string; rewardCredits: number }> {
  const fee = calculateFee(300_000, GAS_PRICE);
  const result = await client.execute(
    sender,
    CONTRACT_ADDRESS,
    { claim_reward: {} },
    fee,
    "MUTAGEN claim reward"
  );
  const attrs = result.events.flatMap((e) => e.attributes);
  const rewardCredits = Number(attrs.find((a) => a.key === "reward_credits")?.value ?? "0");
  return { txHash: result.transactionHash, rewardCredits };
}

export async function queryBossState(): Promise<BossState> {
  const client = await getReadClient();
  return client.queryContractSmart(CONTRACT_ADDRESS, { get_boss_state: {} });
}

export async function queryLeaderboard(): Promise<LeaderboardResponse> {
  const client = await getReadClient();
  return client.queryContractSmart(CONTRACT_ADDRESS, { get_leaderboard: {} });
}

export async function queryPlayerSpecimens(player: string): Promise<Specimen[]> {
  const client = await getReadClient();
  const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
    get_player_specimens: { player },
  });
  return res.specimens ?? [];
}

/** Experiment IDs already burned via merge — derived from player's Specimens. */
export function collectConsumedExperimentIds(specimens: Specimen[]): Set<number> {
  const ids = new Set<number>();
  for (const s of specimens) {
    for (const id of s.consumed_experiment_ids) {
      ids.add(id);
    }
  }
  return ids;
}

export async function querySpecimen(id: number): Promise<Specimen> {
  const client = await getReadClient();
  return client.queryContractSmart(CONTRACT_ADDRESS, { get_specimen: { id } });
}

/** Compute client-side power preview for a merge selection (mirrors specimen.rs formula). */
export function computeSpecimenPreview(tiers: string[]): {
  archetype: string;
  power: number;
} {
  const tierIndex = (t: string) => {
    if (t === "RARE") return 1;
    if (t === "EPIC") return 2;
    if (t === "LEGENDARY") return 3;
    return 0;
  };
  const tierBasePower = [100, 200, 400, 800];
  const indices: number[] = tiers.map(tierIndex);

  const counts = [0, 0, 0, 0];
  indices.forEach((i) => counts[Math.min(i, 3)]++);
  const unique = counts.filter((c) => c > 0).length;

  let archetype = "Hybrid";
  if (unique === 1) archetype = "Pure";
  else if (unique === 2 && counts.every((c) => c === 0 || c === 2)) archetype = "Balanced";

  const baseSum: number = indices.reduce((sum: number, i: number) => sum + tierBasePower[Math.min(i, 3)], 0);
  const mult = archetype === "Pure" ? 1.3 : archetype === "Balanced" ? 1.0 : 0.85;
  const power = Math.floor(baseSum * mult);


  return { archetype, power };
}

