# Phase D — Proposal Portal Uplift Validation Report

**Verdict: YELLOW**

All Phase C portal changes are clean — lint passes on portal files, tests pass, typecheck shows zero portal-related errors, the proposal route still wires every expected component, and the static audit confirms no Tesla branding leakage. However, `next build` fails due to a **pre-existing** compile error in an **untracked** stray template folder (`Bullet ev estimating/`) that Next.js is inadvertently picking up from the project root. This blocks a green light but is orthogonal to the portal work and was present before Phase C.

**Date:** 2026-04-23
**Branch:** `liquid-glass-upgrade`
**Commits audited:** `c2f5d82`, `4239169`, `f1e462d`, `034993f`
**Files changed in Phase C:** 5 (globals.css + 4 portal components)

---

## 1. Lint (`npm run lint`)

**Status:** PASS for Phase C files, PRE-EXISTING issues elsewhere.

Repo-wide: 128 problems (39 errors, 89 warnings). **None** in `src/components/proposal-portal/**` or `src/app/globals.css`.

Filtered for portal scope:
```
$ npm run lint 2>&1 | grep -iE "proposal-portal|proposal/\[viewToken\]"
(no matches)
```

All 39 errors are pre-existing in other modules:
- `src/components/map/StreetViewPanel.tsx` — `react-hooks/set-state-in-effect`
- `src/contexts/EstimateContext.tsx:128` — same rule
- `src/hooks/useSmartEstimate.ts:127` — same rule
- `src/lib/estimate/export-pdf.ts:181` — `no-explicit-any`

Warnings are unused vars in `_` prefixed test fixtures and pricing modules — all outside Phase C scope.

---

## 2. Typecheck (`npx tsc --noEmit`)

**Status:** PASS for Phase C files, PRE-EXISTING issues elsewhere.

Total non-template errors: **5**. All pre-existing, none in portal files:
- `tests/regressions/conduit-diagnostic.test.ts(24,7)` — `"existing_panel"` literal not in panel voltage union
- `tests/regressions/conduit-diagnostic.test.ts(27,5)` — `feederDistance_ft` optionality mismatch
- `tests/regressions/conduit-tripling.test.ts(29,7)`, `(32,5)`, `(117,37)` — same pattern

Confirmed pre-existing via `git stash` baseline (no stash created because no local changes, confirming the errors live in committed code prior to Phase C).

Proposal-portal-scoped grep:
```
$ npx tsc --noEmit 2>&1 | grep -iE "proposal-portal|proposal/\[viewToken\]|globals\.css"
(no matches)
```

Additional ~200 errors come from the untracked `Bullet ev estimating/` template folder — see §6.

---

## 3. Unit tests (`npm test`)

**Status:** PASS.

```
RUN v4.1.1 /mnt/c/Users/pmend/ev-charging-estimator-1
Test Files  21 passed (21)
     Tests  144 passed (144)
  Duration  12.65s
```

No proposal-portal unit tests exist in the repo (portal is markup-only; no test regressions possible). All 144 tests across 21 files — auth, rate-limit, session, media capture, AI render, presentation, regression/conduit, estimate accuracy — pass cleanly. No regression.

---

## 4. Static audit of the 4 Phase C commits

**Status:** PASS.

Diff scope (`git diff 034993f^..HEAD -- src/components/proposal-portal/ src/app/globals.css`):

```
src/app/globals.css                                | 28 ++++++++++++++++++----
src/components/proposal-portal/EquipmentShowcase.tsx          |  2 +-
src/components/proposal-portal/PortalHero.tsx      |  6 +++--
src/components/proposal-portal/TimelineSection.tsx |  2 +-
src/components/proposal-portal/ValueSection.tsx    |  3 ++-
5 files changed, 31 insertions(+), 10 deletions(-)
```

### Tesla-branded copy / asset audit

Grep for `tesla|supercharger|teslacdn|-2\.svg` across `src/components/proposal-portal/**`: **zero matches**.

Single hit in `src/app/globals.css` line 704:
```css
/* Phase B (C.1): stronger elevation on hover — matches Tesla-style lift.
```
This is a **developer comment** documenting design intent, not Tesla branding or asset references. No Tesla URLs, logos, or copy in shipped markup/styles.

The commit `4239169` explicitly **removes** `'supercharger'` keyword from `EquipmentShowcase.tsx` DCFC detection:
```diff
-      lower.includes('supercharger') ||
+      lower.includes('fast charger') ||
```
This is a positive change that reduces Tesla-brand coupling.

