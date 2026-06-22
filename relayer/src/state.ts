export interface HubFeatures {
  bondedRatioDelta: number;
  govActivityDelta: number;
  ibcVolumeDelta: number;
}

export interface RegimeInference {
  timestamp: string;
  features: HubFeatures;
  score: number;
  regimeLabel: "CALM" | "ELEVATED" | "TURBULENT";
}

export interface InterventionLog {
  timestamp: string;
  pullCount: number;
  giniValue: number;
  threshold: number;
  actionTaken: string | null;
  newParam?: number;
}

export interface ExperimentRecord {
  id: number;
  bondAmount: number;
  payout: number;
  tier: string;
  timestamp: string;
}

export interface RelayerState {
  status: "ok" | "degraded" | "error";
  lastUpdate: string | null;
  lastError: string | null;
  hubPulse: {
    bondedRatioDelta: number;
    govActivity: number;
    ibcVolumeDelta: number;
    regimeScore: number;
  };
  lastInference: RegimeInference | null;
  zeroSumIndex: number;
  interventions: InterventionLog[];
  experiments: ExperimentRecord[];
  auditorParams: {
    feeRate: number;
    payoutCap: number;
  };
  snapshots: {
    bondedRatio: number | null;
    govActiveCount: number | null;
    ibcTxCount: number | null;
  };
}

export const state: RelayerState = {
  status: "ok",
  lastUpdate: null,
  lastError: null,
  hubPulse: {
    bondedRatioDelta: 0,
    govActivity: 0,
    ibcVolumeDelta: 0,
    regimeScore: 0,
  },
  lastInference: null,
  zeroSumIndex: 0,
  interventions: [],
  experiments: [],
  auditorParams: { feeRate: 0.01, payoutCap: 1.0 },
  snapshots: {
    bondedRatio: null,
    govActiveCount: null,
    ibcTxCount: null,
  },
};

let experimentSeq = 0;

export function addExperimentRecord(record: Omit<ExperimentRecord, "id">): ExperimentRecord {
  const full = { ...record, id: ++experimentSeq };
  state.experiments.push(full);
  if (state.experiments.length > 500) {
    state.experiments = state.experiments.slice(-500);
  }
  return full;
}
