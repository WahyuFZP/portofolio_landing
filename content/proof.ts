// Numbers shown in the hero proof strip. Both come from one public GitHub Actions run, linked below,
// so a visitor can check them. Update all three together after a newer green run.
export const proof = {
  e2ePassing: 99, // "Playwright Run Summary" annotation of the run: 99 passed, 5 skipped (device-specific)
  axeViolations: 0, // tests/e2e/a11y.spec.ts in the same run: light + dark, desktop + mobile
  workflowUrl: "https://github.com/WahyuFZP/portofolio_landing/actions",
  // While empty, the two numbers stay hidden.
  ciRunUrl: "https://github.com/WahyuFZP/portofolio_landing/actions/runs/43797273821",
};