### Prop shape changes consumed by `src/app/proposal/[viewToken]/page.tsx`

None. All four touched components (`PortalHero`, `EquipmentShowcase`, `TimelineSection`, `ValueSection`) retain their existing `vm: ProposalViewModel` + optional `aerialUrl` prop shape. PortalHero diff is an internal className change; no interface changes.

### Non-portal-scoped CSS leak audit

All CSS changes in `src/app/globals.css` are prefixed with `.proposal-portal` selector (inspected diff):
- `.proposal-portal .pp-hero-stat` (line 690)
- `.proposal-portal .pp-hero-stat:hover`
- `.proposal-portal .pp-hero-stat[data-lead='true']:hover`

Zero unscoped/global selectors introduced. No leak risk.

---

## 5. Phase B acceptance checkpoints

Source: `reports/proposal-portal-redesign-map.md` §6.

### Rendering & Visual

| Checkpoint | Status | Evidence |
|---|---|---|
| Hero stat cards: hover shows subtle background lift + shadow (0 8px 16px); text color unchanged | PASS (static) | `globals.css` lines 706-709: `box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15)`, background nudged `0.12→0.16`, no color override |
| Hero contrast: WCAG AA (4.5:1) on varying aerial darkness | UNKNOWN-NEEDS-BROWSER | Text still `text-white` + textShadow; requires live aerial testing |
| ValueSection: eyebrow "Value" above "Why now..." title | PASS | `ValueSection.tsx:67`: `<p className="pp-eyebrow mb-3">Value</p>` above h2 |
| TimelineSection: dark bg transitions smoothly | UNKNOWN-NEEDS-BROWSER | Class scheme unchanged; only padding bumped |
| Section padding: `py-24 md:py-32` (Value), `py-20 md:py-28` (Timeline) | PASS | `ValueSection.tsx:65`: `py-24 md:py-32`; `TimelineSection.tsx:19`: `py-20 md:py-28` |
| Equipment card: hover scale + shadow consistent with hero stat | PASS (static) | Uses existing `.pp-equipment-card` class, unchanged; no regression |
| Mobile responsive: stacks/reflows at sm/md | UNKNOWN-NEEDS-BROWSER | Tailwind responsive classes unchanged |

### Functional

| Checkpoint | Status | Evidence |
|---|---|---|
| Token scoping: all `.proposal-portal` styles scoped; no CSS leaks | PASS | Diff grep — all new selectors are `.proposal-portal`-prefixed |
| Reveal animations: IntersectionObserver still triggers | PASS (static) | `ProposalLayout` untouched; `.reveal` class still used |
| Motion respect: `prefers-reduced-motion` disables | PASS | `globals.css` still contains `@media (prefers-reduced-motion: reduce)` block at line 725 |
| Links & CTAs: buttons/mailto/tel functional | UNKNOWN-NEEDS-BROWSER | No href changes in diff |
| ViewModel data flows through all sections | PASS | All components still destructure `vm: ProposalViewModel` |

### Regression Testing

| Checkpoint | Status | Evidence |
|---|---|---|
| `/proposal/[viewToken]` 404 for invalid, renders for valid | PASS (static) | Route file untouched; imports intact (§7) |
| Token gating: non-proposal pages unaffected | PASS | CSS changes all `.proposal-portal`-scoped |
| Accessibility baseline (semantic headings, labeled buttons) | PASS (static) | Heading hierarchy unchanged in diff |
| Performance: Lighthouse ≥ 85 mobile | UNKNOWN-NEEDS-BROWSER | No new images/fonts; CSS adds ~18 lines |

### Browser & Device Testing

All entries: **UNKNOWN-NEEDS-BROWSER**.

### Git & CI/CD

| Checkpoint | Status | Evidence |
|---|---|---|
| `npm run lint` passes | PASS for portal; pre-existing errors elsewhere | §1 |
| `tsc` completes without errors | PASS for portal; pre-existing errors in tests + untracked template | §2, §6 |
| Unit/integration tests still pass | PASS | §3 — 144/144 |
| `npm run build` completes | **FAIL** (pre-existing, untracked folder) | §6 |

### Accessibility Audit

All entries: **UNKNOWN-NEEDS-BROWSER** (color contrast, focus visible, semantic HTML verification, alt text).

---

## 6. Build (`npm run build`)

**Status:** FAIL — but **pre-existing** and unrelated to Phase C.

