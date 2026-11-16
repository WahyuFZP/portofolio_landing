import { test, expect, type Page } from "@playwright/test";

// The 3D constellation must never compete with first paint (PRD-UIUX §7.1).

/** Records when (ms since navigation) a script containing three.js arrives. */
function watchThree(page: Page) {
  const seen: number[] = [];
  page.on("response", async (res) => {
    if (res.request().resourceType() !== "script") return;
    const body = await res.text().catch(() => "");
    if (body.includes("WebGLRenderer")) seen.push(Date.now());
  });
  return seen;
}

test("phones keep the poster and never download three.js", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone-only rule");
  const threeAt = watchThree(page);
  await page.goto("/en", { waitUntil: "load" });
  await page.waitForTimeout(4000); // longer than the idle fallback
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-scene", "poster");
  expect(threeAt).toEqual([]);
});

test("poster first, three.js only after the load event, then the live scene", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only: phones keep the poster");
  const threeAt = watchThree(page);
  await page.goto("/en", { waitUntil: "load" });
  const loadedAt = Date.now();
  const scene = page.locator("[data-scene]");
  await expect(scene.locator("svg")).toHaveCount(1); // server-rendered poster

  await expect(scene).toHaveAttribute("data-scene", "live", { timeout: 15_000 });
  expect(threeAt.length).toBeGreaterThan(0);
  expect(Math.min(...threeAt)).toBeGreaterThanOrEqual(loadedAt - 50);
});

test("the 3D canvas renders at 1/4 resolution (pixelated)", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only: phones keep the poster");
  await page.goto("/en");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-scene", "live", { timeout: 15_000 });
  const { width, clientWidth } = await scene.locator("canvas").evaluate((c: HTMLCanvasElement) => ({ width: c.width, clientWidth: c.clientWidth }));
  expect(width).toBeLessThanOrEqual(Math.ceil(clientWidth / 4));
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("keeps the poster and never downloads three.js", async ({ page }) => {
    const threeAt = watchThree(page);
    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(4000); // longer than the idle fallback
    await expect(page.locator("[data-scene]")).toHaveAttribute("data-scene", "poster");
    expect(threeAt).toEqual([]);
  });

  test("all sections are visible without waiting for animations", async ({ page }) => {
    await page.goto("/en");
    for (const id of ["projects", "skills", "experience", "about", "contact"]) {
      const heading = page.locator(`section#${id} h2`);
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toHaveCSS("opacity", "1");
    }
  });
});
