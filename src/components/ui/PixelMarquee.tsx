"use client";

const DEFAULT_ITEMS = [
  "BONDED RATIO Δ",
  "GOV ACTIVITY",
  "IBC VOLUME Δ",
  "REGIME SCORE 0–100",
  "COMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "ZERO-SUM INDEX",
  "AUDITOR ACTIVE",
  "COSMOS HUB",
  "MUTAGEN EXPOSURE",
];

interface PixelMarqueeProps {
  items?: readonly string[];
  variant?: "terminal" | "tape";
  speed?: "slow" | "normal" | "fast";
}

const SPEED_CLASS = {
  slow: "animate-marquee-slow",
  normal: "animate-marquee",
  fast: "animate-marquee-fast",
} as const;

export function PixelMarquee({
  items = DEFAULT_ITEMS,
  variant = "terminal",
  speed = "normal",
}: PixelMarqueeProps) {
  const doubled = [...items, ...items];
  const isTerminal = variant === "terminal";

  return (
    <div
      className={`overflow-hidden border-b-4 border-black select-none ${
        isTerminal ? "bg-black" : "bg-[#EAE4D5]"
      }`}
      aria-hidden
    >
      <div className={`flex w-max ${SPEED_CLASS[speed]} marquee-track`}>
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`flex items-center shrink-0 px-6 py-2 font-header text-[0.55rem] tracking-wider ${
              isTerminal ? "text-mutagen-green" : "text-black"
            }`}
          >
            {item}
            <span
              className={`ml-6 ${isTerminal ? "text-mutagen-green/40" : "text-black/30"}`}
            >
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
