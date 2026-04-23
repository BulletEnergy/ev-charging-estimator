# Rendering Reference Analysis: Tesla Supercharger for Business → BulletEV Portal

**Phase A Deliverable** | Prepared: 2026-04-23 | Scope: Read-only visual & structural analysis

---

## 1. Section Order (Tesla Reference)

The Tesla Supercharger for Business page follows a canonical enterprise sales narrative:

1. **Navigation header** — Sticky, dark, with mega-menu access to product lines
2. **Hero section** — Full-bleed hero with headline, product hero image, and "Request a Quote" CTA
3. **"Built For Business Owners" section** — Hero image block + supporting business-benefit copy and secondary CTA
4. **"Designed For Drivers" section** — Full-bleed hero image + user-centric value messaging
5. **"How It Works" section** — 5-step process illustrated with large hero images (numbered cards with minimal text)
6. **"All The Tech" section** — Product specification breakdown + feature callouts in a 2-column grid
7. **Network/availability section** — Charging map + coverage statistics
8. **Incentives/financing section** — Federal/state rebate messaging + call to action
9. **Social proof / testimonials** — Optional: partner logos or customer outcomes
10. **End CTA section** — Final "Request a Quote" with form or contact link + footer

**BulletEV structure (current):** Hero → Value → Equipment → SiteMap → ROI Calculator → Investment → Timeline → Interactive → Footer
- Compact, single-flow narrative
- Proposal-token-gated (not marketing-stage-gated)
- Data-driven (live estimates, not static copy)

---

## 2. Hero Composition

### Tesla Treatment
- **Layout:** Full-bleed, edge-to-edge background image
- **Image strategy:** Large hero photography (1440px+ wide, 600px+ tall); JPEG/WebP with adaptive sizes
- **Overlay:** Rich gradient composed of 3 layers:
  - Radial blue accent (top-left, 28% opacity)
  - Dark radial vignette (bottom-right, 45% opacity)
  - Diagonal linear mask (top-to-bottom, 55%→25%→75%)
- **Typography stack:**
  - H1: Display-weight (bold), max-width container, text-balance wrapping
  - Subheading: Regular weight, secondary color (e.g., white/70%)
  - Supporting copy: Body text, raised contrast on overlay
- **CTA placement:**
  - Primary: Centered below headline, "Request a Quote" (pill-shaped, solid fill)
  - Secondary: Ghost button adjacent, alternate action
- **Metadata:** Small "Proposal #123" tag in top-right, semi-transparent pill with icon
- **Bottom anchor:** Chevron or scroll indicator showing content below

### BulletEV Current Implementation
- **PortalHero:** Already full-bleed with aerial photo
- **Overlay:** Uses `pp-hero-overlay` with gradient (blue + dark + linear)
- **Typography:** Large H1 (text-6xl/text-7xl on desktop), center-aligned
- **CTA:** Two buttons (Primary "Review This Proposal" + Ghost "Download PDF")
- **Stats bar:** Three stat cards below headline (Total Investment, Ports, Prepared date)

**Translation notes:**
- Hero structure is already premium; focus on tightening overlay contrast and ensuring text legibility on all aerial photo darkness levels
- Keep the three-stat card design but consider if they should be more elevated/glassy

---

## 3. Image Treatment

### Full-Bleed vs. Contained

**Tesla pattern:**
- Hero sections (leadership messaging): Full-bleed, edge-to-edge, no margin
- Product showcase: Contained within max-width, with subtle shadows/borders
- "How It Works" images: Full-bleed within section, image height ~50% of viewport (cinematic)

**BulletEV adoption:**
- Hero: Already full-bleed (keep as-is)
- Equipment showcase: Currently contained (2-col grid, 4:3 aspect); consider adding full-bleed variant for premium equipment blocks
- Site map section: Currently map-only; could add aerial photo full-bleed context block before map

### Aspect Ratios & Sizing
- **Hero:** 16:9 (1920×1080 min, scale to viewport width)
- **Product showcase:** 4:3 (800×600 min) or 16:9 (800×450); Tesla uses 4:3 for charger hardware
- **"How It Works" steps:** 16:9 (1440×810 typical desktop); mobile stacks to full-width

