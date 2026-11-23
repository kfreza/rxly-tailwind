# Rxly Landing Page — Brief & Plan

_Created 2026-11-23. Source of truth for building the rxly.net landing page from Figma._

## Sources

- **Figma:** https://www.figma.com/design/M3t02t8WNRY9EdIhrXc9Rn/Rxly?node-id=249-22153&m=dev
  - fileKey: `M3t02t8WNRY9EdIhrXc9Rn`, single page `0:1`, **design frame `249:22153`**
- **Live site:** https://rxly.net/

## Figma file structure

| Node | Name | Status | Notes |
|---|---|---|---|
| `249:22153` | Rxly (1920×8582) | **Visible — current design (build from this)** | Has real, editable layers (confirmed: e.g. footer nav `249:22256` → links `249:22257`–`249:22268`). The Figma MCP doesn't list children when asked for the whole frame, so query **one section at a time**: select a section in Figma, or share its `node-id` link. |
| `382:45` | CTA (1820×611) | Visible | Current CTA block, has real layers. |
| `228:16138` | Rxly (1920×8035) | Hidden | Previous version **with real layers** — use for measurements. |
| `4:111` | Rxly (1920×7882) | Hidden | Older version. |
| `343:7187` | Group 97 | Hidden | Loose illustration parts (animated SVG scenes, card art). |
| `1:5`…`4:527` | Rectangles 1–8 + "Plus Jakarta Sans" | Visible | Colour swatches / type specimen. |

### Section map of the current frame `249:22153` (36 direct children, mapped 2026-11-23)

| Section | Node IDs | Built in |
|---|---|---|
| Nav | `345:6` (logo `332:7167`) | `src/sections/nav.html` |
| Hero | pill `249:22466`, title `249:22470`, underline `249:22469`, lead `249:22468`, buttons `249:22473` / `249:22477`, trust `249:22471`, app figure + floating cards `269:3641`, waves `249:22254`, glow `345:7` | `hero.html` |
| What it does | `324:7138` (scenes: queue `249:22776`, patient page `249:22974`, brand `249:23845`) | `features.html`, `src/scenes/*` |
| The screens | band `249:22253`, arc `249:22440`, heading `249:22517`–`22520`, tabs `249:22523`, panel `301:4937`, copy card `301:4939`, browser `301:4938` / `301:4940` / `301:4941`, screenshot `249:22568` | `screens.html` |
| How it works | `324:7141` | `how.html` |
| Built for Bangladesh | `249:22185` (globe ellipse `249:22196` has a **video fill**) | `bangladesh.html` |
| Pricing | `349:11` | `pricing.html` |
| FAQ | `249:22276`, glow `249:22182`, dome `364:2` | `faq.html` |
| CTA | `249:22319` | `cta.html` |
| Footer | logo `339:7179`, tagline `249:22269`, links `249:22256` | `footer.html` |

Tip: the Figma MCP can't list the whole 8582px frame at once. A read-only `use_figma` script listing `figma.getNodeById('249:22153').children` works.

### Useful sub-nodes from the older frame (`228:16138` / Group 97), for reference only
- Hero: menubar `228:16519`, headline `228:16548`, app screenshot figure `228:16652`, floating cards `228:16662`, `228:16673`
- Feature illustrations: `228:16788` (queue, "01 712000112"), `228:16734` ("02 1"), `228:16904` ("03 1"), cards `249:21534`, `249:23789`, `249:23787`
- Animated scenes: `185:7279` (patient message link), `193:7634` (fee ledger), `193:8011` (custom logo / branded page), `301:4942` (day ledger)
- Screens section: tabs `228:16688`, front desk panel `228:16700` / `228:16966`, screenshot `228:16723`
- How it works: `228:17017` (label), `243:18830` (stacked step cards)
- Built for Bangladesh: `228:16265`
- Pricing cards: `228:16423`, `228:16450`, `228:16477`
- FAQ: `228:16196`; CTA: `228:16239` / `382:45`

## Page sections (in order)

1. **Nav**: logo, Product · Screens · How it works · Pricing · FAQ, 🌐 English language switch, Log in, **Start free →**
2. **Hero**:
   - Pill: "New: video consults in the same queue"
   - Headline: "Run your clinic from one **screen**" (blue word with a hand-drawn underline)
   - Subline: "Serials by text, a live queue, a prescription pad that knows every medicine, video consults and the cash: practice software for chambers and clinics in Bangladesh."
   - Buttons: Start free / See the screen
   - Trust line: "14 days free · No card · Bangla and English · Nothing to install"
   - Browser-frame app screenshot (Front desk) with floating cards "Serial 15 booked" and "Prescription sent"
