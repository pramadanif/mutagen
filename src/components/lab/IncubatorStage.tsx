"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import type { Tier } from "@/lib/types";
import { TIER_COLORS } from "@/lib/assets";

export type IncubatorPhase = "idle" | "charge" | "rumble" | "flash" | "reveal";

interface IncubatorStageProps {
  phase: IncubatorPhase;
  reducedMotion: boolean;
  revealTier?: Tier;
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: 8 + ((i * 17) % 84),
  delay: (i % 5) * 0.12,
  size: 4 + (i % 3) * 2,
  tx: ((i % 2 === 0 ? 1 : -1) * (30 + (i % 4) * 18)).toFixed(0),
  ty: (-40 - (i % 6) * 22).toFixed(0),
}));

export function IncubatorStage({ phase, reducedMotion, revealTier }: IncubatorStageProps) {
  const active = phase !== "idle";
  const tierColor = revealTier ? TIER_COLORS[revealTier].glow : "#39FF14";

  if (reducedMotion) {
    return (
      <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
        <Image
          src={ASSETS.gachaMachine}
          alt="Gacha Machine"
          width={320}
          height={320}
          className="w-full h-auto [image-rendering:pixelated] object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full max-w-sm aspect-square flex items-center justify-center ${
        phase === "rumble" ? "animate-machine-shake" : ""
      } ${phase === "flash" ? "animate-screen-shake" : ""}`}
    >
      {/* Charge rings */}
      {(phase === "charge" || phase === "rumble") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {[0, 1, 2].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border-4 border-mutagen-green animate-ring-expand"
              style={{
                width: `${55 + ring * 18}%`,
                height: `${55 + ring * 18}%`,
                animationDelay: `${ring * 0.35}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette pulse */}
      {active && (
        <div
          className={`absolute inset-0 rounded-lg pointer-events-none z-[5] animate-charge-vignette ${
            phase === "rumble" ? "opacity-100" : "opacity-70"
          }`}
          style={{
            background: `radial-gradient(circle, transparent 35%, ${tierColor}44 100%)`,
          }}
        />
      )}

      {/* Gacha machine */}
      <Image
        src={ASSETS.gachaMachine}
        alt="Gacha Machine"
        width={320}
        height={320}
        className={`w-full h-auto [image-rendering:pixelated] object-contain relative z-10 transition-transform duration-300 ${
          phase === "charge" ? "animate-machine-charge" : ""
        } ${phase === "rumble" ? "scale-105 brightness-125" : ""} ${
          phase === "reveal" ? "animate-reveal-pop" : ""
        }`}
        priority
      />

      {/* Bubbles */}
      {(phase === "charge" || phase === "rumble") && (
        <div className="absolute inset-0 pointer-events-none z-[15]">
          {PARTICLES.slice(0, 12).map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-mutagen-green animate-bubble-rise shadow-[0_0_8px_#39FF14]"
              style={{
                left: `${p.left}%`,
                bottom: "18%",
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Burst particles on flash */}
      {phase === "flash" && (
        <div className="absolute inset-0 pointer-events-none z-[25]">
          {PARTICLES.map((p) => (
            <div
              key={`burst-${p.id}`}
              className="absolute left-1/2 top-1/2 rounded-sm bg-mutagen-green animate-particle-burst"
              style={{
                width: p.size,
                height: p.size,
                ["--tx" as string]: `${p.tx}px`,
                ["--ty" as string]: `${p.ty}px`,
                animationDelay: `${p.delay * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* White flash overlay */}
      {phase === "flash" && (
        <div className="absolute inset-0 bg-white z-30 animate-flash-burst pointer-events-none" />
      )}

      {/* Tier reveal burst */}
      {phase === "reveal" && revealTier && (
        <div
          className="absolute inset-0 z-[8] pointer-events-none animate-reveal-burst rounded-full"
          style={{
            background: `radial-gradient(circle, ${tierColor}88 0%, transparent 65%)`,
          }}
        />
      )}

      {/* Scanlines during charge */}
      {phase === "charge" && (
        <div className="absolute inset-0 z-20 pointer-events-none opacity-40 animate-scan-sweep bg-[linear-gradient(transparent_50%,rgba(57,255,20,0.15)_50%)] bg-[length:100%_4px]" />
      )}
    </div>
  );
}
