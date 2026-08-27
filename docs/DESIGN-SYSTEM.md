# NextGen — Design System & Build Conventions

Everything in `src/` is built on the tokens and primitives below. Read this
before adding a section; it is the contract that keeps 20+ sections looking
like one website.

---

## 1. Stack

| Concern    | Choice                                              |
| ---------- | --------------------------------------------------- |
| Build      | Vite 8 + React 19 + TypeScript 7 (`strict`)         |
| Styling    | Tailwind CSS v4 — **CSS-first**, tokens in `src/styles/globals.css` under `@theme`. There is no `tailwind.config.js`. |
| Motion     | `framer-motion` (import from `"framer-motion"`)     |
| 3D         | `three` + `@react-three/fiber` + `@react-three/drei` |
| Icons      | `lucide-react`                                       |
| Alias      | `@/…` → `src/…`                                      |

**Do not add dependencies.** Everything needed is installed.

---

## 2. Colour tokens

All custom tokens are prefixed `ng-` so they never collide with Tailwind's own
palette. Use them as normal Tailwind colours: `bg-ng-surface`, `text-ng-muted`,
`border-ng-line`, `ring-ng-brand/40`, `from-ng-brand to-ng-cyan`.

**Surfaces** — `ng-void` `#010206` · `ng-ink` `#04060c` (page) · `ng-surface`
`#080d18` · `ng-surface2` `#0d1424` · `ng-surface3` `#131b2e` ·
`ng-line` `#1b2440` (hairlines) · `ng-line2` `#26314f`

**Brand** — `ng-brand` `#2563eb` · `ng-brand-deep` `#1a45d8` ·
`ng-brand-soft` `#5b8bff` · `ng-cyan` `#22d3ee` · `ng-cyan-deep` `#0ea5c9` ·
`ng-violet` `#8b5cf6` · `ng-violet-deep` `#6d3fe0`

**Accents** — `ng-emerald` `#34d399` · `ng-amber` `#fbbf24` · `ng-rose` `#fb7185`

**Text** — `ng-fg` `#e9eefb` (primary) · `ng-fg2` `#b9c4dc` (secondary) ·
`ng-muted` `#7e8ca8` (body/caption) · `ng-faint` `#4e5a75` (dividers)

> Never hardcode a hex in a component. If you need a raw colour for SVG or
> canvas, take it from `accentOf()` in `@/lib/accent` or a `tint` field in the
> data layer.

### Restraint

Dark, technical, premium — **not** a neon arcade. Rules:

- At most **one** focal glow per viewport. Ambient auras stay at 15–25% opacity.
- Borders are hairlines (`border-ng-line`), never bright.
- Body copy is `text-ng-muted`; reserve `text-ng-fg` for headings and key numbers.
- Gradients go blue → cyan (brand) or blue → violet (AI). Never rainbow.

---

## 3. Type

`font-display` (Sora) for headings · `font-sans` (Inter) for body ·
`font-mono` (JetBrains Mono) for code, terminals, labels, numeric readouts.

Section headings use the fluid clamp already baked into `SectionHeader`.
For custom headings: `text-[clamp(1.5rem,1rem+2vw,2.5rem)]`.

---

## 4. CSS utility classes (defined in `globals.css`)

| Class | Use |
| --- | --- |
| `.ng-glass` | Frosted panel — navbar, floating cards, dashboard chrome |
| `.ng-card` | Standard card; gradient hairline fades in on hover/focus-within |
| `.ng-gradient-text` | Brand gradient applied to text |
| `.ng-grid` / `.ng-grid-fine` | Blueprint grid backdrop (64px / 22px) |
| `.ng-fade-edges` / `.ng-fade-x` / `.ng-fade-b` | Mask a decorative layer at its edges |
| `.ng-eyebrow` | Small uppercase mono label |
| `.ng-tag` | Feature/module pill |
| `.ng-no-scrollbar` | Hide scrollbar on a scroll rail |
| `.ng-aura-brand` / `-cyan` / `-violet` | Radial ambient light |
| `.ng-perspective` / `.ng-preserve-3d` | 3D transform context |
| `.ng-shimmer-bg` | Sweeping highlight gradient |

**Animations** (already keyframed): `animate-ng-marquee`, `animate-ng-marquee-slow`,
`animate-ng-float`, `animate-ng-pulse-ring`, `animate-ng-dash`,
`animate-ng-shimmer`, `animate-ng-caret`, `animate-ng-scan`,
`animate-ng-spin-slow`, `animate-ng-orbit`.

