# Streetlight

Statisk webbplats (Astro, React-öar, Tailwind v4) för en ideell förening med 20 fadderbarn i Addis Abeba. Den ska få nya faddrar och berätta om arbetet. Publiceras på GitHub Pages från `master`.

## Läs först, efter vad du gör

- **Kommandon, datafiler, funktionsflaggor, Repejo, tester, publicering**: `README.md`.
- **Text som besökaren läser**: `PRODUCT.md` (röst, läsare, principer) och `GLOSSARY.md` (orden och de ord vi undviker).
- **Utseende och komponenter**: `DESIGN.md`, som skills för design (`impeccable`) läser och skriver.
- **Fält i Pages CMS** (`.pages.yml`, `src/data/`, `src/content/`): `docs/redaktorer.md`, instruktionen för föreningens redaktörer.
- **Arkitekturval**: `docs/adr/`.

## Konventioner som inte står i konfigurationen

- **Språk**: identifierare på svenska utan å, ä och ö (`hamtaForeningsuppgifter`, `lasDatafil`), kommentarer på engelska. Commits, testnamn, grenar och all text på sajten på svenska. Commit-rubriken är kort och säger vad besökaren märker, gärna `Område: vad` (`Sidfoten: Följ oss på Facebook och Instagram`).
- **Hitta aldrig på.** Siffror, belopp, årtal, citat och löften kommer från föreningen. Saknas något visas chipet ”fylls i” (`FyllsI.astro`). Bilder på barn och familjer kräver samtycke, och bygget stoppar dem utan.
- **Föreningens data** ligger i `src/data/*.json` och läses bara via sin modul i `src/lib/`, som deklarerar filen med `datafil()` (zod-schema, miljövariabel `*_FIL`, formulärets namn i `.pages.yml`). Komponenter skriver aldrig in ett värde själva. En ny datafil läggs till i `DATAFILER` (`src/lib/datafiler.ts`) och får testfiler i `tests/fixtures/` i `playwright.config.ts`; `tests/unit/datafiler.test.ts` kontrollerar båda mot `.pages.yml`. Föreningsuppgifterna visas med `Uppgift.astro`, som tar etikett och chiptext från `visaUppgift()`.
- **Pages CMS är ett gränssnitt mot människor.** När ett fält ändras i `.pages.yml` uppdaterar du `docs/redaktorer.md` i samma ändring. Det föreningen sparar committas direkt till `master`, så ett strängare schema kan stoppa bygget på `master` efter deras nästa sparning, även när innehållet som redan finns i repot passerar.
- **Klar** betyder att `npm run check`, `npm test`, `npm run build` och `npm run test:e2e` går igenom, som i CI. En ändring som besökaren ser har ett Playwright-test. En ny sida läggs till i `SIDOR` i `tests/e2e/hela-sajten.spec.ts`, som kontrollerar h1, WCAG, hopplänk, 18 px och ordlistan på alla sidor; sidans egen spec testar bara det som är sidans. Ett test som beror på skärmbredden får `LAYOUT` (`@layout`), annars körs det bara på desktop.
- **Webbläsartesterna lokalt** återanvänder en server som redan kör på porten, alltså ett gammalt bygge av `dist-*`. Stoppa gamla `astro preview`, och kör `npm run build` före. Sätt `E2E_PORT` när flera worktrees testar samtidigt.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `streetlight-nu/web`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
