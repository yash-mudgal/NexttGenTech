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

## 🟡 Enquiry email — half done

Enquiries **do** reach `yash.mudgal@nexttgentech.com` today, but they arrive
*from FormSubmit*, a third-party relay, and only once activated.

### Right now

- [ ] **Activate FormSubmit.** Send one enquiry from
      <https://nexttgentech.com/#contact>, then click the confirmation link
      FormSubmit emails to `yash.mudgal@nexttgentech.com`.
      **Until this is clicked, nothing is delivered.** One time only.

### To send as `info@nexttgentech.com` instead

The Cloudflare Worker in [`worker/`](worker/README.md) is written, tested and
committed. It just needs your accounts. Full walkthrough is in that README.

- [ ] Sign up at <https://resend.com> — free, no card
- [ ] Add the domain `nexttgentech.com`, put the 3 records it shows into GoDaddy
      DNS. ⚠️ **Do not touch the existing MX records on `@`** — those route your
      incoming Zoho mail. Resend's records sit on a `send` subdomain.
- [ ] Create an API key with *Sending access*
- [ ] Deploy:
      ```bash
      cd worker
      npm install
      npx wrangler login
      npx wrangler secret put RESEND_API_KEY
      npm run deploy
      ```
- [ ] Paste the printed URL into `workerEndpoint` — `src/config/links.ts:70`
- [ ] Commit and push. Done.

**Cost: nothing.** Cloudflare Workers gives 100,000 requests/day free; Resend
gives 3,000 emails/month free. Neither needs a card. **Don't add one** — with no
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
