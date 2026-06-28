# MUTAGEN — Demo Video Narration Script

**Target length:** ~4 minutes 30 seconds (under 5 min with intro/outro buffer)  
**Pace:** ~140 words/min → ~630 words total  
**Tone:** Clear, confident, judge-facing — show working prototype, not hype  
**Format:** `[SCREEN]` = what to show · `[VO]` = voiceover

---

## Pre-roll (optional, 0:00–0:08)

**[SCREEN]** MUTAGEN logo / landing hero — pixel gacha machine, green glow  
**[VO]** *"What if a bonding-curve gacha used bounded AI to reshape your odds from live Cosmos Hub data?"*

---

## Act 1 — The Hook (0:08–0:35)

**[SCREEN]** Landing page scroll: hero → one-line pitch → CTA  
**[VO]**

> This is **MUTAGEN** — a bonding-curve gacha with **bounded AI**, built for the Mad Easy on Cosmos sprint.
>
> You bond testnet ATOM, trigger a **Mutagen Exposure**, and pull a Mutation tier — from Common to Legendary.
>
> But here's the twist: the loot table isn't static. A **Regime Classifier** reads real **Cosmos Hub macro signals** — staking pressure, governance activity, and IBC volume — and rescales odds on-chain.
>
> A second AI layer, the **Auditor**, polices payout fairness so early players can't quietly drain late ones.
>
> Hub turbulence tilts the pool toward high-risk, high-reward outcomes. A calm Hub tightens the distribution.

---

## Act 2 — The Lab (0:35–1:25)

**[SCREEN]** Navigate to `/lab` — three-panel layout  
**[VO]**

> Let's run a real pull in **The Lab**.
>
> First, connect Keplr on the ICS Provider testnet.
>
> On the left — your **Resonance Bonus**. If you delegate ATOM on-chain, the contract reads your staking position natively and shifts odds toward rarer tiers.
>
> In the center — the Incubator. Enter a bond amount — say, zero-point-one ATOM — and hit **Trigger Exposure**.

**[SCREEN]** Click trigger → charge animation → Keplr approve bond tx → approve pull tx → rumble → flash → reveal card  
**[VO]**

> Two on-chain transactions: first **Bond**, then **Trigger Exposure**.
>
> The machine charges while you sign. Then — critical mass — flash — and your Mutation is revealed with a real payout multiplier.
>
> That tx hash on screen? That's a live CosmWasm execution — not a mock.

---

## Act 3 — Hub Pulse & Live Odds (1:25–2:05)

**[SCREEN]** Right panel: Live Odds bars + Hub Pulse panel + Regime gauge  
**[VO]**

> Look at the right panel — **Live Odds**.
>
> These weights come straight from the on-chain loot table. They change when the **Volatility Regime Score** updates.
>
> **Hub Pulse** shows the three signals driving that score: bonded-token ratio delta, active governance proposals, and IBC transfer volume.
>
> When the regime shifts from Calm to Elevated to Turbulent, you can literally watch Legendary odds move — this isn't flavor text. It's the mechanic.

---

## Act 4 — AI: Regime Classifier (2:05–2:40)

**[SCREEN]** Terminal or relayer logs / `/api/hub-pulse` JSON briefly → back to dashboard regime label  
**[VO]**

> MUTAGEN uses AI — but in a bounded, auditable way.
>
> The **Regime Classifier** is a small model in our relayer. Every five minutes it ingests fresh Hub feature deltas and outputs a score from zero to one hundred.
>
> The relayer signs an `update_regime_score` transaction to the CosmWasm contract. The contract immediately rescales tier weights and payout multipliers.
>
> No open-ended chatbot. No agent sprawl. One input, one score, one on-chain action — fired only when new oracle data lands.

---

## Act 5 — Auditor & Transparency (2:40–3:25)

**[SCREEN]** `/dashboard` — payout histogram, Zero-Sum Index gauge, intervention log  
**[VO]**

> Bonding-curve gachas have a classic failure mode: early players extract value, late players get drained.
>
> MUTAGEN's **Auditor** watches for that. Every ten pulls, it computes a **Zero-Sum Index** — a Gini coefficient on recent payouts.
>
> If concentration crosses the threshold, the contract makes a small, hard-capped adjustment — bump the fee or tighten the payout cap — and logs exactly why.
>
> The **Live Dashboard** shows everything: a payout histogram pre-seeded with Monte Carlo simulation, the Zero-Sum gauge, and every intervention with timestamp and metric.
>
> This mirrors **Odin Scan's** pattern — continuous multi-signal auditing — but pointed at **economic risk** instead of code risk.

---

## Act 6 — Lab Notebook & On-Chain Proof (3:25–3:55)

**[SCREEN]** `/notebook` — experiment list → optionally block explorer / contract query  
**[VO]**

> Every pull is permanently logged on-chain as an **Experiment** — timestamp, bond amount, regime score at pull time, tier, and payout.
>
> The **Lab Notebook** is a public, append-only ledger. Mad Scientists say *"Everything is an experiment."* MUTAGEN makes that literal — not a tagline, a data structure.

---

## Act 7 — Cosmos Connection & Close (3:55–4:30)

**[SCREEN]** `/how-it-works` or architecture snippet from README → GitHub repo → landing CTA  
**[VO]**

> Why Cosmos?
>
> Staking and governance signals feed the classifier from real Hub REST data. Wallet delegation is verified with a native **x/staking** query inside the contract. IBC volume comes from live Tendermint tx search. The game runs on CosmWasm — deployed and verified on ICS Provider testnet.
>
> MUTAGEN is a working prototype: bond, pull, live odds shift, on-chain audit, full transparency stack.
>
> Repo link in the description. Everything is an experiment — come trigger one.

**[SCREEN]** End card: **mutagen · GitHub · @yourhandle**  
**[VO]** *"MUTAGEN. The Hub doesn't just secure the chain — it reshapes the game."*

---

## Production notes

| Item | Recommendation |
|------|----------------|
| **Total VO words** | ~620 (fits 4:30 at 140 wpm) |
| **Music** | Low ambient synth under VO; duck during SFX moments in Lab |
| **Captions** | Burn key terms: *Volatility Regime Score*, *Zero-Sum Index*, *Trigger Exposure* |
| **Must-show shots** | Keplr connect · 2 tx approvals · tier reveal · odds bars moving · dashboard gauge · notebook entry |
| **Skip if over time** | Monte Carlo animation detail, `/mutations` page |
| **Relayer** | Have `npm run relayer:dev` running before recording so Hub Pulse is live |

---

## One-liner for video description

```
MUTAGEN — a Cosmos Hub-driven gacha where macro signals reshape loot odds in real time, policed by an on-chain fairness auditor. Built for Mad Easy on Cosmos. CosmWasm + Next.js + bounded AI. Repo: github.com/pramadanif/mutagen
```
