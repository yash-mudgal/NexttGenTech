# Enquiry Worker

Sends the website's contact form as **info@nexttgentech.com**.

The website is a static build on GitHub Pages. A static site has nowhere to keep
a secret — anything in the JS bundle is readable by every visitor — so it can
never hold an API key or SMTP password. This Worker is that missing place. It is
about 250 lines, runs on Cloudflare's free tier, and needs no maintenance.

**Nothing here is part of the website build.** It is deployed separately.

```
Browser  ──POST JSON──▶  Cloudflare Worker  ──API + secret key──▶  Resend  ──▶  your inbox
                         (validates, throttles)                    (DKIM-signed as our domain)
```

---

## Cost

Free, and neither service asks for a card on the free tier.

| | Free allowance | Realistic use |
| --- | --- | --- |
| Cloudflare Workers | 100,000 requests/day | a handful |
| Resend | 3,000 emails/month (100/day) | a handful |

**Do not add a payment method to either account.** With no card on file nothing
can silently start billing you — if a limit were ever hit, sending pauses and
you get an email, not an invoice.

---

## Setup

Roughly 20 minutes, most of it waiting for DNS.

### 1. Create a Resend account

Sign up at <https://resend.com> with `yash.mudgal@nexttgentech.com`. Free plan,
no card.

### 2. Verify the domain

In Resend: **Domains → Add Domain → `nexttgentech.com`**.

Resend shows three DNS records to add. Add them at GoDaddy under
**My Products → nexttgentech.com → DNS → Add New Record**:

| Type | Name | Purpose |
| --- | --- | --- |
| TXT | `resend._domainkey` (or as shown) | DKIM — cryptographically signs mail as us |
| TXT | `send` (or `@`) | SPF — authorises Resend to send for the domain |
| MX | `send` | bounce handling |

> ⚠️ **Do not touch the existing MX records on `@`.** Those route incoming mail
> to Zoho. The record above is on the `send` subdomain and does not collide with
> them. Sending authorisation and inbox delivery are separate concerns — adding
> these does not affect receiving mail.
>
> GoDaddy sometimes appends the domain automatically. If it offers
> `resend._domainkey.nexttgentech.com`, that is correct — don't type the domain
> twice.

Click **Verify** in Resend. Usually minutes; allow up to an hour.

### 3. Create an API key

Resend → **API Keys → Create**, permission **Sending access**. Copy it now — it
is shown once. It looks like `re_...`.

### 4. Deploy the Worker

```bash
cd worker
npm install
npx wrangler login          # opens a browser, authorises this machine
npx wrangler secret put RESEND_API_KEY    # paste the key when prompted
npm run deploy
```

`wrangler login` needs a Cloudflare account — free, also no card.

Deploy prints a URL like:

```
https://nexttgentech-enquiry.<your-subdomain>.workers.dev
```

The key is stored encrypted at Cloudflare. It is never written to this repo —
`.dev.vars` is gitignored, and `wrangler secret` does not touch any file.

### 5. Point the website at it

In `src/config/links.ts`, paste that URL:

```ts
workerEndpoint: "https://nexttgentech-enquiry.<your-subdomain>.workers.dev",
```

Commit and push. GitHub Actions rebuilds and the form switches over.

**Until that line is filled in, the form keeps using the FormSubmit relay** — so
the site is never broken mid-setup.

### 6. Test

Send a real enquiry from <https://nexttgentech.com/#contact>. It should appear
in `yash.mudgal@nexttgentech.com` **from `info@nexttgentech.com`**, and hitting
reply should answer the visitor.

If nothing arrives, watch the Worker's live log:

```bash
cd worker && npm run tail
```

---

## Configuration

Non-secret values live in `wrangler.toml` under `[vars]`:

| Variable | Meaning |
| --- | --- |
| `TO_EMAIL` | inbox that receives enquiries |
| `FROM_EMAIL` | sender — the domain **must** be verified in Resend |
| `ALLOWED_ORIGINS` | comma-separated sites allowed to POST here |

Changing any of them means re-running `npm run deploy`.

The secret `RESEND_API_KEY` is deliberately *not* in that file.

---

## What the Worker refuses

Client-side validation is a convenience for real visitors. Anyone can `curl`
this URL directly, so every rule is enforced here as well:

| Condition | Response |
| --- | --- |
| Origin not in `ALLOWED_ORIGINS` | `403` |
| More than 4 posts/minute from one IP | `429` |
| Body over 16 KB | `413` |
| Unparseable body | `400` |
| Missing name, message, or invalid email | `422` |
| Honeypot field filled | `200` — silently discarded, so a bot learns nothing |

Visitor input is HTML-escaped before it enters the email, and newlines are
stripped from anything that reaches a header position. The provider's own error
text is logged but never returned to the caller — it can echo account details
back to whoever is probing.

### On the rate limit

The throttle is a `Map` inside one Worker isolate. Cloudflare runs many isolates
and recycles them, so a flood spread across data centres will get past it. It
stops the ordinary case: a stuck retry loop, someone leaning on the button, a
naive script.

If real abuse ever appears, add a WAF rate-limiting rule on this route in the
Cloudflare dashboard, or put a Turnstile token in front of it. Both are free;
neither is worth the setup cost until it's needed.

---

## Local development

```bash
cd worker
cp .dev.vars.example .dev.vars   # put a real key in it to send for real
npm run dev                      # http://127.0.0.1:8787
```

`GET /` returns `{"ok":true,"service":"nexttgentech-enquiry"}` — a quick way to
confirm it's alive, locally or in production.

```bash
curl -X POST http://127.0.0.1:8787 \
  -H 'Origin: http://localhost:5173' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"you@example.com","message":"Hello"}'
```

---

## Reverting

Set `workerEndpoint: ""` in `src/config/links.ts` and the site falls straight
back to the FormSubmit relay. Nothing else needs undoing.
