"use client";

import { useEffect, useState } from "react";

interface DamageNumberProps {
  damage: number;
  isCrit?: boolean;
  onComplete?: () => void;
}

/** Floating damage number that rises and fades, then calls onComplete. */
export function DamageNumber({ damage, isCrit = false, onComplete }: DamageNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 900);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none font-header absolute select-none"
      style={{
        fontSize: isCrit ? "2rem" : "1.4rem",
        color: isCrit ? "#FFBD2E" : "#39FF14",
        textShadow: isCrit
          ? "0 0 12px #FFBD2E, 2px 2px 0 #000"
          : "0 0 8px #39FF14, 2px 2px 0 #000",
        animation: "damageFloat 0.9s ease-out forwards",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        zIndex: 100,
      }}
    >
      {isCrit ? "★ " : ""}-{damage.toLocaleString()}
      <style>{`
        @keyframes damageFloat {
          0%   { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
          30%  { transform: translate(-50%, -80%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -160%) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
