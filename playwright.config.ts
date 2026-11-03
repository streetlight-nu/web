import { defineConfig, devices } from "@playwright/test";

const base = (process.env.BASE_PATH ?? "/").replace(/\/?$/, "/");
// E2E_PORT lets several checkouts run their browser tests at the same time.
const port = Number(process.env.E2E_PORT ?? 4321);

// A second build of the site with filled-in föreningsuppgifter and julkampanj from test files, served on its
// own port (E2E_PORT_IFYLLD, by default the one after E2E_PORT), so the tests can see both the "fylls i" chips
// (the real, empty data files) and real values.
const filledPort = Number(process.env.E2E_PORT_IFYLLD ?? port + 1);
process.env.E2E_IFYLLD_URL = `http://localhost:${filledPort}${base}`;
const filledOutDir = "dist-ifylld";

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${port}${base}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `npm run preview -- --port ${port} --ignore-lock`,
      url: `http://localhost:${port}${base}`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "FORENINGSUPPGIFTER_FIL=tests/fixtures/foreningsuppgifter-ifylld.json" +
        " JULKAMPANJ_FIL=tests/fixtures/julkampanj-ifylld.json" +
        ` npm run build -- --outDir ${filledOutDir}` +
        ` && npm run preview -- --outDir ${filledOutDir} --port ${filledPort} --ignore-lock`,
      url: process.env.E2E_IFYLLD_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
