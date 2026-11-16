import { test, expect } from "@playwright/test";

// Launch options force a new worker, so this lives in its own file.
test.use({ launchOptions: { args: ["--disable-webgl", "--disable-3d-apis"] } });

test("without WebGL the hero keeps the poster and logs no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en", { waitUntil: "load" });
  await page.waitForTimeout(4000); // longer than the idle fallback
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-scene", "poster");
  expect(errors).toEqual([]);
});
