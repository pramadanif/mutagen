"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useChain } from "@cosmos-kit/react";
import { CHAIN_NAME } from "@/lib/cosmoshub-testnet-chain";
import {
  mapOnChainExperiment,
  queryPlayerExperiments,
  queryPlayerSpecimens,
  collectConsumedExperimentIds,
  getSigningClient,
  mergeSpecimen,
  computeSpecimenPreview,
} from "@/lib/contract";
import { isLabSoundEnabled, setLabSoundEnabled } from "@/lib/lab-sounds";
import { playBGM, stopBGM } from "@/lib/bgm";
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
  
  const [soundOn, setSoundOn] = useState(true);

  // Audio state
  useEffect(() => {
    setSoundOn(isLabSoundEnabled());
    // Attempt to start BGM. Browsers might block it until a user interacts.
    const startAudio = () => playBGM();
    startAudio();
    // Also try to start on first click if autoplay was blocked
    window.addEventListener('click', startAudio, { once: true });
    return () => {
      window.removeEventListener('click', startAudio);
      stopBGM();
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setLabSoundEnabled(next);
    if (!next) {
      stopBGM();
    } else {
      playBGM();
    }
  };

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [consumedIds, setConsumedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<(Experiment | null)[]>([null, null, null, null]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ specimenId: number; archetype: string; power: number } | null>(null);
  const [txHash, setTxHash] = useState("");

  const loadMergeableExperiments = useCallback(async (wallet: string) => {
    const [exps, specimens] = await Promise.all([
      queryPlayerExperiments(wallet),
      queryPlayerSpecimens(wallet),
    ]);
    const consumed = collectConsumedExperimentIds(specimens);
    setExperiments(exps.map(mapOnChainExperiment));
    setConsumedIds(consumed);
    setSelected((prev) =>
      prev.map((slot) => (slot && consumed.has(slot.id) ? null : slot))
    );
  }, []);

  // Load player mutations (exclude already-merged)
  useEffect(() => {
    if (!isWalletConnected || !address) {
      setExperiments([]);
      setConsumedIds(new Set());
      return;
    }
    setLoading(true);
    loadMergeableExperiments(address)
      .catch(() => {
        setExperiments([]);
        setConsumedIds(new Set());
      })
      .finally(() => setLoading(false));
  }, [address, isWalletConnected, loadMergeableExperiments]);

  // IDs already in selection slots
  const selectedIds = new Set(selected.filter(Boolean).map((e) => e!.id));

  const mergeableExperiments = experiments.filter((e) => !consumedIds.has(e.id));

  const handleCardClick = useCallback((exp: Experiment) => {
    if (consumedIds.has(exp.id)) return;
    if (selectedIds.has(exp.id)) return;
    const firstEmpty = selected.findIndex((s) => s === null);
    if (firstEmpty === -1) return; // all 4 filled
    setSelected((prev) => {
      const next = [...prev];
      next[firstEmpty] = exp;
      return next;
    });
  }, [selected, selectedIds, consumedIds]);

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
      await loadMergeableExperiments(address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
    } finally {
      setMerging(false);
    }
  };

  const archetypeColors = preview ? (ARCHETYPE_COLORS[preview.archetype] ?? ARCHETYPE_COLORS.Hybrid) : null;

  return (
    <div className="w-full min-h-[calc(100vh-72px)] flex flex-col p-4 md:p-6 font-pixel">
      <div className="mb-4 shrink-0 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-header text-2xl md:text-3xl">MERGE LAB</h1>
          <p className="text-sm opacity-80 mt-1">Combine 4 Mutation NFTs → one Specimen. Archetype determines phase sensitivity.</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <Link href="/" className="font-header text-xs border-4 border-black px-3 py-2 bg-white shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-transform text-black">
            HOME
          </Link>
          <Link href="/raid" className="font-header text-xs border-4 border-black px-3 py-2 bg-mutagen-green shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-transform text-black">
            GO TO RAID
          </Link>
          <button
            type="button"
            onClick={toggleSound}
            className="font-header text-xs border-4 border-black px-3 py-2 bg-white shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-transform text-black"
            aria-pressed={soundOn}
          >
            {soundOn ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 min-h-0">
        {/* Left: Mutation Gallery */}
        <div className="flex flex-col bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] min-h-0">
          <div className="p-4 border-b-4 border-black font-header text-sm shrink-0">
            YOUR MUTATIONS
            <span className="ml-3 text-xs opacity-60">
              (click to select — need exactly 4)
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
              {!isWalletConnected ? (
                <p className="text-center opacity-60 py-8">Connect wallet to see your mutations.</p>
              ) : loading ? (
                <p className="text-center opacity-60 py-8 animate-pulse">Loading mutations…</p>
              ) : mergeableExperiments.length === 0 ? (
                <p className="text-center opacity-60 py-8">
                  {experiments.length > 0
                    ? "All mutations already merged into Specimens."
                    : "No mutations yet. Visit The Lab first."}
                </p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {[...mergeableExperiments].reverse().map((exp) => {
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

        {/* Right: Selection + Preview */}
        <div className="flex flex-col gap-4 overflow-y-auto min-h-0 pb-4">
          {/* Selection slots */}
          <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] shrink-0">
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
