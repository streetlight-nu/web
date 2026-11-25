import { defineConfig, devices } from "@playwright/test";

const base = (process.env.BASE_PATH ?? "/").replace(/\/?$/, "/");
// E2E_PORT lets several checkouts run their browser tests at the same time.
const port = Number(process.env.E2E_PORT ?? 4321);

// Two more builds of the site, with every data file (src/lib/datafiler.ts) the questions in Vanliga frågor and the inlägg in Nyheter from
// test files instead of the files the association fills in through Pages CMS, so the tests never depend on what the
// association has written:
// - filled in (E2E_IFYLLD_URL, port E2E_PORT_IFYLLD, by default the one after E2E_PORT): real values.
// - empty (E2E_TOM_URL, port E2E_PORT_TOM, by default two after E2E_PORT): nothing is shown for a missing field.
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

// Every test starts as a visitor who has already declined in the Kakrutan (ADR 0004), so that the bar at the bottom does
// not cover what the tests click. tests/e2e/matning.spec.ts starts from nothing instead.
const harAvvisat = {
  cookies: [],
  origins: [port, filledPort, emptyPort, offPort].map((p) => ({
    origin: `http://localhost:${p}`,
    localStorage: [{ name: "kakval", value: "avvisat" }],
  })),
};

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${port}${base}`,
    trace: "retain-on-failure",
    storageState: harAvvisat,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Most tests check content and behaviour that are the same at every width, so they run once, on desktop. A test
    // whose outcome depends on the width (layout, tap areas, the folded menu) is tagged @layout (LAYOUT in
    // tests/e2e/helpers.ts) and runs on the phone as well.
    { name: "mobil", use: { ...devices["Pixel 7"] }, grep: /@layout/ },
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
        " JULPAKET_FIL=tests/fixtures/julpaket-ifylld.json" +
        " OM_FORENINGEN_FIL=tests/fixtures/om-foreningen-ifylld.json" +
        " HISTORIA_FIL=tests/fixtures/historia-ifylld.json" +
        " MATNING_FIL=tests/fixtures/matning-ifylld.json" +
        // Not production, even when CI sets MILJO on master, so that `ejProduktion` is on (tests/e2e/funktioner.spec.ts).
        " MILJO= FUNKTIONER_FIL=tests/fixtures/funktioner-ejproduktion.json" +
        " FRAGOR_MAPP=tests/fixtures/fragor NYHETER_MAPP=tests/fixtures/nyheter" +
        ` npm run build -- --outDir ${filledOutDir}` +
        ` && npm run preview -- --outDir ${filledOutDir} --port ${filledPort} --ignore-lock`,
      url: process.env.E2E_IFYLLD_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "FORENINGSUPPGIFTER_FIL=tests/fixtures/foreningsuppgifter-tom.json" +
        " JULPAKET_FIL=tests/fixtures/julpaket-tom.json" +
        " OM_FORENINGEN_FIL=tests/fixtures/om-foreningen-tom.json" +
        " HISTORIA_FIL=tests/fixtures/historia-tom.json" +
        " MATNING_FIL=tests/fixtures/matning-tom.json" +
        // Not production, so that the form Få nyheterna med e-post (`ejProduktion`) is on.
        " MILJO= FUNKTIONER_FIL=tests/fixtures/funktioner-ejproduktion.json" +
        " FRAGOR_MAPP=tests/fixtures/fragor NYHETER_MAPP=tests/fixtures/nyheter" +
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
