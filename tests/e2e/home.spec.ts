import { test, expect, type Page } from "@playwright/test";

const SECTIONS = ["about", "skills", "process", "projects", "experience", "contact"];

// Puts a section across the middle of the screen, where the navbar and the guide count it as "in view".
const scrollInto = (page: Page, id: string) =>
  page.evaluate((id) => window.scrollTo({ top: document.getElementById(id)!.getBoundingClientRect().top + scrollY + 200, behavior: "instant" }), id);

test.describe("locale routing", () => {
  for (const [header, locale] of [
    ["en-US,en;q=0.9", "en"],
    ["id-ID,id;q=0.9", "id"],
    ["fr-FR", "id"], // unknown language falls back to the default
  ] as const) {
    test(`/ redirects to /${locale} for Accept-Language "${header}"`, async ({ request }) => {
      const res = await request.get("/", { headers: { "accept-language": header }, maxRedirects: 0 });
      expect(res.status()).toBeGreaterThanOrEqual(300);
      expect(res.status()).toBeLessThan(400);
      expect(new URL(res.headers()["location"], res.url()).pathname).toBe(`/${locale}`);
    });
  }

  for (const locale of ["en", "id"]) {
    test(`/${locale} renders with lang="${locale}" and the owner's name`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Wahyu");
    });
  }

  test("unknown locale is a 404", async ({ request }) => {
    expect((await request.get("/fr")).status()).toBe(404);
  });

  test("language toggle switches locale and keeps the section hash", async ({ page }) => {
    await page.goto("/en#projects");
    await page.getByRole("link", { name: /Ganti ke Bahasa Indonesia/ }).click();
    await expect(page).toHaveURL(/\/id#projects$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
  });

  test("language toggle on a case study keeps the project", async ({ page }) => {
    await page.goto("/en/projects/eretribusi");
    await page.getByRole("link", { name: /Ganti ke Bahasa Indonesia/ }).click();
    await expect(page).toHaveURL(/\/id\/projects\/eretribusi$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sistem Pembayaran E-Retribusi");
  });
});

test.describe("hero", () => {
  test("name and both calls to action are on the first screen", async ({ page }) => {
    await page.goto("/en");
    const hero = page.locator("#home");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await expect(hero.getByRole("link", { name: /View projects/ })).toBeInViewport();
    await expect(hero.getByRole("link", { name: /Download CV/ })).toBeInViewport();
  });

  test("a clicked fish is eaten and the octopus burps", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // fish hold still, so the click is not a moving target
    await page.goto("/en");
    const fish = page.getByRole("button", { name: "Feed this fish to the octopus" });
    await expect(fish).toHaveCount(4);
    const first = page.locator("#home button.swim").first(); // by position: the role query skips a fish once it is hidden
    await first.click();
    await expect(page.locator("#home").getByRole("status")).toHaveText("Burp!");
    await expect(first).toBeHidden();
    await expect(fish).toHaveCount(3);
  });

  test("the CV link serves a PDF", async ({ page, request }) => {
    await page.goto("/en");
    const href = await page.locator("#home a[download]").getAttribute("href");
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });
});

test.describe("home", () => {
  test("sections come in the expected order", async ({ page }) => {
    await page.goto("/en");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(["home", ...SECTIONS]);
  });

  for (const locale of ["en", "id"]) {
    test(`/${locale} never scrolls sideways`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }

  test("navbar link scrolls to its section and marks it current", async ({ page }) => {
    await page.goto("/en");
    const summary = page.locator("header summary");
    const mobile = await summary.isVisible();
    if (mobile) await summary.click();
    await page.locator("header").getByRole("link", { name: "Process", exact: true }).click();
    await expect(page).toHaveURL(/#process$/);
    await expect(page.locator("#process")).toBeInViewport();
    if (mobile) await expect(page.locator("header details")).not.toHaveAttribute("open", /.*/); // menu closes after a choice
    else await expect(page.locator("header").getByRole("link", { name: "Process", exact: true })).toHaveAttribute("aria-current", "true");
  });

  test("content is readable with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    for (const id of SECTIONS) {
      const heading = page.locator(`#${id} h2`).first();
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      expect(await heading.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
  });

  test("experience entry expands to show every point", async ({ page }) => {
    await page.goto("/en#experience");
    const details = page.locator("#experience details").first();
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", /.*/);
    await expect(details.locator("li").first()).toBeVisible();
  });
});

test.describe("projects", () => {
  const count = (page: Page) => page.locator("#projects [aria-live]");

  test("category filter narrows the list and All restores it", async ({ page }) => {
    await page.goto("/en#projects");
    const filter = page.getByRole("group", { name: "Filter projects" });
    await expect(count(page)).toHaveText("3 / 3");
    await filter.getByRole("button", { name: "QA", exact: true }).click();
    await expect(count(page)).toHaveText("2 / 3");
    await expect(page).toHaveURL(/category=qa/);
    await filter.getByRole("button", { name: "All" }).click();
    await expect(count(page)).toHaveText("3 / 3");
  });

  test("a shared ?skill= link filters, and the chip clears it", async ({ page }) => {
    await page.goto("/en?skill=laravel#projects");
    await expect(count(page)).toHaveText("1 / 3");
    await page.getByRole("button", { name: /Clear skill filter/ }).click();
    await expect(count(page)).toHaveText("3 / 3");
  });

  test("a card opens its case study, and the back link returns", async ({ page }) => {
    await page.goto("/en#projects"); // arriving with the hash is what used to double it on the way back
    await page.locator('#projects a[href="/en/projects/eretribusi"]').first().click();
    await expect(page).toHaveURL(/\/en\/projects\/eretribusi$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("E-Retribution Payment System");
    await page.getByRole("link", { name: "All projects" }).click();
    await expect(page).toHaveURL(/\/en#projects$/);
  });
});

test.describe("octopus guide", () => {
  test("appears after the hero, sums up the section, and can be closed and reopened", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByRole("button", { name: "Section recap" });
    const recap = page.getByRole("status").filter({ hasText: /^Skills:/ });
    const guide = toggle.locator("xpath=..");
    await expect(guide).toHaveAttribute("inert", /.*/); // cannot be focused or clicked while the hero is in view

    await scrollInto(page, "skills");
    await expect(guide).not.toHaveAttribute("inert", /.*/);
    await expect(toggle).toBeInViewport();
    // Phones start with the bubble closed, so it does not cover the content.
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await expect(recap).toBeHidden();
      await toggle.click();
    }
    await expect(recap).toBeVisible();

    await page.getByRole("button", { name: "Hide the recap" }).click();
    await expect(recap).toBeHidden();
    await toggle.click();
    await expect(recap).toBeVisible();

    await scrollInto(page, "contact");
    await expect(page.getByRole("status").filter({ hasText: /^Contact:/ })).toBeVisible();
  });
});

test.describe("footer", () => {
  test("has Explore, Connect and Site menus with working links", async ({ page, request }) => {
    await page.goto("/en");
    const footer = page.locator("footer");
    for (const name of ["Explore", "Connect", "Site"]) await expect(footer.getByRole("navigation", { name })).toBeVisible();
    const anchors = await footer.locator('a[href*="#"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash));
    expect(anchors.length).toBeGreaterThanOrEqual(6);
    for (const hash of anchors) await expect(page.locator(hash)).toHaveCount(1);
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    expect((await request.get("/robots.txt")).status()).toBe(200);

    await footer.getByRole("link", { name: "Bahasa Indonesia" }).click();
    await expect(page).toHaveURL(/\/id$/);
  });
});
