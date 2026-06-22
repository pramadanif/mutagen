import Link from "next/link";
import { PITCH, CORE_PILLARS } from "@/lib/judge-content";
import { PixelMarquee } from "@/components/ui/PixelMarquee";
import { MutationTierShowcase } from "@/components/ui/MutationTierShowcase";

const MARQUEE_PILLARS = CORE_PILLARS.map((p) => p.label.toUpperCase());

const CTAS = [
  {
    href: "/lab",
    label: "ENTER THE LAB",
    desc: "Bond · pull · reveal",
    className:
      "bg-mutagen-green text-black hover:bg-[#5cff42]",
  },
  {
    href: "/how-it-works",
    label: "HOW IT WORKS",
    desc: "Full mechanic breakdown",
    className: "bg-white text-black hover:bg-[#f8f8f8]",
  },
  {
    href: "/dashboard",
    label: "OPEN DASHBOARD",
    desc: "Histogram · gauge · Hub Pulse",
    className: "bg-black text-mutagen-green hover:bg-[#1a1a1a]",
  },
] as const;

export function PitchOverview() {
  return (
    <section
      id="overview"
      className="w-full bg-[#EAE4D5] border-b-4 border-black font-pixel -mt-px"
    >
      {/* Hub signal ticker */}
      <PixelMarquee variant="terminal" speed="normal" />

      <div className="max-w-7xl mx-auto px-4 pt-0 pb-14">
        <div className="w-full h-3 bg-[#C0C0C0] border-b-4 border-black mb-0" />

        <div className="bg-[#F5F2EB] border-4 border-t-0 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b-4 border-black bg-[#EAE4D5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-header text-base md:text-lg">Why MUTAGEN</h2>
              <p className="text-sm font-bold mt-1 opacity-70">
                Chain-driven gacha, reshaped by the Hub
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold bg-black text-mutagen-green px-3 py-1.5 border-2 border-black">
                <span className="w-2 h-2 bg-mutagen-green animate-pulse" />
                HUB SIGNALS LIVE
              </div>
            </div>
          </div>

          {/* Pillar ticker */}
          <PixelMarquee items={MARQUEE_PILLARS} variant="tape" speed="slow" />

          <div className="p-6 md:p-10">
            {/* Lead — editorial block */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 mb-12 items-center">
              <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_#000] relative">
                <div className="absolute -top-3 left-6 bg-mutagen-green border-2 border-black px-3 py-0.5 font-header text-[0.45rem]">
                  THE PITCH
                </div>
                <p className="font-header text-sm md:text-base leading-relaxed mb-5 text-black pt-2">
                  {PITCH.headline}
                </p>
                <p className="text-base md:text-lg leading-relaxed text-black/80 border-l-4 border-mutagen-green pl-4">
                  {PITCH.subline}
                </p>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4">
                <MutationTierShowcase size="lg" />
                <p className="text-xs font-bold text-center lg:text-right opacity-60 max-w-[280px]">
                  Pull to mint COMMON, RARE, or LEGENDARY Mutation NFTs
                </p>
              </div>
            </div>

            {/* Pillars */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-header text-xs">CORE SYSTEMS</h3>
              <div className="flex-1 h-px bg-black/20" />
              <span className="text-[0.6rem] font-bold opacity-50">05 MODULES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              {CORE_PILLARS.map((pillar, i) => (
                <article
                  key={pillar.label}
                  className="group bg-white border-4 border-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] transition-all duration-200 overflow-hidden"
                >
                  <div
                    className="h-2 border-b-2 border-black"
                    style={{ backgroundColor: pillar.accent }}
                  />
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="font-header text-[0.48rem] px-2 py-0.5 border-2 border-black"
                        style={{ backgroundColor: pillar.accent }}
                      >
                        {pillar.tag}
                      </span>
                      <span className="font-header text-[0.4rem] text-black/25">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mb-2 leading-tight group-hover:text-mutagen-green transition-colors">
                      {pillar.label}
                    </h4>
                    <p className="text-xs leading-relaxed text-black/70 mt-auto">
                      {pillar.detail}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Flow pipeline */}
            <div className="mb-10 overflow-x-auto">
              <div className="min-w-max flex items-center gap-0 bg-black border-4 border-black p-1">
                {["Bond ATOM", "Hub Pulse", "Rescale Odds", "Trigger Pull", "Mint NFT", "Dashboard"].map(
                  (step, i, arr) => (
                    <div key={step} className="flex items-center">
                      <div className="px-4 py-2.5 bg-[#111] border-r-2 border-[#333] last:border-r-0">
                        <span className="font-header text-[0.48rem] text-mutagen-green whitespace-nowrap">
                          {step}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <span className="text-mutagen-green font-header text-[0.5rem] px-1">▸</span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="border-4 border-black bg-[#EAE4D5] overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="bg-black text-mutagen-green text-center py-2 font-header text-[0.5rem] tracking-[0.2em] border-b-4 border-black">
                START YOUR EXPERIMENT
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
                {CTAS.map((cta) => (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className={`group flex flex-col items-center justify-center gap-1 px-6 py-6 border-black transition-all hover:translate-y-[-2px] ${cta.className}`}
                  >
                    <span className="font-header text-[0.65rem] group-hover:tracking-wider transition-all">
                      {cta.label} →
                    </span>
                    <span className="text-xs font-bold opacity-60">{cta.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** @deprecated use PitchOverview */
export const JudgePitch = PitchOverview;
