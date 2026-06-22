import Link from "next/link";
import Image from "next/image";
import { HUB_SIGNALS, REGIME_ZONES, REGIME_ZONE_COLORS } from "@/lib/judge-content";
import { PixelMarquee } from "@/components/ui/PixelMarquee";

const FLOW_STEPS = [
  { id: "hub", label: "Cosmos Hub", sub: "x/staking · x/gov · IBC", color: "#EAE4D5" },
  { id: "classifier", label: "Regime Classifier", sub: "score 0–100", color: "#39FF14" },
  { id: "contract", label: "CosmWasm Contract", sub: "loot table rescale", color: "#F5F2EB" },
  { id: "pull", label: "Your Pull", sub: "Mutation NFT", color: "#8B5CF6", text: "#F3E8FF" },
] as const;

const MARQUEE_MODULES = ["x/staking", "x/gov", "ibc_transfer", "CosmWasm", "REGIME SCORE", "LOOT TABLE"];

function RegimeSpectrum() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[0.6rem] font-bold opacity-60">
        <span>0</span>
        <span className="font-header text-[0.5rem]">VOLATILITY REGIME SPECTRUM</span>
        <span>100</span>
      </div>
      <div className="relative h-10 border-4 border-black flex overflow-hidden">
        <div className="w-[30%] bg-[#39FF14]/80 border-r-2 border-black flex items-center justify-center">
          <span className="font-header text-[0.45rem]">CALM</span>
        </div>
        <div className="w-[30%] bg-[#FFBD2E]/80 border-r-2 border-black flex items-center justify-center">
          <span className="font-header text-[0.45rem]">ELEVATED</span>
        </div>
        <div className="w-[40%] bg-[#FF5F56]/80 flex items-center justify-center">
          <span className="font-header text-[0.45rem]">TURBULENT</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REGIME_ZONES.map((z) => {
          const colors = REGIME_ZONE_COLORS[z.label];
          return (
            <div
              key={z.label}
              className="border-4 border-black p-4 shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all"
              style={{ backgroundColor: colors.bg }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 border-2 border-black shrink-0"
                  style={{ backgroundColor: colors.bar }}
                />
                <span className="font-header text-[0.55rem]">{z.label}</span>
                <span className="text-xs font-bold opacity-60 ml-auto">{z.range}</span>
              </div>
              <p className="text-xs leading-relaxed">{z.effect}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CosmosConnection() {
  return (
    <section id="cosmos" className="w-full font-pixel pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-5 border-b-4 border-black bg-black text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-header text-sm md:text-base text-mutagen-green">
                Cosmos Hub Connection
              </h2>
              <p className="text-sm font-bold mt-1 text-white/70">
                Live Hub data reshapes your odds — not decoration
              </p>
            </div>
            <Image
              src="/antena.png"
              alt="Hub data antenna"
              width={72}
              height={88}
              className="[image-rendering:pixelated] object-contain self-end md:self-center opacity-90"
            />
          </div>

          <PixelMarquee items={MARQUEE_MODULES} variant="tape" speed="fast" />

          <div className="p-6 md:p-8 bg-[#F5F2EB]">
            {/* Intro stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-10 items-start">
              <p className="text-base md:text-lg leading-relaxed text-black/85">
                MUTAGEN deploys as permissionless CosmWasm on Cosmos Hub.{" "}
                <span className="font-bold text-black">2 of 3</span> regime inputs read
                natively on-chain. IBC volume flows through a small relayer — everything else
                stays auditable in the contract.
              </p>
              <div className="flex gap-3 shrink-0">
                <div className="bg-white border-4 border-black px-4 py-3 text-center shadow-[4px_4px_0_#000] min-w-[100px]">
                  <div className="font-header text-xl text-mutagen-green">2</div>
                  <div className="text-[0.55rem] font-bold mt-1">ON-CHAIN</div>
                </div>
                <div className="bg-white border-4 border-black px-4 py-3 text-center shadow-[4px_4px_0_#000] min-w-[100px]">
                  <div className="font-header text-xl text-[#FFBD2E]">1</div>
                  <div className="text-[0.55rem] font-bold mt-1">RELAYER</div>
                </div>
              </div>
            </div>

            {/* Pipeline */}
            <div className="mb-10">
              <h3 className="font-header text-[0.55rem] mb-4 opacity-60">DATA PIPELINE</h3>
              <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[6px_6px_0_#000] overflow-x-auto">
                <div className="flex items-stretch min-w-max gap-0">
                  {FLOW_STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className="border-4 border-black px-5 py-4 min-w-[140px] text-center shadow-[3px_3px_0_#000]"
                        style={{
                          backgroundColor: step.color,
                          color: "text" in step ? step.text : "#000",
                        }}
                      >
                        <div className="font-header text-[0.5rem] mb-1">{step.label}</div>
                        <div className="text-[0.65rem] font-bold opacity-80">{step.sub}</div>
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className="flex flex-col items-center px-2 gap-0.5">
                          <span className="text-mutagen-green font-header text-xs">▸</span>
                          <div className="w-8 h-0.5 bg-black/30 data-line-right" style={{ strokeDasharray: 4 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-dashed border-black/20 flex items-center gap-2">
                  <span className="font-header text-[0.45rem] bg-black text-[#27C93F] px-2 py-1">
                    AUDITOR
                  </span>
                  <span className="text-xs font-bold opacity-70">
                    Parallel loop — Gini check every K pulls → bounded fee/cap adjustment
                  </span>
                </div>
              </div>
            </div>

            {/* Hub signals */}
            <div className="mb-10">
              <h3 className="font-header text-[0.55rem] mb-4 opacity-60">HUB SIGNAL INPUTS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HUB_SIGNALS.map((s) => (
                  <article
                    key={s.signal}
                    className="bg-white border-4 border-black shadow-[4px_4px_0_#000] overflow-hidden hover:-translate-y-0.5 transition-transform"
                  >
                    <div
                      className={`px-3 py-1.5 border-b-4 border-black font-header text-[0.45rem] ${
                        s.type === "on-chain"
                          ? "bg-mutagen-green text-black"
                          : "bg-[#FFBD2E] text-black"
                      }`}
                    >
                      {s.type === "on-chain" ? "● ON-CHAIN" : "◆ RELAYER"}
                    </div>
                    <div className="p-4">
                      <div className="font-header text-[0.55rem] text-mutagen-green mb-1">
                        {s.signal}
                      </div>
                      <code className="text-[0.65rem] font-bold bg-[#EAE4D5] border border-black px-1.5 py-0.5 mb-3 inline-block">
                        {s.module}
                      </code>
                      <p className="text-xs font-bold mb-2 opacity-70">{s.source}</p>
                      <p className="text-sm leading-snug">{s.role}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Regime zones */}
            <div className="mb-8">
              <h3 className="font-header text-[0.55rem] mb-4 opacity-60">
                HOW REGIME SCORE SHIFTS YOUR ODDS
              </h3>
              <RegimeSpectrum />
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 font-header text-[0.6rem] bg-black text-mutagen-green border-4 border-black px-5 py-3 shadow-[4px_4px_0_#39FF14] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#39FF14] transition-all"
            >
              SEE HUB PULSE LIVE ON DASHBOARD →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
