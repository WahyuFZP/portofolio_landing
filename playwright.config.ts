import { defineConfig, devices } from "@playwright/test";

// PW_PORT lets the suite run beside a dev server that already holds port 3000.
const PORT = Number(process.env.PW_PORT ?? 3000);
// PW_BASE_URL points the suite at a site that is already running (the post-deploy smoke test); no local server then.
const REMOTE = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2, // more workers starve `next start` and time out on mobile emulation
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: REMOTE ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Needs a production build first: `npm run build`.
  webServer: REMOTE
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        url: `http://localhost:${PORT}/en`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
