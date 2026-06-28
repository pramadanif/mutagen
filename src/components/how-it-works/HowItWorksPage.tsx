import Image from "next/image";
import Link from "next/link";
import {
  PITCH,
  PLAYER_LOOP,
  REGIME_ZONES,
  HUB_SIGNALS,
  AI_COMPONENTS,
  FAIRNESS_STORY,
  RESONANCE_BONUS,
  ARCHITECTURE_LAYERS,
  ODIN_PARALLEL,
  CORE_PILLARS,
} from "@/lib/judge-content";
import { InfoPanel, InnerCard } from "@/components/ui/InfoPanel";
import { PixelSprite } from "@/components/ui/PixelSprite";

function AiFlowDiagram() {
  return (
    <svg viewBox="0 0 600 160" className="w-full h-auto svg-pixel" aria-label="AI component trigger flow">
      <rect x="20" y="20" width="160" height="50" fill="#EAE4D5" stroke="#000" strokeWidth="3" />
      <text x="100" y="42" textAnchor="middle" fontSize="10" fontWeight="bold">Hub Oracle Update</text>
      <text x="100" y="58" textAnchor="middle" fontSize="8">(relayer or block event)</text>

      <line x1="180" y1="45" x2="220" y2="45" stroke="#000" strokeWidth="2" />
      <polygon points="220,40 230,45 220,50" fill="#000" />

      <rect x="235" y="15" width="130" height="60" fill="#39FF14" stroke="#000" strokeWidth="3" />
      <text x="300" y="38" textAnchor="middle" fontSize="10" fontWeight="bold">Regime Classifier</text>
      <text x="300" y="55" textAnchor="middle" fontSize="8">deterministic · logged</text>
      <text x="300" y="68" textAnchor="middle" fontSize="8">NOT every block</text>

      <rect x="20" y="100" width="160" height="50" fill="#EAE4D5" stroke="#000" strokeWidth="3" />
      <text x="100" y="122" textAnchor="middle" fontSize="10" fontWeight="bold">Every K Pulls</text>
      <text x="100" y="138" textAnchor="middle" fontSize="8">K = 10 on testnet</text>

      <line x1="180" y1="125" x2="220" y2="125" stroke="#000" strokeWidth="2" />
      <polygon points="220,120 230,125 220,130" fill="#000" />

      <rect x="235" y="95" width="130" height="60" fill="#F59E0B" stroke="#000" strokeWidth="3" />
      <text x="300" y="118" textAnchor="middle" fontSize="10" fontWeight="bold">Auditor</text>
      <text x="300" y="135" textAnchor="middle" fontSize="8">Gini check · 1 action max</text>
      <text x="300" y="148" textAnchor="middle" fontSize="8">hard-capped params</text>

      <line x1="365" y1="45" x2="400" y2="45" stroke="#000" strokeWidth="2" />
      <rect x="405" y="25" width="170" height="110" fill="#111" stroke="#333" strokeWidth="3" />
      <text x="490" y="55" textAnchor="middle" fontSize="9" fill="#27C93F">Loot table rescale</text>
      <text x="490" y="75" textAnchor="middle" fontSize="9" fill="#27C93F">+ intervention log</text>
      <text x="490" y="100" textAnchor="middle" fontSize="8" fill="#FF5F56">No freeform AI text</text>
      <text x="490" y="118" textAnchor="middle" fontSize="8" fill="#FF5F56">No agent chains</text>
    </svg>
  );
}

