# 1. Backend Technical Audit Report

## 1.1 Scope and methodology
- **Target:** Cynbit public web presence (assignment brief). Public sources describe a closely named UK technology services company, Cybit (Newcastle upon Tyne), at cybit.com. The audit applies to whichever domain the brief designates; confirm it before submitting.
- **Approach:** desk-based passive review of public information plus a verification checklist (`04`) using only normal visitor-level requests.
- **Out of scope:** exploitation, fuzzing, brute force, load generation, authenticated testing, any attempt to access non-public data.

## 1.2 Business and technical context (public information)
| Fact | Relevance to backend |
|---|---|
| Positions itself as an IT services / managed services provider (data & AI, modern workspace, hybrid cloud, security) | Site is primarily a **marketing and lead-generation property**, so the backend is likely a CMS plus form handling, not a large transactional API |
| Publicly lists partnerships with Microsoft, AWS and Qlik | Likely uses Microsoft 365 / cloud services for email, identity and possibly hosting |
| Public contact email and recruiting listings | Inbound **PII** flows: contact forms, job applications, newsletter or webinar sign-ups |
| Security is a core selling point | Raises the expected bar for its own security posture, and makes headers, TLS and disclosure practices especially visible |
| Publishes webinars and video content | Third-party embeds (video, analytics) enlarge the script and data-sharing surface |

## 1.3 Inferred architecture
```
Browser -> CDN/WAF? -> Web tier (CMS / static site) -> Form handler -> Email / CRM / marketing automation
                                   \-> Third-party scripts (analytics, video, chat)
```
| Layer | Assessment | Confidence |
|---|---|---|
| Frontend | CMS-driven or static marketing site | Medium (inferred) |
| API surface | Small: form submission endpoints, search, possibly CMS REST endpoints | Low, verify via DevTools |
| Authentication | Probably none for visitors; admin login for CMS | Low |
| Data stores | CMS database; CRM (e.g. Dynamics, given the partner profile) | Low |
| Delivery | Probable CDN or reverse proxy | Low |

## 1.4 Expected API and payload structure
Typical for this site class (to be confirmed in DevTools, see `04`):

| Method | Path pattern | Purpose | Auth | Payload |
|---|---|---|---|---|
| GET | `/`, `/services/*`, `/insights/*` | Content | None | HTML |
| POST | `/contact` or a form-vendor endpoint | Lead capture | None | `{name, email, company, message}` |
| POST | `/careers/apply` or an ATS redirect | Applications | None | Multipart (CV upload) |
| GET | `/wp-json/*` or CMS API | Content API | None/limited | JSON |
| POST | analytics collectors | Telemetry | None | Event JSON |

## 1.5 Data-flow concerns
1. **Form to CRM path:** where PII lands and how it is validated, stored and retained.
2. **File uploads (CVs):** content-type enforcement, size limits, malware scanning, private storage.
3. **Third-party processors:** analytics and embeds receive visitor data, so consent and data processing agreements matter (UK GDPR / PECR cookie rules).
4. **Email delivery:** SPF/DKIM/DMARC protect the brand from spoofing, which is especially relevant for a security provider.

## 1.6 Architectural strengths to look for (and credit)
HTTPS everywhere, HSTS, CDN/WAF fronting, a cookie consent mechanism, a published security contact.

## 1.7 Limitations
No authenticated testing and no traffic generation were performed. Items marked *Hypothesis* are unverified until the checklist in `04` is completed.
