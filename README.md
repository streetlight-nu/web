# Streetlight

Webbplatsen för Streetlight, en ideell förening i Sverige och Etiopien som stöttar 20 fadderbarns skolgång och deras familjer i Addis Abeba.

Byggd med Astro, React-öar, shadcn/ui och Tailwind v4 ([ADR 0001](docs/adr/0001-astro-med-react-oar.md)) enligt designsystemet "Streetlight Designsystem" ([ADR 0002](docs/adr/0002-designsystemet-ersatter-varumarkesguiden.md)). Ord och begrepp finns i [GLOSSARY.md](GLOSSARY.md).

## Kom igång

Kräver Node 22 (se `.nvmrc`).

```bash
npm install
npm run dev
```

| Kommando | Vad det gör |
| --- | --- |
| `npm run dev` | Startar utvecklingsservern på http://localhost:4321 |
| `npm run build` | Bygger den statiska sajten till `dist/` |
| `npm run preview` | Visar det byggda resultatet lokalt |
| `npm run check` | Typkontroll |
| `npm test` | Enhetstester (Vitest) |
| `npm run test:e2e` | Webbläsartester och tillgänglighet med axe (Playwright, kräver bygge först) |

## Design

Färger, typsnitt och avstånd kommer från designsystemets `tokens.json`, som finns i `src/styles/tokens.json`. De är mappade för hand till Tailwind-temat och shadcn-variablerna i `src/styles/global.css`. Ändra först i designsystemet och för sedan över ändringen hit.

I `.astro`-filer används `buttonVariants()` direkt på `<a>`. React-komponenten `Button` med `asChild` fungerar bara inne i React-öar.

Typsnitten läggs på egen server via Fontsource. Sajten gör inga anrop till tredje part, och ett test kontrollerar det.

## Föreningsuppgifter och Pages CMS

Föreningsuppgifterna (organisationsnummer, 90-konto, Swish-nummer, kontaktperson, kontakt-e-post och länken till årsredovisningen) finns bara i `src/data/foreningsuppgifter.json`. Föreningen fyller i dem i [Pages CMS](https://pagescms.org) med formuläret i `.pages.yml`. Redaktörer loggar in med ett GitHub-konto som har skrivrätt, och det som sparas committas direkt till `master`.

Komponenterna läser uppgifterna med `getForeningsuppgifter()` från `src/lib/foreningsuppgifter.ts` och skriver aldrig in ett värde själva. Ett tomt fält visas som chipet ”fylls i” (`FyllsI.astro`). Ett felaktigt värde, till exempel en e-post som inte är en e-postadress, stoppar bygget.

Webbläsartesterna bygger sajten en gång till med `tests/fixtures/foreningsuppgifter-ifylld.json` (via `FORENINGSUPPGIFTER_FIL`) och visar den på porten efter `E2E_PORT`.

## Publicering

GitHub Actions kör typkontroll, enhetstester, bygge och webbläsartester på varje push. När allt går igenom på `master` publiceras sajten på GitHub Pages på https://streetlight-nu.github.io/web/.

Vid egen domän: lägg till domänen under Settings › Pages och sätt repovariablerna `SITE_URL` (till exempel `https://streetlight.nu`) och `BASE_PATH` (`/`). Ingen kod behöver ändras.
