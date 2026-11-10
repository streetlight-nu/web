import { readFileSync } from "node:fs";
import path from "node:path";

import type { z } from "astro/zod";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { DATAFILER } from "@/lib/datafiler";

/** A field in a form in `.pages.yml`. */
interface Falt {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  list?: boolean;
  fields?: Falt[];
  options?: { values?: { value: string }[] };
}

const rot = path.resolve(import.meta.dirname, "../..");
const konfiguration = parse(readFileSync(path.join(rot, ".pages.yml"), "utf8")) as {
  content: (Falt & { path: string; format: string })[];
};

/** A schema with its wrappers taken off (optional, default, nullable, preprocess), and whether it may be left empty. */
function packaUpp(schema: z.ZodType): { schema: z.ZodType; valfri: boolean } {
  let valfri = false;
  let s = schema;
  for (;;) {
    const def = s._zod.def as { type: string; innerType?: z.ZodType; in?: z.ZodType; out?: z.ZodType };
    if (def.type === "optional" || def.type === "default") {
      valfri = true;
      s = def.innerType!;
    } else if (def.type === "nullable") {
      s = def.innerType!;
    } else if (def.type === "pipe") {
      // z.preprocess is a pipe from a transform to the schema; a refined text is a pipe from a text.
      s = def.in!._zod.def.type === "transform" ? def.out! : def.in!;
    } else {
      return { schema: s, valfri };
    }
  }
}

/**
 * Compares a form's fields with a schema, level by level, and returns every difference as a line of text:
 * the same field names, a list where the schema has a list, the choices of a select, and `required` on exactly
 * the single-value fields that cannot be left empty. Lists and groups are never marked required in the form.
 */
function skillnader(falt: Falt[], schema: z.ZodType, plats: string): string[] {
  const shape = (schema._zod.def as unknown as { shape: Record<string, z.ZodType> }).shape;
  const fel: string[] = [];
  const iFormularet = falt.map((f) => f.name).sort();
  const iSchemat = Object.keys(shape).sort();
  if (iFormularet.join() !== iSchemat.join()) {
    fel.push(`${plats}: formuläret har [${iFormularet}], schemat har [${iSchemat}]`);
  }
  for (const f of falt) {
    if (!shape[f.name]) continue;
    const { schema: inre, valfri } = packaUpp(shape[f.name]);
    const typ = inre._zod.def.type;
    const namn = `${plats}.${f.name}`;
    if (typ === "array") {
      if (!f.list) fel.push(`${namn}: är en lista i schemat men inte i formuläret`);
      const element = packaUpp((inre._zod.def as unknown as { element: z.ZodType }).element).schema;
      if (element._zod.def.type === "object") fel.push(...skillnader(f.fields ?? [], element, namn));
    } else if (f.list) {
      fel.push(`${namn}: är en lista i formuläret men inte i schemat`);
    } else if (typ === "object") {
      if (f.type !== "object") fel.push(`${namn}: är en grupp i schemat men ${f.type} i formuläret`);
      fel.push(...skillnader(f.fields ?? [], inre, namn));
    } else {
      if (Boolean(f.required) !== !valfri) {
        fel.push(`${namn}: required är ${Boolean(f.required)} i formuläret, men fältet är ${valfri ? "valfritt" : "obligatoriskt"} i schemat`);
      }
      if (typ === "enum") {
        const val = Object.values((inre._zod.def as unknown as { entries: Record<string, string> }).entries).sort();
        const iValet = (f.options?.values ?? []).map((v) => v.value).sort();
        if (val.join() !== iValet.join()) fel.push(`${namn}: valen är [${iValet}] i formuläret, [${val}] i schemat`);
      }
    }
  }
  return fel;
}

const allaFalt = (lista: Falt[]): Falt[] => lista.flatMap((f) => [f, ...allaFalt(f.fields ?? [])]);

describe.each(DATAFILER.map((datafil) => [datafil.cmsNamn, datafil] as const))(
  "datafilen %s",
  (cmsNamn, datafil) => {
    const formular = konfiguration.content.find((del) => del.name === cmsNamn);

    test("filen i repot klarar schemat", () => {
      const data = JSON.parse(readFileSync(path.join(rot, datafil.fil), "utf8"));
      expect(() => datafil.tolka(data)).not.toThrow();
    });

    test("har ett formulär i .pages.yml som redigerar samma fil", () => {
      expect(formular).toMatchObject({ type: "file", path: datafil.fil, format: "json" });
    });

    test("formulärets fält stämmer med schemat på varje nivå", () => {
      expect(skillnader(formular!.fields ?? [], datafil.schema, cmsNamn)).toEqual([]);
    });

    test("formuläret har bara svenska etiketter", () => {
      for (const f of allaFalt(formular!.fields ?? [])) expect(f.label, f.name).not.toBe(f.name);
    });

    test("har en testfil för webbläsartesternas byggen, som klarar schemat", () => {
      const config = readFileSync(path.join(rot, "playwright.config.ts"), "utf8");
      const testfiler = [...config.matchAll(new RegExp(`${datafil.miljovariabel}=(\\S+)`, "g"))].map((m) => m[1]);
      expect(testfiler.length, `${datafil.miljovariabel} i playwright.config.ts`).toBeGreaterThan(0);
      for (const fil of testfiler) {
        const data = JSON.parse(readFileSync(path.join(rot, fil.replace(/"$/, "")), "utf8"));
        expect(() => datafil.tolka(data), fil).not.toThrow();
      }
    });
  },
);

describe("jämförelsen mellan formulär och schema", () => {
  const schema = DATAFILER.find((d) => d.cmsNamn === "historia")!.schema;
  const formular = konfiguration.content.find((del) => del.name === "historia")!.fields!;

  test("hittar ett fält som saknas, en lista som inte är en lista och ett required som inte stämmer", () => {
    const andrat = structuredClone(formular);
    const perioder = andrat.find((f) => f.name === "perioder")!;
    perioder.fields = perioder.fields!.filter((f) => f.name !== "namn");
    perioder.fields.find((f) => f.name === "rubrik")!.required = false;
    andrat.find((f) => f.name === "ingress")!.list = true;
    expect(skillnader(andrat, schema, "historia")).toEqual([
      expect.stringContaining("historia.ingress: är en lista i formuläret"),
      expect.stringContaining("historia.perioder: formuläret har"),
      expect.stringContaining("historia.perioder.rubrik: required är false"),
    ]);
  });
});