**BulletEV current:** Equipment images at 4:3 ✓ (good match)

### Overlays & Gradients
- **Equipment cards:** Light drop shadow (2px blur, 8% opacity) + subtle scale on hover (1.02×)
- **Hero overlay layers:** 3-layer composite (blue accent + dark vignette + linear mask)
- **Section transitions:** Light→Dark shifts use full-width colored bands, not gradual fades

**Contrast & Darkness:**
- Text on hero background should always maintain WCAG AA (4.5:1 minimum)
- Use scrim/overlay rather than relying on image to be dark enough
- White text at 80–90% opacity is standard; 100% only for emphasis

### Lazy-Loading Patterns
- Tesla: Preload hero image (`rel=preload`); defer below-fold product images (`loading=lazy`)
- BulletEV: Already using Next.js Image component with `priority` on hero, lazy elsewhere (good)

---

## 4. Spacing & Rhythm Patterns

### Vertical Rhythm
Tesla establishes a consistent tempo:
- **Between major sections:** 80px (mobile), 120px (tablet), 160px (desktop)
- **Within-section spacing:** 40px (internal section padding top/bottom)
- **Content max-width:** 1200px (desktop), 100vw - 48px (tablet), 100vw - 32px (mobile)

**BulletEV current gaps:**
- Sections use `py-16 md:py-24` (~64px / 96px) — slightly tighter than Tesla
- Max-width containers: 72rem (1152px) — good
- Dividers: `.section-divider` with gradient fade (already elegant)

**Recommended tightening:**
- Increase inter-section spacing to `py-20 md:py-28` for major shifts (Hero→Value, Equipment→Timeline)
- Keep `py-16 md:py-24` for supporting sections (Investment breakdown, ROI)
- Add subtle background color shifts on dark-to-light transitions (Tesla often shifts background hue, not just darkness)

### Inner Section Padding
- **Content blocks:** 24px (mobile), 40px (tablet), 48px (desktop) horizontal padding
- **Cards within sections:** 16px (mobile), 24px (desktop)

**BulletEV current:** Mostly aligned; `px-6` (24px) on sections ✓

### Max-Width Constraints
- **Hero:** Full bleed (no max-width)
- **Content sections:** 1200px centered with 24–48px gutter
- **Typography max-width:** 44–60 characters (14–16rem for body, 40rem for subheadings)

**BulletEV:** `max-w-5xl` (64rem = 1024px) and `max-w-6xl` (72rem = 1152px) — both solid

### Alignment
- Headings: Centered for standalone sections; left-aligned for content blocks
- Lists/grids: Symmetric padding; no ragged edges

---

## 5. Typography Hierarchy

### Heading Scale (Tesla)

| Level | Desktop      | Mobile      | Weight | Usage                              |
|-------|--------------|-------------|--------|-------------------------------------|
| H1    | 56–72px      | 36–48px     | Bold   | Hero, main section titles          |
| H2    | 40–48px      | 32–40px     | Bold   | Section titles, subsection leads   |
| H3    | 28–32px      | 24–28px     | Bold   | Card titles, step labels           |
| H4    | 20–24px      | 18–22px     | 600wt  | Feature callouts, spec headings    |
| Body  | 16–18px      | 14–16px     | 400wt  | Paragraph copy                     |
| Small | 12–14px      | 11–13px     | 500wt  | Metadata, captions, labels         |

**Font family:** Tesla uses TDS (Tesla Design System) proprietary; BulletEV uses Inter (good choice, similar metrics)

### Letter-Spacing
- **Headlines:** -0.02em (tighter, premium feel)
- **Body:** Normal (0em implied)
- **Labels/tags:** +0.14em to +0.2em (expanded, formal)

**BulletEV current:**
- `.pp-section-title`: Already has `-0.02em` ✓
- `.pp-eyebrow`: Already has `0.2em` ✓

### Weight Distribution
- **Headings:** 600–700wt (bold)
- **Subheadings:** 500–600wt (semibold)
- **Body:** 400wt (regular)
- **Emphasis in body:** 500–600wt

