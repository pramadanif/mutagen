"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useChain } from "@cosmos-kit/react";
import { CHAIN_NAME } from "@/lib/cosmoshub-testnet-chain";
import {
  mapOnChainExperiment,
  queryPlayerExperiments,
  getSigningClient,
  mergeSpecimen,
  computeSpecimenPreview,
} from "@/lib/contract";
import { MUTATION_IMAGES, TIER_COLORS } from "@/lib/assets";
import { PixelButton } from "@/components/ui/PixelButton";
import { playMergeCompleteSound } from "@/lib/raid-sounds";
import type { Experiment, Archetype } from "@/lib/types";

const ARCHETYPE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  Pure:     { bg: "#39FF14", text: "#000", glow: "rgba(57,255,20,0.6)" },
  Balanced: { bg: "#8B5CF6", text: "#fff", glow: "rgba(139,92,246,0.6)" },
  Hybrid:   { bg: "#FF5F56", text: "#fff", glow: "rgba(255,95,86,0.6)" },
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Pure: "All 4 same tier. High raw power but sensitive to regime phase — loses 30% in CALM.",
  Balanced: "Two matching pairs. Moderate power, no phase sensitivity.",
  Hybrid: "All different tiers. Lowest raw power but immune to CALM penalties — consistent damage.",
};

function SelectionSlot({ index, exp, onRemove }: {
  index: number;
  exp: Experiment | null;
  onRemove: (i: number) => void;
}) {
  if (!exp) {
    return (
      <div className="bg-white border-4 border-dashed border-black flex items-center justify-center h-32 opacity-40">
        <span className="font-header text-xs">SLOT {index + 1}</span>
      </div>
    );
  }
  const colors = TIER_COLORS[exp.tier];
  return (
    <div
      className="relative bg-[#EAE4D5] border-4 border-black shadow-[4px_4px_0_#000] p-2"
      style={{ boxShadow: `4px 4px 0 #000, 0 0 8px ${colors.glow}` }}
    >
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 bg-black text-white font-header text-xs px-1 hover:bg-red-600 transition-colors z-10"
        title="Remove"
      >
        ✕
      </button>
      <Image
        src={MUTATION_IMAGES[exp.tier]}
        alt={exp.tier}
        width={80}
        height={80}
        className="mx-auto [image-rendering:pixelated]"
      />
      <div
        className="mt-1 text-center font-header text-[0.5rem] px-1 border border-black"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {exp.tier} #{exp.id}
      </div>
    </div>
  );
}

