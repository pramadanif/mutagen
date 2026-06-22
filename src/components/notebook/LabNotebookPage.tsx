"use client";

import { useState, useMemo, useRef } from "react";
import { getExperiments } from "@/lib/experiment-store";
import { useStoreRefresh } from "@/lib/hooks";
import { TIER_COLORS } from "@/lib/assets";
import type { Tier } from "@/lib/types";

function TierBadge({ tier }: { tier: Tier }) {
  const colors = TIER_COLORS[tier];
  if (tier === "COMMON") {
    return <span className="text-[#666]">[{tier}]</span>;
  }
  return (
    <span
      className="border border-black px-1 font-bold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      [{tier}]
    </span>
  );
}

export function LabNotebookPage() {
  useStoreRefresh();
  const [filter, setFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const experiments = getExperiments();

  const filtered = useMemo(() => {
    if (!filter.trim()) return [...experiments].reverse();
    const q = filter.trim().toLowerCase();
    return experiments
      .filter((e) => e.wallet.toLowerCase().includes(q))
      .reverse();
  }, [experiments, filter]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-pixel">
      <div className="mb-6">
        <h1 className="font-header text-2xl md:text-3xl">Lab Notebook</h1>
        <p className="text-lg mt-2">Experiment log for all exposures.</p>
      </div>

      <div className="bg-[#F5F2EB] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="p-4 border-b-4 border-black flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="font-header text-sm">Experiments</h2>
          <input
            type="text"
            placeholder="Filter by wallet address..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-white border-2 border-black px-3 py-1 text-base outline-none"
          />
        </div>

        <div
          ref={scrollRef}
          className="h-96 overflow-y-auto custom-scroll p-4 space-y-2 font-mono text-base"
        >
          {filtered.length === 0 ? (
            <p className="text-[#666]">No experiments logged yet. Pull in The Lab first.</p>
          ) : (
            filtered.map((exp) => (
              <div key={exp.id} className="leading-relaxed">
                Exp #{exp.id}: Bonded [{exp.bondAmount}
                {exp.denom}], Exposure [{exp.exposureScore}], Outcome{" "}
                <TierBadge tier={exp.tier} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
