import { Router } from "express";

export function healthRouter() {
  const r = Router();
  r.get("/healthz", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));
  return r;
}
