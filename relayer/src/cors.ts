import type { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

function parseAllowedOrigins(raw: string): string[] | "*" {
  const trimmed = raw.trim();
  if (trimmed === "*") return "*";
  return trimmed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowed = parseAllowedOrigins(config.corsOrigin);
  const requestOrigin = req.headers.origin;

  let allowOrigin: string | undefined;

  if (allowed === "*") {
    allowOrigin = "*";
  } else if (requestOrigin && allowed.includes(requestOrigin)) {
    allowOrigin = requestOrigin;
  } else if (allowed.length === 1) {
    allowOrigin = allowed[0];
  }

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
