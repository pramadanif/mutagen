import type { Tier } from "./types";

export const ASSETS = {
  atomToken: "/atom token.png",
  gachaMachine: "/gachamachine.png",
  labTube: "/labtube.png",
  speedometer: "/speedometer.png",
  antena: "/antena.png",
} as const;

export const MUTATION_IMAGES: Record<Tier, string> = {
  COMMON: "/commonnft.png",
  RARE: "/rarenft.png",
  EPIC: "/rarenft.png",
  LEGENDARY: "/legendarynft.png",
};

export const TIER_COLORS: Record<Tier, { bg: string; text: string; glow: string }> = {
  COMMON: { bg: "#9CA3AF", text: "#374151", glow: "rgba(156,163,175,0.6)" },
  RARE: { bg: "#39FF14", text: "#14532D", glow: "rgba(57,255,20,0.6)" },
  EPIC: { bg: "#8B5CF6", text: "#F3E8FF", glow: "rgba(139,92,246,0.6)" },
  LEGENDARY: { bg: "#F59E0B", text: "#78350F", glow: "rgba(245,158,11,0.7)" },
};
