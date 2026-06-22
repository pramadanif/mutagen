import express from "express";
import { config } from "./config.js";
import { state, addExperimentRecord } from "./state.js";
import { runAuditorIfNeeded } from "./ai/auditor.js";
import { log } from "./logger.js";

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.options("*", (_req, res) => res.sendStatus(204));

  app.get("/", (_req, res) => {
    res.json({ service: "mutagen-relayer", status: state.status, health: "/health" });
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: state.status,
      lastUpdate: state.lastUpdate,
      lastError: state.lastError,
      hubPulse: state.hubPulse,
      zeroSumIndex: state.zeroSumIndex,
      pullCount: state.experiments.length,
      auditorParams: state.auditorParams,
    });
  });

  app.get("/api/hub-pulse", (_req, res) => {
    res.json({
      ...state.hubPulse,
      lastUpdate: state.lastUpdate,
      inference: state.lastInference,
    });
  });

  app.get("/api/interventions", (_req, res) => {
    res.json({ interventions: state.interventions });
  });

  app.get("/api/auditor", (_req, res) => {
    res.json({
      zeroSumIndex: state.zeroSumIndex,
      interventions: state.interventions,
      params: state.auditorParams,
    });
  });

  app.post("/api/experiments", (req, res) => {
    const { bondAmount, payout, tier, timestamp } = req.body ?? {};
    if (typeof bondAmount !== "number" || !tier) {
      res.status(400).json({ error: "bondAmount and tier required" });
      return;
    }

    const record = addExperimentRecord({
      bondAmount,
      payout: typeof payout === "number" ? payout : bondAmount,
      tier: String(tier),
      timestamp: timestamp ?? new Date().toISOString(),
    });

    const intervention = runAuditorIfNeeded();
    log("info", "experiment_recorded", { id: record.id, tier: record.tier });

    res.json({ experiment: record, intervention });
  });

  return app;
}

export function startServer(): void {
  const app = createServer();
  app.listen(config.port, config.host, () => {
    log("info", "relayer_started", { host: config.host, port: config.port });
  });
}
