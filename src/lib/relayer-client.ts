import type { HubPulseData } from "./types";

const RELAYER_URL =
  process.env.NEXT_PUBLIC_RELAYER_URL ?? "http://localhost:3091";

export interface RelayerHealth {
  status: string;
  lastUpdate: string | null;
  hubPulse: HubPulseData;
  zeroSumIndex: number;
  pullCount: number;
}

export interface RelayerIntervention {
  timestamp: string;
  pullCount: number;
  giniValue: number;
  threshold: number;
  actionTaken: string | null;
  newParam?: number;
}

export async function fetchRelayerHealth(): Promise<RelayerHealth | null> {
  try {
    const res = await fetch(`${RELAYER_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchRelayerInterventions(): Promise<RelayerIntervention[]> {
  try {
    const res = await fetch(`${RELAYER_URL}/api/interventions`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.interventions ?? [];
  } catch {
    return [];
  }
}

export async function postExperimentToRelayer(payload: {
  bondAmount: number;
  payout: number;
  tier: string;
  timestamp: string;
}): Promise<void> {
  try {
    await fetch(`${RELAYER_URL}/api/experiments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // relayer offline — local store still works
  }
}
