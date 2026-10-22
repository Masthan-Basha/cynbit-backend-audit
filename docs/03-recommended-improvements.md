# 3. Recommended Improvements

All code is in `../reference-implementation/` and covered by `npm test` (10 passing tests).

| ID | Recommendation | Addresses | Code |
|---|---|---|---|
| R-01 | Security headers, strict CSP, CORS allowlist, hide stack details | F-01, F-02, F-03, F-04 | `src/middleware/security.js` |
| R-02 | Short-lived session in `HttpOnly; Secure; SameSite=Strict` cookie | F-05 | `src/middleware/auth.js` |
| R-03 | Rate limiting (per IP) on forms and auth | F-06 | `src/middleware/rateLimit.js` |
| R-04 | Server-side schema validation, body size caps, honeypot, upload policy | F-07, F-08 | `src/schemas/contact.js`, `src/routes/contact.js` |
| R-05 | Uniform error envelope with request IDs | F-09 | `src/middleware/errorHandler.js` |
| R-06 | Compression, `Cache-Control`, ETag | F-10 | `src/app.js`, `src/routes/services.js` |
| R-07 | Email auth DNS records and `security.txt` | F-11, F-12 | snippets below |
| R-08 | Consent-gated third-party scripts | F-13 | snippet below |

## R-01 Security headers and CORS
```js
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"] } },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
app.disable("x-powered-by");
```
Roll CSP out with `Content-Security-Policy-Report-Only` first so third-party widgets are not broken.

## R-02 Session cookies
```js
res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 15 * 60 * 1000 });
```

## R-03 Rate limiting
```js
app.use("/v1/contact", rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: true }));
```
Use a Redis store when running multiple instances, and add CAPTCHA/Turnstile on public forms.

## R-04 Validation and uploads
```js
const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(254),
  message: z.string().trim().min(1).max(2000),
}).strict();
```
Upload policy: allowlist extensions and MIME (PDF/DOCX), verify magic bytes, cap size (for example 5 MB), scan with AV, store in a private bucket with randomized names, and serve via short-lived signed URLs.

## R-05 Error handling
```js
res.status(status).json({ error: { code, message: expected ? msg : "Something went wrong", requestId: req.id } });
```
Log full detail server-side only.

## R-06 Performance
```js
app.use(compression());
res.set({ ETag: etag, "Cache-Control": "public, max-age=300, stale-while-revalidate=60" });
```
Also serve static assets with long-lived immutable caching and fingerprinted filenames, enable Brotli at the CDN, and defer non-critical third-party scripts.

## R-07 Email authentication and disclosure
```
example.com.          TXT  "v=spf1 include:spf.protection.outlook.com -all"
_dmarc.example.com.   TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com; pct=100"
```
```
# /.well-known/security.txt
Contact: mailto:security@example.com
Expires: 2027-12-31T23:59:59Z
Preferred-Languages: en
```
Move DMARC from `none` to `quarantine` to `reject` gradually, while watching aggregate reports.

## R-08 Consent-gated scripts
```js
function loadAnalytics() { const s = document.createElement("script"); s.src = "/analytics.js"; s.defer = true; document.head.appendChild(s); }
window.addEventListener("consent:granted", loadAnalytics, { once: true });
```

## Architecture improvements
1. **Queue-backed form handling:** API validates and enqueues; a worker delivers to CRM/email, so outages do not lose leads.
2. **CDN + WAF in front of origin:** edge rate limiting, bot management, TLS.
3. **Structured logging with request IDs** and alerting on 5xx spikes.
4. **API versioning (`/v1`) and an OpenAPI spec** for any public endpoints.
5. **Secrets in a secret manager,** never in the repo or client bundles.

## Trade-offs
- Strict CSP may break inline scripts and embeds; use report-only mode first.
- In-memory rate limiting does not scale horizontally.
- The demo login route in the reference app issues a session without credential checks. Replace it with real verification (argon2-hashed passwords, MFA) for any real use.
