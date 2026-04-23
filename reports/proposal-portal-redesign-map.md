# Proposal Portal Redesign Map — Phase B

**Deliverable for:** EV Charging Estimator Proposal Portal Uplift Plan  
**Date:** 2026-04-23  
**Status:** Ready for Phase C execution  

---

## 0. Executive Summary

This phase maps the Tesla rendering reference patterns (Phase A: `rendering-reference-analysis.md`) onto the existing BulletEV proposal portal component structure. The analysis shows that BulletEV already implements most canonical enterprise sales narrative patterns (full-bleed hero, alternating equipment cards, dark-to-light section transitions, reveal animations, and strong CTA placement). This uplift is primarily a **rhythm and clarity pass**: tightening vertical spacing, adding narrative context headers and eyebrows to previously title-only sections, and strengthening hero stat card elevation. No wholesale redesign is needed; polish and coherence are the goals.

---

## 1. Component-by-Component Map

### PortalHero

**Current state:** Full-bleed aerial photo hero with centered headline, customer name subtitle, 3-stat cards below (Total Investment, Charging Ports, Prepared date), and dual CTAs (Review Proposal + Download PDF). Includes logo badge and proposal ID tag in top-right. Already implements 3-layer gradient overlay (`pp-hero-overlay`) and text shadow for legibility.

