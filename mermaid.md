# MUTAGEN — Architecture Diagrams

This file contains all Mermaid diagrams referenced from [README.md](./README.md).  
GitHub, GitLab, and many Markdown viewers render these blocks natively.

---

## 1. System overview

High-level view of every runtime component and how they connect.

```mermaid
flowchart TB
    subgraph User["User browser"]
        UI["Next.js frontend<br/>React + Cosmos Kit"]
        Keplr["Keplr wallet"]
    end

    subgraph OffChain["Off-chain services"]
        Relayer["Relayer service<br/>Express + Node.js"]
        RC["Regime Classifier"]
        RA["Gini Auditor<br/>(relayer mirror)"]
        HubFetch["Hub feature fetchers<br/>staking · gov · IBC"]
    end

    subgraph Chain["Cosmos ICS Provider testnet"]
        Contract["MUTAGEN CosmWasm contract"]
        Staking["x/staking module"]
        Bank["x/bank module"]
    end

    subgraph Hub["Cosmos Hub (data source)"]
        HubREST["Hub REST / RPC"]
    end

    UI <-->|"sign txs"| Keplr
    Keplr <-->|"bond · trigger_exposure"| Contract
    UI -->|"read queries"| Contract
    UI -->|"GET /health · hub-pulse"| Relayer

    Relayer --> HubFetch
    HubFetch --> HubREST
    HubFetch --> RC
    RC -->|"update_regime_score"| Contract
    UI -->|"POST /api/experiments"| Relayer
    Relayer --> RA

    Contract -->|"delegation query"| Staking
    Contract -->|"payout send"| Bank
```

---

## 2. Mutagen Exposure pull sequence

End-to-end flow when a player triggers a pull in **The Lab**.

```mermaid
sequenceDiagram
    actor Player
    participant UI as LabPage
    participant Keplr
    participant Contract as CosmWasm contract
    participant Relayer

    Player->>UI: Click TRIGGER EXPOSURE
    UI->>UI: Phase: charge (animation + SFX)
    UI->>Keplr: Sign bond tx
    Keplr->>Contract: ExecuteMsg::Bond + uatom funds
    Contract-->>Contract: Store pending bond per player

    UI->>Keplr: Sign trigger_exposure tx
    Keplr->>Contract: ExecuteMsg::TriggerExposure
    Contract->>Contract: Query x/staking for resonance bonus
    Contract->>Contract: Draw tier from loot table (deterministic seed)
    Contract->>Contract: Compute payout, fee, cap
    Contract->>Contract: Append Experiment to ledger
    Contract->>Contract: Run on-chain Gini audit (every K pulls)
    Contract->>Player: BankMsg::Send payout uatom
    Contract-->>UI: Tx events (tier attribute)

    UI->>UI: Phases: rumble → flash → reveal
    UI->>Relayer: POST /api/experiments
    Relayer->>Relayer: Mirror Gini auditor check
    UI->>Player: Show Mutation NFT tier card
```

---

## 3. Oracle cycle (Regime Classifier)

Runs on an interval (`INTERVAL_MS`, default 5 minutes) inside the relayer.

```mermaid
flowchart LR
    A["Start cycle"] --> B["Fetch bonded ratio Δ"]
    A --> C["Fetch gov activity Δ"]
    A --> D["Fetch IBC tx count Δ"]

    B --> E["Regime Classifier"]
    C --> E
    D --> E

    E --> F["Volatility Regime Score<br/>0–100"]
    F --> G{"CONTRACT_ADDRESS<br/>+ MNEMONIC set?"}

    G -->|yes| H["Submit update_regime_score<br/>on-chain tx"]
    G -->|no| I["Log score only<br/>(degraded mode)"]

    H --> J["Contract rescales loot table"]
    I --> K["Expose via /api/hub-pulse"]
    J --> K
```

**Score formula (simplified):**

```text
score = min(100, round(bonded_contrib + gov_contrib + ibc_contrib))
each contrib = min(33, normalizeDelta(feature) × 33.33)
```

| Score range | Regime label | Loot table behavior        |
|-------------|--------------|----------------------------|
| 0–30        | CALM         | Tighter distribution       |
| 31–60       | ELEVATED     | Balanced shift             |
| 61–100      | TURBULENT    | Flattened odds, higher mult |

---

## 4. Dual auditor model

MUTAGEN runs fairness checks in **two places** — mirroring Odin Scan’s “continuous audit” pattern for economic risk instead of code risk.

```mermaid
flowchart TB
    subgraph OnChain["On-chain Auditor (CosmWasm)"]
        OC1["Every K pulls (k_interval = 10)"]
        OC2["Compute Gini on last K payouts"]
        OC3{"Gini > 0.6?"}
        OC4["fee_rate += 0.005<br/>(max 5%)"]
        OC5["payout_cap × 0.98<br/>(min 85%)"]
        OC6["Log intervention on-chain"]
    end

    subgraph OffChain["Off-chain Auditor (Relayer)"]
        OF1["Every K experiment POSTs"]
        OF2["Compute Gini on last K records"]
        OF3{"Gini > GINI_THRESHOLD?"}
        OF4["Adjust mirrored feeRate / payoutCap"]
        OF5["Append to /api/interventions"]
    end

    OC1 --> OC2 --> OC3
    OC3 -->|yes| OC4
    OC3 -->|yes| OC5
    OC4 --> OC6
    OC5 --> OC6

    OF1 --> OF2 --> OF3
    OF3 -->|yes| OF4 --> OF5
```

