"use client";

import { getRegimeColor, getRegimeLabel } from "@/lib/loot-table";

interface RegimeGaugeProps {
  score: number;
  compact?: boolean;
}

export function RegimeGauge({ score, compact }: RegimeGaugeProps) {
  const color = getRegimeColor(score);
  const label = getRegimeLabel(score);
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-1" : "gap-3"}`}>
      <div className={`relative ${compact ? "w-24 h-12" : "w-32 h-16"}`}>
        <div className="absolute inset-0 border-4 border-black rounded-t-full overflow-hidden bg-white">
          <div
            className="absolute bottom-0 left-1/2 w-1 bg-black origin-bottom transition-transform duration-700"
            style={{
              height: compact ? "40px" : "56px",
              transform: `translateX(-50%) rotate(${rotation}deg)`,
            }}
          />
        </div>
        <div
          className="absolute -bottom-1 left-2 right-2 h-2 rounded-full opacity-40"
          style={{ background: `linear-gradient(90deg, #39FF14 0%, #FFBD2E 50%, #FF5F56 100%)` }}
        />
      </div>
      <div className="text-center">
        <div className={`font-header ${compact ? "text-sm" : "text-lg"}`} style={{ color }}>
          {score}
        </div>
        <div className="text-sm font-bold opacity-70">{label}</div>
      </div>
    </div>
  );
}
