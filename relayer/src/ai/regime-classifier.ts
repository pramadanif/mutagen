import type { HubFeatures, RegimeInference } from "../state.js";
import { normalizeDelta } from "../utils.js";

export function getRegimeLabel(score: number): RegimeInference["regimeLabel"] {
  if (score <= 30) return "CALM";
  if (score <= 60) return "ELEVATED";
  return "TURBULENT";
}

export function classifyRegime(features: HubFeatures): RegimeInference {
  const bonded = Math.min(33, normalizeDelta(features.bondedRatioDelta) * 33.33);
  const gov = Math.min(33, normalizeDelta(features.govActivityDelta) * 33.33);
  const ibc = Math.min(33, normalizeDelta(features.ibcVolumeDelta) * 33.33);
  const score = Math.min(100, Math.round(bonded + gov + ibc));

  return {
    timestamp: new Date().toISOString(),
    features,
    score,
    regimeLabel: getRegimeLabel(score),
  };
}
