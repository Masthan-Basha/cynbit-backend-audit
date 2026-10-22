export function loadConfig(env = process.env) {
  const isProd = env.NODE_ENV === "production";
  const jwtSecret = env.JWT_SECRET;
  if (isProd && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error("JWT_SECRET must be set (>=32 chars) in production");
  }
  return {
    port: Number(env.PORT ?? 3000),
    isProd,
    jwtSecret: jwtSecret ?? "dev-only-secret-not-for-production",
    allowedOrigins: (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  };
}
