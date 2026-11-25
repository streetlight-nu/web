import type { Datafil } from "./datafil";
import { FORENINGSUPPGIFTER_DATAFIL } from "./foreningsuppgifter";
import { FUNKTIONER_DATAFIL } from "./funktioner";
import { HISTORIA_DATAFIL } from "./historia";
import { JULPAKET_DATAFIL } from "./julpaket";
import { MATNING_DATAFIL } from "./matning";
import { OM_FORENINGEN_DATAFIL } from "./om-foreningen";

/**
 * Every data file the association edits in Pages CMS. A new data file is declared with `datafil()` in its own
 * module and added here; tests/unit/datafiler.test.ts then checks it against `.pages.yml`, and
 * playwright.config.ts gives the browser tests' builds a test file for it.
 */
export const DATAFILER: Datafil<unknown>[] = [
  FORENINGSUPPGIFTER_DATAFIL,
  JULPAKET_DATAFIL,
  FUNKTIONER_DATAFIL,
  OM_FORENINGEN_DATAFIL,
  HISTORIA_DATAFIL,
  MATNING_DATAFIL,
];
