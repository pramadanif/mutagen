"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useChain } from "@cosmos-kit/react";
import { CHAIN_NAME } from "@/lib/cosmoshub-testnet-chain";
import {
  queryBossState,
  queryLeaderboard,
  queryPlayerSpecimens,
  attackBoss,
  claimReward,
  getSigningClient,
} from "@/lib/contract";
import { getHubPulse } from "@/lib/experiment-store";
import { getRegimeLabel, getRegimeColor } from "@/lib/loot-table";
import { isLabSoundEnabled, setLabSoundEnabled } from "@/lib/lab-sounds";
import { playBGM, stopBGM } from "@/lib/bgm";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { BossHpBar } from "@/components/raid/BossHpBar";
import { DamageNumber } from "@/components/raid/DamageNumber";
import {
  playAttackHitSound,
  playBossHitReactionSound,
  playBossDefeatedSound,
} from "@/lib/raid-sounds";
import type { BossState, LeaderboardEntry, Specimen } from "@/lib/types";

const ATTACK_COOLDOWN_SECS = 300;




// ─── Cooldown hook ────────────────────────────────────────────────────────────
function useCooldownTimer(lastAttackAtSecs: number | null): number {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      if (lastAttackAtSecs === null) { setRemaining(0); return; }
      const elapsed = Math.floor(Date.now() / 1000) - lastAttackAtSecs;
      const rem = Math.max(0, ATTACK_COOLDOWN_SECS - elapsed);
      setRemaining(rem);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastAttackAtSecs]);

  return remaining;
}

// ─── Damage flash hook ────────────────────────────────────────────────────────
function useDamageFlash() {
  const [flash, setFlash] = useState(false);
  const trigger = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
  }, []);
  return [flash, trigger] as const;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhaseTag({ score }: { score: number }) {
  const label = getRegimeLabel(score);
  const color = getRegimeColor(score);
  return (
    <div
      className="inline-flex items-center gap-2 border-4 border-black px-3 py-1 font-header text-xs shadow-[3px_3px_0_#000]"
      style={{ backgroundColor: color, color: "#000" }}
    >
      <span>◆</span>
      <span>PHASE: {label}</span>
    </div>
  );
}

