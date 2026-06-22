"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import type { HubPulseData } from "@/lib/types";
import { getRegimeColor } from "@/lib/loot-table";

interface HubPulsePanelProps {
  data: HubPulseData;
  showRegime?: boolean;
}

export function HubPulsePanel({ data, showRegime }: HubPulsePanelProps) {
  const formatDelta = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between bg-white border-2 border-black p-2 shadow-[2px_2px_0_#000]">
          <span className="font-bold">Bonded Ratio Δ</span>
          <span className="text-[#27C93F] font-bold">{formatDelta(data.bondedRatioDelta)}</span>
        </div>
        <div className="flex justify-between bg-white border-2 border-black p-2 shadow-[2px_2px_0_#000]">
          <span className="font-bold">Gov Activity</span>
          <span className="text-[#FFBD2E] font-bold">{data.govActivity} active</span>
        </div>
        <div className="flex justify-between bg-white border-2 border-black p-2 shadow-[2px_2px_0_#000]">
          <span className="font-bold">IBC Volume Δ</span>
          <span className={data.ibcVolumeDelta >= 0 ? "text-[#27C93F] font-bold" : "text-[#FF5F56] font-bold"}>
            {formatDelta(data.ibcVolumeDelta)}
          </span>
        </div>
      </div>

      {showRegime && (
        <div className="bg-white border-2 border-black p-4 text-center shadow-[2px_2px_0_#000]">
          <div className="text-sm font-bold mb-2">Regime Score</div>
          <div
            className="font-header text-4xl"
            style={{ color: getRegimeColor(data.regimeScore) }}
          >
            {data.regimeScore}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Image
          src={ASSETS.antena}
          alt="Hub Pulse"
          width={64}
          height={80}
          className="[image-rendering:pixelated] object-contain"
        />
      </div>
    </div>
  );
}

export function RegimeShiftIndicator({ score }: { score: number }) {
  const label = score <= 30 ? "tight odds" : score <= 60 ? "moderate spread" : "extreme spread";
  return (
    <div className="bg-black border-2 border-[#333] p-3 text-[#27C93F] font-mono text-sm">
      <div className="mb-1 text-white font-bold">Regime Effect</div>
      Score {score} → {label}
      <div className="mt-2 h-2 border border-[#333]">
        <div
          className="h-full bg-mutagen-green transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
