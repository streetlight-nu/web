import { defineConfig, devices } from "@playwright/test";

const base = (process.env.BASE_PATH ?? "/").replace(/\/?$/, "/");
// E2E_PORT lets several checkouts run their browser tests at the same time.
const port = Number(process.env.E2E_PORT ?? 4321);

// Two more builds of the site, with föreningsuppgifter, julkampanj and the questions in Vanliga frågor from test
// files instead of the files the association fills in through Pages CMS, so the tests never depend on what the
// association has written:
// - filled in (E2E_IFYLLD_URL, port E2E_PORT_IFYLLD, by default the one after E2E_PORT): real values.
// - empty (E2E_TOM_URL, port E2E_PORT_TOM, by default two after E2E_PORT): the "fylls i" chips.
const filledPort = Number(process.env.E2E_PORT_IFYLLD ?? port + 1);
process.env.E2E_IFYLLD_URL = `http://localhost:${filledPort}${base}`;
const filledOutDir = "dist-ifylld";
const emptyPort = Number(process.env.E2E_PORT_TOM ?? port + 2);
process.env.E2E_TOM_URL = `http://localhost:${emptyPort}${base}`;
const emptyOutDir = "dist-tom";
// A third build with the funktionsflaggor off (E2E_AV_URL, port E2E_PORT_AV, by default three after E2E_PORT): it is
// built as production (MILJO=produktion) from tests/fixtures/funktioner-av.json, so it covers both `av` and `ejProduktion`.
const offPort = Number(process.env.E2E_PORT_AV ?? port + 3);
process.env.E2E_AV_URL = `http://localhost:${offPort}${base}`;
const offOutDir = "dist-av";

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
        " FRAGOR_MAPP=tests/fixtures/fragor" +
        ` npm run build -- --outDir ${filledOutDir}` +
        ` && npm run preview -- --outDir ${filledOutDir} --port ${filledPort} --ignore-lock`,
      url: process.env.E2E_IFYLLD_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "FORENINGSUPPGIFTER_FIL=tests/fixtures/foreningsuppgifter-tom.json" +
        " JULKAMPANJ_FIL=tests/fixtures/julkampanj-tom.json" +
        " FRAGOR_MAPP=tests/fixtures/fragor" +
        ` npm run build -- --outDir ${emptyOutDir}` +
        ` && npm run preview -- --outDir ${emptyOutDir} --port ${emptyPort} --ignore-lock`,
      url: process.env.E2E_TOM_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "MILJO=produktion FUNKTIONER_FIL=tests/fixtures/funktioner-av.json" +
        ` npm run build -- --outDir ${offOutDir}` +
        ` && npm run preview -- --outDir ${offOutDir} --port ${offPort} --ignore-lock`,
      url: process.env.E2E_AV_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