3. **What it does**: "Everything a chamber does in a day, **in one place**". Six cards in a bento grid:
   - A queue that runs itself
   - A pad that knows every medicine
   - Video consults, paid before they start (tall card)
   - The patient's own page
   - Cash, expenses and the doctor's share
   - Your name on the door & on the address bar

   Some cards have gradient glow borders (pink/purple, cyan).
4. **The screens** (grey band): "Four screens. **No training day.**"
   - Tabs: Front desk / Doctor's room / Prescription pad / Patient's phone
   - Each panel: title, description, 3-item checklist, and a screenshot on a striped gradient background
5. **How it works**: "Running by this **evening**". Three tilted, overlapping step cards (Step 01 Add your doctor…, Step 02 Share the link, Step 03 Call the next patient) with a live-queue mini UI.
6. **Built for Bangladesh**: "Made for how clinics here **actually work**". Six tiles arranged around a central globe with connector lines:
   - Bangla and English
   - Video fees up front
   - Fits the phone you have
   - Texts that reach phones
   - Pay in taka
   - Our records stay yours
7. **Pricing**: "One price per clinic. Every feature, **every plan**."
   - Monthly/Yearly toggle ("Save up to 17%")
   - Three plans: Solo ৳1,000 / Clinic ৳2,500 (highlighted, blue button) / Hospital ৳5,000. Yearly price is 10× the monthly.
8. **FAQ**: "Before you **start**"; 3D hexagon globe on the left; seven accordion questions:
   - How do patients get a serial?
   - What do I need to buy?
   - Does it work in Bangla?
   - How do the texts work?
   - Can I see patients by video?
   - How do I pay for the subscription?
   - Can I leave and take my records with me?
9. **CTA**: blue rounded panel with a 3D hexagon background: "Open your clinic on Rxly this **evening**". Button: Start free.
10. **Footer**: logo, "Practice software for Bangladesh", Product · Screens · How it works · Pricing · FAQ · Log in.

## Design tokens

| Token | Value | Source |
|---|---|---|
| Background | `#FFFFFF` | Figma variable |
| Text | `#111111` | Figma variable |
| Border ("Strock color") | `#E5EDF5` | Figma variable |
| Card shadow | `0 12.8px 32px #1D4D3E0D` | Figma variable |
| Primary blue | ~`#1068FF` | Estimated from the screenshot. Confirm with get_design_context. |
| Dark button | `#111111` | Screenshot |
| Section band grey | ~`#F3F5F9` | Screenshot (estimate) |
| Font (Latin) | Plus Jakarta Sans (confirmed) | Figma type specimen |
| Font (Bangla) | Noto Sans Bengali (confirmed) | Team decision |

- Content width 1440 on a 1920 canvas; full-bleed bands are 1820.
- Signature motif: a key word in primary blue with a hand-drawn underline (SVG vector) under it.

## Live site (rxly.net) findings

- **Stack:** Laravel + Inertia + React (Laravel React starter kit): shadcn/ui, Lucide icons, Laravel Wayfinder, i18n. The landing page is the Inertia `welcome` component and is client-rendered.
- **Font on live site:** Inter (the design uses Plus Jakarta Sans).
- **Props the server already sends:**
  ```json
  {
    "locale": "en",
    "languages": [{"code":"en","name":"English"},{"code":"bn","name":"বাংলা"}],
    "plans": [
      {"name":"Solo","description":"One doctor's chamber","doctor_limit":1,"monthly_price":1000,"yearly_price":10000},
      {"name":"Clinic","description":"Up to five doctors under one roof","doctor_limit":5,"monthly_price":2500,"yearly_price":25000},
      {"name":"Hospital","description":"As many doctors as you have","doctor_limit":null,"monthly_price":5000,"yearly_price":50000}
    ],
    "trialDays": 14,
    "medicineBrands": "21714",
    "mainSiteUrl": "https://rxly.net"
  }
  ```
- **SEO gaps:**
  - Title is only "Rxly"; no meta description, OG tags or JSON-LD.
  - `/sitemap.xml` returns 404.
  - `robots.txt` allows everything but has no sitemap line.

## Build plan

The detailed task list is in [PLAN.md](PLAN.md).

