import { describe, expect, test } from "vitest";

import { harExempel, nyastForst, perAr, senaste } from "./nyheter";

const inlagg = (id: string, datum: string, example = false) => ({ id, data: { date: new Date(datum), example } });

const arsmote = inlagg("valkommen-till-arsmotet", "2026-03-20");
const skolstart = inlagg("skolstart-i-addis-abeba", "2026-09-14");
const julen = inlagg("julen-i-addis-abeba", "2025-12-20");
const tack = inlagg("tack-for-ett-ar-i-skolan", "2026-01-10");

describe("nyheterna längs tråden", () => {
  test("inläggen ordnas med det senaste datumet först, oavsett ordningen i samlingen", () => {
    expect(nyastForst([arsmote, julen, skolstart, tack])).toEqual([skolstart, arsmote, tack, julen]);
  });

  test("inlägg från samma dag står i en stabil ordning efter sin slug", () => {
    const b = inlagg("b-inlagg", "2026-03-20");
    expect(nyastForst([b, arsmote])).toEqual([b, arsmote]);
    expect(nyastForst([arsmote, b])).toEqual([b, arsmote]);
  });

  test("det senaste inlägget är det första i datumordningen", () => {
    expect(senaste(nyastForst([arsmote, julen, skolstart, tack]))).toBe(skolstart);
  });

  test("utan inlägg finns inget senaste inlägg", () => {
    expect(senaste([])).toBeUndefined();
  });

  test("inläggen grupperas per år, med det nyaste året och inlägget först", () => {
    expect(perAr(nyastForst([tack, julen, skolstart, arsmote]))).toEqual([
      { ar: 2026, inlagg: [skolstart, arsmote, tack] },
      { ar: 2025, inlagg: [julen] },
    ]);
  });

  test("notisen om exempel visas så länge minst ett exempelinlägg finns", () => {
    expect(harExempel([arsmote, inlagg("exempel", "2026-01-01", true)])).toBe(true);
    expect(harExempel([arsmote, skolstart])).toBe(false);
  });
});
