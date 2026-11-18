import { test, expect } from "@playwright/test";

const FORMSPREE = "https://formspree.io/f/**";

test.describe("contact form", () => {
  test("empty submit is blocked by required fields and sends nothing", async ({ page }) => {
    let sent = false;
    await page.route(FORMSPREE, (route) => {
      sent = true;
      return route.abort();
    });
    await page.goto("/en#contact");
    await page.locator("#contact form button[type=submit]").click();
    await expect(page.locator("#contact #name")).toHaveJSProperty("validity.valueMissing", true);
    expect(sent).toBe(false);
  });

  test("valid submit posts to Formspree and shows success", async ({ page }) => {
    const posted: string[] = [];
    await page.route(FORMSPREE, async (route) => {
      posted.push(route.request().postData() ?? "");
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await page.goto("/en#contact");
    await page.locator("#contact #name").fill("QA Bot");
    await page.locator("#contact #email").fill("qa@example.com");
    await page.locator("#contact #message").fill("Hello from Playwright");
    await page.locator("#contact form button[type=submit]").click();

    await expect(page.getByText(/Message sent/)).toBeVisible();
    expect(posted).toHaveLength(1);
    expect(posted[0]).toContain("qa@example.com");
  });

  test("server error shows an error message", async ({ page }) => {
    await page.route(FORMSPREE, (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.goto("/en#contact");
    await page.locator("#contact #name").fill("QA Bot");
    await page.locator("#contact #email").fill("qa@example.com");
    await page.locator("#contact #message").fill("Hello");
    await page.locator("#contact form button[type=submit]").click();
    await expect(page.getByText(/Failed to send/)).toBeVisible();
  });
});
