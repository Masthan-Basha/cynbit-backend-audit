# 4. Passive Verification Checklist

Only normal visitor-level requests. Do not repeat requests in loops, test login forms, or probe paths that are not linked from the site.
Record result and date next to each check; mark the matching finding **Confirmed** or **Not observed**.

| ID | Check | How | Confirms |
|---|---|---|---|
| V-01 | Response headers on the homepage | `curl -sI https://DOMAIN/` or DevTools, Network, click the document, Headers. Look for CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame protection, `Server`, `X-Powered-By` | F-01, F-02, F-04 |
| V-02 | CORS on JSON endpoints seen in the Network tab | Inspect `Access-Control-Allow-Origin` / `-Credentials` on responses that browsing already produced | F-03 |
| V-03 | Tech fingerprints | View page source: generator meta tag, script/CSS paths | F-04 |
| V-04 | Cookie flags | DevTools, Application, Cookies: Secure, HttpOnly, SameSite, expiry | F-05 |
| V-05 | Form behaviour | Submit **one** normal, valid form entry only with your own details if permitted. Note the endpoint, payload shape and whether validation happens server-side (response codes), plus any `RateLimit-*` headers. No bulk or malformed submissions | F-06, F-07 |
| V-06 | Upload UI hints | Read the careers page: stated accepted types/size limits (do not upload anything unless authorized) | F-08 |
| V-07 | Error pages | Open the site's normal 404 page (a mistyped link) and note whether it exposes framework details | F-09 |
| V-08 | Performance | Lighthouse or DevTools: TTFB, `Content-Encoding`, `Cache-Control`, page weight, third-party requests | F-10 |
| V-09 | Email DNS | `dig TXT DOMAIN`, `dig TXT _dmarc.DOMAIN` (public DNS records) | F-11 |
| V-10 | Security contact | Open `https://DOMAIN/.well-known/security.txt` | F-12 |
| V-11 | Consent behaviour | Load the site in a fresh private window, decline cookies, and check the Network tab for tracker requests | F-13 |

### Results log
| Check | Date | Result | Evidence file |
|---|---|---|---|
| V-01 | | | |
