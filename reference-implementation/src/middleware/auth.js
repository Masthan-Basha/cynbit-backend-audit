import jwt from "jsonwebtoken";

// R-02: short-lived token in an HttpOnly cookie (not readable by page JS).
export function issueSession(res, user, cfg) {
  const token = jwt.sign({ sub: user.id, role: user.role }, cfg.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
  res.cookie("session", token, {
    httpOnly: true,
    secure: cfg.isProd,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
}

export function requireAuth(cfg) {
  return (req, res, next) => {
    const token = req.cookies?.session;
    if (!token) return next({ status: 401, code: "unauthenticated", message: "Authentication required" });
    try {
      req.user = jwt.verify(token, cfg.jwtSecret, { algorithms: ["HS256"] });
      next();
    } catch {
      next({ status: 401, code: "invalid_token", message: "Invalid or expired session" });
    }
  };
}
