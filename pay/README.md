# astra-pay — Bankful HPP payment service

Tiny zero-dependency Node server that signs Bankful Hosted Payment Page requests
and redirects customers to Bankful's secure page. The merchant password (HMAC salt)
lives ONLY in env vars here — never in the static site.

## Endpoints
- `GET /checkout?package=consultation|starter|growth|scale|vip` — branded checkout form
- `GET /support` (alias `/donate`) — unlisted flexible-amount page: preset buttons,
  custom amount ($1–$25,000, validated server-side) and an optional note that becomes
  the Bankful cart name. Deliberately not linked from the site or any menu; share the
  URL directly. `noindex` is set on every page here.
- `GET /checkout?package=custom&amount=X&note=Y` — checkout form for a flexible amount
- `POST /checkout` — signs request, calls Bankful, 302 → hosted payment page
- `GET /payment/success|failed|cancel|pending` — result pages Bankful redirects back to
- `POST /payment/callback` — Bankful server-to-server webhook (logged to stdout)
- `GET /health` — healthcheck

## Coolify setup (new app, same repo)
1. Coolify → New Resource → Public Repository → this repo, branch `main`
2. Build pack: Dockerfile, **Base Directory: `/pay`**, Ports Exposes: **3000**
3. Domain: `https://pay.astra-meta.com` (add DNS A record `pay` → 187.124.184.80 in Hostinger)
4. Environment variables:
   - `BANKFUL_USERNAME` — merchant username (sandbox default: testsandbox8@sanbox.com)
   - `BANKFUL_SALT` — merchant password/salt (sandbox default baked in)
   - `BANKFUL_API_URL` — production: `https://api.paybybankful.com/front-calls/go-in/hosted-page-pay`
     (default is sandbox `api-dev1`)
   - `PUBLIC_BASE_URL` — `https://pay.astra-meta.com`
   - `SITE_URL` — `https://astra-meta.com`

Without env vars the service runs in SANDBOX mode (test credentials, no real charges).

## Going live checklist
1. Bankful underwriting approved → production username/password received
2. Set env vars above in Coolify → redeploy
3. Point the site's package CTA buttons to `https://pay.astra-meta.com/checkout?package=...`
4. Test a real low-amount transaction, verify callback log + merchant portal
