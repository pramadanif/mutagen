import {
  addExperiment,
  getHubPulse,
} from "./experiment-store";
import {
  applyResonanceBonus,
  computeLootTable,
  drawTier,
} from "./loot-table";
import type { PullResult, ResonanceStatus } from "./types";

let pendingBond: { amount: number; denom: string } | null = null;
let txCounter = 0;

function mockTxHash(): string {
  txCounter += 1;
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `COSMOS${txCounter.toString().padStart(4, "0")}${hex.toUpperCase()}`;
}

export function mockBond(amount: number, denom: string): string {
  pendingBond = { amount, denom };
  return mockTxHash();
}

export function mockTriggerExposure(
  wallet: string,
  resonance: ResonanceStatus
): PullResult {
  if (!pendingBond) {
    throw new Error("No bonded amount. Bond tokens first.");
  }

  const { regimeScore } = getHubPulse();
  const baseTable = computeLootTable(regimeScore);
  const table = applyResonanceBonus(baseTable, resonance);
  const tier = drawTier(table);
  const tierData = table.find((t) => t.name === tier)!;
  const exposureScore = Math.min(
    1,
    (pendingBond.amount / 1000) * (tierData.payoutMultiplier / 10) + Math.random() * 0.3
  );
  const txHash = mockTxHash();

  addExperiment({
    wallet,
    bondAmount: pendingBond.amount,
    denom: pendingBond.denom,
    exposureScore: parseFloat(exposureScore.toFixed(2)),
    tier,
    txHash,
    timestamp: Date.now(),
  });

  pendingBond = null;

  return {
    tier,
    exposureScore: parseFloat(exposureScore.toFixed(2)),
    txHash,
    payoutMultiplier: tierData.payoutMultiplier,
  };
}

export function hasPendingBond(): boolean {
  return pendingBond !== null;
}

export function mockResonanceStatus(wallet: string | undefined): ResonanceStatus {
  if (!wallet) {
    return { hubStaker: false, nftHolder: false, labHolder: false };
  }
  const hash = wallet.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    hubStaker: hash % 3 !== 0,
    nftHolder: hash % 5 === 0,
    labHolder: hash % 7 === 0,
  };
}
