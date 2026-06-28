import type { Metadata } from "next";
import { RaidPage } from "@/components/raid/RaidPage";

export const metadata: Metadata = {
  title: "Raid Boss — MUTAGEN",
  description:
    "Cooperative raid fight against the on-chain Construct. Attack with your Specimens, watch the live HP bar, and claim reward credits proportional to your damage contribution.",
};

export default function RaidRoute() {
  return <RaidPage />;
}
