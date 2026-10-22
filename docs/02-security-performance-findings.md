# 2. Security & Performance Findings

**Status key:** *Confirmed* = publicly documented fact. *Hypothesis* = common risk for this class of site; run the matching check in `04` to confirm or dismiss.
**Severity (if confirmed):** High / Medium / Low / Info, rated by likelihood x impact.

| ID | Category | Finding | Status | Severity if confirmed | Impact | Verify | Fix |
|---|---|---|---|---|---|---|---|
| F-01 | Security | Missing or weak `Content-Security-Policy` | Hypothesis | Medium | Weaker XSS mitigation; third-party scripts unrestricted | V-01 | R-01 |
| F-02 | Security | Incomplete security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame protection) | Hypothesis | Low-Medium | Clickjacking, MIME sniffing, referrer leakage | V-01 | R-01 |
| F-03 | Security | Permissive CORS on any JSON/CMS API (wildcard or reflected origin, especially with credentials) | Hypothesis | Medium-High | Cross-site data reads | V-02 | R-01 |
| F-04 | Security | Technology disclosure via `Server` / `X-Powered-By` / generator meta / CMS API paths | Hypothesis | Low | Easier targeting of known CVEs | V-01, V-03 | R-01 |
| F-05 | Authentication | Session/CMS cookies lacking `Secure`, `HttpOnly` or `SameSite` | Hypothesis | Medium | Session theft or CSRF | V-04 | R-02 |
| F-06 | Abuse protection | Public form endpoints with no visible rate limiting or bot protection | Hypothesis | Medium | Spam, CRM pollution, cost abuse | V-05 | R-03 |
| F-07 | Data validation | Reliance on client-side validation only; unbounded field sizes | Hypothesis | Medium | Malformed or oversized input reaching CRM/email | V-05 | R-04 |
| F-08 | Data validation | CV/file upload without strict type, size and scanning controls | Hypothesis | Medium-High | Malware delivery to staff; storage abuse | V-06 | R-04 |
| F-09 | Error handling | Verbose or inconsistent error responses (stack traces, framework error pages) | Hypothesis | Low-Medium | Information leakage | V-07 | R-05 |
| F-10 | Performance | Missing compression, weak cache headers, heavy third-party scripts | Hypothesis | Low | Slower TTFB/LCP, higher bandwidth | V-08 | R-06 |
| F-11 | Email security | Missing or weak SPF/DKIM/DMARC on the brand domain | Hypothesis | Medium | Brand spoofing and phishing, notable for a security vendor | V-09 | R-07 |
| F-12 | Disclosure | No `/.well-known/security.txt` | Hypothesis | Info | No clear channel for vulnerability reports | V-10 | R-07 |
| F-13 | Privacy | Third-party trackers loading before consent | Hypothesis | Medium | UK GDPR/PECR exposure | V-11 | R-08 |
| C-01 | Context | Public contact and recruiting channels exist | Confirmed | Info | Defines the PII intake surface to protect | n/a | n/a |

## Prioritization
1. **Fix first:** F-03, F-08, F-05 (potential data exposure or malware vector).
2. **Next:** F-01, F-06, F-07, F-11 (hardening and abuse resistance).
3. **Then:** F-02, F-04, F-09, F-10, F-12, F-13.

## Why these areas
The site type (marketing plus lead capture) concentrates risk in headers, form handling, uploads, third-party content and email authentication, rather than in a deep business API. For a company selling security services, these are also the most visible signals to customers.
