import type { Metadata } from "next";
import { MergePage } from "@/components/merge/MergePage";

export const metadata: Metadata = {
  title: "Merge Lab — MUTAGEN",
  description:
    "Combine 4 Mutation NFTs into a powerful Specimen. Choose your archetype wisely — Pure, Balanced, or Hybrid — each reacts differently to the current Volatility Regime.",
};

export default function MergeRoute() {
  return <MergePage />;
}
