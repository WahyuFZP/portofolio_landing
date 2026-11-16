// Numbers shown in the hero proof strip.
// shortcut: hand-maintained; update after `npm run test:e2e` / Lighthouse runs (see docs/baseline-v1.md).
export const proof = {
  e2ePassing: 99, // `npm run test:e2e`, 2026-11-16: 99 passed, 5 skipped (device-specific)
  a11yScore: 100,
  workflowUrl: "https://github.com/WahyuFZP/portofolio_landing/actions",
  // URL of a passing GitHub Actions run. While empty, the two numbers above stay hidden:
  // a visitor must be able to verify them (set this after the first green run on GitHub).
  ciRunUrl: "",
};
