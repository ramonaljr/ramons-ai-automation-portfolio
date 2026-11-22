# External Integrations

**Analysis Date:** 2026-10-21

## Summary

The site has one server-side upstream: an n8n instance, reached only from Next.js route handlers in `src/app/api/`. The browser never calls n8n directly. n8n in turn fronts Google Calendar, Gmail, and an LLM (for chat). Everything else is Vercel platform services, self-hosted assets, or outbound links.

## APIs & External Services

**n8n (automation backend, required for forms, booking, and chat):**
- Purpose: Handles contact form submissions, appointment booking, availability lookup, and the chat assistant.
- Client: hand-written `fetch` wrapper in `src/lib/n8n.ts` (`callN8n`). No SDK.
- Base URL: `N8N_BASE_URL` (default `http://localhost:5678`), trailing slash stripped.
- Auth: Shared secret `N8N_WEBHOOK_KEY`, sent as request header `X-Portfolio-Key` when set. The n8n webhook nodes enforce it as Header Auth against a credential named "Portfolio Webhook Key" (per `.env.example` comments). If unset, the header is omitted and n8n answers 403.
- Timeouts: 15 s default (`DEFAULT_TIMEOUT_MS`), 45 s for chat (`CHAT_TIMEOUT_MS`), enforced with `AbortController`.
- Response handling: Non-JSON upstream bodies (for example an inactive workflow answering HTML) are converted to `502` with `error: 'bad_upstream_response'`.
- Caching: `cache: 'no-store'` on every upstream call.

Webhook paths called from this app (all `POST` except availability):

| Path | Called from | Method | Purpose |
|------|-------------|--------|---------|
| `/webhook/portfolio-contact` | `src/app/api/contact/route.ts` | POST | Contact form. Body: `name`, `email`, `service`, `message` |
| `/webhook/portfolio-booking` | `src/app/api/booking/route.ts` | POST | Books a slot. Body: `name`, `email`, `date`, `time`, `topic`, `notes`, `timezone` (always `Asia/Manila`) |
| `/webhook/portfolio-availability` | `src/app/api/availability/route.ts` | GET | Query `date` (YYYY-MM-DD). Returns open slots |
| `/webhook/portfolio-chat` | `src/app/api/chat/route.ts` | POST | Chat message. Body: `message`, `sessionId`. Health probe sends an empty message and expects `400 empty_message` |

Status codes from n8n are passed through to the browser unchanged (for example `409` for a taken slot).

**Downstream services used inside n8n (configured in the n8n instance, not in this repo):**
- Google Calendar - Availability reads and event creation for bookings. Referenced in `.github/workflows/booking-uptime.yml` and `src/app/api/availability/route.ts` comments.
- Gmail - Sends confirmation and notification email. Referenced in `src/lib/n8n.ts` comments ("send mail from Ramon's Gmail").
- LLM provider - The chat workflow calls a language model. Provider is not identifiable from this repo. The README lists Claude, OpenAI, and Gemini as skills, but the wiring lives in n8n.
- Workflow source JSON is not in the repo in unpacked form. `n8n-project-portfolio-workflows.zip` (untracked, repo root) contains `n8n-workflows/*.json` and a README. It was not extracted during this analysis.

**Vercel platform services:**
- `@vercel/analytics/next` - Page analytics, mounted in `src/app/layout.tsx`
- `@vercel/speed-insights/next` - Web vitals, mounted in `src/app/layout.tsx`
- `VERCEL_OIDC_TOKEN` appears in `.env.local` (created by the Vercel CLI). Name only; no application code reads it.

**Google Fonts (build-time):**
- Geist Mono via `next/font/google` in `src/app/layout.tsx`. Downloaded at build time and self-hosted by Next. No runtime request to Google from the browser.

**No other third-party APIs detected.** No payment, CRM, email-sending SDK, or database client appears in `src/` or `package.json`.

## Data Storage

**Databases:**
- None in this app. No ORM, database client, or connection string is present.
- Booking records and contact submissions are written by n8n into its own stores (the README and `docs/PROJECT-PORTFOLIO-BUILD-PLAN.md` reference an n8n Data Table for bookings). Not in this repo.