**Radii**: `rounded-ng-sm` `rounded-ng` `rounded-ng-card` `rounded-ng-lg` `rounded-ng-xl`
**Shadows**: `shadow-ng-card` `shadow-ng-lift` `shadow-ng-glow` `shadow-ng-glow-cyan`

---

## 5. Shared components

```ts
import Section          from "@/components/layout/Section";       // page section wrapper
import SectionHeader    from "@/components/ui/SectionHeader";     // eyebrow + title + description
import Button           from "@/components/ui/Button";            // primary|secondary|outline|ghost
import Tag              from "@/components/ui/Tag";               // pill (style, wrap)
import Icon             from "@/components/ui/Icon";              // <Icon name="rocket" />
import TechGlyph        from "@/components/ui/TechGlyph";         // <TechGlyph name="react" />
import Logo, { LogoMark } from "@/components/ui/Logo";
import { SocialIcon, SocialRow, socialLabels } from "@/components/ui/SocialIcon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Aura, GridBackdrop }          from "@/components/ui/Aura";
```

**Social marks** live in `SocialIcon.tsx` — lucide-react v1 removed every brand
icon, so LinkedIn/Instagram/Facebook/GitHub/X/YouTube are drawn there. `SocialRow`
renders the whole row and handles unconfigured URLs. Don't re-draw them locally.

### `Section`

```tsx
<Section
  id="products"                 // only when the navbar links to it
  width="default"               // narrow | default | wide | full
  spacing="md"                  // sm | md | lg
  divider                       // hairline along the top edge
  backdrop={<><GridBackdrop /><Aura tone="cyan" className="-top-40 right-0" /></>}
>
  …
</Section>
```

`backdrop` is rendered `aria-hidden`, `pointer-events-none`, `-z-10`, clipped.

A `Section` names its own landmark: the first `SectionHeader` inside claims a
generated id for its heading and the section picks it up as `aria-labelledby`.
Nothing to wire at the call site. Pass `label` instead only for a section with
no visible heading, or `aria-labelledby` to point at your own element.

### `SectionHeader`

```tsx
<SectionHeader
  eyebrow="03 — Products"
  title="Technology Built Around"
  highlight="Your Business"      // rendered in the brand gradient
  description="One sentence of context."
  align="center"                 // or "left"
  aside={<Button …/>}            // right-hand slot, left-aligned headers only
/>
```

### `Button`

```tsx
<Button variant="primary" size="lg" arrow="right" href="#products">Explore</Button>
<Button href={productLinks.crm} external requireConfigured arrow="up">View Product</Button>
```

`requireConfigured` renders an inert, locked control when the URL is still `"#"`.

### `Reveal` / `Stagger`

```tsx
<Reveal direction="up" delay={0.1}>…</Reveal>

<Stagger className="grid gap-6 md:grid-cols-3">
  {items.map((i) => <StaggerItem key={i.id}>…</StaggerItem>)}
</Stagger>
```

Framer Motion handles `prefers-reduced-motion` internally — do not add your own
media query for entrance animations.

### Hooks — `@/hooks`

`useWebGL()` · `useIsMobile()` · `useIsTablet()` · `useIsTouch()` ·
`usePrefersReducedMotion()` · `useActiveSection(ids)` · `useScrolled(px)` ·
`usePointer(ref?)` · `useCountUp(value)`

---

## 6. Data layer — never hardcode content

| Import | Contents |
| --- | --- |
| `@/config/company` | name, tagline, contact, metrics, differentiators, process |
| `@/config/links` | `productLinks`, `socialLinks`, `contactForm`, `sectionIds`, `isConfigured()`, `externalLinkProps` |
| `@/config/site` | SEO + `organizationJsonLd()` |
| `@/config/navigation` | `navItems`, `navSectionIds`, `navCta` |
| `@/data/products` | 6 products: modules, tags, accent, `dashboard` spec, `link` key |
| `@/data/services` | 14 services + `serviceGroups` |
| `@/data/technologies` | `technologies`, `techCategories`, `marqueeTech`, `databases`, `cloudCapabilities` |
| `@/data/industries` | 11 industries, each mapped to product ids |
| `@/data/leadership` | founder/co-founder placeholders + `monogram()` |
| `@/data/ai` | `aiCapabilities`, `aiNodes`, `aiUseCases`, `aiWorkflow`, `aiEngineeringPractices` |
| `@/lib/accent` | `accentOf(accent)` → Tailwind class bundle + raw hex |
| `@/lib/cn` | `cn()` class joiner |

