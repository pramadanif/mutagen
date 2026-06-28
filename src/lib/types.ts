export type Tier = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type RegimeLabel = "CALM" | "ELEVATED" | "TURBULENT";

export interface LootTierOdds {
  name: Tier;
  weight: number;
  payoutMultiplier: number;
}

export interface Experiment {
  id: number;
  wallet: string;
  bondAmount: number;
  denom: string;
  exposureScore: number;
  tier: Tier;
  txHash: string;
  timestamp: number;
}

export interface ResonanceStatus {
  hubStaker: boolean;
  nftHolder: boolean;
  labHolder: boolean;
}

export interface HubPulseData {
  bondedRatioDelta: number;
  govActivity: number;
  ibcVolumeDelta: number;
  regimeScore: number;
}

export interface BondRecord {
  id: number;
  amount: number;
  denom: string;
  tier: Tier;
  timestamp: number;
}

export interface PullResult {
  tier: Tier;
  exposureScore: number;
  txHash: string;
  payoutMultiplier: number;
}

// ─── Raid Boss types ─────────────────────────────────────────────────────────

export type Archetype = "Pure" | "Balanced" | "Hybrid";

export interface Specimen {
  id: number;
  owner: string;
  archetype: Archetype;
  tier: Tier;
  power: number;
  consumed_experiment_ids: [number, number, number, number];
  last_attack_at: { seconds: string; nanos: number } | null;
  created_at: { seconds: string; nanos: number };
  /** Seconds until next attack is allowed (0 = ready). Computed client-side. */
  cooldownRemainingSecs?: number;
}

export interface BossState {
  max_hp: number;
  current_hp: number;
  defeated: boolean;
  respawn_count: number;
  hp_percent: number;
}

export interface LeaderboardEntry {
  player: string;
  damage: number;
  /** Share in basis points (e.g. 4250 = 42.50%) */
  share_bps: number;
  reward_credits: number;
  claimed: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_damage: number;
  boss_defeated: boolean;
  respawn_count: number;
}