**File Storage:**
- Local filesystem only. Content is read with `fs` from `src/content/blog/` (`src/lib/posts.ts`) and `src/content/case-studies/` (`src/lib/case-studies.ts`).
- Static media ships in `public/` (films, images, models, video, CV PDF).

**Caching:**
- None external. Client-side fetches set `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` on the chat health probe (`src/app/api/chat/route.ts`).
- In-memory rate limiter (`src/lib/rate-limit.ts`) stores buckets on `globalThis.portfolioRateLimits`. State is per Node process and resets on cold start. Not shared across Vercel instances.

## Authentication & Identity

**Auth Provider:**
- No end-user authentication. The site is public.
- Server-to-n8n trust is a shared header secret (`X-Portfolio-Key`, from `N8N_WEBHOOK_KEY`). Enforced by n8n, sent from `src/lib/n8n.ts`.
- Rate limiting keys on the first `x-forwarded-for` value, then `x-real-ip`, then `unknown` (`src/lib/rate-limit.ts`). These headers are client-controllable when the app is reached directly rather than through a proxy that sets them.

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, Rollbar, or similar SDK detected.

**Uptime Monitoring:**
- GitHub Actions workflow `.github/workflows/booking-uptime.yml` runs hourly (`cron: '17 * * * *'`) plus on manual dispatch. It calls `${SITE_URL}/api/availability?date=<tomorrow in Asia/Manila>` three times, 20 s apart, and fails if the response is not `200` with `ok == true` and a `slots` array. GitHub emails the repository owner on failure.
- `SITE_URL` is a GitHub repository variable and defaults to `https://ramonvallejera.com`.

**Logs:**
- `console` only, server side. No logging library detected.

## CI/CD & Deployment

**Hosting:**
- Vercel. Project linked in `.vercel/project.json` (project name `ramons-ai-automation-portfolio`).
- Git deploys enabled for `main` only (`vercel.json`, `git.deploymentEnabled.main: true`).
- Production domain: `https://ramonvallejera.com` (`src/lib/site.ts`). Permanent redirect from `ramons-ai-automation-portfolio.vercel.app` to the production domain (`vercel.json`).

**CI Pipeline:**
- GitHub Actions, only one workflow: `.github/workflows/booking-uptime.yml` (uptime check, not a build or test pipeline). Runs on `ubuntu-latest`, `permissions: {}`.
- No build, lint, or type-check CI is configured.

## Environment Configuration

**Required env vars (server-side, no `NEXT_PUBLIC_` prefix):**
- `N8N_BASE_URL` - Origin of the n8n instance. Required for forms, booking, and chat in deployed environments. Defaults to `http://localhost:5678`, which will not work on Vercel.
- `N8N_WEBHOOK_KEY` - Shared secret matching the n8n "Portfolio Webhook Key" credential. Without it, n8n rejects calls with 403.

**Optional env vars:**
- `NEXT_PUBLIC_APP_URL` - Overrides canonical origin (`src/lib/site.ts`). Client-visible by design, since it is used in metadata.
- `BASEPATH` - Next.js `basePath` (`next.config.ts`).

**Non-app variables:**
- `SITE_URL` - GitHub Actions repository variable used by the uptime workflow.
- `VERCEL_OIDC_TOKEN` - Written by the Vercel CLI into `.env.local`. Not read by application code.

**Secrets location:**
- Local: `.env.local` (gitignored). Template: `.env.example` (committed, values blank).
- Production: Vercel project environment variables (inferred from the Vercel-linked project; not verified in this analysis).
- Webhook key also lives in n8n as a Header Auth credential.

## Webhooks & Callbacks

**Incoming:**
- None from third parties. The app exposes its own route handlers (`/api/contact`, `/api/booking`, `/api/availability`, `/api/chat`) that the browser calls. These are not webhooks in the sense of receiving external callbacks.
- The n8n instance receives the forwarded webhook calls listed above.

**Outgoing:**
- Calls from the app to n8n webhooks only (table above).
- No outbound callbacks registered with third-party services.

## Outbound Links (not integrations)

External hosts linked from the source, for reference only: `github.com`, `linkedin.com`, `upwork.com`, `zapier.com`, `make.com`, `n8n.io`, `reactbits.dev`, `shadcnstudio.com`. Also `schema.org` in JSON-LD and `www.w3.org` / `purl.org` namespace strings. None are called at runtime.

---

*Integration audit: 2026-10-21*
