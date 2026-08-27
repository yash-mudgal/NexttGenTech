<div align="center">

# NextGen Software Technologies — Website

**Software Engineering · ERP · CRM · HRMS · AI · SaaS · Cloud**

A static, production-ready marketing site built with React 19, Vite 8,
TypeScript 7, Tailwind CSS v4, Framer Motion and React Three Fiber.

</div>

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ locally on :4173
npm run typecheck  # types only
```

Node 20+ recommended (developed on 22).

---

## What you need to fill in before launch

Everything editable lives in `src/config/` and `src/data/`. Search the codebase
for **`«REPLACE»`** to find every placeholder in one pass. Nothing has been
invented — no fake statistics, clients, awards, certifications, testimonials or
founder credentials — so these are the fields that need real values:

| File | What to set |
| --- | --- |
| `src/config/company.ts` | email, phone, WhatsApp, address, business hours, the five **metrics** (currently `XX+` placeholders) |
| `src/config/links.ts` | **product URLs**, social profiles, contact-form mode |
| `src/config/site.ts` | canonical origin, founding year, Twitter/X handle |
| `src/data/leadership.ts` | founder & co-founder names, roles, bios, expertise, LinkedIn, photos |
| `index.html` | canonical URL + Open Graph / Twitter URLs (must match `site.ts`) |
| `public/robots.txt`, `public/sitemap.xml` | production origin |

### Product links (the important one)

Every product CTA on the site resolves through **one object**:

```ts
// src/config/links.ts
export const productLinks = {
  schoolERP:     "https://school.yourdomain.com",
  hospitalERP:   "https://hospital.yourdomain.com",
  crm:           "https://crm.yourdomain.com",
  hrms:          "https://hrms.yourdomain.com",
  inventory:     "https://inventory.yourdomain.com",
  restaurantERP: "https://restaurant.yourdomain.com",
};
```

No component hardcodes a URL. While a link is still `"#"` the site keeps the
button visible but renders it as an inert, clearly-locked control instead of a
dead link — swap in the real URL and it activates itself. All external links
open with `target="_blank" rel="noopener noreferrer"`.

### Metrics

`company.metrics.items` ships as `XX+` placeholders on purpose. Replace the
`value` strings with real figures and the band animates them in with a count-up.
Set `company.metrics.enabled = false` to hide the band entirely until then.

### Leadership photos

Drop images into `public/assets/leadership/` (4:5 portrait, ideally WebP under
250 KB) and point `src/data/leadership.ts` at them. A missing or failed image
falls back to a designed monogram plate — it never shows a broken image, so the
site is safe to ship before the photos exist. Add directors and technical
leadership by appending entries with `tier: "leadership"`.

### Contact form

Static site, no backend. `contactForm.mode` in `src/config/links.ts`:

- **`"mailto"`** (default) — validates client-side, then opens the visitor's mail
  client with everything pre-filled. The UI says so plainly; it never claims a
  message was sent.
- **`"endpoint"`** — set `endpoint` to a Formspree / Getform / Web3Forms /
  Cloudflare Worker URL and the form POSTs to it natively.

### Share image

`og:image` currently points at the brand lockup. Export a proper 1200 × 630 card
to `public/brand/og-image.png` and update the three references in `index.html`
plus `site.ogImage`.

---

## Project structure

```
src/
├── components/
│   ├── layout/       Section, Footer, JsonLd, SkipLink
│   ├── navigation/   Navbar, MobileMenu
│   ├── ui/           Button, SectionHeader, Tag, Icon, TechGlyph, Logo, Reveal, Aura
│   └── dashboard/    Hand-built enterprise dashboard mockups
├── sections/         One folder per page section (Hero, Solutions, Products, …)
├── data/             products, services, technologies, industries, leadership, ai
├── config/           company, links, site, navigation
├── hooks/            useWebGL, useActiveSection, usePointer, useCountUp, …
├── lib/              cn, accent
├── pages/            Home — the section running order
└── styles/           globals.css — the entire design system
```

`@/` is aliased to `src/`.

**Read [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) before adding anything.**
It documents the colour tokens, typography, CSS primitives, shared components,
hooks, accessibility rules and the 3D policy that keep the site coherent.

---

## Design system in one paragraph

Dark futuristic developer platform. Deep navy/black surfaces, electric blue →
cyan → violet accents, glassmorphism, hairline borders, blueprint grids,
terminal and dashboard chrome. Every custom token is prefixed `ng-`
(`bg-ng-surface`, `text-ng-muted`, `border-ng-line`) and defined in
`src/styles/globals.css` under Tailwind v4's `@theme`. There is no
`tailwind.config.js`. Restraint is a rule: one focal glow per viewport, ambient
auras at 15–25% opacity, body copy in `text-ng-muted`.

---

## Performance & accessibility

Production build, gzipped:

| Chunk | Size | When it loads |
| --- | --- | --- |
| `react` | 57 KB | initial |
| `index` (all sections) | 62 KB | initial |
| `motion` | 47 KB | initial |
| `vendor` + runtime | 10 KB | initial |
| CSS | 22 KB | initial |
| **initial total** | **≈ 198 KB** | |
| `three` | 234 KB | only when the hero's WebGL scene mounts |
| `DigitalCore` | 2.5 KB | with `three` |

- Three.js is code-split into its own chunk and lazy-loaded behind `Suspense`;
  it never blocks first paint, and never downloads at all for reduced-motion
  visitors or devices without WebGL.
- The dashboard mockups use **container queries**, so they lay themselves out
  from their own width rather than the viewport's.
- `useWebGL()` gates every 3D scene and every scene ships a designed static
  fallback for unsupported devices and reduced-motion visitors.
- Particle counts, DPR and scene complexity drop on small screens.
- Fonts are self-hosted variable fonts (no third-party request on load).
- Semantic landmarks, a skip link, keyboard-operable sliders, tabs and menus,
  visible focus rings, `aria-current` on the active nav item, real `alt` text,
  and full `prefers-reduced-motion` support.

---

## Deployment

Static output in `dist/`. Config for the common hosts is committed:

| Host | Config |
| --- | --- |
| **Vercel** | `vercel.json` |
| **Netlify** | `netlify.toml` |
| **Cloudflare Pages** | `public/_headers`, `public/_redirects` — build `npm run build`, output `dist` |
| **GitHub Pages** | Build, publish `dist/`. If serving from a sub-path, set `base` in `vite.config.ts`. |

All of them include the SPA fallback, immutable caching for hashed assets, and
sensible security headers.

---

## Content policy

This site deliberately contains **no** invented statistics, client logos, awards,
certifications, testimonials, partner badges or founder credentials, and names no
AI vendor. AI is described as capability the engineering team works with, never
as a proprietary model. Where a real value wasn't available, you'll find a
clearly-marked placeholder in the config layer rather than a plausible-looking
fabrication in a component. Please keep it that way.
