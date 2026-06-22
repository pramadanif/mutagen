import Image from "next/image";

const STEPS = [
  { img: "/pouringlab.png", title: "Bond", desc: "Lock ATOM into the incubator curve." },
  { img: "/scientist pull lever.png", title: "Trigger", desc: "Pull the lever. Hub regime sets your odds." },
  { img: "/mutagen.png", title: "Mutate", desc: "Receive a tiered mutation NFT payout." },
];

const AI_COMPONENTS = [
  {
    title: "Regime Classifier",
    desc: "Rule-based scorer reads bonded ratio Δ, gov activity Δ, and IBC volume Δ from Cosmos Hub. Outputs 0–100 regime score that rescales loot table weights.",
  },
  {
    title: "Auditor",
    desc: "Every K pulls, computes Gini coefficient on payouts. If Gini > 0.6, applies exactly one bounded intervention (fee +0.005 or cap −2%).",
  },
];

export function HowItWorksPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-pixel">
      <div className="mb-8">
        <h1 className="font-header text-2xl md:text-3xl">How It Works</h1>
        <p className="text-lg mt-2">Chain-driven gacha, reshaped by the Hub.</p>
      </div>

      <div className="bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] mb-8">
        <div className="p-4 border-b-4 border-black font-header text-sm">The Cycle</div>
        <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-center">
                <Image
                  src={step.img}
                  alt={step.title}
                  width={120}
                  height={120}
                  className="mx-auto [image-rendering:pixelated] object-contain mb-2"
                />
                <div className="font-header text-xs mb-1">{step.title}</div>
                <p className="text-sm max-w-[160px]">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block arrow-right" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F5F2EB] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="p-4 border-b-4 border-black font-header text-sm">AI Components</div>
        <div className="p-6 space-y-6">
          {AI_COMPONENTS.map((ai) => (
            <div key={ai.title} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000]">
              <h3 className="font-header text-xs mb-2 text-mutagen-green">{ai.title}</h3>
              <p className="text-base">{ai.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