Product URLs live **only** in `src/config/links.ts`. A product's `link` field is
a *key* into `productLinks` — resolve it as `productLinks[product.link]`.

---

## 7. Accessibility (non-negotiable)

- One `<h1>` on the page — it belongs to the Hero. Sections use `<h2>`.
- Decorative layers: `aria-hidden="true"` **and** `pointer-events-none`.
- Every interactive element is reachable and operable by keyboard, with a
  visible focus ring (the global `:focus-visible` style handles most cases).
- Icon-only buttons need `aria-label`. Images need real `alt` (or `alt=""` when
  decorative).
- Sliders/tabs: arrow-key navigation, `aria-selected` / `aria-controls`, and
  `role="tablist"` where the pattern applies.
- Colour is never the only signal — pair it with text or an icon.

---

## 8. Responsive

Must be correct at 360 · 390 · 480 · 768 · 1024 · 1280 · 1440 · 1920 px.

- **No horizontal overflow, ever.** Wide content scrolls inside its own
  `overflow-x-auto` rail, not the page.
- Mobile: stack grids, convert sliders to swipe rails, reduce particle counts,
  drop or simplify 3D (`useWebGL().lowPower`, `useIsMobile()`).
- Touch targets ≥ 44 px.
- Long module lists get a `max-h` + scroll rail on small screens rather than an
  endless column.

---

## 9. 3D rules

- Never import `three` / `@react-three/fiber` at module top level in a section.
  Wrap the scene in `React.lazy()` + `<Suspense>` so the WebGL chunk stays out
  of the initial bundle.
- Always gate on `useWebGL()`; render a designed static fallback (SVG/CSS) when
  `!enabled`. The fallback is part of the deliverable, not an afterthought.
- `dpr={[1, lowPower ? 1.25 : 2]}`, `frameloop="demand"` where nothing animates
  continuously, and always pass `gl={{ antialias: !lowPower, powerPreference: "high-performance" }}`.
- Pause rendering when off-screen.

---

## 10. Content rules

No lorem ipsum. No invented statistics, clients, awards, certifications,
testimonials or founder credentials. No named AI vendors. Where information
isn't available, use a clearly-marked editable placeholder in the config layer —
never a plausible-looking fabrication in a component.

---

## 11. Gotchas that have already bitten us

Each of these was a real bug found in the browser, not a hypothetical.

**Tailwind class order does not decide the winner.** Two utilities in the same
group have identical specificity, so *stylesheet* order wins, not the order you
wrote them. `<Button className="hidden md:inline-flex">` lost to `Button`'s own
base `inline-flex` — the mobile navbar CTA stayed visible and pushed the menu
toggle off-screen. Put a responsive `display` on a **wrapper element**, never in
the `className` of a component that already sets its own display.

**`min-w-*` on a flex item is not a width.** A `shrink-0` flex child with only a
min-width is still sized by its content. One descendant with a large max-content
width inflated a product slide to **1,075,678px** and froze the renderer. Give
scroll-rail items a real `w-*`.

**Viewport breakpoints lie inside a narrow container.** A component rendered in
an 830px slide still sees `lg:` at a 1280px viewport. Use Tailwind v4 container
queries (`@container` + `@sm:`/`@md:`/`@lg:`) for anything whose width is set by
its parent rather than the page — the dashboard mockups do this.

**Never depend on `scrollTo({ behavior: "smooth" })` completing.** Some browsers
and settings decline to animate; the scroll then never happens at all and the
control is silently inert. Always verify and fall back to `"auto"`.

**drei's `<Text>` cannot parse a variable font.** troika never resolves, the
Suspense boundary stays suspended forever, React hides the subtree with
`display: none !important`, and every visitor silently gets the fallback. Use an
`<Html>` label instead.

**A default size in a `cn()` can override the caller's.** `TechGlyph` emitted
both `size-6` and the caller's `size-5`; the default won. It now only applies its
default when the caller hasn't sized it.

**`Stagger`/`Reveal` use `amount: "some"`.** A fractional threshold can never be
satisfied by a container taller than the viewport, which leaves a long list
permanently at `opacity: 0` on a phone. Don't change it back to a ratio.

---

## 12. Definition of done for a section

1. `npx tsc -b` passes (`strict`, `noUnusedLocals`, `noUnusedParameters`).
2. No console errors or warnings at runtime.
3. Renders correctly at 360 px and 1920 px with no horizontal scroll.
4. Keyboard-navigable; decorative layers hidden from assistive tech.
5. All content read from the data/config layer.
6. Only files you own were modified.
