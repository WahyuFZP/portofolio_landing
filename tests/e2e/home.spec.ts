import { test, expect, type Page } from "@playwright/test";

// On mobile the section links live in a <details> menu.
async function openMenuIfCollapsed(page: Page) {
  const summary = page.locator("header summary");
  if (await summary.isVisible()) await summary.click();
}

test.describe("locale routing", () => {
  for (const [header, locale] of [
    ["en-US,en;q=0.9", "en"],
    ["id-ID,id;q=0.9", "id"],
    ["fr-FR", "id"], // unknown language falls back to default `id`
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
  test("name, role, CTAs and proof strip are visible without scrolling", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await expect(page.getByText("Software QA Engineer · Automation, API & Security")).toBeInViewport();
    await expect(page.locator("#home").getByRole("link", { name: /View projects/ })).toBeInViewport();
    await expect(page.locator("#home").getByRole("link", { name: /Download CV/ })).toBeInViewport();
    const proof = page.getByRole("list", { name: "Test run summary" });
    await expect(proof).toBeInViewport();
    await expect(proof).toContainText("QA Engineer @ Exodrinks");
    await expect(proof).toContainText("3 case studies");
    // Test and a11y numbers stay hidden until a public CI run can back them (content/proof.ts).
    await expect(proof).not.toContainText("tests passing");
  });
});

test.describe("home sections", () => {
  test("sections follow the QA-first order", async ({ page }) => {
    await page.goto("/en");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(["home", "projects", "skills", "experience", "about", "contact"]);
  });

  test("old #certificates anchor still exists", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("#certificates")).toHaveCount(1);
  });

  for (const id of ["projects", "experience", "about", "contact"]) {
    test(`navbar link scrolls to #${id}`, async ({ page }) => {
      await page.goto("/en");
      await openMenuIfCollapsed(page);
      await page.locator(`header a[href="/en#${id}"]:visible`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`section#${id}`)).toBeInViewport();
    });
  }

  test("CV link serves a PDF", async ({ page, request }) => {
    await page.goto("/en");
    const href = await page.locator('a[href$=".pdf"]').first().getAttribute("href");
    expect(href).toBe("/CV-WahyuFikriZeniPutra.pdf"); // public URL must stay stable
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });

  test("each skill is listed once", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("#skills").locator("li", { hasText: /^Playwright/ })).toHaveCount(1);
  });

  test("experience matches LinkedIn: 3 roles, current one first", async ({ page }) => {
    await page.goto("/en");
    const roles = page.locator("#experience ol > li");
    await expect(roles).toHaveCount(3);
    await expect(roles.first()).toContainText("Software Quality Assurance Engineer");
    await expect(roles.first()).toContainText("PT Exodrinks Indonesia Prestige");
    await expect(page.locator("main")).not.toContainText("—"); // no em dashes in visible copy
  });

  test("English page has no Indonesian UI text", async ({ page }) => {
    await page.goto("/en");
    for (const word of ["Lokasi", "Kirim pesan", "Pesan Terkirim", "Unduh CV", "Sedang belajar"]) {
      await expect(page.locator("body")).not.toContainText(word);
    }
  });

  test("pixel font is only used for display text, never for reading text", async ({ page }) => {
    await page.goto("/en");
    const fonts = await page
      .locator("#home p.text-lg, #about div.text-lg p, #about li p.text-muted, #experience ol li li, #projects article p.text-muted")
      .evaluateAll((els) => els.map((e) => getComputedStyle(e).fontFamily));
    expect(fonts.length).toBeGreaterThan(5);
    for (const f of fonts) expect(f.toLowerCase()).not.toContain("pixelify");
  });
});

test.describe("projects", () => {
  test("category filter narrows the list and is shareable via URL", async ({ page }) => {
    await page.goto("/en#projects");
    const cards = page.locator("#projects article");
    await expect(cards).toHaveCount(3);

    await page.locator("#projects").getByRole("button", { name: "QA", exact: true }).click();
    await expect(page).toHaveURL(/\?category=qa#projects$/);
    await expect(cards).toHaveCount(2);

    await page.reload();
    await expect(cards).toHaveCount(2);

    await page.locator("#projects").getByRole("button", { name: "All", exact: true }).click();
    await expect(cards).toHaveCount(3);
  });

  test("skill chip filters projects and the filter can be cleared", async ({ page }) => {
    await page.goto("/en");
    await page.locator("#skills").getByRole("link", { name: /Laravel/ }).click();
    await expect(page).toHaveURL(/\?skill=laravel#projects$/);
    const cards = page.locator("#projects article");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("E-Retribution");

    await page.getByRole("button", { name: /Clear skill filter/ }).click();
    await expect(cards).toHaveCount(3);
  });

  test("filters with no match show an empty state with a reset", async ({ page }) => {
    await page.goto("/en?category=qa&skill=laravel#projects");
    const section = page.locator("#projects");
    await expect(section.locator("article")).toHaveCount(0);
    await expect(section.getByText("No projects match these filters.")).toBeVisible();
    await section.getByRole("button", { name: "Show all projects" }).click();
    await expect(section.locator("article")).toHaveCount(3);
    await expect(page).toHaveURL(/\/en#projects$/);
  });

  test("unknown ?skill and ?category show all projects", async ({ page }) => {
    await page.goto("/en?skill=nope&category=nope#projects");
    await expect(page.locator("#projects article")).toHaveCount(3);
  });

  test("tags beyond 4 collapse into +N with the full list for screen readers", async ({ page }) => {
    await page.goto("/en#projects");
    const more = page.locator("#projects article", { hasText: "Ticket Space" }).locator("li", { hasText: /^\+\d+$/ });
    await expect(more).toHaveText("+5");
    await expect(more).toHaveAttribute("aria-label", /PostgreSQL/);
  });

  test("card opens the case study, next project link works", async ({ page }) => {
    await page.goto("/en#projects");
    await page.getByRole("link", { name: "E-Retribution Payment System" }).click();
    await expect(page).toHaveURL(/\/en\/projects\/eretribusi$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("E-Retribution Payment System");
    await expect(page.getByRole("heading", { level: 2, name: "Problem" })).toBeVisible();

    await page.getByRole("link", { name: /Next project/ }).click();
    await expect(page).toHaveURL(/\/en\/projects\/ticketspace$/);
  });

  test("unknown project slug is a 404", async ({ request }) => {
    expect((await request.get("/en/projects/nope")).status()).toBe(404);
  });
});

test("sitemap lists both locales", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/en/projects/eretribusi");
  expect(xml).toContain("/id/projects/eretribusi");
});
