import { test, expect } from "@playwright/test";

test.describe("theme toggle", () => {
  test("switches theme, and the choice survives a reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/en");
    const html = page.locator("html");
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const light = await bg();

    await page.getByRole("button", { name: /light and dark theme/ }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect.poll(bg).not.toBe(light);

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark"); // set before paint by the inline script

    await page.getByRole("button", { name: /light and dark theme/ }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect.poll(bg).toBe(light);
  });

  test("an explicit light choice beats a dark OS", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/en");
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.getByRole("button", { name: /light and dark theme/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(dark);
  });
});

test.describe("footer", () => {
  test("has Explore, Connect and Site menus with working links", async ({ page, request }) => {
    await page.goto("/en");
    const footer = page.locator("footer");
    for (const name of ["Explore", "Connect", "Site"]) {
      await expect(footer.getByRole("navigation", { name })).toBeVisible();
    }
    // Every in-page link points at a section that exists.
    const anchors = await footer.locator('a[href*="#"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash));
    expect(anchors.length).toBeGreaterThanOrEqual(6);
    for (const hash of anchors) await expect(page.locator(hash)).toHaveCount(1);
    expect((await request.get("/sitemap.xml")).status()).toBe(200);

    await footer.getByRole("link", { name: "Bahasa Indonesia" }).click();
    await expect(page).toHaveURL(/\/id$/);
  });
});

test.describe("layout", () => {
  test("stack marquee can be paused and resumed without a mouse", async ({ page }) => {
    await page.goto("/en");
    const strip = page.locator(".marquee").first();
    const state = () => strip.evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(await state()).toBe("running");

    const button = page.getByRole("button", { name: "Pause motion" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Resume motion" })).toHaveAttribute("aria-pressed", "true");
    expect(await state()).toBe("paused");

    await page.keyboard.press("Enter");
    expect(await state()).toBe("running");
  });

  test("stack marquee is decorative and the page never scrolls sideways", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator(".marquee-band").first()).toBeVisible();
    await expect(page.locator(".marquee-band").first().locator("xpath=..")).toHaveAttribute("aria-hidden", "true");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });

  test("project cards show the site inside a laptop frame", async ({ page }) => {
    await page.goto("/en#projects");
    await expect(page.locator("#projects article .laptop-lid")).toHaveCount(3);
    await expect(page.locator("#projects article", { hasText: "This Portfolio" }).locator(".laptop-lid")).toContainText("This Portfolio"); // no live URL claimed until v2 is deployed
  });
});
