# Launch Checklist

Everything still outstanding on **nexttgentech.com**, and exactly where to change
each one. Tick items off as you go.

The site is live and working — nothing here is broken. These are values only you
can supply, plus one setup step that needs your accounts.

Last reviewed: 28 August 2026

---

## 🔴 Security — do this first

- [ ] **Change the GitHub password.** It was typed into a chat window in
      plaintext, which means it should be treated as compromised regardless of
      who saw it. <https://github.com/settings/security>
- [ ] **Change the `info@nexttgentech.com` mailbox password.** Same reason.
      Zoho India admin: <https://mailadmin.zoho.in>

Neither password was ever used or written into this repository — that was
verified against the source and the deployed bundle. Change them anyway.

---

## ✅ Enquiry email — done and delivering

Finished 28 August 2026. Enquiries from the live site arrive at
`yash.mudgal@nexttgentech.com` **from `info@nexttgentech.com`**, DKIM-signed,
with Reply-To set to the visitor so hitting reply answers them directly.

Confirmed by real submissions landing in the inbox, not just a 200 response.

- [x] Resend account — workspace `nexttgentech`
- [x] Domain `nexttgentech.com` added and **Verified** (region ap-northeast-1)
- [x] 3 DNS records at GoDaddy, confirmed live against the authoritative
      nameserver `ns59.domaincontrol.com`. Zoho's MX on `@` verified unchanged.
- [x] `RESEND_API_KEY` stored as an encrypted Cloudflare Worker secret
- [x] Worker deployed —
      `nexttgentech-enquiry.nexttgentech-enquiry-worker.workers.dev`
- [x] `workerEndpoint` set in `src/config/links.ts`, built and pushed

### If it ever breaks

Emptying `workerEndpoint` in `src/config/links.ts` is the kill switch — the
form drops straight back to the FormSubmit relay and keeps delivering. That
fallback needs a one-time activation click if it's ever actually used.

Watch the Worker live: `cd worker && npm run tail`
Delivery logs: <https://resend.com/emails>

### 🔑 Rotate the API key if it was ever pasted anywhere

A Resend key can send mail as this domain until revoked. If one is ever pasted
into a chat, a ticket or a commit, delete it at <https://resend.com/api-keys>,
create a replacement, and re-run:

```bash
cd worker && npx wrangler secret put RESEND_API_KEY
```

No redeploy needed — the Worker picks up the new secret immediately.

### The exact DNS records

Read off the Resend domain page on 28 Aug 2026. Add these at **GoDaddy → My
Products → nexttgentech.com → DNS → Add New Record**. TTL: leave default (1 hr).

| # | Type | Name | Value | Priority |
| - | --- | --- | --- | --- |
| 1 | `TXT` | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDVQ4M2VxfMCAoEQNpgioInA6IMeOK9ETI5XhuEAkz3ZyVxKjJAjc8fXqNT3FCT6nn5v+sNNbz+IKj0e5LqNkwpii384eqgMS6dmqknQQs2GwoRBaH4mxKoYhnLT1kHjYU72rIe/f/2vohQSpIpB0VDUS0WmrV6Kh5rlH0Kh1JYGwIDAQAB` | — |
| 2 | `MX` | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` | `10` |
| 3 | `TXT` | `send` | `v=spf1 include:amazonses.com ~all` | — |

> GoDaddy appends the domain automatically. Enter the **Name** exactly as
> written above — if the field then reads `resend._domainkey.nexttgentech.com`,
> that is correct. Don't type the domain a second time.

### 🚨 Do NOT add Resend's fourth record

Resend's page also shows an **"Enable Receiving"** section asking for:

```
MX   @   inbound-smtp.ap-northeast-1.amazonaws.com   priority 9
```

**Skip it.** That record is for receiving mail *through Resend*. Your incoming
mail is handled by **Zoho**, and its MX records live on `@`. Adding this one
would put Amazon at priority 9 — *higher* precedence than Zoho's — and inbound
mail to `info@nexttgentech.com` would start going to a Resend inbox that isn't
being read.

The three records above are all on `resend._domainkey` and `send`. None of them
touch `@`, so none of them affect receiving. **Sending authorisation and inbox
delivery are separate concerns** — that separation is the only reason this is
safe to do on a live domain.

