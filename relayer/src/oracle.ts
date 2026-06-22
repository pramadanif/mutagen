import { fetchBondedRatioDelta } from "./hub/bonded-ratio.js";
import { fetchGovActivityDelta } from "./hub/gov-activity.js";
import { fetchIbcVolumeDelta } from "./hub/ibc-volume.js";
import { classifyRegime } from "./ai/regime-classifier.js";
import { submitRegimeUpdate } from "./contract/client.js";
import { state } from "./state.js";
import { log } from "./logger.js";
import { withRetry } from "./utils.js";

export async function runOracleCycle(): Promise<void> {
  try {
    const [bondedRatioDelta, gov, ibcVolumeDelta] = await withRetry(
      async () =>
        Promise.all([
          fetchBondedRatioDelta(),
          fetchGovActivityDelta(),
          fetchIbcVolumeDelta(),
        ]),
      "hub_feature_fetch"
    );

    const features = {
      bondedRatioDelta,
      govActivityDelta: gov.delta,
      ibcVolumeDelta,
    };

    const inference = classifyRegime(features);
    state.lastInference = inference;
    state.hubPulse = {
      bondedRatioDelta,
      govActivity: gov.active,
      ibcVolumeDelta,
      regimeScore: inference.score,
    };
    state.lastUpdate = inference.timestamp;
    state.status = "ok";
    state.lastError = null;

    log("info", "regime_inference", {
      score: inference.score,
      regimeLabel: inference.regimeLabel,
      features,
    });

    const txHash = await submitRegimeUpdate(inference);
    if (txHash) {
      log("info", "regime_update_tx", { txHash });
    }
  } catch (err) {
    state.status = "degraded";
    state.lastError = err instanceof Error ? err.message : String(err);
    log("error", "oracle_cycle_failed", { error: state.lastError });
  }
}
