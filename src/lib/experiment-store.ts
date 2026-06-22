import type { BondRecord, Experiment, HubPulseData } from "./types";
import type { RelayerIntervention } from "./relayer-client";

type Listener = () => void;

let experiments: Experiment[] = [];
let bondHistory: BondRecord[] = [];
let experimentId = 1000;
let bondId = 0;
const listeners = new Set<Listener>();

let hubPulse: HubPulseData = {
  bondedRatioDelta: 0,
  govActivity: 0,
  ibcVolumeDelta: 0,
  regimeScore: 0,
};

let relayerInterventions: RelayerIntervention[] = [];
let zeroSumIndex = 0.38;
let relayerOnline = false;

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function syncContractData(data: {
  experiments: Experiment[];
  zeroSumIndex: number;
  interventions: RelayerIntervention[];
}) {
  experiments = data.experiments;
  bondHistory = [...data.experiments]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map((exp) => ({
      id: exp.id,
      amount: exp.bondAmount,
      denom: exp.denom,
      tier: exp.tier,
      timestamp: exp.timestamp,
    }));
  zeroSumIndex = data.zeroSumIndex;
  relayerInterventions = data.interventions;
  notify();
}

export function setExperiments(exps: Experiment[]): void {
  experiments = exps;
  notify();
}

export function getExperiments(): Experiment[] {
  return experiments;
}

export function getBondHistory(): BondRecord[] {
  return bondHistory;
}

export function getHubPulse(): HubPulseData {
  return hubPulse;
}

export function setHubPulse(data: Partial<HubPulseData>) {
  hubPulse = { ...hubPulse, ...data };
  notify();
}

export function syncFromRelayer(data: {
  hubPulse: HubPulseData;
  interventions: RelayerIntervention[];
  zeroSumIndex: number;
  online: boolean;
}) {
  if (data.online) {
    hubPulse = data.hubPulse;
    relayerInterventions = data.interventions;
    zeroSumIndex = data.zeroSumIndex;
  }
  relayerOnline = data.online;
  notify();
}

export function getZeroSumIndex(): number {
  return zeroSumIndex;
}

export function isRelayerOnline(): boolean {
  return relayerOnline;
}

export function addExperiment(exp: Omit<Experiment, "id">): Experiment {
  const full: Experiment = { ...exp, id: ++experimentId };
  experiments = [...experiments, full];
  bondHistory = [
    {
      id: ++bondId,
      amount: exp.bondAmount,
      denom: exp.denom,
      tier: exp.tier,
      timestamp: exp.timestamp,
    },
    ...bondHistory,
  ].slice(0, 5);
  notify();
  return full;
}

export function getInterventionLogs(): {
  id: number;
  text: string;
  isError: boolean;
}[] {
  if (relayerInterventions.length > 0) {
    return relayerInterventions.slice(-8).map((log, i) => {
      const isError = Boolean(log.actionTaken);
      const action = log.actionTaken
        ? `Action: ${log.actionTaken}`
        : "No intervention";
      return {
        id: i + 1,
        text: `[${new Date(log.timestamp).toLocaleTimeString()}] Gini: ${log.giniValue.toFixed(2)} | ${action}`,
        isError,
      };
    });
  }

  if (relayerOnline) {
    return [
      {
        id: 1,
        text: `[OK] Relayer online — Gini ${zeroSumIndex.toFixed(2)}, no interventions yet`,
        isError: false,
      },
    ];
  }

  return [
    { id: 1, text: "[WAIT] Connect relayer for live auditor log", isError: false },
  ];
}