**BulletEV tokens:** Already well-distributed via Inter weight variants

### Accent/Display Faces
Tesla uses a display font for headlines in some sections (likely GT Pressura or similar); BulletEV's Inter at bold weight is sufficient and maintains modernity.

---

## 6. CTA Placement Patterns

### Primary CTA
- **Position:** Centered below headline or at end of value proposition section
- **Style:** Solid fill, rounded (999px border-radius for pill shape)
- **Copy:** Action-focused ("Request a Quote", "Get Started", "Review This Proposal")
- **Hover:** Slight lift (translate-y: -1px), shadow elevation
- **Size:** 44–48px height (touch-friendly), 16–20px padding horizontal

**BulletEV current:** `.clay-btn-primary` — pill-shaped, 600wt text, shadow on hover ✓

### Secondary CTA
- **Position:** Adjacent to primary (ghost variant)
- **Style:** Transparent background, border only or semi-transparent fill
- **Copy:** Alternative action ("Learn More", "Download PDF", "See Details")
- **Hover:** Background fade-in, no shadow

**BulletEV current:** `.clay-btn-ghost` — transparent, flex layout ✓

### Sticky / Floating CTAs
Tesla uses persistent floating action (top-right "Request" button on some pages); BulletEV's token-gated model doesn't need this (proposal is already accessed via token).

### Button Contrast Tactics
- Ensure 4.5:1 contrast minimum (already coded in `pp-primary-foreground`)
- On dark backgrounds, use white button with dark text or inverted ghost button
- Don't rely on shadow alone for clickability; color must differentiate

**BulletEV implementation:** Already strong; `.pp-primary` is 222 80% 55% (blue), sufficient contrast ✓

---

## 7. "How It Works" / Step Sections

### Layout Pattern (Tesla)

**Desktop:**
- Horizontal timeline with 4–5 steps
- Each step: numbered circle (icon area) + step label + title + description
- Steps connected by line (dashed or solid)
- Images offset (alternating left-right) in separate row below

**Mobile:**
- Vertical stack (flexbox column)
- Numbered badges float left
- Text content right-aligned
- Connecting line becomes vertical

**Visual treatment:**
- Large hero image per step (or shared multi-image carousel)
- Step numbers: bold, large (48–64px on desktop, 24–32px mobile)
- Icons: Subtle, monochromatic

**BulletEV current TimelineSection:**
- Desktop: 4-column grid, numbered circles with connectors ✓
- Mobile: Vertical flex with badges + connecting lines ✓
- No images per step (currently text-only)

### Enhancement Recommendation
Consider adding optional step imagery (e.g., site survey → permits → installation → go-live visual progression) to match Tesla's storytelling depth. Current text-only is professional but less cinematic.

---

## 8. Equipment / Product Showcase

### Layout Pattern (Tesla)

1. **Hero image + specs side-by-side:**
   - Image: 50% width (4:3 aspect), subtle shadow, rounded corners
   - Text: 50% width, specs in definition list (label | value pairs)

2. **Alternating pattern:**
   - First card: Image left, text right
   - Second card: Image right, text left
   - Maintains visual rhythm without monotony

3. **Spec callouts:**
   - Small label (uppercase, muted)
   - Large value (bold, primary color or foreground)
   - Optional: Icon beside label

**BulletEV current EquipmentShowcase:**
- Alternating grid (md:grid-cols-2) with md:order-2 toggle ✓
- Image aspect-ratio 4:3 ✓
- Specs in `<dl>` with flex justify-between ✓
- Match is excellent; no change needed

### Contextual Images
Tesla includes:
- Product photo (official, studio-lit)
- Site context photo (chargers in situ at business)
- Optional: Installation process or use case

**BulletEV current:** Uses stock `/brand/charger-dcfc.jpg` and `/brand/charger-l2.jpg`
- Consider adding site-context overlay or reference image in timeline section

---

## 9. Section Transitions

### Dark ↔ Light Shifts

**Tesla approach:**
- Full-width colored bands (not gradual fades)
- Background color change vs. background darkness change
- Used to segment narrative: business messaging (light) → benefits (dark) → tech specs (light)

