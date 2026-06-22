import type { LootTierOdds, RegimeLabel, ResonanceStatus, Tier } from "./types";

export function getRegimeLabel(score: number): RegimeLabel {
  if (score <= 30) return "CALM";
  if (score <= 60) return "ELEVATED";
  return "TURBULENT";
}

export function getRegimeColor(score: number): string {
  if (score <= 30) return "#39FF14";
  if (score <= 60) return "#FFBD2E";
  return "#FF5F56";
}

export function computeLootTable(regimeScore: number): LootTierOdds[] {
  const label = getRegimeLabel(regimeScore);

  const base: Record<RegimeLabel, LootTierOdds[]> = {
    CALM: [
      { name: "COMMON", weight: 55, payoutMultiplier: 1.0 },
      { name: "RARE", weight: 28, payoutMultiplier: 2.5 },
      { name: "EPIC", weight: 12, payoutMultiplier: 5.0 },
      { name: "LEGENDARY", weight: 5, payoutMultiplier: 12.0 },
    ],
    ELEVATED: [
      { name: "COMMON", weight: 40, payoutMultiplier: 1.2 },
      { name: "RARE", weight: 30, payoutMultiplier: 3.0 },
      { name: "EPIC", weight: 20, payoutMultiplier: 6.0 },
      { name: "LEGENDARY", weight: 10, payoutMultiplier: 15.0 },
    ],
    TURBULENT: [
      { name: "COMMON", weight: 25, payoutMultiplier: 1.5 },
      { name: "RARE", weight: 25, payoutMultiplier: 4.0 },
      { name: "EPIC", weight: 25, payoutMultiplier: 8.0 },
      { name: "LEGENDARY", weight: 25, payoutMultiplier: 25.0 },
    ],
  };

  return base[label];
}

export function applyResonanceBonus(
  table: LootTierOdds[],
  resonance: ResonanceStatus
): LootTierOdds[] {
  const bonusCount = [resonance.hubStaker, resonance.nftHolder, resonance.labHolder].filter(
    Boolean
  ).length;
  if (bonusCount === 0) return table;

  const shift = bonusCount * 0.05;
  const adjusted = table.map((t) => ({ ...t }));

  for (let i = 0; i < bonusCount; i++) {
    adjusted[0].weight = Math.max(adjusted[0].weight - shift * 100, 10);
    adjusted[1].weight += shift * 40;
    adjusted[2].weight += shift * 35;
    adjusted[3].weight += shift * 25;
  }

  return adjusted;
}

export function drawTier(table: LootTierOdds[]): Tier {
  const total = table.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;

  for (const tier of table) {
    roll -= tier.weight;
    if (roll <= 0) return tier.name;
  }

  return "COMMON";
}

export function normalizeWeights(table: LootTierOdds[]): LootTierOdds[] {
  const total = table.reduce((sum, t) => sum + t.weight, 0);
  return table.map((t) => ({
    ...t,
    weight: Math.round((t.weight / total) * 100),
  }));
}
