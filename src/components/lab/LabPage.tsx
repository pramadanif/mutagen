"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useChain } from "@cosmos-kit/react";
import { PixelButton } from "@/components/ui/PixelButton";
import { ResonanceBonusPanel } from "@/components/lab/ResonanceBonusPanel";
import { RegimeGauge } from "@/components/lab/RegimeGauge";
import { LootTableBars } from "@/components/lab/LootTableBars";
import { HubPulsePanel, RegimeShiftIndicator } from "@/components/lab/HubPulsePanel";
import { ASSETS, MUTATION_IMAGES, TIER_COLORS } from "@/lib/assets";
import { getBondHistory, getHubPulse, setExperiments } from "@/lib/experiment-store";
import {
  bondTokens,
  getSigningClient,
  queryResonanceBonus,
  triggerExposure,
} from "@/lib/contract";
import { postExperimentToRelayer } from "@/lib/relayer-client";
import { CHAIN_NAME } from "@/lib/cosmoshub-testnet-chain";
import { applyResonanceBonus, computeLootTable, normalizeWeights } from "@/lib/loot-table";
import { useStoreRefresh, usePrefersReducedMotion } from "@/lib/hooks";
import type { PullResult, ResonanceStatus } from "@/lib/types";

type PullPhase = "idle" | "glowing" | "flash" | "reveal";

const DENOMS = ["uatom", "ulab"] as const;

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col h-full">
      <div className="p-4 border-b-4 border-black font-header text-sm md:text-base">{title}</div>
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}

function ResultCard({
  result,
  bondAmount,
  denom,
}: {
  result: PullResult;
  bondAmount: number;
  denom: string;
}) {
  const colors = TIER_COLORS[result.tier];
  return (
    <div className="bg-white border-4 border-black shadow-[4px_4px_0_#000] p-4 text-center animate-fade-in">
      <Image
        src={MUTATION_IMAGES[result.tier]}
        alt={result.tier}
        width={160}
        height={160}
        className="mx-auto [image-rendering:pixelated] object-contain mb-3"
      />
      <div
        className="inline-block px-3 py-1 border-2 border-black font-header text-xs mb-3"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          boxShadow: `0 0 12px ${colors.glow}`,
        }}
      >
        {result.tier}
      </div>
      <div className="text-sm space-y-1 font-bold">
        <div>Bond: {bondAmount} {denom}</div>
        <div>Exposure: {result.exposureScore}</div>
        <div>Multiplier: {result.payoutMultiplier}x</div>
      </div>
    </div>
  );
}