**Phase 0: assets and tokens**
- Export 3D renders (doctor/video scene, cash stack, prescription printer, hexagon globe, CTA hexagons, globe) as WebP at 2×.
- Export animated scenes as SVG and animate them with CSS, respecting `prefers-reduced-motion`.
- Set up Tailwind v4 `@theme` tokens (colours, radius, shadow, fonts) and a reusable underline-highlight component.
- Read exact values per section from `249:22153` with `get_design_context`.

**Phase 1: shared pieces**
- Button (primary / outline / dark), section label pill, `SectionHeading` (with the highlighted word)
- Card, gradient-border card, checklist item

**Phase 2: sections** in page order: Nav (+ mobile menu), Hero, Features bento, Screens tabs, How it works, Built for Bangladesh, Pricing (data-driven toggle), FAQ accordion, CTA, Footer.

**Phase 3: responsive.** The design only exists at desktop width, so tablet and mobile layouts are new work:
- Tilted step cards become a vertical stack.
- Globe layout becomes a single column.
- The bento grid collapses.

**Phase 4: Bangla/English, SEO, accessibility**
- All copy in translation keys; Bangla text uses Noto Sans Bengali.
- Meta description and OG tags; `SoftwareApplication` and `FAQPage` JSON-LD.
- Keyboard-accessible tabs and accordion.

**Phase 5: visual check.** Compare each section side by side with Figma at 1440 and 1920.

_This is the summary. The step-by-step checklist is in PLAN.md._

## Risks

- The Figma MCP can't list the whole 8582px frame at once, so each section's node ID has to be found first (Figma selection or `node-id` link).
- Some 3D illustrations may only exist as flattened images, which limits export quality.
- Placeholder copy is reused across the design (e.g. "Serials by text, a live queue…" appears many times), so final text needs confirming.
- Only the Front desk screenshot exists in Figma. The team will supply all four tab screenshots from the dashboard.

## Decisions (confirmed 2026-11-23)

1. **Build target:** a standalone HTML + Tailwind v4 site in this folder. Each section stays a self-contained block so it can later be ported to the Laravel/Inertia React app.
2. **Fonts:** Plus Jakarta Sans for English (as in Figma); **Noto Sans Bengali** for Bangla.
3. **Screens tabs:** the team will provide screenshots from the Rxly dashboard for all four tabs. Until then the Front desk image is used as a placeholder.
4. **Figma frame `249:22153`:** resolved. The frame has real layers, so exact values are read section by section with `get_design_context`.

## Build status (2026-11-23)

The page is built and checked. See [PLAN.md](PLAN.md) for the phase checklist, scripts and results (Lighthouse mobile 99/100/100/100, desktop 100/100/100/100; 42/42 interaction checks).

### Decisions made during the build
- **Screens tab screenshots** come from the live site (`rxly.net/images/landing/desk.jpg`, `room.jpg`, `pad.jpg`, `book.png`, `status.png`). The copy for the Doctor's room, Prescription pad and Patient's phone tabs also comes from the live site, because Figma only has the Front desk tab.
- **FAQ answers** come from the live site (Figma only shows the first answer).
- **Bangla:** 107 strings reuse the official Rxly app translations (`design/i18n/bn-official.json`, read from the live app's Bangla locale); 62 page-specific strings were written for this page (`src/i18n/bn.manual.json`).
- **Figma animations** (3 scenes in "What it does") are reproduced from Figma's exported keyframes (`design/motion/features.json` → `src/styles/motion.css`). They are not render-blocking and are disabled for reduced-motion users.
- **Globe video** in "Built for Bangladesh": Figma uses a video fill that the Figma API can't export. An animated SVG stand-in (`public/images/bd/globe.svg`) matches the frame.
- **Buttons** use Plus Jakarta Sans Medium (Figma uses Inter Medium for button labels only; unified to the brand font).
- **Floating hero cards and the FAQ dome** use Figma's exact offsets from 1440px up, and smaller offsets between 1200 and 1439 so they aren't clipped.

### Needs review / confirmation
| Item | Where | Note |
|---|---|---|
| Globe video file | `bangladesh.html`, `public/images/bd/globe.svg` | Send the original MP4/WebM to replace the stand-in |
| App URLs | nav, hero, pricing, CTA | Currently `https://app.rxly.net/login` and `https://app.rxly.net/register?plan=…` |
| Bangla, 62 strings | `src/i18n/bn.manual.json` | Headings re-ordered for Bangla word order; prices in Bangla numerals |
| "How it works" demo copy | `how.html` | Figma placeholders kept as designed: `$80`, `care.clario.health/maya`, "Dr. Maya Khan", "Amelia Brown" |
| "1 of 3" / "Active" demo labels | `how.html` | Kept from Figma |
