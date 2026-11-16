import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Every theme we ship must pass (the toggle makes both reachable on any OS).
for (const colorScheme of ["light", "dark"] as const) {
  for (const path of ["/en", "/id", "/en/projects/eretribusi"]) {
    test(`no axe violations on ${path} (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
  }
}
