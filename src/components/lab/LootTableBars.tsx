"use client";

import type { LootTierOdds } from "@/lib/types";
import { TIER_COLORS } from "@/lib/assets";

interface LootTableBarsProps {
  table: LootTierOdds[];
}

export function LootTableBars({ table }: LootTableBarsProps) {
  const maxWeight = Math.max(...table.map((t) => t.weight));

  return (
    <div className="space-y-3">
      {table.map((tier) => {
        const colors = TIER_COLORS[tier.name];
        const width = (tier.weight / maxWeight) * 100;
        return (
          <div key={tier.name}>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>{tier.name}</span>
              <span>{tier.weight}%</span>
            </div>
            <div className="h-6 bg-white border-2 border-black relative">
              <div
                className="h-full border-r-2 border-black transition-all duration-500"
                style={{ width: `${width}%`, backgroundColor: colors.bg }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
