# MUTAGEN — build context

This file is reference material. Read it fully before writing any code. Do not invent facts beyond what's here — if something is unconfirmed, it's marked as such.

## 1. Event context

**Event:** "Mad Easy on Cosmos" — a one-week builder sprint hosted by Mad Scientists, sponsored by Cosmos Labs and Odin Scan. Build window: one week. Submissions go through the Mad Scientists Discord and require: project name, one-line description, public GitHub repo with README + setup instructions, a live demo link (or short video if not deployable), a sentence on the Cosmos Hub connection, and team info.

**Official scoring criteria (verbatim, no extra public weighting found):** Working prototype, Creative mechanic, AI usage, Cosmos relevance, Incentive clarity.

**Judge 1 — @RoboMcGobo (Ecosystem Lead, Cosmos Labs; ex-Osmosis Grants):**
- Practical, growth-oriented, realistic about AI — explicitly not a hype/singularity believer
- Documented pet peeve: "AI slop" — low-effort AI-generated submissions; has seen a large spike in junk bug-bounty reports from careless AI use
- Wants AI usage that is visibly controlled and high-quality — not over-reliance, not under-use
- Grants background (Osmosis) — reads "zero-sum vs. revenue-generating" incentive framing fluently

**Judge 2 — @qxnico (CMO, Cosmos Labs; ex-NEAR/IPFS):**
- More formal/professional register in official threads
- Focused on interoperability, institutional/enterprise adoption, LATAM finance modernization
- Fully supports the ATOM tokenomics redesign
- Supportive of the Mad Scientists community vibe

**Host — Mad Scientists:** NFT PFP collection on Osmosis. Brand tagline: "Everything is an experiment." Has a 1/1 sub-collection called COSMIC ("The 1/1 Five"). Has its own token, $LAB, tradeable on Osmosis. Hosts this hackathon and contributes NFT prizes for places 4-5.

**Sponsor — Odin Scan:** AI-powered continuous security audits for smart contracts (EVM, Solana, CosmWasm, Move, Cosmos SDK). Runs as a GitHub Action that scans every PR using multiple AI models in parallel.

**Confirmed but unconfirmed-link caveat:** There is no public evidence this hackathon is formally tied to Cosmos Labs' internal tokenomics or "Hub Unit" research. Do not claim that link in any copy, pitch, or README.

**Platform update (confirmed via Cosmos Hub Forum, governance Proposal 1007, passed ~Aug-Sept 2025):** CosmWasm smart contract deployment on Cosmos Hub mainnet is now **permissionless** (previously it required whitelisting). This means the contract can be deployed directly on the Hub itself rather than on a separate CosmWasm chain like Neutron — which makes the "Cosmos relevance" criterion easier to satisfy literally, not just via cross-chain data reads. Cosmos Hub is separately also rolling out EVM/Solidity support via Interchain Labs (`evm.cosmos.network`), but CosmWasm/Rust remains the more native, better-tooled choice for this build. Confirm at build time whether the public Hub testnet has the same permissionless parameters as mainnet before assuming it.

## 2. Builder context

The builder has a track record of fast, solo, technically ambitious onchain builds — including an onchain raytracing project and an onchain ML inference project, both shipped in 2 days for a separate Arbitrum Stylus mini-hackathon. Calibrate scope assuming strong, fast execution is available. Do not default to over-cautious MVP-trimming — but do not let scope creep threaten a working live demo either; "working prototype" is one of the five scored criteria and the single biggest execution risk in this spec (see §7).

## 3. Product concept — MUTAGEN

**One-line pitch:** A bonding-curve gacha where the loot table isn't fixed — it's reshaped live by real Cosmos Hub activity, and policed live by an onchain fairness auditor.

