# Baseline v1 (Fase 0)

Measured 2026-11-15 on commit `da61bf2` (branch `v2` before any redesign), local production build (`npm run build && npm run start`), Windows, Chrome Headless Shell. These are the "before" numbers for the v2 case study.

## Lighthouse 12.8.2 — `/en`

| Profile | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Mobile (default throttling) | **56** | 94 | 100 | 100 | **6.3 s** | 690 ms | 0.026 |
| Desktop | 98 | 94 | 100 | 100 | 1.1 s | 10 ms | 0.01 |

PRD target: ≥95 on all four categories, mobile. Main gap: mobile Performance. Likely causes: `Preloader` overlay (C9), framer-motion on every section, hotlinked skill icons (C8).

## axe-core — `/en` (desktop)

| Rule | Impact | Nodes |
|---|---|---|
| `color-contrast` | serious | 8 |
| `heading-order` | moderate | 2 |
| `region` | moderate | 1 |

## Static checks

| Check | Result |
|---|---|
| `npm run lint` | 15 errors, 11 warnings (`no-explicit-any`, `react-hooks/set-state-in-effect`, `no-img-element`, …) |
| `npm run typecheck` | Pass |
| `npm run build` | Pass. `/[locale]` is rendered dynamically (ƒ), not static |

## E2E (Playwright, desktop + Pixel 7)

48 tests, all green. Run: `npm run build`, then `npm run test:e2e`.

- `tests/e2e/home.spec.ts`: locale redirect from `/`, `lang` attribute, language toggle keeps hash, sections exist, navbar anchors, stable CV URL.
- `tests/e2e/contact.spec.ts`: required-field validation, success and error paths (Formspree mocked with `page.route`).
- `tests/e2e/known-bugs.spec.ts`: PRD §2.1 bugs C1/C2, C6, C8, and axe serious violations, marked `test.fail()`. Each one flips CI red when it gets fixed; then remove its `test.fail()`.

## CI

`.github/workflows/ci.yml`: install → lint (non-blocking until Fase 3) → typecheck → build → Playwright → upload `playwright-report` artifact.

---

# After refactor (branch `v2`)

Measured 2026-11-15, same machine and method.

## Lighthouse 12.8.2

| Page / profile | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/en` mobile (3 runs) | 74 / 84 / 97 (median **84**) | **100** | 100 | 100 | **2.1–2.2 s** | 150–1,170 ms | **0** |
| `/en` desktop | **100** | 100 | 100 | 100 | 0.7 s | 20 ms | 0 |
| `/en/projects/eretribusi` mobile | 90 | 100 | 100 | 100 | 1.5 s | 400 ms | 0 |
| `/en/projects/eretribusi` desktop | 99 | 100 | 100 | 100 | 0.6 s | 60 ms | 0 |

Mobile Performance swings with TBT, which is local CPU noise (same build, 74 to 97). LCP is stable: 6.3 s → 2.1 s. Re-measure on the Vercel deployment with PageSpeed Insights before quoting a number publicly.

## axe-core

0 violations on `/en`, `/id`, `/en/projects/eretribusi` (enforced by `tests/e2e/a11y.spec.ts`).

## Static checks

| Check | Before | After |
|---|---|---|
| `npm run lint` | 15 errors, 11 warnings | 0 (now blocking in CI) |
| `npm run typecheck` | Pass | Pass (`next typegen && tsc --noEmit`) |
| Rendering | `/[locale]` dynamic | All pages SSG (13 static pages) |

## E2E

68 tests (34 × desktop + Pixel 7), all green. Every v1 known bug (C1/C2, C6, C8, axe) is now a normal passing regression test.
