// Draws the site's standard image for shared links (og:image), public/delningsbild.png, 1200 × 630.
// Green field, the lamp mark and the wordmark, as in the design system's Logo, with the woven band below.
// Run again after a change to the logo: node scripts/rita-delningsbild.mjs
import { readFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

const rot = path.resolve(import.meta.dirname, "..");
const fil = (relativ) => path.join(rot, relativ);
const typsnitt = (relativ) => `data:font/woff2;base64,${readFileSync(fil(relativ)).toString("base64")}`;

const mark = readFileSync(fil("src/assets/logo/streetlight-mark-pa-gront.svg"), "utf8").replace(
  / width="\d+" height="\d+"/,
  ' width="232" height="232"',
);
// The woven band (TibebBand, "full"): red, cotton, the green weave with gold diamonds, cotton, red.
const vav =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='38' height='30' viewBox='0 0 38 30'><rect width='38' height='30' fill='#0E4A38'/><path d='M19 3 31 15 19 27 7 15Z' fill='#F4B400'/><path d='M19 9 25 15 19 21 13 15Z' fill='#D64527'/><rect x='17' y='13' width='4' height='4' fill='#FBFBF8'/><path d='M0 13h3v4H0zM35 13h3v4h-3z' fill='#1F4FA8'/></svg>",
  );

const html = `<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><style>
  @font-face { font-family: "Bricolage Grotesque"; font-weight: 800;
    src: url(${typsnitt("node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2")}) format("woff2"); }
  @font-face { font-family: "Familjen Grotesk"; font-weight: 600;
    src: url(${typsnitt("node_modules/@fontsource/familjen-grotesk/files/familjen-grotesk-latin-600-normal.woff2")}) format("woff2"); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0E4A38; color: #FBFBF8; overflow: hidden; position: relative; }
  .logo { position: absolute; left: 96px; top: 150px; display: flex; align-items: center; gap: 44px; }
  .ord { font-family: "Bricolage Grotesque"; font-weight: 800; font-size: 150px; line-height: 1; letter-spacing: -0.045em; }
  .i { display: inline-block; text-align: center; line-height: 1; }
  .i svg { display: block; margin: 0 auto -0.26em; width: 0.22em; height: 0.2em; }
  .rad { position: absolute; left: 100px; top: 430px; font-family: "Bricolage Grotesque"; font-weight: 800;
    font-size: 54px; letter-spacing: -0.03em; }
  .rad span { color: #F4B400; }
  .band { position: absolute; left: 0; right: 0; bottom: 0; height: 46px;
    background:
      linear-gradient(#D64527, #D64527) top / 100% 5px no-repeat,
      linear-gradient(#D64527, #D64527) bottom / 100% 5px no-repeat,
      linear-gradient(#FBFBF8, #FBFBF8) 0 5px / 100% 3px no-repeat,
      linear-gradient(#FBFBF8, #FBFBF8) 0 calc(100% - 5px) / 100% 3px no-repeat,
      url("${vav}") 0 8px / 38px 30px repeat-x; }
</style></head><body>
  <div class="logo">${mark}<div class="ord">streetl<span class="i"><svg viewBox="0 0 10 10"><path d="M2.5 0H7.5L10 10H0Z" fill="#F4B400"/></svg>ı</span>ght</div></div>
  <p class="rad">Ett ljus på vägen <span>till skolan.</span></p>
  <div class="band"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fil("public/delningsbild.png"), type: "png" });
await browser.close();
console.log("Ritade public/delningsbild.png (1200 × 630).");
