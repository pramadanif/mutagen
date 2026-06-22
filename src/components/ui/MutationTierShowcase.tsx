import Image from "next/image";
import type { Tier } from "@/lib/types";
import { MUTATION_IMAGES, TIER_COLORS } from "@/lib/assets";

const SHOWCASE_TIERS: { tier: Tier; label: string }[] = [
  { tier: "COMMON", label: "COMMON" },
  { tier: "RARE", label: "RARE" },
  { tier: "LEGENDARY", label: "LEGENDARY" },
];

interface MutationTierShowcaseProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { box: "w-16 h-16", img: 56, badge: "text-[0.4rem]", pad: "p-2" },
  md: { box: "w-24 h-24", img: 80, badge: "text-[0.45rem]", pad: "p-3" },
  lg: { box: "w-28 h-28 md:w-32 md:h-32", img: 112, badge: "text-[0.5rem]", pad: "p-3" },
} as const;

export function MutationTierShowcase({ size = "md", className = "" }: MutationTierShowcaseProps) {
  const s = SIZE[size];

  return (
    <div className={`flex flex-wrap justify-center gap-3 md:gap-4 ${className}`}>
      {SHOWCASE_TIERS.map(({ tier, label }) => {
        const colors = TIER_COLORS[tier];
        return (
          <div key={tier} className="flex flex-col items-center gap-2 group">
            <div
              className={`relative bg-white border-4 border-black shadow-[4px_4px_0_#000] ${s.pad} ${s.box} flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_#000] transition-all`}
            >
              <Image
                src={MUTATION_IMAGES[tier]}
                alt={`${label} Mutation NFT`}
                width={s.img}
                height={s.img}
                className="[image-rendering:pixelated] object-contain w-full h-auto"
              />
            </div>
            <span
              className={`font-header ${s.badge} px-2 py-0.5 border-2 border-black`}
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
