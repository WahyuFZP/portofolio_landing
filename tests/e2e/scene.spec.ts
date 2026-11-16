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

test("phones show the static poster and never download three.js", async ({ page, isMobile }) => {
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

test("the 3D canvas renders at half resolution (pixelated)", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only: phones keep the poster");
  await page.goto("/en");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-scene", "live", { timeout: 15_000 });
  const { width, clientWidth } = await scene.locator("canvas").evaluate((c: HTMLCanvasElement) => ({ width: c.width, clientWidth: c.clientWidth }));
  expect(width).toBeLessThanOrEqual(Math.ceil(clientWidth / 2));
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

test("hovering a skill node names it, clicking a linked one filters projects", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only: phones keep the poster");
  await page.goto("/en");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-scene", "live", { timeout: 15_000 });
  const canvas = scene.locator("canvas");
  const box = (await canvas.boundingBox())!;

  // Sweep the canvas until the cursor says "clickable skill" (node positions rotate, so no fixed point).
  let found = false;
  sweep: for (let gy = 0.2; gy <= 0.8; gy += 0.05) {
    for (let gx = 0.2; gx <= 0.8; gx += 0.05) {
      await page.mouse.move(box.x + box.width * gx, box.y + box.height * gy);
      await page.waitForTimeout(50);
      if ((await canvas.evaluate((c: HTMLCanvasElement) => c.style.cursor)) === "pointer") {
        found = true;
        break sweep;
      }
    }
  }
  expect(found).toBe(true);
  await expect(scene.locator("span")).toBeVisible(); // tooltip with the skill name
  await page.mouse.down();
  await page.mouse.up();
  await expect(page).toHaveURL(/\?skill=[a-z-]+#projects$/);
  await expect(page.locator("#projects").getByRole("button", { name: /Clear skill filter/ })).toBeVisible();
});

test("deep-field background starts after load on desktop and stays behind the content", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only: phones get no WebGL");
  await page.goto("/en");
  const bg = page.locator("canvas[data-deepfield]");
  await expect(bg).toHaveAttribute("data-deepfield", "live", { timeout: 15_000 });
  await expect(bg).toHaveAttribute("aria-hidden", "true");
  // It must never swallow clicks: the primary CTA still works with the canvas covering the viewport.
  await page.locator("#home").getByRole("link", { name: /View projects/ }).click();
  await expect(page).toHaveURL(/#projects$/);
});

test("deep-field background stays off under reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/en", { waitUntil: "load" });
  await page.waitForTimeout(4000); // longer than the idle fallback
  await expect(page.locator("canvas[data-deepfield]")).toHaveAttribute("data-deepfield", "off");
  await ctx.close();
});