export function HowItWorksPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-pixel space-y-8">
      <div>
        <h1 className="font-header text-2xl md:text-3xl">How It Works</h1>
        <p className="text-lg mt-2 leading-relaxed">{PITCH.headline}</p>
        <p className="text-base mt-2 opacity-80 leading-relaxed">{PITCH.subline}</p>
      </div>

      {/* Scoring map */}
      <InfoPanel title="Core Pillars" subtitle="What MUTAGEN delivers end-to-end">
        <div className="space-y-3">
          {CORE_PILLARS.map((c, i) => (
            <div key={c.label} className="flex gap-3 items-start">
              <span className="font-header text-xs bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <span className="font-bold">{c.label}:</span>{" "}
                <span className="text-sm">{c.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </InfoPanel>

      {/* Player loop */}
      <InfoPanel title="The Player Loop" subtitle="Bond → Trigger → Mutate">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAYER_LOOP.map((step) => {
            const imgs = ["/pouringlab.png", "/scientist pull lever.png", "/mutagen.png"];
            const idx = parseInt(step.step) - 1;
            return (
              <div key={step.step} className="text-center">
                <Image
                  src={imgs[idx]}
                  alt={step.title}
                  width={100}
                  height={100}
                  className="mx-auto [image-rendering:pixelated] object-contain mb-3"
                />
                <div className="font-header text-xs mb-1">
                  {step.step}. {step.title}
                </div>
                <p className="text-sm leading-snug">{step.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/lab"
            className="inline-block bg-mutagen-green text-black border-4 border-black px-6 py-3 font-header text-[0.65rem] shadow-[4px_4px_0_#000]"
          >
            RUN A PULL IN THE LAB →
          </Link>
        </div>
      </InfoPanel>

      {/* Synthesis & Raid */}
      <InfoPanel title="The Synthesis & Raid Loop" subtitle="Merge → Deploy → Defeat">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 border-4 border-black bg-white flex flex-col items-center h-full">
            <div className="h-40 w-full flex items-center justify-center mb-4 shrink-0">
              <Image
                src="/specimen_v2.png"
                alt="Merge Mutations"
                width={120}
                height={120}
                className="[image-rendering:pixelated] object-contain"
              />
            </div>
            <div className="font-header text-xs mb-2">1. MERGE SPECIMEN</div>
            <p className="text-sm leading-snug mb-6">Sacrifice 4 Mutation NFTs to synthesize a powerful Specimen. The archetype is determined by the traits of the sacrificed NFTs.</p>
            <Link href="/merge" className="mt-auto inline-block bg-[#8B5CF6] text-white border-4 border-black px-4 py-2 font-header text-[0.6rem] shadow-[4px_4px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-all">
              ENTER MERGE LAB →
            </Link>
          </div>
          <div className="text-center p-6 border-4 border-black bg-white flex flex-col items-center h-full">
            <div className="h-40 w-full flex items-center justify-center mb-4 relative shrink-0">
              <PixelSprite
                src="/sprites/boss-calm-idle.png"
                frameW={341}
                frameH={550}
                offsetY={0}
                totalFrames={3}
                fps={3}
                style={{ height: "100%", width: "auto", objectFit: "contain" }}
              />
            </div>
            <div className="font-header text-xs mb-2">2. FIGHT RAID BOSS</div>
            <p className="text-sm leading-snug mb-6">Deploy your Specimen to deal damage to a global, server-wide Raid Boss. Earn reward credits based on your damage contribution.</p>
            <Link href="/raid" className="mt-auto inline-block bg-mutagen-red text-white border-4 border-black px-4 py-2 font-header text-[0.6rem] shadow-[4px_4px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-all animate-pulse">
              FIGHT RAID BOSS →
            </Link>
          </div>
        </div>
      </InfoPanel>

      {/* Hub connection */}
      <InfoPanel title="Cosmos Hub Data Pipeline" subtitle="Why this is Cosmos-native">
        <p className="text-sm mb-4 leading-relaxed">
          Post governance Prop 1007, CosmWasm deploys permissionlessly on Cosmos Hub. Staking and
          governance signals are read via native Stargate queries inside the contract. IBC volume is
          the only signal requiring an off-chain relayer.
        </p>
        <div className="space-y-3 mb-4">
          {HUB_SIGNALS.map((s) => (
            <InnerCard key={s.signal} className="!p-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-header text-[0.6rem] text-mutagen-green shrink-0 w-36">
                  {s.signal}
                </span>
                <span className="text-xs bg-black text-white px-2 py-0.5 shrink-0">{s.source}</span>
                <span className="text-sm">{s.role}</span>
              </div>
            </InnerCard>
          ))}
        </div>
        <div className="font-header text-xs mb-2">Volatility Regime Zones</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {REGIME_ZONES.map((z) => (
            <div
              key={z.label}
              className="border-2 border-black p-3 text-sm"
              style={{
                backgroundColor:
                  z.label === "CALM" ? "#D0F0C0" : z.label === "ELEVATED" ? "#FFF3CD" : "#FFD0D0",
              }}
            >
              <span className="font-header text-[0.55rem]">{z.label}</span>
              <span className="font-bold ml-1">({z.range})</span>
              <p className="mt-1 text-xs leading-snug">{z.effect}</p>
            </div>
          ))}
        </div>
      </InfoPanel>

      {/* AI */}
      <InfoPanel title="AI Components" subtitle="Bounded. Deterministic-on-trigger. Auditable.">
        <InnerCard className="mb-6">
          <AiFlowDiagram />
        </InnerCard>
        <div className="space-y-6">
          {AI_COMPONENTS.map((ai) => (
            <div key={ai.title} className="flex flex-col sm:flex-row gap-4">
              <div className="w-24 h-24 shrink-0 bg-[#CFCAB9] border-4 border-black flex items-center justify-center">
                <Image
                  src={ai.icon}
                  alt={ai.title}
                  width={80}
                  height={80}
                  className="[image-rendering:pixelated] object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-header text-xs text-mutagen-green mb-2">{ai.title}</h3>
                <dl className="text-sm space-y-1">
                  <div>
                    <dt className="font-bold inline">Trigger: </dt>
                    <dd className="inline">{ai.trigger}</dd>
                  </div>
                  <div>
                    <dt className="font-bold inline">Input: </dt>
                    <dd className="inline">{ai.input}</dd>
                  </div>
                  <div>
                    <dt className="font-bold inline">Output: </dt>
                    <dd className="inline">{ai.output}</dd>
                  </div>
                  <div>
                    <dt className="font-bold inline">Design: </dt>
                    <dd className="inline">{ai.design}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs bg-black text-[#27C93F] p-3 border-2 border-[#333] font-mono">
          Neither component generates freeform text or runs agent chains. Both log structured JSON
          for the Dashboard — designed as a direct counter to careless AI slop.
        </p>
      </InfoPanel>

      {/* Fairness */}
      <InfoPanel title="Incentive Clarity & Fairness" subtitle="Zero-Sum Index + visible proof">
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <span className="font-bold">Problem: </span>
            {FAIRNESS_STORY.problem}
          </p>
          <p>
            <span className="font-bold">Solution: </span>
            {FAIRNESS_STORY.solution}
          </p>
          <p>
            <span className="font-bold">On-screen proof: </span>
            {FAIRNESS_STORY.proof}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block mt-4 text-sm font-bold underline hover:text-mutagen-green"
        >
          Open Live Dashboard →
        </Link>
      </InfoPanel>

      {/* Resonance */}
      <InfoPanel title="Resonance Bonus" subtitle="Real wallet checks — not cosmetic badges">
        <div className="space-y-3">
          {RESONANCE_BONUS.map((r) => (
            <InnerCard key={r.label} className="!p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-header text-[0.55rem] w-40 shrink-0">{r.label}</span>
              <span className="text-xs flex-1">{r.check}</span>
              <span className="text-xs font-bold text-mutagen-green">{r.bonus}</span>
            </InnerCard>
          ))}
        </div>
      </InfoPanel>

      {/* Architecture */}
      <InfoPanel title="System Architecture" subtitle="On-chain vs off-chain — honest split">
        <div className="space-y-3 mb-4">
          {ARCHITECTURE_LAYERS.map((l) => (
            <div key={l.layer} className="border-l-4 border-mutagen-green pl-3">
              <div className="font-header text-[0.55rem]">{l.layer}</div>
              <p className="text-sm">{l.items}</p>
            </div>
          ))}
        </div>
        <InnerCard>
          <p className="text-sm leading-relaxed">{ODIN_PARALLEL}</p>
        </InnerCard>
      </InfoPanel>

      {/* Lab notebook */}
      <InfoPanel title="Lab Notebook" subtitle="Every pull = permanent Experiment entry">
        <p className="text-sm leading-relaxed mb-4">
          Each Mutagen Exposure is logged on-chain as Exp #NNNN: bond amount, exposure score,
          outcome tier, timestamp, and tx hash. Public append-only ledger — literalizing Mad
          Scientists&apos; &quot;Everything is an experiment.&quot;
        </p>
        <Link href="/notebook" className="text-sm font-bold underline hover:text-mutagen-green">
          View Lab Notebook →
        </Link>
      </InfoPanel>
    </div>
  );
}
