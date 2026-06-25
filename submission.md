# MUTAGEN — Hackathon Submission

**Event:** Mad Easy on Cosmos  
**Host:** [@madscientists_x](https://x.com/madscientists_x)  
**Co-sponsors:** [@cosmoslabs_io](https://x.com/cosmoslabs_io) · [@odin_scan](https://x.com/odin_scan)  
**Judges:** [@qxnico](https://x.com/qxnico) · [@RoboMcGobo](https://x.com/RoboMcGobo)

---

## Project name

**MUTAGEN**

---

## One-line description

A bonding-curve gacha powered by bounded AI — the loot table is reshaped live by real Cosmos Hub activity and policed by an onchain fairness auditor.

---

## Public repository

**GitHub:** https://github.com/pramadanif/mutagen

Includes:
- Full [README.md](./README.md) with setup instructions
- [mermaid.md](./mermaid.md) architecture diagrams
- CosmWasm contract (`mutagen-contract/`)
- Hub oracle relayer (`relayer/`)
- Next.js frontend (`src/`)

---

## Live demo

| Resource | Link |
|----------|------|
| **Demo video** | *(paste your uploaded video URL — YouTube / Loom / X)* |
| **Local run** | `npm install` → `npm run relayer:dev` + `npm run dev` → http://localhost:3000/lab |
| **Deployed frontend** | *(paste Vercel/Netlify URL if deployed)* |

**Quick verify:**
```bash
npm run relayer:verify -- all
npm run verify:e2e
```

---

## Cosmos Hub connection (one sentence)

MUTAGEN reads live Cosmos Hub staking ratio, governance activity, and IBC transfer deltas through an oracle relayer that submits a Volatility Regime Score to an on-chain CosmWasm contract — rescaling gacha odds in real time — while the contract natively queries `x/staking` to grant improved pull weights to verified Hub delegators.

---

## How it maps to judging criteria

| Criterion | How MUTAGEN delivers |
|-----------|----------------------|
| **Working prototype** | Full loop on testnet: Keplr connect → `bond` → `trigger_exposure` → on-chain payout + experiment log. E2E verify script included. |
| **Creative mechanic** | Reflexive gacha — Hub macro conditions literally reshape tier weights and multipliers, not cosmetic labels. |
| **AI usage** | Bounded Regime Classifier (Hub features → score → single on-chain tx) + Gini Auditor (threshold-triggered curve adjustment). No agent sprawl. |
| **Cosmos relevance** | CosmWasm on ICS Provider testnet, native staking query in contract, Hub REST + IBC signals, Keplr via Cosmos Kit. |
| **Incentive clarity** | Live dashboard: payout histogram, Zero-Sum Index gauge, intervention log, Hub Pulse panel, append-only Lab Notebook. |

---

## Tech stack

- **Contract:** CosmWasm 1.5 (Rust) — bonding, draws, auditor, experiment ledger
- **Relayer:** Node.js + Express — Hub feature fetch, Regime Classifier, regime tx submission
- **Frontend:** Next.js 16, React 19, Cosmos Kit + Keplr
- **Chain:** ICS Provider testnet (`provider`)

---

## Deployed testnet contract

| Field | Value |
|-------|-------|
| Contract | `cosmos1cegnz6mmj94vwtvyhm3ev44cqrsh3ft44rf28d08hdd9eft6t2kqsldh3g` |
| Code ID | `514` |
| Chain | `provider` |
| Manifest | `public/contract.json` |

---

## Odin Scan parallel

MUTAGEN's Auditor mirrors Odin Scan's continuous multi-signal audit pattern — applied to **economic extraction risk** (Gini on payouts) rather than smart-contract vulnerabilities. Intervention actions are logged with exact metrics and thresholds.

---

## Mad Scientists brand tie-in

- **"Everything is an experiment"** — every pull is an on-chain `Experiment` entry in the Lab Notebook
- Pixel-art visual identity (original landing page design system)
- Resonance Bonus UI for Hub stakers / Mad Scientists NFT / $LAB holders (staking bonus live on-chain; NFT/LAB checks stubbed for stretch)

---

## Team

| Name | Role | Links |
|------|------|-------|
| *(Your name)* | Solo builder — full stack | GitHub: [@pramadanif](https://github.com/pramadanif) · X: *(@yourhandle)* |

---

## Social / announcement

X thread ready to post: [threads.md](./threads.md)  
Video narration script: [naration.md](./naration.md)

---

## Discord submission

Mad Scientists Discord membutuhkan: **nama proyek · one-liner · repo + README · demo/video · kalimat Cosmos Hub · info tim**.  
Di bawah ini dua versi — **pakai Versi Lengkap** untuk channel submission; **Versi Singkat** jika ada batas karakter.

### Versi Lengkap *(recommended — copy semua ke Discord)*

```
**MUTAGEN** 🧪
Mad Easy on Cosmos submission

**One-liner**
Bonding-curve gacha + bounded AI. Cosmos Hub macro signals reshape loot odds on-chain; an Auditor polices payout fairness.

**What it does**
• Bond testnet ATOM → Trigger Mutagen Exposure → pull COMMON → LEGENDARY
• Loot table rescales live from Hub staking ratio, governance activity & IBC volume
• Every pull logged on-chain as an Experiment (Lab Notebook)

**AI (bounded, not agent sprawl)**
• Regime Classifier — Hub feature deltas → Volatility Regime Score (0–100) → signed `update_regime_score` tx
• Auditor — Gini index every 10 pulls; hard-capped fee/cap adjustment past threshold; full intervention log

**Cosmos Hub connection**
Hub REST + IBC signals feed the relayer oracle; score hits CosmWasm on ICS Provider testnet. Contract natively queries `x/staking` for delegator Resonance Bonus.

**Working prototype**
• Keplr → bond → trigger_exposure → real payout on testnet
• Verify: `npm run relayer:verify -- all` + `npm run verify:e2e`

**Incentive clarity**
Live dashboard: payout histogram, Zero-Sum Index gauge, Hub Pulse panel, intervention log, append-only Lab Notebook.

**Links**
• Repo: https://github.com/pramadanif/mutagen
• README + setup: see repo root README.md
• Deploy guide: deployment.md in repo
• Architecture: mermaid.md in repo
• Demo video: [PASTE VIDEO URL]
• Live app (FE): [PASTE VERCEL URL]
• Live API (BE): https://mutagen.pramadani.site
• X announcement: [PASTE X POST URL]

**On-chain (testnet)**
• Contract: `cosmos1cegnz6mmj94vwtvyhm3ev44cqrsh3ft44rf28d08hdd9eft6t2kqsldh3g`
• Chain: `provider` · Code ID: `514`

**Tech**
CosmWasm 1.5 (Rust) · Node relayer · Next.js 16 · Cosmos Kit + Keplr

**Team**
[YOUR NAME] — solo builder
GitHub: https://github.com/pramadanif
X: [@yourhandle]

**Judging criteria**
✅ Working prototype — full on-chain pull loop + E2E scripts
✅ Creative mechanic — reflexive gacha tied to live Hub regime
✅ AI usage — Regime Classifier + Gini Auditor, threshold-triggered only
✅ Cosmos relevance — CosmWasm, native staking query, Hub oracle, Keplr
✅ Incentive clarity — transparent dashboard + on-chain experiment ledger
```

---

### Versi Singkat *(minimum fields)*

```
Project: MUTAGEN
One-liner: Bonding-curve gacha + bounded AI. Hub macro signals reshape on-chain loot odds; Auditor polices payout fairness.
Repo: https://github.com/pramadanif/mutagen
Demo: https://x.com/bagus_firza/status/2069132265746297121?s=20
Live: https://mutagen-chi.vercel.app/
Cosmos: Hub staking/gov/IBC → Regime Classifier → CosmWasm rescale; native x/staking delegator bonus.
AI: Regime Classifier (oracle score) + Gini Auditor (every 10 pulls, logged interventions).
Contract: cosmos1cegnz6mmj94vwtvyhm3ev44cqrsh3ft44rf28d08hdd9eft6t2kqsldh3g (provider testnet)
Team: [Pramadani] — solo builder · GitHub: pramadanif · X: @bagus_firza
```

---

### Checklist — sudah tercakup?

| Requirement (Discord / judges) | Ada di submission? |
|--------------------------------|-------------------|
| Project name | ✅ MUTAGEN |
| One-line description | ✅ bonding-curve + bounded AI + Hub + auditor |
| Public repo + README setup | ✅ link + README/mermaid disebut |
| Demo video atau live link | ⚠️ isi `[VIDEO URL]` / `[DEPLOYED URL]` sebelum kirim |
| Cosmos Hub connection (1 kalimat) | ✅ versi singkat + panjang |
| Team info | ⚠️ isi nama & X handle |
| AI usage (kriteria judge) | ✅ Regime Classifier + Auditor |
| Working prototype | ✅ flow + verify commands + contract |
| Incentive clarity | ✅ dashboard + notebook |
| Creative mechanic | ✅ reflexive gacha / Hub-driven odds |

**Sebelum submit:** ganti semua placeholder `[...]` dan `@yourhandle`, upload video, lalu paste Versi Lengkap ke channel submission Mad Scientists.

---

## Optional judge notes

**For @RoboMcGobo:** AI is deliberately infrequent and deterministic-on-trigger — Regime Classifier fires on oracle cycle only; Auditor intervenes only past Gini threshold with hard-capped actions. Full intervention log is queryable on-chain and visible on dashboard.

**For @qxnico:** Cross-chain data story — Hub macro signals (interoperability activity via IBC volume) feed an on-chain game economy with transparent incentive alignment tooling.
