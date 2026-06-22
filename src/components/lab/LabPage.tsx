"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useChain } from "@cosmos-kit/react";
import { PixelButton } from "@/components/ui/PixelButton";
import { ResonanceBonusPanel } from "@/components/lab/ResonanceBonusPanel";
import { RegimeGauge } from "@/components/lab/RegimeGauge";
import { LootTableBars } from "@/components/lab/LootTableBars";
import { HubPulsePanel, RegimeShiftIndicator } from "@/components/lab/HubPulsePanel";
import { IncubatorStage, type IncubatorPhase } from "@/components/lab/IncubatorStage";
import { ASSETS, MUTATION_IMAGES, TIER_COLORS } from "@/lib/assets";
import { getBondHistory, getHubPulse } from "@/lib/experiment-store";
import {
  bondTokens,
  getSigningClient,
  queryResonanceBonus,
  triggerExposure,
} from "@/lib/contract";
import { postExperimentToRelayer } from "@/lib/relayer-client";
import { CHAIN_NAME } from "@/lib/cosmoshub-testnet-chain";
import { applyResonanceBonus, computeLootTable, normalizeWeights } from "@/lib/loot-table";
import {
  isLabSoundEnabled,
  playChargeSound,
  playErrorSound,
  playFlashSound,
  playRevealSound,
  playRumbleSound,
  setLabSoundEnabled,
  stopChargeSound,
} from "@/lib/lab-sounds";
import { useStoreRefresh, usePrefersReducedMotion } from "@/lib/hooks";
import type { PullResult, ResonanceStatus } from "@/lib/types";

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
    <div
      className="bg-white border-4 border-black shadow-[4px_4px_0_#000] p-4 text-center animate-reveal-card"
      style={{ boxShadow: `4px 4px 0 #000, 0 0 24px ${colors.glow}` }}
    >
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
          boxShadow: `0 0 16px ${colors.glow}`,
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
  const [phase, setPhase] = useState<IncubatorPhase>("idle");
  const [result, setResult] = useState<PullResult | null>(null);
  const [lastBond, setLastBond] = useState({ amount: 0, denom: "uatom" });
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
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
    setSoundOn(isLabSoundEnabled());
  }, []);

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

      if (reducedMotion) {
        setPhase("reveal");
        setResult(pullResult);
        setLastBond({ amount: bondAmt, denom: bondDenom });
        playRevealSound(pullResult.tier);
        return;
      }

      const timings = { rumble: 700, flash: 450 };

      setPhase("rumble");
      playRumbleSound();

      setTimeout(() => {
        if (pullIdRef.current !== id) return;
        setPhase("flash");
        playFlashSound();
      }, timings.rumble);

      setTimeout(() => {
        if (pullIdRef.current !== id) return;
        setPhase("reveal");
        setResult(pullResult);
        setLastBond({ amount: bondAmt, denom: bondDenom });
        playRevealSound(pullResult.tier);
      }, timings.rumble + timings.flash);
    },
    [reducedMotion]
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setLabSoundEnabled(next);
    if (!next) stopChargeSound();
  };

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
    setResult(null);
    if (!reducedMotion) {
      setPhase("charge");
      playChargeSound();
    }

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
      stopChargeSound();
      playErrorSound();
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-header text-2xl md:text-3xl">The Lab</h1>
          <p className="text-lg mt-2">Bond ATOM to trigger an exposure.</p>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          className="font-header text-xs border-4 border-black px-3 py-2 bg-white shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-transform"
          aria-pressed={soundOn}
        >
          {soundOn ? "🔊 SFX ON" : "🔇 SFX OFF"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
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

        <PanelShell title="The Incubator">
          <div className="flex flex-col items-center gap-6">
            <IncubatorStage
              phase={phase}
              reducedMotion={reducedMotion}
              revealTier={result?.tier}
            />

            {phase === "charge" && !reducedMotion && (
              <p className="font-header text-sm text-mutagen-green animate-fast-blink">
                CHARGING REACTOR...
              </p>
            )}
            {phase === "rumble" && !reducedMotion && (
              <p className="font-header text-sm text-mutagen-red animate-fast-blink">
                CRITICAL MASS!!!
              </p>
            )}

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
                {loading ? "SIGNING..." : phase === "charge" ? "CHARGING..." : "TRIGGER EXPOSURE"}
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