function SpecimenCard({
  specimen,
  selected,
  onSelect,
  cooldownRemaining,
}: {
  specimen: Specimen;
  selected: boolean;
  onSelect: () => void;
  cooldownRemaining: number;
}) {
  const ready = cooldownRemaining === 0;
  const archetypeColors: Record<string, string> = {
    Pure: "#39FF14", Balanced: "#8B5CF6", Hybrid: "#FF5F56",
  };
  const color = archetypeColors[specimen.archetype] ?? "#B6B09F";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left border-4 border-black p-3 transition-all
        ${selected ? "bg-black text-white" : "bg-[#EAE4D5] hover:translate-x-[2px] hover:translate-y-[2px]"}
      `}
      style={selected ? { boxShadow: `0 0 16px ${color}` } : { boxShadow: "4px 4px 0 #000" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="font-header text-xs border-2 border-black px-1 py-0.5 shrink-0"
          style={{ backgroundColor: color, color: "#000" }}
        >
          {specimen.archetype.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-header text-xs truncate">
            Specimen #{specimen.id} — {specimen.tier}
          </div>
          <div className="text-xs opacity-70">⚡ Power: {specimen.power}</div>
        </div>
      </div>
      {!ready && (
        <div className="mt-2 text-xs font-pixel text-yellow-500 animate-pulse">
          ⏱ Cooldown: {Math.floor(cooldownRemaining / 60)}m {cooldownRemaining % 60}s
        </div>
      )}
      {ready && (
        <div className="mt-2 text-xs font-pixel text-green-400">✓ READY TO ATTACK</div>
      )}
    </button>
  );
}

function LeaderboardRow({
  entry,
  rank,
  isMe,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
}) {
  const sharePct = (entry.share_bps / 100).toFixed(2);
  return (
    <tr
      className={`border-b border-black/20 ${isMe ? "bg-[#39FF14]/10" : ""}`}
    >
      <td className="py-1 px-2 font-header text-xs opacity-60">#{rank}</td>
      <td className="py-1 px-2 font-pixel text-xs">
        {entry.player.slice(0, 10)}…
        {isMe && <span className="ml-1 text-[0.5rem] bg-[#39FF14] text-black px-1">YOU</span>}
      </td>
      <td className="py-1 px-2 font-pixel text-xs text-right">{entry.damage.toLocaleString()}</td>
      <td className="py-1 px-2 font-pixel text-xs text-right opacity-70">{sharePct}%</td>
    </tr>
  );
}

// ─── Main RaidPage ─────────────────────────────────────────────────────────────

export function RaidPage() {
  const { address, isWalletConnected, getOfflineSigner } = useChain(CHAIN_NAME);
  const hubPulse = getHubPulse();

  const [soundOn, setSoundOn] = useState(true);

  // Audio state
  useEffect(() => {
    setSoundOn(isLabSoundEnabled());
    const startAudio = () => playBGM();
    startAudio();
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

  const [boss, setBoss] = useState<BossState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [selectedSpecimen, setSelectedSpecimen] = useState<number | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [lastDamage, setLastDamage] = useState<number | null>(null);
  const [showDamage, setShowDamage] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [bossDefeatedModal, setBossDefeatedModal] = useState(false);
  const [claimResult, setClaimResult] = useState<{ credits: number; damage: number } | null>(null);
  const prevBossHp = useRef<number | null>(null);

  // Poll boss state + leaderboard every 8 seconds
  useEffect(() => {
    const load = async () => {
      try {
        const [b, lb] = await Promise.all([queryBossState(), queryLeaderboard()]);

        // Detect boss defeat transition
        if (prevBossHp.current !== null && prevBossHp.current > 0 && b.current_hp === 0) {
          playBossDefeatedSound();
          setBossDefeatedModal(true);
        }
        prevBossHp.current = b.current_hp;

        setBoss(b);
        setLeaderboard(lb.entries);
      } catch { /* offline */ }
    };
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  // Load player specimens
  useEffect(() => {
    if (!isWalletConnected || !address) { setSpecimens([]); return; }
    queryPlayerSpecimens(address)
      .then(setSpecimens)
      .catch(() => setSpecimens([]));
  }, [address, isWalletConnected]);

  // Per-specimen cooldown state (keyed by id)
  const [cooldowns, setCooldowns] = useState<Record<number, number>>({});

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const updated: Record<number, number> = {};
      for (const sp of specimens) {
        if (!sp.last_attack_at) { updated[sp.id] = 0; continue; }
        const lastSecs = Number(sp.last_attack_at.seconds);
        const elapsed = now - lastSecs;
        updated[sp.id] = Math.max(0, ATTACK_COOLDOWN_SECS - elapsed);
      }
      setCooldowns(updated);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [specimens]);

  const handleAttack = useCallback(async () => {
    if (!isWalletConnected || !address || selectedSpecimen === null) return;
    const cd = cooldowns[selectedSpecimen] ?? 0;
    if (cd > 0) { setError(`Cooldown: ${cd}s remaining.`); return; }
    if (!boss || boss.defeated) { setError("Boss is already defeated."); return; }

    setError("");
    setAttacking(true);

    // Optimistic feedback
    playAttackHitSound();

    try {
      const signer = await getOfflineSigner();
      const client = await getSigningClient(signer);
      const result = await attackBoss(client, address, selectedSpecimen);

      setTxHash(result.txHash);
      setLastDamage(result.damage);
      setShowDamage(true);

      // Sound + visual feedback
      playBossHitReactionSound();
      setBossFlash(true);
      setTimeout(() => setBossFlash(false), 300);

      // Refresh state
      const [b, lb] = await Promise.all([queryBossState(), queryLeaderboard()]);

      if (result.defeated || b.current_hp === 0) {
        playBossDefeatedSound();
        setBossDefeatedModal(true);
      }

      setBoss(b);
      setLeaderboard(lb.entries);

      // Update specimen cooldown locally
      setSpecimens((prev) =>
        prev.map((sp) =>
          sp.id === selectedSpecimen
            ? { ...sp, last_attack_at: { seconds: String(Math.floor(Date.now() / 1000)), nanos: 0 } }
            : sp
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Attack failed.");
    } finally {
      setAttacking(false);
    }
  }, [address, boss, cooldowns, getOfflineSigner, isWalletConnected, selectedSpecimen]);

  const handleClaim = useCallback(async () => {
    if (!isWalletConnected || !address) return;
    setClaiming(true);
    setError("");
    try {
      const signer = await getOfflineSigner();
      const client = await getSigningClient(signer);
      const result = await claimReward(client, address);
      const myEntry = leaderboard.find((e) => e.player === address);
      setClaimResult({
        credits: result.rewardCredits,
        damage: myEntry?.damage ?? 0,
      });
      setTxHash(result.txHash);
      // Refresh
      const lb = await queryLeaderboard();
      setLeaderboard(lb.entries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim failed.");
    } finally {
      setClaiming(false);
    }
  }, [address, getOfflineSigner, isWalletConnected, leaderboard]);

  // Select boss sprite based on regime score
  const regimeScore = hubPulse.regimeScore;
  const regimeLabel = getRegimeLabel(regimeScore);
  const bossSpriteConfig =
    regimeScore <= 30
      ? { src: "/sprites/boss-calm-idle.png", frameH: 550, offsetY: 0 }
      : regimeScore <= 60
      ? { src: "/sprites/boss-elevated-idle.png", frameH: 550, offsetY: 245 }
      : { src: "/sprites/boss-turbulent-idle.png", frameH: 550, offsetY: 150 };

  const myEntry = leaderboard.find((e) => e.player === address);
  const canClaim = boss?.defeated && myEntry && myEntry.damage > 0 && !myEntry.claimed;

  const selectedSp = specimens.find((s) => s.id === selectedSpecimen);
  const selectedCd = selectedSpecimen !== null ? (cooldowns[selectedSpecimen] ?? 0) : 0;
  const attackReady = selectedSp && selectedCd === 0 && !boss?.defeated;

  return (
    <div className="w-full min-h-[calc(100vh-72px)] flex flex-col p-4 md:p-6 font-pixel">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-header text-2xl md:text-3xl">RAID BOSS</h1>
          <p className="text-lg mt-2 opacity-70">Cooperative boss fight — coordinate with other players.</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <PhaseTag score={hubPulse.regimeScore} />
          <Link href="/" className="font-header text-xs border-4 border-black px-3 py-2 bg-white shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-transform text-black">
            HOME
          </Link>
          <Link href="/merge" className="font-header text-xs border-4 border-black px-3 py-2 bg-[#8B5CF6] text-white shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-transform">
            MERGE LAB
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px_320px] xl:grid-cols-[1fr_380px_380px] gap-6 min-h-0">

        {/* ── Boss Arena ── */}
        <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col">
          <div className="p-4 border-b-4 border-black font-header text-sm shrink-0">THE CONSTRUCT</div>
          <div className="p-6 flex flex-col items-center justify-center flex-1 gap-6 overflow-y-auto">

          {/* Boss sprite — animated using PixelSprite */}
            <div className="relative flex justify-center w-full max-w-[400px] aspect-square items-center">
              <div 
                className={`transition-all ${bossFlash ? "brightness-[3] saturate-0" : ""}`}
                style={{
                   filter: boss?.defeated
                      ? "grayscale(1) brightness(0.4)"
                      : `drop-shadow(0 0 24px ${regimeLabel === "TURBULENT" ? "#FF0000" : regimeLabel === "ELEVATED" ? "#FFBD2E" : "#39FF14"})`,
                   transition: bossFlash ? "none" : "filter 0.2s"
                }}
              >
                <PixelSprite
                  src={bossSpriteConfig.src}
                  frameW={341}
                  frameH={bossSpriteConfig.frameH}
                  offsetY={bossSpriteConfig.offsetY}
                  totalFrames={3}
                  fps={3}
                  className="mx-auto"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              {/* Damage number overlay */}
              {showDamage && lastDamage !== null && (
                <DamageNumber
                  damage={lastDamage}
                  isCrit={selectedSp?.archetype === "Pure" && regimeScore > 60}
                  onComplete={() => setShowDamage(false)}
                />
              )}
            </div>

            {boss?.defeated && (
              <div className="font-header text-xl text-red-500 animate-pulse">
                ✗ DEFEATED
              </div>
            )}

            {/* HP bar */}
            {boss && (
              <div className="w-full max-w-md">
                <BossHpBar
                  currentHp={boss.current_hp}
                  maxHp={boss.max_hp}
                  flashHit={bossFlash}
                />
              </div>
            )}

            {/* Regime phase indicator */}
            <div className="w-full max-w-md bg-black border-4 border-black p-3 shrink-0">
              <div className="font-header text-xs mb-2" style={{ color: getRegimeColor(hubPulse.regimeScore) }}>
                CURRENT PHASE: {getRegimeLabel(hubPulse.regimeScore)}
              </div>
              <p className="text-xs text-white opacity-70 font-pixel">
                {hubPulse.regimeScore <= 30
                  ? "CALM — Pure specimens deal −30% damage. Hybrid optimal."
                  : hubPulse.regimeScore <= 60
                  ? "ELEVATED — All archetypes deal equal damage."
                  : "TURBULENT — Pure specimens deal +30% damage. Maximum risk/reward."}
              </p>
            </div>

            {/* Phase Guide showing other boss animations */}
            <div className="w-full max-w-md mt-2 shrink-0">
              <div className="font-header text-[0.65rem] mb-2 text-center opacity-80">BOSS PHASE GUIDE</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "CALM", src: "/sprites/boss-calm-idle.png", color: "#39FF14", desc: "Pure: -30%", h: 550, oy: 0 },
                  { name: "ELEVATED", src: "/sprites/boss-elevated-idle.png", color: "#FFBD2E", desc: "Neutral", h: 550, oy: 245 },
                  { name: "TURBULENT", src: "/sprites/boss-turbulent-idle.png", color: "#FF0000", desc: "Pure: +30%", h: 550, oy: 150 },
                ].map((p) => (
                  <div key={p.name} className={`flex flex-col items-center bg-white border-2 border-black p-1.5 ${p.name === regimeLabel ? 'ring-2 ring-black bg-[#EAE4D5]' : 'opacity-60 grayscale-[0.5]'}`}>
                    <div className="h-14 w-full flex items-center justify-center mb-1">
                      <PixelSprite
                        src={p.src}
                        frameW={341}
                        frameH={p.h}
                        offsetY={p.oy}
                        totalFrames={3}
                        fps={3}
                        style={{ height: "100%", width: "auto", objectFit: "contain", filter: `drop-shadow(0 0 8px ${p.color})` }}
                      />
                    </div>
                    <div className="text-[0.55rem] font-header" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-[0.5rem] font-pixel text-center mt-0.5 opacity-80">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {txHash && (
              <div className="w-full max-w-md bg-black border-4 border-[#333] p-3 font-mono text-xs text-[#27C93F] break-all">
                <span className="text-[#FF5F56]">tx&gt; </span>{txHash}
              </div>
            )}
          </div>
        </div>

        {/* ── Attack Controls ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col flex-1 min-h-0">
            <div className="p-4 border-b-4 border-black font-header text-sm shrink-0">YOUR SPECIMENS</div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {!isWalletConnected ? (
                <p className="text-sm opacity-60">Connect wallet to load specimens.</p>
              ) : specimens.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm opacity-60">No specimens yet.</p>
                  <a href="/merge" className="underline text-xs font-header opacity-70 hover:opacity-100">
                    → Go to Merge Lab
                  </a>
                </div>
              ) : (
                specimens.map((sp) => (
                  <SpecimenCard
                    key={sp.id}
                    specimen={sp}
                    selected={selectedSpecimen === sp.id}
                    onSelect={() => setSelectedSpecimen(sp.id)}
                    cooldownRemaining={cooldowns[sp.id] ?? 0}
                  />
                ))
              )}
            </div>
          </div>

          {error && <p className="text-red-600 font-bold text-sm">{error}</p>}

          <PixelButton
            onClick={handleAttack}
            disabled={!attackReady || attacking || !isWalletConnected}
            className="w-full py-4 text-sm"
          >
            {attacking
              ? "ATTACKING…"
              : selectedCd > 0
              ? `COOLDOWN ${Math.floor(selectedCd / 60)}m${selectedCd % 60}s`
              : boss?.defeated
              ? "BOSS DEFEATED"
              : "ATTACK BOSS"}
          </PixelButton>

          {canClaim && (
            <PixelButton
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-3 text-xs"
            >
              {claiming ? "CLAIMING…" : "CLAIM REWARD"}
            </PixelButton>
          )}

          {claimResult && (
            <div className="bg-black border-4 border-[#39FF14] p-4 shadow-[0_0_20px_#39FF14]">
              <div className="font-header text-[#39FF14] text-sm">✓ REWARD CLAIMED</div>
              <div className="text-white text-xs mt-2 space-y-1">
                <div>Credits earned: {claimResult.credits.toLocaleString()}</div>
                <div>Total damage dealt: {claimResult.damage.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Leaderboard ── */}
        <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col min-h-0">
          <div className="p-4 border-b-4 border-black font-header text-sm shrink-0">
            DAMAGE LEADERBOARD
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {leaderboard.length === 0 ? (
              <p className="text-sm opacity-60 py-4 text-center">No attacks yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black text-left">
                    <th className="py-1 px-2 font-header text-xs">#</th>
                    <th className="py-1 px-2 font-header text-xs">Player</th>
                    <th className="py-1 px-2 font-header text-xs text-right">DMG</th>
                    <th className="py-1 px-2 font-header text-xs text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => (
                    <LeaderboardRow
                      key={entry.player}
                      entry={entry}
                      rank={i + 1}
                      isMe={entry.player === address}
                    />
                  ))}
                </tbody>
              </table>
            )}

            {myEntry && (
              <div className="mt-4 border-t-2 border-black pt-4">
                <div className="font-header text-xs mb-1">YOUR CONTRIBUTION</div>
                <div className="text-sm">
                  <span className="font-bold">{myEntry.damage.toLocaleString()}</span>
                  <span className="opacity-60"> dmg</span>
                  <span className="ml-2 opacity-60">({(myEntry.share_bps / 100).toFixed(2)}%)</span>
                </div>
                {myEntry.claimed && (
                  <div className="mt-1 text-xs text-green-500">✓ Reward claimed</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Boss Defeated Modal ── */}
      {bossDefeatedModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_#000] p-8 max-w-md w-full text-center">
            <div className="font-header text-2xl mb-4 animate-pulse" style={{ color: "#39FF14" }}>
              ★ BOSS DEFEATED ★
            </div>
            <div className="text-4xl mb-4">💥</div>
            <p className="font-pixel text-sm mb-4 opacity-70">
              The Construct has fallen! Claim your reward credits proportional to your damage contribution.
            </p>
            {myEntry && (
              <div className="bg-black text-white p-4 border-4 border-[#39FF14] mb-4">
                <div className="font-header text-xs text-[#39FF14] mb-2">YOUR SHARE</div>
                <div className="font-pixel text-sm">
                  {myEntry.damage.toLocaleString()} damage · {(myEntry.share_bps / 100).toFixed(2)}%
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-col">
              {canClaim && (
                <PixelButton onClick={() => { setBossDefeatedModal(false); void handleClaim(); }} className="w-full">
                  CLAIM REWARD
                </PixelButton>
              )}
              <button
                type="button"
                onClick={() => setBossDefeatedModal(false)}
                className="w-full bg-black text-white border-4 border-black py-3 font-header text-xs hover:bg-mutagen-green hover:text-black transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
