import type { BondRecord, Experiment, HubPulseData } from "./types";

type Listener = () => void;

let experiments: Experiment[] = [];
let bondHistory: BondRecord[] = [];
let experimentId = 1000;
let bondId = 0;
const listeners = new Set<Listener>();

let hubPulse: HubPulseData = {
  bondedRatioDelta: 0.12,
  govActivity: 3,
  ibcVolumeDelta: 0.08,
  regimeScore: 42,
};

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
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
  return [
    { id: 1, text: "[OK] Index stable at 0.38", isError: false },
    { id: 2, text: "[CHECK] Pull count: 10 | Gini: 0.52", isError: false },
    { id: 3, text: "[ACTION] Adjusted fee_rate by +0.005", isError: false },
    { id: 4, text: "[OK] Index stable at 0.41", isError: false },
  ];
}
