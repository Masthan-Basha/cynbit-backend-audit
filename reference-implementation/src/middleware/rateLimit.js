import rateLimit from "express-rate-limit";

// R-03: use a shared store (e.g. Redis) when running multiple instances.
const json429 = (req, res) =>
  res.status(429).json({ error: { code: "rate_limited", message: "Too many requests", requestId: req.id } });

export const authLimiter = () =>
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: json429 });

export const formLimiter = () =>
  rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, handler: json429 });
