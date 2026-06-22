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