**BulletEV current:**
- Sections mostly white with subtle surface-warm/surface-cool tints
- TimelineSection is dark (pp-bg-foreground white text) ✓

### Dividers
- **Tesla:** Subtle gradient line or spacer band
- **BulletEV:** `.section-divider` with radial gradient fade — elegant, already good ✓

### Sticky Elements
Tesla uses fixed/sticky headers on scroll to keep messaging visible; BulletEV's proposal is more compact, so full-page scroll is appropriate (no sticky needed).

### Visual "Breaks"
- Use full-width bands (not contained max-width) for dark sections
- Adds cinematic scale and makes sections feel distinct
- BulletEV's TimelineSection already does this (100vw width, dark background)

---

## 10. Patterns to Translate to BulletEV

### Top 5 Most Impactful

1. **Full-width dark section contrast shift** — Apply to TimelineSection (already done ✓) and consider adding a similar "Next Steps" or "Get Started" dark band at footer boundary to anchor the proposal close

2. **3-layer hero overlay (blue + dark + linear)** — Already implemented in `pp-hero-overlay`; ensure it's used on all full-bleed hero sections going forward ✓

3. **Alternating equipment card layout** — Already implemented in EquipmentShowcase ✓; maintain pattern for any future multi-product scenarios

4. **Spec list definition-list styling** — Already implemented; ensure consistent padding and border colors across all specs blocks ✓

5. **Reveal animations + staggered grid delays** — Already implemented in ProposalLayout ✓; ensure applied to new sections as they're added

### Additional Patterns Worth Adopting

- **Eyebrow + title + description pattern** for every section header (already used, good)
- **Stat card elevation on hover** — Currently only on EquipmentShowcase images; extend to hero stat cards (pp-hero-stat) ✓
- **Pill-shaped buttons with gap and icon spacing** — Already in `.clay-btn-primary` and `.clay-btn-ghost` ✓
- **Tabular-nums on all currency/numeric values** — Already applied via `tabular-nums` class (good)
- **Text balance for headings** — Already applied via `.pp-section-title` ✓

---

## 11. DO-NOT-COPY List

