import { z } from "astro/zod";

import { datafil } from "./datafil";

/**
 * Funktionsflaggor: they decide whether a page or an element is shown, per build.
 *
 * The flags live in one data file, `src/data/funktioner.json`, which can be edited in Pages CMS (see
 * `.pages.yml`). The site is static, so a flag is read when the site is built: changing one means a new build
 * and a new publication. Every flag has one of three modes:
 * - `pa`: shown everywhere.
 * - `av`: shown nowhere.
 * - `ejProduktion`: shown locally and in test builds, but not in production.
 *
 * Production is the build CI makes on `master` (it sets MILJO=produktion). A page that is off is not built at
 * all and so is a 404, and an element that is off is not rendered. Neither is hidden with CSS.
 *
 * Read the flags in `.astro` files only, never in a React island: this module reads a file with node:fs.
 */
export const FUNKTIONER = ["julklapp", "historia"] as const;
export type Funktion = (typeof FUNKTIONER)[number];

export const LAGEN = ["pa", "av", "ejProduktion"] as const;
export type Lage = (typeof LAGEN)[number];

export const funktionerSchema = z.strictObject(
  Object.fromEntries(
    FUNKTIONER.map((funktion) => [
      funktion,
      z.enum(LAGEN, { error: `${funktion} måste vara ${LAGEN.join(", ")}` }),
    ]),
  ) as Record<Funktion, z.ZodEnum<{ pa: "pa"; av: "av"; ejProduktion: "ejProduktion" }>>,
);

export type Funktionslagen = Record<Funktion, Lage>;

/** The data file. FUNKTIONER_FIL points elsewhere, so the browser tests can build with a test file. */
export const FUNKTIONER_DATAFIL = datafil({
  fil: "src/data/funktioner.json",
  miljovariabel: "FUNKTIONER_FIL",
  cmsNamn: "funktioner",
  schema: funktionerSchema,
  fel: "Funktionsflaggorna är felaktiga",
});

/** Checks the contents of the data file. A missing flag, an unknown flag or an unknown mode fails the build. */
export const tolkaFunktioner: (data: unknown) => Funktionslagen = FUNKTIONER_DATAFIL.tolka;

/** Whether a flag in this mode is on in this environment. */
export function arPa(lage: Lage, produktion: boolean): boolean {
  return lage === "pa" || (lage === "ejProduktion" && !produktion);
}

/** Whether this build is the production build. CI sets MILJO=produktion on `master`. */
export function arProduktion(): boolean {
  return process.env.MILJO === "produktion";
}

/** Reads the flags from the data file, once per build, and says which are on. */
export function hamtaFunktioner(): Record<Funktion, boolean> {
  const lagen = FUNKTIONER_DATAFIL.hamta();
  const produktion = arProduktion();
  return Object.fromEntries(FUNKTIONER.map((f) => [f, arPa(lagen[f], produktion)])) as Record<Funktion, boolean>;
}
