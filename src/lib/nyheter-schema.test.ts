import { describe, expect, test } from "vitest";

import { inlaggSchema } from "./nyheter-schema";

const giltigt = {
  title: "Skolstart i Addis Abeba",
  date: "2026-09-14",
  topic: "rapport",
  place: "Addis Abeba",
  lede: "Ett nytt läsår har börjat.",
};

const godtas = (data: object) => inlaggSchema().safeParse(data).success;

describe("schemat för inlägg", () => {
  test("godtar ett giltigt inlägg", () => {
    expect(godtas(giltigt)).toBe(true);
  });

  test("avvisar ett ämne utanför de fyra", () => {
    expect(godtas({ ...giltigt, topic: "blogg" })).toBe(false);
  });

  test("avvisar en bild utan alt-text", () => {
    expect(godtas({ ...giltigt, image: "./skolgarden.jpg" })).toBe(false);
    expect(godtas({ ...giltigt, image: "./skolgarden.jpg", imageAlt: "  " })).toBe(false);
    expect(godtas({ ...giltigt, image: "./skolgarden.jpg", imageAlt: "Skolgården i Addis Abeba" })).toBe(true);
  });

  test("avvisar en Berättelse från en familj utan samtycke", () => {
    expect(godtas({ ...giltigt, topic: "familj" })).toBe(false);
    expect(godtas({ ...giltigt, topic: "familj", consent: false })).toBe(false);
    expect(godtas({ ...giltigt, topic: "familj", consent: true })).toBe(true);
  });

  test("avvisar en bild där barn visas utan samtycke", () => {
    const barnfoto = { ...giltigt, image: "./klassrummet.jpg", imageAlt: "Barn i klassrummet", showsChildren: true };
    expect(godtas(barnfoto)).toBe(false);
    expect(godtas({ ...barnfoto, consent: true })).toBe(true);
  });

  test("avvisar ett inlägg utan datum", () => {
    const { date: _, ...utanDatum } = giltigt;
    expect(godtas(utanDatum)).toBe(false);
    expect(godtas({ ...giltigt, date: null })).toBe(false);
    expect(godtas({ ...giltigt, date: "" })).toBe(false);
    expect(godtas({ ...giltigt, date: "inte ett datum" })).toBe(false);
  });

  test("godtar ett giltigt exempelinlägg och markerar det som exempel", () => {
    const resultat = inlaggSchema().safeParse({ ...giltigt, example: true });
    expect(resultat.success).toBe(true);
    expect(resultat.data?.example).toBe(true);
    expect(inlaggSchema().parse(giltigt).example).toBe(false);
  });
});
