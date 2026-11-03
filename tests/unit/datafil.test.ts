import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { lasDatafil } from "@/lib/datafil";

function skrivFil(innehall: unknown): string {
  const fil = path.join(mkdtempSync(path.join(tmpdir(), "datafil-")), "data.json");
  writeFileSync(fil, JSON.stringify(innehall));
  return fil;
}

describe("lasDatafil", () => {
  test("läser JSON-filen och tolkar den med den givna funktionen", () => {
    const fil = skrivFil({ namn: " Streetlight " });
    expect(lasDatafil(fil, (data) => ({ namn: (data as { namn: string }).namn.trim() }))).toEqual({
      namn: "Streetlight",
    });
  });

  test("läser och tolkar varje fil en gång per bygge", () => {
    const fil = skrivFil({ varde: "första" });
    const tolka = (data: unknown) => data as { varde: string };
    expect(lasDatafil(fil, tolka)).toEqual({ varde: "första" });
    writeFileSync(fil, JSON.stringify({ varde: "andra" }));
    expect(lasDatafil(fil, tolka)).toEqual({ varde: "första" });
  });

  test("håller olika filer isär", () => {
    const tolka = (data: unknown) => data;
    expect(lasDatafil(skrivFil({ a: 1 }), tolka)).toEqual({ a: 1 });
    expect(lasDatafil(skrivFil({ b: 2 }), tolka)).toEqual({ b: 2 });
  });
});
