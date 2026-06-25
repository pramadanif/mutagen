"use client";

import { useEffect, useRef } from "react";

interface BossHpBarProps {
  currentHp: number;
  maxHp: number;
  /** Flash red on hit */
  flashHit?: boolean;
}

export function BossHpBar({ currentHp, maxHp, flashHit = false }: BossHpBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = maxHp === 0 ? 0 : Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  // Color by HP %
  const barColor =
    pct > 50 ? "#39FF14" : pct > 20 ? "#FFBD2E" : "#FF0000";

  // Flash animation
  useEffect(() => {
    if (!flashHit || !barRef.current) return;
    const el = barRef.current;
    el.classList.add("hp-flash");
    const t = setTimeout(() => el.classList.remove("hp-flash"), 350);
    return () => clearTimeout(t);
  }, [flashHit]);

  return (
    <div className="w-full" ref={barRef}>
      <div className="flex justify-between font-header text-xs mb-1">
        <span>BOSS HP</span>
        <span style={{ color: barColor }}>
          {currentHp.toLocaleString()} / {maxHp.toLocaleString()}
        </span>
      </div>
      {/* Segmented pixel HP bar */}
      <div className="relative w-full h-8 bg-black border-4 border-black overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 12px ${barColor}`,
          }}
        />
        {/* Pixel segments overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.4) 18px, rgba(0,0,0,0.4) 20px)",
          }}
        />
        {/* Scanline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
          }}
        />
      </div>
      <div className="font-pixel text-xs mt-1 opacity-60">
        {pct.toFixed(1)}% remaining
      </div>

      <style>{`
        .hp-flash {
          animation: hpFlash 0.35s ease-out;
        }
        @keyframes hpFlash {
          0%   { filter: brightness(3) saturate(0); }
          40%  { filter: brightness(2) saturate(0.5); }
          100% { filter: brightness(1) saturate(1); }
        }
      `}</style>
    </div>
  );
}
