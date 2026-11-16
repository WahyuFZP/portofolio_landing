import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of ["/en", "/id", "/en/projects/eretribusi"]) {
  test(`no axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
  });
}