---

## 5. Frontend data synchronization

How live dashboard and lab odds stay updated.

```mermaid
flowchart TB
    subgraph Hooks["React hooks (layout)"]
        RS["useRelayerSync<br/>every 15s"]
        CS["useContractSync<br/>every 20s"]
        SR["useStoreRefresh"]
    end

    subgraph Store["experiment-store (client)"]
        HP["hubPulse"]
        ZS["zeroSumIndex"]
        EXP["experiments"]
        INT["interventions"]
        BH["bondHistory"]
    end

    subgraph Sources["Data sources"]
        RAPI["Relayer /health"]
        CQUERY["Contract queries<br/>list_experiments · get_auditor_state"]
    end

    RS --> RAPI
    RS -->|"syncFromRelayer"| HP

    CS --> CQUERY
    CS -->|"syncContractData"| EXP
    CS -->|"syncContractData"| INT
    CS -->|"syncContractData"| ZS
    CS -->|"syncContractData"| BH

    Store --> SR
    SR --> UI2["Lab · Dashboard · Notebook pages"]
```

---

## 6. Loot table state machine

How regime score reshapes tier weights.

```mermaid
stateDiagram-v2
    [*] --> CALM: score 0–30
    [*] --> ELEVATED: score 31–60
    [*] --> TURBULENT: score 61–100

  state CALM {
    [*] --> CommonHeavy
    CommonHeavy: COMMON 55% · LEGENDARY 5%
  }

  state ELEVATED {
    [*] --> Balanced
    Balanced: COMMON 40% · LEGENDARY 10%
  }

  state TURBULENT {
    [*] --> FlatOdds
    FlatOdds: All tiers 25% each
  }

  CALM --> ELEVATED: relayer update_regime_score
  ELEVATED --> TURBULENT: relayer update_regime_score
  TURBULENT --> CALM: relayer update_regime_score
```

Resonance bonus (on-chain: Hub staker with ≥ 1 ATOM delegated) shifts weight from COMMON toward higher tiers before the draw.

---

## 7. Repository module map

```mermaid
flowchart LR
    subgraph Frontend["src/"]
        APP["app/ routes"]
        LAB["components/lab/"]
        DASH["components/dashboard/"]
        LIB["lib/<br/>contract · loot-table · lab-sounds"]
    end

    subgraph RelayerPkg["relayer/src/"]
        HUB["hub/"]
        AI["ai/"]
        SRV["server.ts"]
        ORC["oracle.ts"]
    end

    subgraph Wasm["mutagen-contract/src/"]
        EXE["execute.rs"]
        LOOT["loot.rs"]
        AUD["auditor.rs"]
        QRY["query.rs"]
    end

    subgraph Scripts["scripts/"]
        DEP["deploy.ts"]
        E2E["e2e-verify.ts"]
    end

    APP --> LAB
    APP --> DASH
    LAB --> LIB
    LIB --> Wasm
    ORC --> HUB
    ORC --> AI
    SRV --> AI
    DEP --> Wasm
    E2E --> Wasm
    E2E --> RelayerPkg
```

---

## 8. Lab animation phases

Visual and audio timeline during a pull (when reduced motion is off).

```mermaid
gantt
    title Mutagen Exposure animation timeline
    dateFormat X
    axisFormat %Ls

    section Visual
    Charge (rings, bubbles, scanlines) :active, c1, 0, 3000
    Rumble (machine shake)               :active, c2, 3000, 700
    Flash (white burst + particles)      :crit, c3, 3700, 450
    Reveal (tier card pop)               :done, c4, 4150, 700

    section Audio
    Soft charge hum                      :a1, 0, 3000
    Rumble noise                         :a2, 3000, 250
    Flash square burst                   :a3, 3700, 300
    Tier arpeggio reveal                 :a4, 4150, 500
```

> Timing overlaps with wallet signing — charge audio starts on button click and fades when rumble begins.

---

## 9. Deployment topology (current testnet)

```mermaid
flowchart LR
    Dev["Developer machine"]
    Dev -->|"npm run dev :3000"| FE["Next.js"]
    Dev -->|"npm run relayer:dev :3091"| RL["Relayer"]

    RL -->|"RPC + REST"| NET["provider testnet"]
    FE -->|"CosmJS queries"| NET
    FE -->|"Keplr txs"| NET

    NET --> CA["cosmos1cegnz6...ldh3g<br/>code ID 514"]
    RL -->|"relayer wallet"| RW["cosmos18tl6...z27kr"]
```

See `public/contract.json` for the canonical deployment manifest.
