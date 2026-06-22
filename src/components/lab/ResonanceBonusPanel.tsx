"use client";

import { HexBadge, ShieldIcon, DiamondIcon, FlaskIcon } from "@/components/ui/HexBadge";
import type { ResonanceStatus } from "@/lib/types";

interface ResonanceBonusPanelProps {
  status: ResonanceStatus;
}

const ROWS = [
  { key: "hubStaker" as const, label: "Hub Staker", color: "#39FF14", icon: <ShieldIcon /> },
  { key: "nftHolder" as const, label: "Mad Scientists NFT", color: "#F59E0B", icon: <DiamondIcon /> },
  { key: "labHolder" as const, label: "$LAB Holder", color: "#8B5CF6", icon: <FlaskIcon /> },
];

export function ResonanceBonusPanel({ status }: ResonanceBonusPanelProps) {
  return (
    <div className="space-y-3">
      {ROWS.map((row) => {
        const active = status[row.key];
        return (
          <div key={row.key} className="flex items-center gap-3 bg-white border-2 border-black p-2 shadow-[2px_2px_0_#000]">
            <HexBadge color={row.color}>{row.icon}</HexBadge>
            <span className="flex-1 text-base font-bold">{row.label}</span>
            <span className={`text-xl font-bold ${active ? "text-mutagen-green" : "text-mutagen-red"}`}>
              {active ? "✓" : "✗"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
