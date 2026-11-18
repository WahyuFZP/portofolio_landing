import { test, expect } from "@playwright/test";

const PAGES = ["/en", "/id", "/en/projects/eretribusi"];
const XSS = `"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>`;
const xssRan = () => (window as unknown as { __xss?: number }).__xss;

test.describe("response headers", () => {
  for (const path of [...PAGES, "/CV-WahyuFikriZeniPutra.pdf"]) {
    test(`${path} sends the hardening headers`, async ({ request }) => {
      const h = (await request.get(path)).headers();
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["x-frame-options"]).toBe("DENY");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"]).toContain("camera=()");
      expect(h["strict-transport-security"]).toContain("max-age=");
      expect(h["x-powered-by"]).toBeUndefined(); // do not advertise the framework
      const csp = h["content-security-policy"];
      for (const rule of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) expect(csp).toContain(rule);
      expect(csp).not.toContain("unsafe-eval");
    });
  }
});

test.describe("page load", () => {
  for (const path of PAGES) {
    test(`${path} loads with no console errors, no third-party requests and no cookies`, async ({ page, context, baseURL }) => {
      const errors: string[] = [];
      const foreign: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text())); // includes CSP violations
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("request", (r) => {
        if (!r.url().startsWith(baseURL!) && !/^(data|blob):/.test(r.url())) foreign.push(r.url());
      });
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // lazy images and canvases too
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
      expect(foreign).toEqual([]);
      expect(await context.cookies()).toEqual([]);
    });
  }

  test("client bundles carry no secrets and no source maps", async ({ page, request }) => {
    const scripts: string[] = [];
    page.on("response", (r) => r.request().resourceType() === "script" && scripts.push(r.url()));
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    expect(scripts.length).toBeGreaterThan(0);
    const secret = /SPOTIFY_|client_secret|refresh_token|-----BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}/;
    for (const url of scripts) {
      const body = await (await request.get(url)).text();
      expect(body.match(secret)?.[0], url).toBeUndefined();
    }
    expect((await request.get(`${scripts[0]}.map`)).status()).toBe(404);
  });
});

test.describe("injection", () => {
  test("script payloads in the query string and hash are never executed", async ({ page }) => {
    let dialog = false;
    page.on("dialog", (d) => ((dialog = true), d.dismiss()));
    await page.goto(`/en?skill=${encodeURIComponent(XSS)}&category=${encodeURIComponent(XSS)}#${encodeURIComponent(XSS)}`);
    await expect(page.locator("#projects [aria-live]")).toHaveText("3 / 3"); // unknown filters are ignored
    expect(await page.evaluate(xssRan)).toBeUndefined();
    expect(dialog).toBe(false);
  });

  test("a script payload in the path is a 404 and is not echoed as markup", async ({ request }) => {
    const res = await request.get(`/en/projects/${encodeURIComponent("<script>alert(1)</script>")}`);
    expect(res.status()).toBe(404);
    expect(await res.text()).not.toContain("<script>alert(1)</script>");
  });

  test("the contact form sends a payload as plain text, only to Formspree", async ({ page }) => {
    const posts: { url: string; body: string }[] = [];
    await page.route("https://formspree.io/**", async (route) => {
      posts.push({ url: route.request().url(), body: route.request().postData() ?? "" });
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await page.goto("/en#contact");
    await page.locator("#name").fill(XSS.slice(0, 100));
    await page.locator("#email").fill("qa@example.com");
    await page.locator("#message").fill(XSS);
    await page.locator("#contact form button[type=submit]").click();
    await expect(page.getByText(/Message sent/)).toBeVisible();
    expect(posts).toHaveLength(1);
    expect(posts[0].url).toMatch(/^https:\/\/formspree\.io\/f\/\w+$/);
    expect(posts[0].body).toContain("window.__xss=1"); // sent as typed, not altered
    expect(await page.evaluate(xssRan)).toBeUndefined();
  });

  test("contact fields are length-limited and the honeypot is out of reach", async ({ page }) => {
    await page.goto("/en#contact");
    await expect(page.locator("#name")).toHaveAttribute("maxlength", "100");
    await expect(page.locator("#email")).toHaveAttribute("maxlength", "200");
    await expect(page.locator("#message")).toHaveAttribute("maxlength", "5000");
    await page.locator("#email").fill("not-an-email");
    await expect(page.locator("#email")).toHaveJSProperty("validity.typeMismatch", true);
    const trap = page.locator('input[name="_gotcha"]');
    await expect(trap).toBeHidden();
    await expect(trap).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("routing", () => {
  test("the locale redirect cannot be pointed at another site", async ({ request, baseURL }) => {
    for (const path of ["//evil.example", "/%5Cevil.example", "//evil.example/%2f.."]) {
      const res = await request.get(`${baseURL}${path}`, { maxRedirects: 0 });
      const location = res.headers()["location"];
      if (location) expect(new URL(location, baseURL).origin, path).toBe(new URL(baseURL!).origin);
      else expect(res.status(), path).toBeGreaterThanOrEqual(400);
    }
  });

  for (const path of ["/.env", "/.env.local", "/.git/config", "/package.json", "/next.config.ts", "/en/projects/..%2f..%2fpackage.json", "/en/projects/%2e%2e%2f%2e%2e%2f.env.local"]) {
    test(`${path} is not served`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404);
    });
  }
});

test.describe("links", () => {
  for (const path of PAGES) {
    test(`${path}: new-tab links are isolated and external links use https`, async ({ page }) => {
      await page.goto(path);
      const links = await page.locator("a[href]").evaluateAll((as) => as.map((a) => ({ href: a.getAttribute("href")!, target: a.getAttribute("target"), rel: a.getAttribute("rel") ?? "" })));
      for (const l of links) {
        if (l.target === "_blank") expect(l.rel, l.href).toMatch(/noopener.*noreferrer|noreferrer.*noopener/);
        if (/^[a-z][a-z0-9+.-]*:/i.test(l.href)) expect(l.href).toMatch(/^(https:\/\/|mailto:)/); // no http:, no javascript:
      }
    });
  }
});