### Cost

**Nothing.** Cloudflare Workers gives 100,000 requests/day free; Resend gives
3,000 emails/month free. Neither needs a card. **Don't add one** — with no
payment method on file nothing can silently start billing you.

While `workerEndpoint` is empty the form falls back to the relay automatically,
so this setup cannot leave the live form broken halfway through.

---

## 🟡 Content only you can supply

No statistics, credentials or client claims were invented anywhere on this site.
That's why these read as placeholders rather than plausible-looking filler.

### Leadership — `src/data/leadership.ts`

Your name and photograph are real; the words under them are not yet.

- [ ] **Founder bio** — line 51. Currently generic placeholder prose.
- [ ] **Founder expertise tags** — line 52. Generic list.
- [ ] **Years of experience** — line 59. Empty string hides the badge.
- [ ] **Founder LinkedIn** — line 60. `"#"` renders an inert locked control.
- [ ] **Founder email** — line 61. Empty hides the mail button.
- [ ] **Co-founder — the whole entry**, lines 63–81. This currently publishes a
      card reading *"Co-Founder Name"*. If there is no co-founder, **delete the
      entry** rather than filling it in — the section handles one person fine.

### Product links — `src/config/links.ts:14-19`

- [ ] School ERP
- [ ] Hospital ERP
- [ ] CRM
- [ ] HRMS
- [ ] Inventory
- [ ] Restaurant ERP

All six are `"#"`, so every product CTA renders as a greyed, non-clicking
control with a padlock. That's deliberate — better than a button that goes
nowhere — but it is the most visible unfinished thing on the site.

### Social links — `src/config/links.ts:26-31`

- [ ] LinkedIn, Instagram, Facebook, GitHub, X, YouTube

Footer icons render muted and inert until set. Delete the ones you don't use.

### Metrics — `src/config/company.ts:66-75`

- [ ] Projects Delivered / Clients Served / Products Built / Industries /
      Years Experience

**All five currently display a literal `XX+` on the live site.** Two options:

- put in real figures, or
- set `enabled: false` and the whole band disappears cleanly

Either is fine. Leaving `XX+` published is the one that isn't.

### Company details — `src/config/company.ts`

- [ ] **Address** — lines 51-55. Currently "Registered Office / City, State".
- [ ] **Business hours** — line 57. Currently a guess: *Mon–Sat 10:00–19:00 IST*.
- [ ] **`sales@` / `careers@`** — lines 42-43. Both deliberately point at
      `info@` because those mailboxes weren't confirmed to exist. Split them out
      only once they're real; pointing at a dead mailbox loses enquiries
      silently.

### Site metadata — `src/config/site.ts`

- [ ] **Founding year** — line 53. Currently `2024`; the footer copyright uses it.
- [ ] **Twitter/X handle** — line 50. Empty omits the meta tag entirely.

---

## 🟢 Cosmetic

- [ ] **Share card** — `src/config/site.ts:48` points at the square brand
      lockup. Links shared on WhatsApp, LinkedIn or Slack will crop it awkwardly.
      Export a 1200 × 630 image to `public/brand/og-image.png`, then update
      `site.ogImage` **and** the three matching tags in `index.html`.

---

## ✅ Done

- Live at <https://nexttgentech.com> with free SSL, auto-renewing
- Custom domain connected at GoDaddy; Zoho mail records left intact
- Auto-deploy on push to `main` via GitHub Actions
- Full 3D site — nine WebGL scenes sharing one canvas
- Founder name and photograph
- Contact email, phone, and WhatsApp (`+91 96229 68107`)
- Enquiry form delivers by email (pending the activation click above)

---

## How to change anything here

Almost every value lives in three files, by design:

| File | Holds |
| --- | --- |
| `src/config/company.ts` | name, contact details, metrics, differentiators, process |
| `src/config/links.ts` | every external URL, and the contact-form transport |
| `src/config/site.ts` | domain, SEO metadata, share image, founding year |

Edit, then:

```bash
npm run build     # catches type errors before they reach the live site
git add -A && git commit -m "..." && git push
```

GitHub Actions rebuilds and redeploys automatically — about 90 seconds.