### Branding & Legal
- ❌ **Tesla logo or wordmark** — Use BulletEV logo/name only
- ❌ **Tesla brand colors** — (Black, white, red #CC0000 accents) — Stick to BulletEV primary (222 80% 55% blue)
- ❌ **"Supercharger" terminology** — Trademarked by Tesla; use "DC Fast Charging" or "Level 2 Charging" or "[Brand] Charging" instead
- ❌ **"Supercharger for Business" copy phrases** — Adapt concepts but write original BulletEV messaging
- ❌ **Tesla URLs in links** — All links must point to bulletev.com or internal routes, never tesla.com

### Assets
- ❌ **Tesla-hosted images** (digitalassets.tesla.com, etc.) — Use only local/BulletEV-owned assets
- ❌ **Tesla product photography** — Use BulletEV charger images or licensed alternatives
- ❌ **Tesla screenshots** — Don't embed Tesla interface elements
- ❌ **Google Maps embedded directly from Tesla page** — Use your own map or licensed embed

### Functionality
- ❌ **Tesla mega-menu structure** — BulletEV doesn't have product portfolio breadth; keep navigation flat
- ❌ **Tesla's dynamic pricing widget** — (Visible in head script) — Not applicable to BulletEV's token-gated proposal model

---

## 12. Current Proposal Portal Starting Point Summary

### Existing Foundation (What BulletEV Already Has)

| Component            | Current Status                                                                           | Notes for Phase B                                                          |
|----------------------|------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| **PortalHero**       | Full-bleed hero with aerial photo, overlay, 3-stat cards, dual CTAs                     | Solid; tighten overlay contrast if needed; hero stat cards could lift       |
| **ValueSection**     | 2×3 metric grid (payback, rebates, CO2, property lift, warranty, install time)          | Good; spacing is tight; add eyebrow + description above                     |
| **Equipment**        | Alternating 2-col cards with image + spec lists, adjusts to stacked on mobile           | Excellent structure; keep as-is                                             |
| **SiteMapSection**   | Embedded map with equipment markers; no accompanying narrative                          | Add headline/description block + optional aerial photo context             |
| **ROICalculator**    | Interactive 4-slider cost breakdown (hardware, install, labor, other)                    | Tucked between Equipment and Investment; consider more prominence            |
| **InvestmentBreakdown** | Bucketed line items (hardware, infrastructure, services, accessories, controls)       | Solid; section dividers are good; ensure tax/contingency are clear          |
| **TimelineSection**  | Dark background, 4-step timeline with numbered phases, desktop grid + mobile stack       | Excellent; already implements dark transition pattern                       |
| **InteractiveSection** | PDF download + interactive proposal action section                                      | Keep visible; ensure CTAs are clear                                        |
| **ProposalFooter**   | Basic footer with logo + links                                                         | Could add trust signals or next-steps callout                              |
| **Global CSS**       | Comprehensive proposal-portal token layer: colors, shadows, buttons, animations         | Well-scoped; add new tokens sparingly (Phase C.1)                           |

### Gaps / Improvement Opportunities (for Phase B Design Mapping)

1. **ValueSection heading**: Currently no eyebrow or intro description; add for consistency
2. **SiteMapSection context**: Just a map; add narrative block + aerial photo reference
3. **Dark-to-light transition at TimelineSection boundary**: Sharp change; smooth with spacing
4. **Equipment showcase imagery**: No on-site context images; currently stock shots only
5. **Footer prominence**: Minimal; consider adding "Next Steps" or partner/testimonial section before footer
6. **Interactive section positioning**: Currently at end; could be moved earlier for engagement
7. **Button contrast on all CTAs**: Verify all buttons meet 4.5:1 AA contrast in current dark/light sections

### Design System Maturity
- ✓ Token layer is comprehensive (--pp-* variables in scope)
- ✓ Reveal animations are in place
- ✓ Responsive breakpoints are consistent
- ✓ Color tokens include primary, secondary, muted, destructive, gold, surface-warm, surface-cool
- ⚠ Could benefit from explicit "hero" token variant for overlay treatment
- ⚠ Could benefit from explicit "elevated" token for cards/stats on hero background

---

## Concrete Recommendations for Phase B

### High Priority
1. **Enhance ValueSection presentation** — Add eyebrow label + supporting paragraph above metric grid
2. **Strengthen hero stat card visibility** — Consider elevated glass treatment (more `pp-hero-stat` hover feedback)
3. **Add SiteMapSection narrative** — Headline + description before map, optional aerial context image
4. **Establish section rhythm** — Verify py-spacing matches Tesla (20 md:28 for major shifts)

### Medium Priority
5. **Introduce "on-site context" imagery** — Add site photo reference (e.g., charging station in use) somewhere in Equipment or as interstitial
6. **Add footer "Next Steps" callout** — "What happens next?" section before footer with timeline or contact info
7. **Verify contrast on all transitions** — Ensure text remains readable on all dark/light shifts

### Lower Priority (Out of Scope for Phase B, but noted)
8. **Consider equipment multi-image carousel** — (Phase C.2 enhancement) For multi-charger proposals, show variants side-by-side or in carousel
9. **Add testimonial/social proof section** — (Phase C optimization) If BulletEV has case studies or partner endorsements
10. **Responsive image optimization** — (Infrastructure) Ensure all hero/product images are optimized with `srcSet` and `sizes`

---

## Conclusion

The Tesla reference demonstrates a mature enterprise sales narrative architecture:
- **Clear hero framing** with cinematic visual scale
- **Alternating layout patterns** that prevent monotony while maintaining rhythm
- **Dark-to-light section transitions** that segment the story
- **Strong product showcase** with spec clarity and on-site context
- **Persistent CTAs** at strategic moments

BulletEV's proposal portal is already well-structured and largely implements these patterns. Phase B should focus on **rhythm tightening, narrative enhancement (adding eyebrows and context), and section transition smoothness** rather than wholesale redesign.

The foundation is strong; the uplift is a matter of polish and clarity.