export function MergePage() {
  const { address, isWalletConnected, getOfflineSigner } = useChain(CHAIN_NAME);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<(Experiment | null)[]>([null, null, null, null]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ specimenId: number; archetype: string; power: number } | null>(null);
  const [txHash, setTxHash] = useState("");

  // Load player mutations
  useEffect(() => {
    if (!isWalletConnected || !address) { setExperiments([]); return; }
    setLoading(true);
    queryPlayerExperiments(address)
      .then((exps) => setExperiments(exps.map(mapOnChainExperiment)))
      .catch(() => setExperiments([]))
      .finally(() => setLoading(false));
  }, [address, isWalletConnected]);

  // IDs already in selection slots
  const selectedIds = new Set(selected.filter(Boolean).map((e) => e!.id));

  const handleCardClick = useCallback((exp: Experiment) => {
    if (selectedIds.has(exp.id)) return; // already selected, remove via slot
    const firstEmpty = selected.findIndex((s) => s === null);
    if (firstEmpty === -1) return; // all 4 filled
    setSelected((prev) => {
      const next = [...prev];
      next[firstEmpty] = exp;
      return next;
    });
  }, [selected, selectedIds]);

  const handleRemoveSlot = (i: number) => {
    setSelected((prev) => { const next = [...prev]; next[i] = null; return next; });
  };

  const readyToMerge = selected.every(Boolean);
  const selectedTiers = selected.filter(Boolean).map((e) => e!.tier);
  const preview = readyToMerge ? computeSpecimenPreview(selectedTiers) : null;

  const handleMerge = async () => {
    if (!readyToMerge || !isWalletConnected || !address) return;
    setError("");
    setSuccess(null);
    setMerging(true);

    try {
      const signer = await getOfflineSigner();
      const client = await getSigningClient(signer);
      const ids = selected.map((e) => e!.id) as [number, number, number, number];
      const result = await mergeSpecimen(client, address, ids);
      setTxHash(result.txHash);
      setSuccess(result);
      playMergeCompleteSound();
      // Reset selection
      setSelected([null, null, null, null]);
      // Refresh experiments
      queryPlayerExperiments(address)
        .then((exps) => setExperiments(exps.map(mapOnChainExperiment)))
        .catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
    } finally {
      setMerging(false);
    }
  };

  const archetypeColors = preview ? (ARCHETYPE_COLORS[preview.archetype] ?? ARCHETYPE_COLORS.Hybrid) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-pixel">
      <div className="mb-6">
        <h1 className="font-header text-2xl md:text-3xl">MERGE LAB</h1>
        <p className="text-lg mt-2 opacity-70">
          Combine 4 Mutation NFTs → one Specimen. Archetype determines phase sensitivity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Mutation Gallery */}
        <div>
          <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] mb-4">
            <div className="p-4 border-b-4 border-black font-header text-sm">
              YOUR MUTATIONS
              <span className="ml-3 text-xs opacity-60">
                (click to select — need exactly 4)
              </span>
            </div>
            <div className="p-4">
              {!isWalletConnected ? (
                <p className="text-center opacity-60 py-8">Connect wallet to see your mutations.</p>
              ) : loading ? (
                <p className="text-center opacity-60 py-8 animate-pulse">Loading mutations…</p>
              ) : experiments.length === 0 ? (
                <p className="text-center opacity-60 py-8">No mutations yet. Visit The Lab first.</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {[...experiments].reverse().map((exp) => {
                    const colors = TIER_COLORS[exp.tier];
                    const isSelected = selectedIds.has(exp.id);
                    const isFull = selected.every(Boolean);
                    const disabled = isSelected || (isFull && !isSelected);
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => handleCardClick(exp)}
                        disabled={disabled}
                        className={`relative bg-white border-4 border-black p-2 transition-all text-left
                          ${isSelected ? "opacity-30 cursor-not-allowed" : ""}
                          ${!disabled ? "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] shadow-[4px_4px_0_#000]" : ""}
                        `}
                        style={isSelected ? {} : { boxShadow: `4px 4px 0 ${colors.glow}` }}
                      >
                        <Image
                          src={MUTATION_IMAGES[exp.tier]}
                          alt={exp.tier}
                          width={64}
                          height={64}
                          className="mx-auto [image-rendering:pixelated]"
                        />
                        <div
                          className="mt-1 text-center font-header text-[0.45rem] px-0.5 border border-black"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {exp.tier}
                        </div>
                        <div className="text-xs opacity-50 text-center mt-0.5">#{exp.id}</div>
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="font-header text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Selection + Preview */}
        <div className="space-y-4">
          {/* Selection slots */}
          <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <div className="p-4 border-b-4 border-black font-header text-sm">
              MERGE SELECTION ({selected.filter(Boolean).length}/4)
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {selected.map((exp, i) => (
                <SelectionSlot key={i} index={i} exp={exp} onRemove={handleRemoveSlot} />
              ))}
            </div>
          </div>

          {/* Live Archetype preview */}
          {preview && archetypeColors && (
            <div
              className="border-4 border-black p-4 shadow-[6px_6px_0_#000]"
              style={{
                backgroundColor: archetypeColors.bg,
                color: archetypeColors.text,
                boxShadow: `6px 6px 0 #000, 0 0 20px ${archetypeColors.glow}`,
              }}
            >
              <div className="font-header text-sm mb-2">PREVIEW</div>
              <div className="text-2xl font-header mb-1">{preview.archetype.toUpperCase()}</div>
              <div className="text-lg font-bold mb-2">⚡ Power: {preview.power}</div>
              <p className="text-xs opacity-80 leading-relaxed">
                {ARCHETYPE_DESCRIPTIONS[preview.archetype]}
              </p>
            </div>
          )}

          {/* Phase modifier cheat-sheet */}
          <div className="bg-[#EAE4D5] border-4 border-black p-4">
            <div className="font-header text-xs mb-3">PHASE MODIFIERS</div>
            <table className="w-full text-xs font-pixel">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-1">Phase</th>
                  <th className="text-center">Pure</th>
                  <th className="text-center">Balanced</th>
                  <th className="text-center">Hybrid</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ color: "#39FF14" }}>
                  <td className="py-1">CALM</td>
                  <td className="text-center text-red-600">−30%</td>
                  <td className="text-center">0%</td>
                  <td className="text-center">0%</td>
                </tr>
                <tr style={{ color: "#FFBD2E" }}>
                  <td className="py-1">ELEVATED</td>
                  <td className="text-center">0%</td>
                  <td className="text-center">0%</td>
                  <td className="text-center">0%</td>
                </tr>
                <tr style={{ color: "#FF5F56" }}>
                  <td className="py-1">TURBULENT</td>
                  <td className="text-center text-green-600">+30%</td>
                  <td className="text-center">0%</td>
                  <td className="text-center">0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {error && <p className="text-red-600 font-bold text-sm">{error}</p>}

          {success && (
            <div className="bg-black border-4 border-[#39FF14] p-4 shadow-[0_0_24px_#39FF14]">
              <div className="font-header text-[#39FF14] text-sm mb-2">✓ MERGE COMPLETE!</div>
              <div className="text-white font-pixel text-sm space-y-1">
                <div>Specimen #{success.specimenId}</div>
                <div>Archetype: {success.archetype}</div>
                <div>Power: {success.power}</div>
              </div>
              {txHash && (
                <div className="mt-2 font-mono text-[0.6rem] text-[#39FF14] break-all opacity-70">
                  tx: {txHash}
                </div>
              )}
            </div>
          )}

          <PixelButton
            onClick={handleMerge}
            disabled={!readyToMerge || merging || !isWalletConnected}
            className="w-full py-4 text-sm"
          >
            {merging ? "MERGING…" : "MERGE INTO SPECIMEN"}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