**Core mechanic:**
- Players bond a testnet token into a curve to trigger a "Mutagen Exposure" (the pull), minting a Mutation NFT drawn from a loot table.
- The loot table's odds are rescaled every cycle by a Volatility Regime Score (0-100), computed from live Cosmos Hub state: bonded-token ratio delta, active governance proposal activity / vote-tally skew, IBC packet volume delta.
- Hub turbulence tilts the pool toward extreme high-risk/high-reward outcomes; a calm Hub tightens the distribution. Hub macro conditions literally reshape in-game risk — this is not a flavor-text label, it's a real input.
- A second loop: an Auditor computes a Zero-Sum Index (standard payout-concentration / extraction metrics) every K pulls. If it crosses a threshold, it makes a small, hard-capped, logged adjustment to the curve (fee, slope, or payout cap) to stop early bonders from quietly extracting value from late ones — the standard failure mode of bonding-curve gachas.

**AI components (both load-bearing in the mechanic, neither doing codegen):**
1. **Regime Classifier** — a small model ingesting Hub feature deltas, outputs the Volatility Regime Score. Fires only when a fresh oracle update lands — not continuously, not every block.
2. **Auditor** — computes the Zero-Sum Index every K pulls, intervenes only past threshold, logs the exact metric/threshold that fired alongside its single bounded action. No freeform text generation, no chained agentic behavior.

Both must read as infrequent, bounded, deterministic-on-trigger, and auditable — this is the direct design counter to "AI slop" (see Judge 1 persona, §1).

**Cosmos Hub connection (must be real, not cosmetic):**
- Because the contract now deploys directly on the Hub (see §1 platform update), the bonded-token ratio delta and governance proposal/vote-skew signals can be read with **native same-chain Stargate/Cosmos SDK queries** straight from inside the CosmWasm contract — querying the `x/staking` and `x/gov` modules directly. No relayer needed for these two.
- The IBC packet volume delta is the one signal that genuinely needs an off-chain component, since there's no ready-made aggregate query for it: either index IBC transfer events via Tendermint RPC `tx_search`, or pull from an existing indexer (e.g. Mintscan/Numia-style API), then have a small relayer service sign and submit the computed delta into the contract.
- **Resonance Bonus:** on wallet connect, the contract checks that address's real Hub delegation via a native `x/staking` query; verified stakers above a threshold get improved pull odds.
- **Resonance Bonus extension:** also check the connected wallet for (a) Mad Scientists / COSMIC NFT ownership and (b) $LAB token balance, using the same wallet-check pattern. Either qualifying condition grants a bonus path. If time allows, let $LAB itself be used as an alternate bonding asset alongside the testnet token — giving $LAB genuine utility inside the mechanic, not just a name-check.

**Visual proof of incentive clarity (the live dashboard, see §6):**
- Real-time histogram of every payout so far
- Zero-Sum Index gauge + intervention log (exact time/reason for every Auditor action)
- "Hub Pulse" panel showing the live Hub values currently driving the Volatility Regime Score
- Pre-seed the histogram with a fast client-side Monte Carlo simulation (thousands of synthetic pulls) animating in before any live pull happens, proving the long-run fairness property instantly; real pulls then land on top of it live.

**Odin Scan hook:** Wire Odin Scan's GitHub Action into the actual repo as a real dependency (not just a logo). The Auditor mirrors Odin Scan's own pattern — continuous, multi-signal AI auditing — pointed at economic risk instead of code risk. This parallel is worth stating explicitly in the pitch/README.

**Mad Scientists hook — Lab Notebook:** every pull is logged permanently onchain as an "Experiment" entry (timestamp, parameters, outcome), in a public, append-only ledger. This literalizes the "everything is an experiment" brand line instead of just citing it.

## 4. Visual identity / design reference

**Source of truth: the builder's own existing landing page — do not pull design from `madscientists.io` or any Mad Scientists property.** The builder has already built an original landing page they consider strong, and MUTAGEN's visual identity should extend that, not the host's brand.