export function LabPage() {
  const { address, isWalletConnected, getOfflineSigner } = useChain(CHAIN_NAME);
  useStoreRefresh();

  const [amount, setAmount] = useState("0.1");
  const [denom, setDenom] = useState<string>("uatom");
  const [phase, setPhase] = useState<PullPhase>("idle");
  const [result, setResult] = useState<PullResult | null>(null);
  const [lastBond, setLastBond] = useState({ amount: 0, denom: "uatom" });
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resonance, setResonance] = useState<ResonanceStatus>({
    hubStaker: false,
    nftHolder: false,
    labHolder: false,
  });
  const pullIdRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  const hubPulse = getHubPulse();
  const bondHistory = getBondHistory();

  useEffect(() => {
    if (!address) {
      setResonance({ hubStaker: false, nftHolder: false, labHolder: false });
      return;
    }
    void queryResonanceBonus(address).then((r) =>
      setResonance({
        hubStaker: r.hubStaker,
        nftHolder: r.nftHolder,
        labHolder: r.labHolder,
      })
    );
  }, [address]);
  const lootTable = normalizeWeights(
    applyResonanceBonus(computeLootTable(hubPulse.regimeScore), resonance)
  );

  const runPullAnimation = useCallback(
    (pullResult: PullResult, bondAmt: number, bondDenom: string) => {
      const id = ++pullIdRef.current;
      setResult(null);
      setPhase(reducedMotion ? "reveal" : "glowing");

      const timings = reducedMotion
        ? { glow: 0, flash: 0, reveal: 100 }
        : { glow: 1200, flash: 400, reveal: 600 };

      if (!reducedMotion) {
        setTimeout(() => {
          if (pullIdRef.current !== id) return;
          setPhase("flash");
        }, timings.glow);
        setTimeout(() => {
          if (pullIdRef.current !== id) return;
          setPhase("reveal");
          setResult(pullResult);
          setLastBond({ amount: bondAmt, denom: bondDenom });
        }, timings.glow + timings.flash);
      } else {
        setTimeout(() => {
          setResult(pullResult);
          setLastBond({ amount: bondAmt, denom: bondDenom });
        }, timings.reveal);
      }
    },
    [reducedMotion]
  );

  const handleTrigger = async () => {
    setError("");
    if (!isWalletConnected || !address) {
      setError("Connect wallet first.");
      return;
    }

    const bondAmt = parseFloat(amount);
    if (isNaN(bondAmt) || bondAmt <= 0) {
      setError("Enter valid bond amount.");
      return;
    }
    if (denom !== "uatom") {
      setError("On-chain demo supports uatom only.");
      return;
    }

    setLoading(true);
    try {
      const signer = await getOfflineSigner();
      const client = await getSigningClient(signer);
      const uatom = Math.floor(bondAmt * 1_000_000).toString();

      await bondTokens(client, address, uatom);
      const pullResult = await triggerExposure(client, address);

      const full: PullResult = {
        tier: pullResult.tier,
        exposureScore: parseFloat((bondAmt * pullResult.payoutMultiplier * 0.1).toFixed(2)),
        txHash: pullResult.txHash,
        payoutMultiplier: pullResult.payoutMultiplier,
      };

      setTxHash(full.txHash);
      runPullAnimation(full, bondAmt, denom);

      void postExperimentToRelayer({
        bondAmount: bondAmt,
        payout: bondAmt * pullResult.payoutMultiplier,
        tier: pullResult.tier,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "On-chain pull failed.");
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  };

  const isAnimating = phase !== "idle" && phase !== "reveal";
  const busy = loading || isAnimating;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-pixel">
      <div className="mb-6">
        <h1 className="font-header text-2xl md:text-3xl">The Lab</h1>
        <p className="text-lg mt-2">Bond ATOM to trigger an exposure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
        {/* Left — Your Status */}
        <PanelShell title="Your Status">
          <div className="space-y-4">
            <div className="text-sm font-bold">
              {isWalletConnected && address ? (
                <span className="bg-mutagen-green text-black px-2 py-1 border-2 border-black inline-block break-all">
                  {address.slice(0, 12)}...{address.slice(-6)}
                </span>
              ) : (
                <span className="text-mutagen-red">Wallet disconnected</span>
              )}
            </div>

            <div>
              <div className="font-header text-xs mb-2">Resonance Bonus</div>
              <ResonanceBonusPanel status={resonance} />
            </div>

            <div>
              <div className="font-header text-xs mb-2">Volatility Regime</div>
              <RegimeGauge score={hubPulse.regimeScore} compact />
            </div>

            <div>
              <div className="font-header text-xs mb-2">Recent Pulls</div>
              {bondHistory.length === 0 ? (
                <p className="text-sm opacity-60">No pulls yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {bondHistory.map((b) => (
                    <li key={b.id} className="bg-white border border-black px-2 py-1">
                      {b.amount} {b.denom} → {b.tier}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </PanelShell>

        {/* Center — The Incubator */}
        <PanelShell title="The Incubator">
          <div className="flex flex-col items-center gap-6">
            <div
              className={`relative w-full max-w-sm aspect-square flex items-center justify-center ${
                phase === "glowing" ? "animate-tank-glow" : ""
              }`}
            >
              <Image
                src={ASSETS.gachaMachine}
                alt="Gacha Machine"
                width={320}
                height={320}
                className="w-full h-auto [image-rendering:pixelated] object-contain relative z-10"
                priority
              />
              {phase === "glowing" && !reducedMotion && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full bg-mutagen-green animate-bubble"
                      style={{
                        left: `${20 + i * 12}%`,
                        bottom: "20%",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
              {phase === "flash" && (
                <div className="absolute inset-0 bg-mutagen-green/60 z-20 animate-flash" />
              )}
            </div>

            {result && phase === "reveal" && (
              <ResultCard result={result} bondAmount={lastBond.amount} denom={lastBond.denom} />
            )}

            <div className="w-full max-w-sm space-y-4">
              <div className="flex gap-2 items-center bg-white border-4 border-black p-2 shadow-[4px_4px_0_#000]">
                <Image
                  src={ASSETS.atomToken}
                  alt="Token"
                  width={32}
                  height={32}
                  className="[image-rendering:pixelated]"
                />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-xl font-bold min-w-0"
                  disabled={busy}
                />
                <select
                  value={denom}
                  onChange={(e) => setDenom(e.target.value)}
                  className="border-2 border-black bg-[#EAE4D5] px-2 py-1 text-base font-bold"
                  disabled={busy}
                >
                  {DENOMS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-mutagen-red font-bold text-sm">{error}</p>}

              <PixelButton
                onClick={handleTrigger}
                disabled={busy}
                className="w-full py-4 text-sm"
              >
                {loading ? "SIGNING..." : "TRIGGER EXPOSURE"}
              </PixelButton>
            </div>

            {txHash && (
              <div className="w-full max-w-sm bg-black border-4 border-[#333] p-3 font-mono text-sm text-[#27C93F]">
                <span className="text-[#FF5F56]">tx&gt; </span>
                {txHash}
              </div>
            )}
          </div>
        </PanelShell>

        {/* Right — Live Odds */}
        <PanelShell title="Live Odds">
          <div className="space-y-4">
            <LootTableBars table={lootTable} />
            <div className="font-header text-xs">Hub Pulse</div>
            <HubPulsePanel data={hubPulse} />
            <RegimeShiftIndicator score={hubPulse.regimeScore} />
          </div>
        </PanelShell>
      </div>
    </div>
  );
}
