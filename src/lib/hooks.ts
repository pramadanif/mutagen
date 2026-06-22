"use client";

import { useEffect, useState } from "react";
import {
  fetchRelayerHealth,
  fetchRelayerInterventions,
} from "./relayer-client";
import {
  mapOnChainExperiment,
  queryAuditorState,
  queryListExperiments,
} from "./contract";
import {
  subscribe,
  syncFromRelayer,
  syncContractData,
  getHubPulse,
  getZeroSumIndex,
} from "./experiment-store";

export function useStoreRefresh(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return tick;
}

export function useContractSync(intervalMs = 20_000): void {
  useEffect(() => {
    let active = true;

    async function pull() {
      try {
        const [exps, auditor] = await Promise.all([
          queryListExperiments(50),
          queryAuditorState(),
        ]);
        if (!active) return;
        syncContractData({
          experiments: exps.map(mapOnChainExperiment),
          interventions: auditor.intervention_log.map((log) => ({
            timestamp: new Date(Number(log.timestamp.seconds) * 1000).toISOString(),
            pullCount: log.pull_number,
            giniValue: parseFloat(log.gini_before),
            threshold: parseFloat(log.threshold),
            actionTaken: log.action === "none" ? null : log.action,
            newParam: parseFloat(log.param_after),
          })),
          zeroSumIndex: parseFloat(auditor.zero_sum_index),
        });
      } catch {
        // relayer/contract query failed — keep last state
      }
    }

    void pull();
    const id = setInterval(() => void pull(), intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs]);
}

export function useRelayerSync(intervalMs = 15_000): void {
  useEffect(() => {
    let active = true;

    async function pull() {
      const health = await fetchRelayerHealth();
      if (!active) return;

      if (health?.hubPulse) {
        const interventions = await fetchRelayerInterventions();
        syncFromRelayer({
          hubPulse: health.hubPulse,
          interventions,
          zeroSumIndex: health.zeroSumIndex ?? 0,
          online: true,
        });
      } else {
        syncFromRelayer({
          hubPulse: getHubPulse(),
          interventions: [],
          zeroSumIndex: getZeroSumIndex(),
          online: false,
        });
      }
    }

    void pull();
    const id = setInterval(() => void pull(), intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs]);
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
