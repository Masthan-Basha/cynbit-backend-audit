import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import { loadConfig } from "./config.js";
import { requestId } from "./middleware/requestId.js";
import { securityHeaders, corsAllowlist } from "./middleware/security.js";
import { formLimiter, authLimiter } from "./middleware/rateLimit.js";
import { issueSession, requireAuth } from "./middleware/auth.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { contactRouter } from "./routes/contact.js";
import { servicesRouter } from "./routes/services.js";
import { healthRouter } from "./routes/health.js";

export function memoryQueue() {
  const items = [];
  return { items, enqueue: async (job) => void items.push(job) };
}

export function createApp({ config = loadConfig(), queue = memoryQueue(), logger = console } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind CDN/load balancer; adjust to your topology

  app.use(requestId);
  app.use(securityHeaders());
  app.use(corsAllowlist(config.allowedOrigins));
  app.use(compression());
  app.use(express.json({ limit: "10kb" })); // cap body size
  app.use(cookieParser());

  app.use(healthRouter());
  app.use("/v1/services", servicesRouter());
  app.use("/v1/contact", contactRouter({ queue, limiter: formLimiter() }));

  // DEMO ONLY: replace with real credential check (hashed passwords, e.g. argon2).
  app.post("/v1/auth/login", authLimiter(), (req, res) => {
    issueSession(res, { id: "demo-user", role: "user" }, config);
    res.json({ status: "ok" });
  });
  app.get("/v1/me", requireAuth(config), (req, res) => res.json({ id: req.user.sub, role: req.user.role }));

  app.use(notFound);
  app.use(errorHandler(logger));
  return app;
}