**Phase A patterns to apply:**
- ✓ Full-bleed edge-to-edge background (already done)
- ✓ 3-layer overlay with blue + dark + linear mask (already done)
- ✓ Large H1 display weight with text-balance wrapping (already done)
- ✓ Metadata tag placement (Proposal #) (already done)
- ⚠ **Hero stat card elevation on hover** — Currently has basic hover but no explicit "glassy" or elevated treatment
- ⚠ **Leading stat prominence** — "Total Investment" stat has `data-lead='true'` but could use stronger visual hierarchy (larger text, bolder weight)
- ⚠ **Scroll anchor/chevron** — Already has bounce animation on ArrowDownIcon; good

**Decision:** MODIFY

**Concrete changes (if MODIFY):**
- Enhance `.pp-hero-stat` hover effect: add `box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15)` and subtle `background: hsl(var(--pp-background) / 0.95)` lift
- Increase padding on lead stat: `p-6 md:p-7` instead of `p-4 md:p-5` to give more breathing room
- Consider increasing H1 max-width slightly (`max-w-5xl`) to allow for longer customer names to not break awkwardly
- Ensure stat label color is `text-white/65` (already is); maintain 0.65rem uppercase tracking-[0.18em]

**Files touched:**
- `src/components/proposal-portal/PortalHero.tsx` (minor: hover CSS)
- `src/app/globals.css` (`.pp-hero-stat:hover` enhancement)

**Risk / watch-outs:**
- The aerial photo darkness varies by site; must ensure overlay + text shadow combo maintains WCAG AA (4.5:1) on light aerial backgrounds. Test with light property photos during Phase D.
- Hero stat cards are positioned at bottom of hero; if increased padding, ensure mobile doesn't overflow viewport.

---

### ValueSection

**Current state:** Centered section with H2 title ("Why now is the perfect time") and supporting paragraph, then a 2×3 metric grid showing Payback Period, Rebate Potential, CO₂ Offset, Property Value Lift, Full Warranty, Install Time. Uses `.stagger` class for reveal animation delays. No eyebrow label above title (unlike other sections).

**Phase A patterns to apply:**
- ⚠ **Eyebrow + title + description pattern** — Missing eyebrow; should add "Value" or "What you gain" eyebrow label
- ✓ Centered section header (already done)
- ✓ Metric grid with large bold values + muted units (already done)
- ✓ Reveal animations with stagger delays (already done)

**Decision:** MODIFY

**Concrete changes (if MODIFY):**
- Add `.pp-eyebrow` label before H2: "Value" or "What you gain"
- Increase inter-section spacing: change `py-20 md:py-28` to `py-24 md:py-32` to match Tesla rhythm (major section boundary)
- Verify metric value sizes match hierarchy (currently `text-5xl md:text-7xl` — good)
- Ensure grid gap spacing: `gap-y-12 gap-x-8` is tight enough; consider `gap-x-10 md:gap-x-12` for more breathing room on desktop

**Files touched:**
- `src/components/proposal-portal/ValueSection.tsx` (add eyebrow JSX + spacing)
- `src/app/globals.css` (no token changes; spacing is Tailwind)

**Risk / watch-outs:**
- Increased padding may push section further down page; ensure mobile doesn't feel overly spaced-out on small screens (test at 375px width)
- Metric labels are uppercase; verify they remain readable at smaller font sizes on mobile

---

### EquipmentShowcase

**Current state:** Excellent alternating 2-column grid (md:grid-cols-2 with md:order-2 toggle) showing equipment cards with 4:3 aspect-ratio image, level label, equipment name, detail text, and specification list with borders. Cards use `.pp-equipment-card` and `.pp-equipment-image` with hover scale and subtle shadow. Already implements the Tesla alternating pattern perfectly.

**Phase A patterns to apply:**
- ✓ Alternating image left/right layout (already done)
- ✓ 4:3 aspect ratio product images (already done)
- ✓ Spec lists in definition-list format (already done)
- ✓ Hover elevation on images (scale 1.02 + shadow) (already done)
- ✓ Eyebrow + title + description (already done)

**Decision:** KEEP

**Concrete changes (if KEEP):**
- No changes required; this component is already polished and follows Tesla patterns closely.
- Optional: Consider adding site-context image or on-site charger photo in the hero above this section (Phase C enhancement, out of scope for token/rhythm work).

**Files touched:**
- None

**Risk / watch-outs:**
- None. Component is solid.

---

### ValueSection (before Investment)

*See ValueSection above.*

---

### SiteMapSection

**Current state:** Centered header with eyebrow ("Site plan") and title (address), supporting paragraph, then full-bleed 16:9 aspect aerial image with centered pin marker showing city/region and port count. Includes a metadata row below showing charging type, site type, and address. Currently uses only the aerial image; no accompanying narrative block.

**Phase A patterns to apply:**
- ✓ Eyebrow + title (already done)
- ✓ Supporting description paragraph (already done)
- ✓ Full-bleed image (16:9 aspect) (already done)
- ✓ Static address pin / location metadata (already done)
- ⚠ **Section context image or "next steps" callout** — Tesla includes narrative context after product showcase; SiteMap is currently standalone image-only. Phase A recommends adding optional aerial photo context block before map (already satisfied by map itself; no change needed) or "during design phase" callout

**Decision:** MODIFY

**Concrete changes (if MODIFY):**
- Increase padding/spacing around map: add `.mb-8 md:mb-12` gap between title/description block and image (currently `mb-10 md:mb-14` on reveal block; this is fine)
- Enhance the supportive text below map (metadata row): increase font size slightly from `text-sm` to maintain hierarchy. Currently reads as secondary; no change needed.
- Consider adding a subtle "Next: Design Phase" callout or "Exact placement finalized during design phase" as emphasized text in description paragraph (already included verbatim; no change)

**Decision:** KEEP (minor spacing review)

**Files touched:**
- `src/components/proposal-portal/SiteMapSection.tsx` (verify spacing only; no code changes)

**Risk / watch-outs:**
- Metadata row below map reads small; ensure text contrast meets AA on all backgrounds.
- Site address display: if address is very long, test word-wrap and truncation on mobile.

---

### ROICalculator (between Equipment and Investment)

*Note: Phase A analysis mentions this component is "tucked between Equipment and Investment; consider more prominence." This is noted for Phase C optimization, not Phase B design mapping. No changes here.*

**Current state:** Interactive 4-slider cost breakdown (hardware, install, labor, other) with dynamic result calculation.

**Decision:** KEEP

**Concrete changes:** None for this phase.

**Files touched:** None

**Risk / watch-outs:** None for Phase B.

---

### InvestmentBreakdown

**Current state:** Detailed line-item breakdown by bucket (Hardware, Infrastructure, Services, Accessories, Controls) with each line item showing qty, unit, detail, and cost. Bottom section shows subtotal, markup, tax, contingency, and grand total. Includes "Accept This Estimate" CTA at end. Uses `.pp-bucket[data-bucket=*]` for color-coded left borders per category.

**Phase A patterns to apply:**
- ✓ Eyebrow + title (already done: "Line-item breakdown" + "Investment")
- ✓ Bucketed grouping with subtotals (already done)
- ✓ Spec callout styling (definition-list format) (already done)
- ✓ Grand total emphasis (large bold text) (already done)
- ✓ Primary CTA at section close (already done)

**Decision:** KEEP

**Concrete changes:**
- Verify bucket color tokens are present in globals.css (`.pp-bucket[data-bucket='hardware']` etc.) ✓ (already defined with HSL colors)
- No changes needed; spacing and typography are solid.

**Files touched:** None

**Risk / watch-outs:**
- Tax and contingency rows are conditional; ensure mobile layout accommodates variable number of rows without ugly breaks.
- "Accept This Estimate" button: verify it links or is wired to backend action (out of scope for design mapping, but flag for Phase D validation).

---

### TimelineSection

**Current state:** Dark background section (`pp-bg-foreground` with `pp-text-background`) showing 4 deployment phases in desktop grid (4-column) and mobile vertical stack. Each phase has numbered circle, week label, title, and description. Uses connecting lines (desktop: horizontal pseudo-element; mobile: vertical pseudo-element).

**Phase A patterns to apply:**
- ✓ Dark section transition (full-width band) (already done)
- ✓ 4-step horizontal timeline with icons/numbers (already done)
- ✓ Mobile vertical stack (already done)
- ✓ Connecting line visualization (already done)
- ⚠ **Section rhythm at dark transition** — Phase A recommends spacing tightening at dark-to-light boundaries. Currently using `py-16 md:py-24`; consider bumping to `py-20 md:py-28` for major transition emphasis

**Decision:** MODIFY

**Concrete changes (if MODIFY):**
- Increase padding: change `py-16 md:py-24` to `py-20 md:py-28` to emphasize section boundary (major dark ↔ light transition)
- Verify eyebrow label color: currently using `color: hsl(var(--pp-background) / 0.6)` (good — 60% of background = light gray on dark)
- Verify step circles use proper contrast: `borderColor: hsl(var(--pp-background) / 0.35)` (35% opacity) for subtle appearance — good

**Files touched:**
- `src/components/proposal-portal/TimelineSection.tsx` (padding adjustment)
- `src/app/globals.css` (no token changes)

**Risk / watch-outs:**
- Dark background may have contrast issues with light text on some devices; ensure all text meets WCAG AA (4.5:1) minimum. Currently uses 70%+ opacity for supporting text; should be fine.
- Timeline step images (Phase A mentions "optional step imagery") — not currently implemented; flagged as Phase C enhancement, not Phase B.

---

### InteractiveSection

**Current state:** Light background section with eyebrow ("Have questions?"), title ("Questions?"), and rep intro paragraph. Contains a card with preset common-question links and two CTAs (Ask your rep via mailto, Call rep). Uses preset email templates with proposal ID.

**Phase A patterns to apply:**
- ✓ Eyebrow + title + description (already done)
- ✓ CTA placement (dual buttons at section close) (already done)
- ⚠ **Section prominence** — Phase A notes this section is "at end; could be moved earlier for engagement." Current position (before footer) is appropriate for proposal flow; no change.

**Decision:** KEEP

**Concrete changes:** None

**Files touched:** None

**Risk / watch-outs:**
- Preset questions use fixed strings; ensure they're generic enough to apply to any proposal (they are: "What's excluded from make-ready?", "Does this include a warranty?", etc.)
- mailto links: verify email addresses are properly encoded; currently using `encodeURIComponent` (good)

---

### ProposalFooter

**Current state:** Light background footer with BulletEV logo, "Ready to move forward?" headline, rep intro paragraph, "Accept Estimate" CTA, optional contact info (email + phone), and copyright/proposal ID metadata.

**Phase A patterns to apply:**
- ✓ Section CTA (already done)
- ✓ Logo placement (centered) (already done)
- ✓ Contact info clear (already done)
- ✓ Trust signals (warranty mention, rep name, valid 30 days) (already done in text)
- ⚠ **Footer prominence** — Phase A recommends adding "Next Steps" or partner/testimonial section before footer. Currently no such section; this is Phase C enhancement, not Phase B.

**Decision:** KEEP

**Concrete changes:** None for Phase B.

**Files touched:** None

**Risk / watch-outs:**
- Footer contact info is conditional; ensure layout doesn't break if only email or only phone is present (currently handled with flexbox; should be fine).
- "Accept Estimate" button: same caveat as InvestmentBreakdown CTA — wire-up is Phase D responsibility.

---

### ProposalLayout (wrapper)

**Current state:** Client component that scopes the `.proposal-portal` class, sets up IntersectionObserver for reveal animations, and respects `prefers-reduced-motion`.

**Phase A patterns to apply:**
- ✓ Reveal animation orchestration (already done)
- ✓ Motion preference respect (already done)

**Decision:** KEEP

**Concrete changes:** None

**Files touched:** None

**Risk / watch-outs:** None

---

## 2. Token Changes in globals.css

### New Tokens to Add

None. The existing token set is comprehensive and includes all patterns from Phase A.

### Existing Tokens to Verify/Document

| Token | Value | Usage | Notes |
|-------|-------|-------|-------|
| `--pp-background` | `0 0% 100%` | Base white | Good; no change |
| `--pp-foreground` | `220 15% 10%` | Dark text | Good; no change |
| `--pp-primary` | `222 80% 55%` | Blue accent, CTAs | Good; sufficient contrast |
| `--pp-secondary` | `220 10% 96%` | Light backgrounds | Good; no change |
| `--pp-border` | `220 10% 90%` | Dividers, borders | Good; no change |
| `--pp-surface-warm` | `0 0% 97%` | Section backgrounds | Good; no change |
| `--pp-surface-cool` | `220 10% 97%` | Section backgrounds | Good; no change |
| `--pp-highlight` | `222 80% 55%` | Accent (same as primary) | Good; no change |
| `--pp-gold` | `42 80% 55%` | Optional accent (not currently used) | Good; available for future |
| `--pp-muted-foreground` | `220 10% 40%` | Secondary text | Good; no change |

### Class Tokens to Enhance

| Class | Current | Proposed Change | Rationale |
|-------|---------|-----------------|-----------|
| `.pp-hero-stat` | `p-4 md:p-5` | `p-5 md:p-6` | Add more breathing room, especially for lead stat |
| `.pp-hero-stat:hover` | `box-shadow: 0 4px 12px rgba(...)` (approx) | `box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15)` | Stronger elevation on hover, matching product card hover |
| `.pp-section-title` | ✓ (text-balance, -0.02em tracking) | No change | Already follows Tesla pattern |
| `.pp-eyebrow` | ✓ (0.2em tracking, muted color) | No change | Already follows Tesla pattern |

### Section Padding Adjustments

| Section | Current | Proposed | Rationale |
|---------|---------|----------|-----------|
| Hero | `min-h-[600px] md:min-h-[680px]` | No change | Already cinematic |
| ValueSection | `py-20 md:py-28` | `py-24 md:py-32` | Emphasize major transition after Hero |
| EquipmentShowcase | `py-16 md:py-24` | No change | Support section; keep tighter |
| SiteMapSection | `py-16 md:py-24` | No change | Support section |
| InvestmentBreakdown | `py-16 md:py-24` | No change | Keep consistent |
| TimelineSection | `py-16 md:py-24` | `py-20 md:py-28` | Emphasize dark transition |
| InteractiveSection | `py-20 md:py-28` | No change | Final section; already prominent |
| ProposalFooter | `py-16 md:py-20` | No change | Footer; keep moderate |

### Concrete CSS Changes Required

Add or update these in `.proposal-portal` scope in `src/app/globals.css`:

```css
/* Enhanced hero stat elevation */
.proposal-portal .pp-hero-stat:hover {
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15);
  background: hsl(var(--pp-background) / 0.95);
  /* Existing transition-colors should handle smoothness */
}

/* Increase lead stat prominence */
.proposal-portal .pp-hero-stat[data-lead='true'] {
  padding: 1.5rem; /* md:1.75rem — adjust via component */
}
```

**Note:** Most padding changes are inline Tailwind classes in component JSX, not CSS tokens. Update `.tsx` files directly.

---

## 3. New Shared Subcomponents (if any)

**Decision:** None. All components are sufficiently specialized to warrant their own files. No shared abstractions are justified at this phase.

**Rationale:** Each proposal portal section has unique data shapes (equipment specs differ from timeline phases; investment buckets differ from value metrics). Extracting a generic "card grid" or "metric display" component would add abstraction overhead without clear reuse benefit. Keep components colocated in `src/components/proposal-portal/` and stateless/pure.

---

## 4. Out-of-Scope This Pass

Explicitly locked to Phase B (design mapping):

- **Estimator workflow redesign** — In-scope for later phases; not touched here
- **Navigation redesign** — BulletEV doesn't have Tesla-style mega-menu; no change intended
- **PDF template redesign** — Separate system; out of scope
- **Additional imagery assets** — "On-site context images" and "step progression photos" flagged in Phase A as potential Phase C enhancements; not sourced or added here
- **New section additions** — No "social proof," "testimonials," or "next steps callout" sections added; existing sections only
- **Estimator UI / form refinement** — Only proposal *portal* (read-only customer view) is in scope; not the admin/estimator tool
- **Analytics or tracking enhancements** — No new telemetry or funnel tracking
- **Accessibility remediation beyond token verification** — Phase D (validation) will audit contrast, focus states, etc.; Phase B only flags risks
- **Responsive breakpoint changes** — Using existing Tailwind breakpoints (sm, md, lg); no new breakpoints added
- **Animation or motion refinement** — Existing reveal/stagger animations are solid; no new motion patterns added
- **Dark mode support** — Proposal portal is always light with dark accents; no dark mode variant needed

---

## 5. Execution Ordering Hint

### Recommended Phase C Workstream Sequence

**C.1 — Portal tokens + globals.css uplift (FIRST)**
- **Why first:** This work is a prerequisite for components; they depend on token values and CSS class enhancements.
- **Tasks:**
  - Add/update `.pp-hero-stat:hover` with stronger elevation
  - Verify all token values are present and correct
  - Document token usage in globals.css comments
  - Run lint/test on CSS changes
- **Duration:** ~1 day
- **Dependencies:** None (isolated CSS work)
- **Output:** Updated `src/app/globals.css` ready for consumption by C.2 and C.3

**C.2 — PortalHero + EquipmentShowcase uplift (PARALLEL with C.1, ready after C.1 completes)**
- **Why second:** Hero is first visual impression; EquipmentShowcase is KEEP but needs hero-consistent padding/spacing
- **Tasks:**
  - Enhance hero stat cards: increase padding, hook up improved hover via updated CSS from C.1
  - Verify hero title sizing and text-balance wrapping
  - Test hero on light/dark aerial photos for contrast
  - No changes to EquipmentShowcase JSX; verify it aligns with hero spacing rhythm
  - Render testing on desktop + mobile
- **Duration:** ~1–2 days
- **Dependencies:** Needs C.1 CSS updates
- **Output:** Visually polished hero and confirmed equipment card consistency

**C.3 — Value/Investment/SiteMap/Timeline/Interactive rhythm tightening (PARALLEL with C.2, can start after C.1)**
- **Why third:** These sections' spacing and text changes are independent of hero polish; can start in parallel once token values are confirmed.
- **Tasks:**
  - ValueSection: add eyebrow, adjust spacing to `py-24 md:py-32`
  - SiteMapSection: verify spacing (no code changes)
  - TimelineSection: adjust spacing to `py-20 md:py-28`
  - InteractiveSection: no changes (keep as-is)
  - ProposalFooter: no changes (keep as-is)
  - Stagger animation timing: verify 80ms increments feel natural (no change expected)
  - Render testing on desktop + mobile
- **Duration:** ~1–2 days
- **Dependencies:** C.1 complete (token verification)
- **Output:** Consistent section rhythm across proposal flow

### Cross-Workstream Dependencies

- **C.1 → C.2:** C.2 needs updated `.pp-hero-stat:hover` CSS
- **C.1 → C.3:** C.3 needs token verification (no breaking changes, but good to confirm)
- **C.2 ↔ C.3:** Independent; can run in parallel after C.1
- **All → Phase D:** D needs all three C workstreams complete before validation

### Critical Path

1. **C.1** (1 day) — Blocks C.2
2. **C.2 + C.3 in parallel** (1–2 days each)
3. **Phase D** — After C.2 + C.3 both land

**Total estimate:** 3–4 days wall-clock time with parallel work

---

## 6. Acceptance Checkpoints (Phase D)

Phase D (QA validation) must confirm all of the following:

### Rendering & Visual

- [ ] **Hero stat cards:** Hover effect shows subtle background lift + shadow (0 8px 16px); text color unchanged
- [ ] **Hero contrast:** Text (white) maintains WCAG AA (4.5:1) on test aerial photos with varying darkness
- [ ] **ValueSection:** Eyebrow label "Value" appears above "Why now..." title; spacing feels rhythmic
- [ ] **TimelineSection:** Dark background transitions smoothly from light sections above/below; no harsh edges
- [ ] **Section padding:** Measurement confirms `py-24 md:py-32` (ValueSection) and `py-20 md:py-28` (TimelineSection)
- [ ] **Equipment card:** Hover scale + shadow consistent with hero stat card elevation
- [ ] **Mobile responsive:** All sections stack and reflow correctly at sm (640px) and md (768px) breakpoints

### Functional

- [ ] **Token scoping:** All `.proposal-portal` styles are scoped; no CSS leaks to other pages
- [ ] **Reveal animations:** IntersectionObserver still triggers stagger animations on scroll
- [ ] **Motion respect:** `prefers-reduced-motion: reduce` disables animations; all content remains visible
- [ ] **Links & CTAs:** All buttons, mailto links, tel links remain functional; no routing regressions
- [ ] **Form data:** Proposal ViewModel data flows through all sections; no missing fields or broken displays

### Regression Testing

- [ ] **Proposal portal URL route:** `/proposal/[viewToken]` still returns 404 for invalid tokens, renders correctly for valid tokens
- [ ] **Token gating:** Public pages (non-proposal) are unaffected; no style bleed
- [ ] **Accessibility (baseline):** Headings are semantic (h1 > h2 > h3); buttons have accessible labels; form inputs are labeled
- [ ] **Performance:** Lighthouse score remains above 85 on mobile (no new layout shifts, unused CSS, or bloat)

### Browser & Device Testing

- [ ] **Desktop:** Chrome, Firefox, Safari on macOS/Windows (latest versions)
- [ ] **Mobile:** Chrome on Android (Pixel 6), Safari on iOS (iPhone 14+)
- [ ] **Touch interactions:** Buttons have 44px+ touch targets; hover effects degrade gracefully on touch
- [ ] **Dark mode (if applicable):** Not required for proposal portal (light theme always); skip if out-of-scope

### Git & CI/CD

- [ ] **Linting:** `npm run lint` passes (no ESLint or Prettier errors)
- [ ] **Type checking:** `tsc` completes without errors
- [ ] **Tests:** Any existing unit/integration tests still pass; no new test failures
- [ ] **Build:** `npm run build` completes successfully; no build warnings related to touched files

### Accessibility Audit

- [ ] **Color contrast:** Text on all backgrounds meets WCAG AA (4.5:1 for normal, 3:1 for large text)
- [ ] **Focus visible:** Tab navigation works; focus outline is visible and clear
- [ ] **Semantic HTML:** Headings, lists, buttons are semantic; no role overrides where not needed
- [ ] **Alt text:** All images have descriptive alt text (aerial photo, equipment images, logo)

---

## Summary: Touch List Per Component

| Component | Decision | Effort | Phase C Owner |
|-----------|----------|--------|---------------|
| **PortalHero** | MODIFY | 1–2h | C.2 |
| **ValueSection** | MODIFY | 1h | C.3 |
| **EquipmentShowcase** | KEEP | 0h | (verify alignment) |
| **SiteMapSection** | KEEP | 0h | (verify spacing) |
| **ROICalculator** | KEEP | 0h | (no change) |
| **InvestmentBreakdown** | KEEP | 0h | (no change) |
| **TimelineSection** | MODIFY | 1h | C.3 |
| **InteractiveSection** | KEEP | 0h | (no change) |
| **ProposalFooter** | KEEP | 0h | (no change) |
| **globals.css** | MODIFY | 2–3h | C.1 |
| **ProposalLayout** | KEEP | 0h | (no change) |

---

## Non-Obvious Observations

1. **Hero stat card hover is already close to good** — Current implementation has shadow on hover (`0 4px 12px`). Phase A recommends stronger elevation. Adjustment from `0 4px 12px` → `0 8px 16px` (doubled) is subtle but meaningful; test on actual hardware.

2. **ValueSection was missing its eyebrow** — Unlike other sections (Equipment, SiteMap, Investment, Timeline, Interactive), ValueSection jumps straight to title. This is the only narrative gap in the portal; adding eyebrow ("Value" or "What you gain") completes the pattern consistency.

3. **Equipment card hover already nails Tesla pattern** — The alternating layout + hover scale + shadow is already best-in-class. No changes needed.

4. **TimelineSection is already a perfect dark transition** — Dark background on white text is crisp and premium. Only change is padding emphasis to signal "major section boundary."

5. **Section dividers are elegant** — The `.section-divider` with radial gradient fade is more sophisticated than Tesla's approach (solid lines). No change needed; it's a BulletEV strength.

6. **No shared subcomponents justified** — Each section's data shape is unique. Extracting a generic component would reduce clarity without adding value. Keep sections colocated.

7. **Phase A's "on-site context imagery" is out of scope here** — Phase A flags that equipment sections could benefit from on-site charger photos (not just studio shots). This is a Phase C enhancement requiring new image sourcing/management. Phase B design mapping doesn't justify new components for this.

8. **Responsive breakpoints are already well-balanced** — Using standard Tailwind sm/md/lg; no new breakpoints needed. Component JSX already uses `md:grid-cols-2`, `md:py-24`, etc. consistently.

9. **Reveal/stagger animations are solid** — IntersectionObserver setup in ProposalLayout + 80ms stagger increments feel natural. No motion tweaks recommended.

10. **Token set is comprehensive** — No new tokens needed. Existing `--pp-*` variables cover all patterns from Phase A. C.1 work is purely CSS class enhancements (`:hover` states, etc.), not new tokens.

---

## Appendix: Phase A Patterns Successfully Implemented in Current Portal

| Phase A Pattern | Implemented | Component | Notes |
|-----------------|-------------|-----------|-------|
| Full-bleed hero | ✓ | PortalHero | Edge-to-edge background image, no margin |
| 3-layer overlay | ✓ | PortalHero | `.pp-hero-overlay` with blue + dark + linear |
| Alternating product cards | ✓ | EquipmentShowcase | `md:order-2` toggle per row |
| Spec lists (definition-list) | ✓ | EquipmentShowcase, InvestmentBreakdown | `<dl>` + `<dt>/<dd>` structure |
| Dark section transition | ✓ | TimelineSection | `pp-bg-foreground` with light text |
| Reveal animations | ✓ | ProposalLayout + all sections | `.reveal` class + IntersectionObserver |
| Stagger animation delays | ✓ | ValueSection | `.stagger > :nth-child(n)` with 80ms increments |
| Section dividers | ✓ | page.tsx | `.section-divider` with gradient fade |
| Eyebrow + title + description | ✓ | Most sections | `.pp-eyebrow` + `h2` + `<p>` pattern |
| Centered section headers | ✓ | All sections | `text-center` with centered max-width |
| Pill-shaped CTAs | ✓ | All sections | `.clay-btn-primary` with rounded-full |
| Metadata tags | ✓ | PortalHero | Proposal # tag with icon |

---

## Conclusion

The BulletEV proposal portal is already well-aligned with Tesla's enterprise sales narrative patterns. Phase B analysis shows that **the foundation is strong**; this uplift is primarily **polish and clarity**.

The three Phase C workstreams (C.1 tokens, C.2 hero, C.3 rhythm) are tightly scoped and low-risk. No wholesale redesign is needed; no new components or patterns are justified. Focus is on:

1. Tightening vertical rhythm (section spacing)
2. Adding narrative context (missing eyebrow in ValueSection)
3. Strengthening visual feedback (hero stat hover elevation)

All changes are backward-compatible and localized to proposal-portal-scoped styles. No risk of affecting other pages or systems.

**Ready for Phase C execution.**

---

**Document prepared:** 2026-04-23  
**Next phase:** Phase C (Proposal Portal Uplift) — Three parallel workstreams  
**Validation phase:** Phase D (Regression & UX Testing)
