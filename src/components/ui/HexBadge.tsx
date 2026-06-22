"use client";

import type { ReactNode } from "react";

interface HexBadgeProps {
  color: string;
  borderColor?: string;
  children: ReactNode;
}

export function HexBadge({ color, borderColor = "#000", children }: HexBadgeProps) {
  return (
    <div
      className="w-10 h-11 flex items-center justify-center shrink-0"
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        backgroundColor: color,
        border: `2px solid ${borderColor}`,
      }}
    >
      {children}
    </div>
  );
}

export function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="svg-pixel">
      <path d="M8 1 L14 3 L14 8 C14 12 8 15 8 15 C8 15 2 12 2 8 L2 3 Z" fill="#14532D" stroke="#000" strokeWidth="1" />
    </svg>
  );
}

export function DiamondIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="svg-pixel">
      <polygon points="7,1 13,7 7,13 1,7" fill="#F59E0B" stroke="#000" strokeWidth="1" />
    </svg>
  );
}

export function FlaskIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" className="svg-pixel">
      <rect x="4" y="0" width="4" height="2" fill="#000" />
      <rect x="3" y="2" width="6" height="2" fill="#6B21A8" />
      <rect x="2" y="4" width="8" height="10" fill="#8B5CF6" stroke="#000" strokeWidth="1" />
      <rect x="3" y="10" width="6" height="2" fill="#39FF14" />
    </svg>
  );
}
