// Draws the share image for Ge ett julpaket, public/julpaket-delningsbild.png, 1200 × 630, from the julkort
// (src/assets/julpaket/julpaket-kort.png, 1200 × 800). The card is scaled to the full height and centred on its own
// cotton background, and the woven band is drawn across the whole width, so nothing is cropped and no edge shows.
// Run again after a change to the julkort: node scripts/rita-julpaket-delningsbild.mjs
import { readFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

const rot = path.resolve(import.meta.dirname, "..");
const fil = (relativ) => path.join(rot, relativ);

const BREDD = 1200;
const HOJD = 630;
const kort = `data:image/png;base64,${readFileSync(fil("src/assets/julpaket/julpaket-kort.png")).toString("base64")}`;
// The band is 46 px at 1200 × 800 in the card (TibebBand, "full"); scaled with the card.
const s = HOJD / 800;
const vav =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='38' height='30' viewBox='0 0 38 30'><rect width='38' height='30' fill='#0E4A38'/><path d='M19 3 31 15 19 27 7 15Z' fill='#F4B400'/><path d='M19 9 25 15 19 21 13 15Z' fill='#D64527'/><rect x='17' y='13' width='4' height='4' fill='#FBFBF8'/><path d='M0 13h3v4H0zM35 13h3v4h-3z' fill='#1F4FA8'/></svg>",
  );
const px = (n) => `${(n * s).toFixed(2)}px`;

const html = `<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: ${BREDD}px; height: ${HOJD}px; background: #FBFBF8; overflow: hidden; position: relative; }
  img { position: absolute; top: 0; left: 50%; height: ${HOJD}px; transform: translateX(-50%); }
  .band { position: absolute; left: 0; right: 0; bottom: 0; height: ${px(46)};
    background:
      linear-gradient(#D64527, #D64527) top / 100% ${px(5)} no-repeat,
      linear-gradient(#D64527, #D64527) bottom / 100% ${px(5)} no-repeat,
      linear-gradient(#FBFBF8, #FBFBF8) 0 ${px(5)} / 100% ${px(3)} no-repeat,
      linear-gradient(#FBFBF8, #FBFBF8) 0 calc(100% - ${px(5)}) / 100% ${px(3)} no-repeat,
      url("${vav}") 0 ${px(8)} / ${px(38)} ${px(30)} repeat-x; }
</style></head><body>
  <img src="${kort}" alt="">
  <div class="band"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: BREDD, height: HOJD } });
await page.setContent(html);
await page.evaluate(() => document.images[0].decode());
await page.screenshot({ path: fil("public/julpaket-delningsbild.png"), type: "png" });
await browser.close();
console.log("Ritade public/julpaket-delningsbild.png (1200 × 630).");
