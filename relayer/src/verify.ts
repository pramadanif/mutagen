/**
 * Phase 2 verification — run with relayer already up OR standalone hub fetch test.
 */
import { fetchBondedRatioDelta } from "./hub/bonded-ratio.js";
import { fetchGovActivityDelta } from "./hub/gov-activity.js";
import { fetchIbcVolumeDelta } from "./hub/ibc-volume.js";
import { classifyRegime } from "./ai/regime-classifier.js";
import { computeGini } from "./ai/auditor.js";

const RELAYER_URL = process.env.RELAYER_URL ?? "http://localhost:3091";

async function verifyHubFetch() {
  const bonded = await fetchBondedRatioDelta();
  const gov = await fetchGovActivityDelta();
  const ibc = await fetchIbcVolumeDelta();
  const inference = classifyRegime({
    bondedRatioDelta: bonded,
    govActivityDelta: gov.delta,
    ibcVolumeDelta: ibc,
  });

  console.log("✓ Hub fetch OK");
  console.log("  bondedRatioDelta:", bonded.toFixed(6));
  console.log("  govActive:", gov.active, "delta:", gov.delta.toFixed(6));
  console.log("  ibcVolumeDelta:", ibc.toFixed(6));
  console.log("  regimeScore:", inference.score, inference.regimeLabel);

  if (inference.score < 0 || inference.score > 100) {
    throw new Error("regime score out of range");
  }
}

async function verifyGini() {
  const gini = computeGini([10, 10, 10, 100]);
  console.log("✓ Gini computation OK:", gini.toFixed(4));
  if (gini <= 0 || gini > 1) throw new Error("invalid gini");
}

async function verifyHealthEndpoint() {
  const res = await fetch(`${RELAYER_URL}/health`);
  if (!res.ok) throw new Error(`health HTTP ${res.status}`);
  const data = await res.json();
  console.log("✓ /health OK", JSON.stringify(data, null, 2));
  if (!data.hubPulse) throw new Error("missing hubPulse");
}

async function verifyExperimentPost() {
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${RELAYER_URL}/api/experiments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bondAmount: 100 + i * 50,
        payout: i === 9 ? 5000 : 100 + i * 10,
        tier: i === 9 ? "LEGENDARY" : "COMMON",
      }),
    });
    if (!res.ok) throw new Error(`experiment POST ${res.status}`);
  }
  const auditor = await fetch(`${RELAYER_URL}/api/auditor`);
  const data = await auditor.json();
  console.log("✓ Auditor after 10 pulls OK", {
    zeroSumIndex: data.zeroSumIndex,
    interventions: data.interventions?.length,
  });
}

async function verifyFrontendFlow() {
  const healthBefore = await fetch(`${RELAYER_URL}/health`).then((r) => r.json());
  const pullBefore = healthBefore.pullCount ?? 0;

  const res = await fetch(`${RELAYER_URL}/api/experiments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bondAmount: 250,
      payout: 750,
      tier: "RARE",
      timestamp: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`lab pull POST ${res.status}`);

  const healthAfter = await fetch(`${RELAYER_URL}/health`).then((r) => r.json());
  if ((healthAfter.pullCount ?? 0) !== pullBefore + 1) {
    throw new Error(`pullCount expected ${pullBefore + 1}, got ${healthAfter.pullCount}`);
  }

  const interventions = await fetch(`${RELAYER_URL}/api/interventions`).then((r) => r.json());
  if (!Array.isArray(interventions.interventions)) {
    throw new Error("interventions payload invalid");
  }

  const pulse = await fetch(`${RELAYER_URL}/api/hub-pulse`).then((r) => r.json());
  if (pulse.regimeScore !== healthAfter.hubPulse.regimeScore) {
    throw new Error("hub-pulse / health regimeScore mismatch");
  }

  console.log("✓ FE flow OK (Lab pull → health → interventions → hub-pulse)");
}

async function main() {
  const mode = process.argv[2] ?? "all";
  console.log("=== MUTAGEN Phase 2 Verify ===\n");

  if (mode === "hub" || mode === "all") await verifyHubFetch();
  if (mode === "gini" || mode === "all") await verifyGini();

  if (mode === "api" || mode === "fe" || mode === "all") {
    await verifyHealthEndpoint();
    await verifyExperimentPost();
  }

  if (mode === "fe" || mode === "all") await verifyFrontendFlow();

  console.log("\n=== ALL CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("\n✗ VERIFY FAILED:", err);
  process.exit(1);
});