**Design instruction for the agent:**
- Treat the builder's existing landing page as the canonical design system: reuse its color tokens, typography, spacing scale, and component patterns for every new page (The Lab, Live Dashboard, Lab Notebook, My Mutations, How It Works). If the landing page's source/CSS/design tokens aren't directly available in the repo, ask the builder for the file or URL before inventing a palette — don't default to a generic crypto-dashboard look out of convenience.
- Apply real design discipline on top of the existing system, not just reuse for its own sake:
  - Pick one true signature element for MUTAGEN's interactive pages — most likely the live reflexive-odds visualization itself (the moment the Hub Pulse value visibly reshapes the loot odds) — and let that carry the page's memorability, styled consistently with the existing landing page's visual language.
  - Keep typography consistent with the landing page's existing display/body face pairing rather than introducing new fonts.
  - Let structural devices encode real information: the Lab Notebook is a real ledger, not decorative numbering; the Zero-Sum gauge is a real metric, not a fake progress bar.
  - Spend the animation budget on one orchestrated moment — the Mutagen Exposure pull/reveal — rather than scattering motion across every element.
  - Write all copy in plain, active voice from the player's point of view ("Bond ATOM to trigger an exposure," not "Initiate bonding transaction").
  - Respect reduced-motion preferences and keyboard focus visibility.

## 5. Suggested tech stack

- **Contract:** CosmWasm (Rust), deployed directly on Cosmos Hub testnet/mainnet (permissionless as of governance Prop 1007 — see §1). Bonding curve, pull logic, Auditor state machine, and native `x/staking`/`x/gov` Stargate queries all live in this one contract.
- **IBC volume relayer:** a small off-chain service is only needed for the IBC packet volume delta — index transfer events via Tendermint RPC `tx_search` or pull from an indexer API, then sign and submit the computed value to the contract. Staking and governance signals do not need this relayer; they're read natively.
- **Regime Classifier:** a small model computing the Volatility Regime Score from Hub feature deltas — can run inside the relayer process or onchain if the builder's existing onchain-ML approach (from prior Arbitrum Stylus work) is portable.
- **Frontend:** React, Cosmos wallet connect (e.g. Keplr / Cosmos Kit), charting library for the live dashboard.
- **Target network:** Cosmos Hub testnet — confirm current public RPC/REST/gRPC endpoints and CosmWasm parameters via `cosmos.directory` at build time; don't assume cached values.

## 6. Pages required

1. **Landing / Home** — hero pitch for MUTAGEN, one-line mission tie-in to the hackathon theme, CTA into the Lab. This is the page judges see first — it must communicate the concept in seconds.
2. **The Lab** (core interaction) — wallet connect, bonding input, trigger Mutagen Exposure, pull result/reveal animation, visible Resonance Bonus status (Hub staker / Mad Scientists NFT holder / $LAB holder badges).
3. **Live Dashboard** — the three-panel transparency view described in §3: payout histogram with Monte Carlo preseed, Zero-Sum Index gauge + intervention log, Hub Pulse live feed.
4. **Lab Notebook** — public, permanent log of every experiment (timestamp, parameters, outcome). Can be merged into the Dashboard as a tab if time is tight.
5. **My Mutations** — the connected wallet's collected Mutation NFTs.
6. **How It Works** — short, judge-facing explainer of the mechanic, the two AI components, and the real Hub data dependency. Can be a section on the Landing page instead of a separate route if time is tight.

Minimum viable set under tight time: pages 1, 2, 3 (with Lab Notebook as a Dashboard tab), and an About section embedded in the Landing page. Pages 4-6 as standalone routes are the stretch version if time allows.

## 7. Biggest execution risk

"Working prototype" is one of five scored criteria and still the most fragile one, though the platform update in §1 lowers the risk somewhat: two of the three Hub signals (staking, governance) are now native same-chain queries instead of relayer-fed, so there's one less moving part to keep alive. The remaining real risk is the IBC volume relayer, the two AI components, wallet-based bonus checks across two ecosystems, and the live multi-panel dashboard all staying genuinely live at once. If any one piece isn't actually working on judging day, the whole "transparency" pitch loses credibility. Prioritize a fully working core loop (bond → pull → see a real Hub-driven odds shift → see it on the dashboard) before adding every bonus path or stretch feature.