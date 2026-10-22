import helmet from "helmet";
import cors from "cors";

// R-01: security headers and strict CORS allowlist
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  });
}

export function corsAllowlist(allowedOrigins) {
  const allowed = new Set(allowedOrigins);
  return cors({
    origin(origin, cb) {
      // Non-browser clients send no Origin; browsers must be on the allowlist.
      if (!origin || allowed.has(origin)) return cb(null, true);
      return cb(null, false); // no CORS headers => browser blocks
    },
    credentials: true,
    methods: ["GET", "POST"],
    maxAge: 600,
  });
}
