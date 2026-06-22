import type { ExperimentRecord, InterventionLog } from "../state.js";
import { config } from "../config.js";
import { state } from "../state.js";
import { log } from "../logger.js";

export function computeGini(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;

  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i];
  }
  return numerator / (n * sum);
}

function payoutFromExperiment(exp: ExperimentRecord): number {
  return exp.payout > 0 ? exp.payout : exp.bondAmount;
}

export function runAuditorIfNeeded(): InterventionLog | null {
  const pulls = state.experiments.length;
  if (pulls === 0 || pulls % config.auditorK !== 0) return null;

  const lastK = state.experiments.slice(-config.auditorK);
  const payouts = lastK.map(payoutFromExperiment);
  const gini = computeGini(payouts);
  state.zeroSumIndex = parseFloat(gini.toFixed(4));

  const entry: InterventionLog = {
    timestamp: new Date().toISOString(),
    pullCount: pulls,
    giniValue: state.zeroSumIndex,
    threshold: config.giniThreshold,
    actionTaken: null,
  };

  if (gini > config.giniThreshold) {
    const feeOption = state.auditorParams.feeRate + 0.005;
    const capOption = state.auditorParams.payoutCap * 0.98;
    const giniIfFee = Math.abs(gini - config.giniTarget);
    const giniIfCap = Math.abs(gini * 0.95 - config.giniTarget);

    if (giniIfFee <= giniIfCap && state.auditorParams.feeRate < 0.05) {
      state.auditorParams.feeRate = Math.min(0.05, feeOption);
      entry.actionTaken = "fee_increase_0.005";
      entry.newParam = state.auditorParams.feeRate;
    } else if (state.auditorParams.payoutCap > 0.85) {
      state.auditorParams.payoutCap = Math.max(0.85, capOption);
      entry.actionTaken = "cap_decrease_2pct";
      entry.newParam = state.auditorParams.payoutCap;
    }
  }

  state.interventions.push(entry);
  if (state.interventions.length > 100) {
    state.interventions = state.interventions.slice(-100);
  }

  log("info", "auditor_check", entry as unknown as Record<string, unknown>);
  return entry;
}