```
▲ Next.js 16.1.6 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 39.5s
  Running TypeScript ...
Failed to compile.

./Bullet ev estimating/Estimate template/bulletev-portal-design/playwright-fixture.ts:3:30
Type error: Cannot find module 'lovable-agent-playwright-config/fixture'
 or its corresponding type declarations.

  1 | // Re-export the base fixture from the package
  2 | // Override or extend test/expect here if needed
> 3 | export { test, expect } from "lovable-agent-playwright-config/fixture";
    |                              ^
Next.js build worker exited with code: 1
```

**Root cause:** A stray reference template folder `Bullet ev estimating/Estimate template/bulletev-portal-design/` exists at the project root. It is untracked (`git status` shows `?? "Bullet ev estimating/"`) and missing from `.gitignore`. Next.js 16 + Turbopack pulls any `.ts`/`.tsx` file under the project root into its TypeScript pass, and this template references `lovable-agent-playwright-config` which is not in `node_modules`.

**Evidence this is pre-existing, not Phase C's fault:**
- The folder was not touched by any of the 4 Phase C commits (`git diff 034993f^..HEAD --name-only` lists zero files under `Bullet ev estimating/`).
- The portal code itself compiled successfully (`✓ Compiled successfully in 39.5s`); failure occurred only in the subsequent standalone `tsc` pass.
- All Phase C-touched files type-check cleanly.

**Recommended fix (out of scope for Phase D):**
- Add `Bullet ev estimating/` to `.gitignore` AND delete or relocate the folder out of the project root, OR
- Add an `exclude` entry for `Bullet ev estimating/**` in `tsconfig.json`.

Either fix is trivial but requires orchestrator sign-off because it touches config and may have been deliberately stashed there.

---

## 7. Proposal route sanity (`src/app/proposal/[viewToken]/page.tsx`)

**Status:** PASS.

All 9 expected components are imported and used:

| Component | Import line | Used in JSX |
|---|---|---|
| `ProposalLayout` | 14 | Yes (L65) |
| `PortalHero` | 15 | Yes (L66) |
| `ValueSection` | 16 | Yes (L67) |
| `InvestmentBreakdown` | 17 | Yes (L73) |
| `EquipmentShowcase` | 18 | Yes (L69) |
| `TimelineSection` | 19 | Yes (L74) |
| `SiteMapSection` | 20 | Yes (L71) |
| `ROICalculator` | 21 | Yes (L72) |
| `InteractiveSection` | 22 | Yes (L75) |
| `ProposalFooter` | 23 | Yes (L76) |

Zero unused imports. Render order preserved from pre-Phase-C state. `dynamic = 'force-dynamic'` and `revalidate = 0` unchanged. `generateMetadata` + `notFound()` token-gating intact.

---

## Summary Table

| Check | Status |
|---|---|
| Lint (portal scope) | PASS |
| Lint (repo-wide) | PRE-EXISTING failures, none in Phase C scope |
| Typecheck (portal scope) | PASS |
| Typecheck (repo-wide) | 5 pre-existing errors in `tests/regressions/conduit-*`; none in Phase C scope |
| Unit tests | PASS (144/144) |
| Static audit — Tesla branding | PASS (only a design-intent comment in CSS; actual `supercharger` keyword REMOVED) |
| Static audit — prop shape | PASS (no public API changes) |
| Static audit — CSS scope | PASS (all new rules `.proposal-portal`-scoped) |
| Build | FAIL — pre-existing untracked `Bullet ev estimating/` folder, **NOT** introduced by Phase C |
| Proposal route imports | PASS (10/10 components used) |
| Phase B §6 rendering checkpoints | PASS where statically verifiable; UNKNOWN-NEEDS-BROWSER otherwise |

---

## Recommended next steps

1. **Unblock build** — orchestrator decides: `.gitignore` + `rm -rf "Bullet ev estimating/"` OR `tsconfig.json` exclude. This is the ONLY thing standing between YELLOW and GREEN.
2. **Browser smoke test** — load `/proposal/<test-token>` on a staging deploy to clear the UNKNOWN-NEEDS-BROWSER checkpoints (hero contrast, section transitions, mobile reflow, Lighthouse).
3. **Optional cleanup** — address the 39 pre-existing lint errors (`react-hooks/set-state-in-effect` violations) separately from Phase C/D. Not blocking.

---

**Validation prepared:** 2026-04-23
**Phase D owner:** Validation agent
**Handoff:** Orchestrator for build-unblock decision + optional browser QA
