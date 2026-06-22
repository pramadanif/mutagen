export const PITCH = {
  headline: "Bonding-curve gacha where loot odds reshape from live Cosmos Hub activity.",
  subline:
    "Not fixed odds. Hub macro conditions (staking, governance, IBC) rescale your pull table. An on-chain Auditor caps extraction before early bonders drain late ones.",
} as const;

export const CORE_PILLARS = [
  {
    label: "Live Loop",
    tag: "PLAY",
    detail: "Bond ATOM, trigger exposure, reveal your Mutation NFT — all in The Lab.",
    accent: "#39FF14",
  },
  {
    label: "Hub-Driven Odds",
    tag: "MECHANIC",
    detail: "Volatility Regime Score (0–100) tilts COMMON → LEGENDARY weights from live Hub data.",
    accent: "#8B5CF6",
  },
  {
    label: "Bounded AI",
    tag: "SENTINELS",
    detail: "Classifier + Auditor fire on trigger only. Deterministic. No freeform generation.",
    accent: "#27C93F",
  },
  {
    label: "Cosmos Native",
    tag: "CHAIN",
    detail: "CosmWasm on Cosmos Hub. x/staking + x/gov on-chain. IBC relayer for volume Δ.",
    accent: "#4169E1",
  },
  {
    label: "Transparent Payouts",
    tag: "PROOF",
    detail: "Monte Carlo histogram, Zero-Sum gauge, and intervention log — visible on Dashboard.",
    accent: "#F59E0B",
  },
] as const;

/** @deprecated use CORE_PILLARS */
export const SCORING_CRITERIA = CORE_PILLARS.map((p) => ({
  label: p.label,
  detail: p.detail,
}));

export const PLAYER_LOOP = [
  {
    step: "1",
    title: "Bond",
    desc: "Lock ATOM (or $LAB) into the incubator bonding curve. Your stake enters the shared pool.",
  },
  {
    step: "2",
    title: "Trigger Exposure",
    desc: "Pull the lever. Contract draws from the current loot table — weights set by the latest Regime Score.",
  },
  {
    step: "3",
    title: "Mutate",
    desc: "Mint a Mutation NFT (COMMON / RARE / EPIC / LEGENDARY). Experiment logged on-chain as Exp #NNNN.",
  },
] as const;

export const REGIME_ZONES = [
  { label: "CALM", range: "0–30", effect: "Tight distribution. Safer pulls, lower upside." },
  { label: "ELEVATED", range: "31–60", effect: "Moderate spread. Balanced risk/reward." },
  { label: "TURBULENT", range: "61–100", effect: "Extreme spread. High risk, high LEGENDARY weight." },
] as const;

export const HUB_SIGNALS = [
  {
    signal: "Bonded Ratio Δ",
    module: "x/staking",
    source: "Same-chain Stargate query",
    type: "on-chain" as const,
    role: "Staking inflow/outflow pressure on the Hub.",
  },
  {
    signal: "Gov Activity Δ",
    module: "x/gov",
    source: "Same-chain Stargate query",
    type: "on-chain" as const,
    role: "Active proposals + vote skew — governance turbulence.",
  },
  {
    signal: "IBC Volume Δ",
    module: "ibc_transfer",
    source: "Relayer → contract oracle",
    type: "relayer" as const,
    role: "IBC transfer events via RPC tx_search. Only off-chain signal.",
  },
] as const;

export const REGIME_ZONE_COLORS = {
  CALM: { bg: "#D0F0C0", bar: "#39FF14" },
  ELEVATED: { bg: "#FFF3CD", bar: "#FFBD2E" },
  TURBULENT: { bg: "#FFD0D0", bar: "#FF5F56" },
} as const;

export const AI_COMPONENTS = [
  {
    title: "Regime Classifier",
    trigger: "Fires only when a fresh oracle update lands — not every block.",
    input: "3 normalized Hub feature deltas (bonded ratio, gov activity, IBC volume).",
    output: "Volatility Regime Score 0–100 → rescales loot table tier weights.",
    design: "Rule-based scorer (auditable). Deterministic on trigger. Logged: features, score, regime label.",
    icon: "/robot.png",
  },
  {
    title: "The Auditor",
    trigger: "Every K pulls (K = 10 in testnet demo).",
    input: "Last K pull payouts from contract state.",
    output: "Zero-Sum Index (Gini coefficient). One bounded action if Gini > 0.6.",
    design: "Fee +0.005 OR cap −2% — whichever moves Gini closer to 0.4. Max cumulative caps enforced.",
    icon: "/auditor.png",
  },
] as const;

export const FAIRNESS_STORY = {
  problem:
    "Bonding-curve gachas fail when early bonders extract value from late ones — the classic zero-sum extraction problem.",
  solution:
    "The Auditor watches payout concentration (Gini). Past threshold, it applies exactly one hard-capped parameter tweak and logs the metric that fired.",
  proof:
    "Live Dashboard: Monte Carlo pre-seed (1000+ synthetic pulls) plus real pull overlay. Intervention log shows timestamp, metric, threshold, and action.",
} as const;

export const RESONANCE_BONUS = [
  { label: "Hub Staker", check: "x/staking delegations ≥ 1 ATOM", bonus: "+15% improved odds path" },
  { label: "Mad Scientists NFT", check: "COSMIC / collection ownership on Osmosis", bonus: "Resonance tier unlock" },
  { label: "$LAB Holder", check: "Balance query + optional bonding denom", bonus: "Alternate bond asset utility" },
] as const;

export const ARCHITECTURE_LAYERS = [
  { layer: "CosmWasm Contract", items: "Bond, TriggerExposure, loot table, Auditor state, Experiment ledger" },
  { layer: "On-Chain Queries", items: "x/staking delegations, x/gov proposals — no relayer needed" },
  { layer: "IBC Relayer", items: "tx_search IBC events → UpdateRegimeScore every 5 min" },
  { layer: "Frontend", items: "The Lab, Dashboard, Notebook — wallet via Keplr extension" },
] as const;

export const ODIN_PARALLEL =
  "Odin Scan audits code continuously via GitHub Action. Our Auditor applies the same philosophy to economic risk — multi-signal, threshold-triggered, logged interventions.";
