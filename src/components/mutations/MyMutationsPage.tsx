"use client";

import Image from "next/image";
import { useState } from "react";
import { getExperiments } from "@/lib/experiment-store";
import { useStoreRefresh } from "@/lib/hooks";
import { MUTATION_IMAGES, TIER_COLORS } from "@/lib/assets";
import type { Experiment } from "@/lib/types";

function MutationCard({ exp, onSelect }: { exp: Experiment; onSelect: (e: Experiment) => void }) {
  const colors = TIER_COLORS[exp.tier];
  return (
    <button
      type="button"
      onClick={() => onSelect(exp)}
      className="bg-[#EAE4D5] border-4 border-black shadow-[4px_4px_0_#000] p-4 text-left hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all"
    >
      <div className="bg-white border-4 border-black p-3 mb-3">
        <Image
          src={MUTATION_IMAGES[exp.tier]}
          alt={exp.tier}
          width={120}
          height={120}
          className="mx-auto [image-rendering:pixelated] object-contain"
        />
      </div>
      <div
        className="inline-block px-2 py-0.5 border-2 border-black font-header text-[0.6rem] mb-2"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {exp.tier}
      </div>
      <div className="text-sm font-bold">
        <div>{exp.bondAmount} {exp.denom}</div>
        <div className="opacity-60 text-xs mt-1">
          {new Date(exp.timestamp).toLocaleDateString()}
        </div>
      </div>
    </button>
  );
}

export function MyMutationsPage() {
  useStoreRefresh();
  const experiments = getExperiments();
  const [selected, setSelected] = useState<Experiment | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 font-pixel">
      <div className="mb-6">
        <h1 className="font-header text-2xl md:text-3xl">My Mutations</h1>
        <p className="text-lg mt-2">Your collected mutation NFTs.</p>
      </div>

      {experiments.length === 0 ? (
        <p className="text-center opacity-60 py-12">No mutations yet. Visit The Lab.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...experiments].reverse().map((exp) => (
            <MutationCard key={exp.id} exp={exp} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_#000] p-6 max-w-md w-full">
            <div className="font-header text-sm mb-4">Exp #{selected.id}</div>
            <Image
              src={MUTATION_IMAGES[selected.tier]}
              alt={selected.tier}
              width={200}
              height={200}
              className="mx-auto [image-rendering:pixelated] mb-4"
            />
            <div className="space-y-2 text-sm font-bold">
              <div>Tier: {selected.tier}</div>
              <div>Bond: {selected.bondAmount} {selected.denom}</div>
              <div>Exposure: {selected.exposureScore}</div>
              <div>Wallet: {selected.wallet}</div>
              <div className="font-mono text-xs break-all bg-black text-[#27C93F] p-2 border-2 border-[#333]">
                tx: {selected.txHash}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 w-full bg-black text-white border-2 border-black py-2 font-header text-xs hover:bg-mutagen-green hover:text-black"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
