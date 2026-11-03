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
| `npm run test:e2e` | Webbläsartester och tillgänglighet med axe (Playwright). Kräver `npm run build` först; testvarianten med ifyllda föreningsuppgifter bygger den själv |

## Design

Färger, typsnitt och avstånd kommer från designsystemets `tokens.json`, som finns i `src/styles/tokens.json`. De är mappade för hand till Tailwind-temat och shadcn-variablerna i `src/styles/global.css`. Ändra först i designsystemet och för sedan över ändringen hit.

I `.astro`-filer används `buttonVariants()` direkt på `<a>`. React-komponenten `Button` med `asChild` fungerar bara inne i React-öar.

En delad länk visar sajtens standardbild `public/delningsbild.png` (1200 × 630), eller inläggets egen bild. Standardbilden ritas av `node scripts/rita-delningsbild.mjs` från logotypen; kör skriptet igen om logotypen ändras.

Typsnitten läggs på egen server via Fontsource, och sajtens egen kod hämtar dem aldrig från Google Fonts. En sida får anropa en extern tjänst bara när en funktion kräver det ([ADR 0003](docs/adr/0003-externa-tjanster-som-repejo-far-anropas.md)). I dag gäller det bara julkampanjen, som använder Repejo. Testet `tests/e2e/tredje-part.spec.ts` har en tillåtelselista per sida för vad vår egen kod anropar. Det stubbar Repejo och ser därför inte vad Repejos skript själv hämtar på `/julklapp`: typsnitt från Google, Stripe, Adyen, BankID och kanske Metas pixel. ADR 0003 listar dem.

## Föreningsuppgifter och Pages CMS

Föreningsuppgifterna (organisationsnummer, 90-konto, Swish-nummer, kontaktperson, kontakt-e-post och länken till årsredovisningen) finns bara i `src/data/foreningsuppgifter.json`. Föreningen fyller i dem i [Pages CMS](https://pagescms.org) med formuläret i `.pages.yml`. Redaktörer loggar in med ett GitHub-konto som har skrivrätt, och det som sparas committas direkt till `master`.

Komponenterna läser uppgifterna med `hamtaForeningsuppgifter()` från `src/lib/foreningsuppgifter.ts` och skriver aldrig in ett värde själva. Ett tomt fält visas som chipet ”fylls i” (`FyllsI.astro`). Ett felaktigt värde, till exempel en e-post som inte är en e-postadress, stoppar bygget.

`npm run test:e2e` bygger själv sajten två gånger till, med testfiler i stället för datafilerna (via `FORENINGSUPPGIFTER_FIL` och `JULKAMPANJ_FIL`), så att testerna aldrig beror på vad föreningen har fyllt i: till `dist-ifylld/` med ifyllda uppgifter (`tests/fixtures/*-ifylld.json`) på porten `E2E_PORT_IFYLLD`, och till `dist-tom/` med tomma uppgifter (`tests/fixtures/*-tom.json`) på porten `E2E_PORT_TOM`. Utan dem används de två portarna efter `E2E_PORT` (standard 4321, 4322 och 4323). Den vanliga sajten i `dist/` bygger du själv innan. Testerna som letar efter ”fylls i” går mot `dist-tom/`.

## Julkampanjen och Repejo

Sidan ”Ge en julklapp” (`src/pages/julklapp.astro`, `/julklapp`) bäddar in Repejos checkout och insamlingsmätare via `src/components/Repejo.astro`. Värd, organisations-id och kampanjens kortkod finns i `src/lib/repejo.ts`. Under checkouten och mätaren finns alltid en länk till Repejos kampanjsida, så att besökaren kan ge även om Repejo inte fungerar. Kampanjens egna uppgifter (sista dagen, vad julklappen gör och en e-post för frågor) finns i `src/data/julkampanj.json` och fylls i i Pages CMS under Julkampanjen. Webbläsartesterna stubbar Repejo och läser kampanjens uppgifter från `tests/fixtures/julkampanj-ifylld.json` och `julkampanj-tom.json` (via `JULKAMPANJ_FIL`).

Kampanjen är säsongsbunden. Efter jul kan sidan tas bort, eller kortkoden bytas, utan att något annat ändras. Tas sidan bort tas den också bort ur tillåtelselistan i `tests/e2e/tredje-part.spec.ts`.

## Intresseanmälan

Formuläret i "Bli fadder" (`src/components/Intresseanmalan.tsx`) är inte kopplat till någon formulärtjänst än, och det säger det till besökaren. Ingen data lämnar sidan. Formuläret skickar bara via `skickaIntresseanmalan()` i `src/lib/intresseanmalan.ts`, som i v1 svarar `inte-kopplat`. När föreningen har valt tjänst och mottagare kopplas den in där, och tackläget i formuläret ändras så att det säger vad det nya svaret betyder.

## Publicering

GitHub Actions kör typkontroll, enhetstester, bygge och webbläsartester på varje push. När allt går igenom på `master` publiceras sajten på GitHub Pages på https://streetlight-nu.github.io/web/.

Redaktörer skriver Nyheter i [Pages CMS](https://app.pagescms.org), som läser `.pages.yml` och committar direkt till `master`. Instruktionen för redaktörer finns i [docs/redaktorer.md](docs/redaktorer.md). Bilder laddas upp till `src/assets/nyheter/` och optimeras vid bygget.

Vid egen domän: lägg till domänen under Settings › Pages och sätt repovariablerna `SITE_URL` (till exempel `https://streetlight.nu`) och `BASE_PATH` (`/`). Ingen kod behöver ändras.
