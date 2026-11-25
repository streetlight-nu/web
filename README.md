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

Typsnitten läggs på egen server via Fontsource, och sajtens egen kod hämtar dem aldrig från Google Fonts. En sida får anropa en extern tjänst ([ADR 0003](docs/adr/0003-externa-tjanster-som-repejo-far-anropas.md)). I dag använder Ge ett julpaket, Bli fadder och Engagera dig Repejo. Repejos skript hämtar själv andra tjänster på `/julpaket`: typsnitt från Google, Stripe, Adyen, BankID och kanske Metas pixel. ADR 0003 listar dem.

## Föreningsuppgifter och Pages CMS

Föreningsuppgifterna (organisationsnummer, 90-konto, Swish-nummer, kontakt-e-post och länken till årsredovisningen) finns bara i `src/data/foreningsuppgifter.json`. Föreningen fyller i dem i [Pages CMS](https://pagescms.org) med formuläret i `.pages.yml`. Redaktörer loggar in med ett GitHub-konto som har skrivrätt, och det som sparas committas direkt till `master`.

Komponenterna läser uppgifterna med `hamtaForeningsuppgifter()` från `src/lib/foreningsuppgifter.ts` och skriver aldrig in ett värde själva. Ett tomt fält visas inte alls. Ett felaktigt värde, till exempel en e-post som inte är en e-postadress, stoppar bygget.

`npm run test:e2e` bygger själv sajten tre gånger till (den tredje, `dist-av/`, för funktionsflaggorna, se Funktionsflaggor), med testfiler i stället för datafilerna (via `FORENINGSUPPGIFTER_FIL` och `JULKAMPANJ_FIL`), och med de påhittade exempelinläggen i `tests/fixtures/nyheter/` i stället för Nyheter (via `NYHETER_MAPP`), så att testerna aldrig beror på vad föreningen har fyllt i: till `dist-ifylld/` med ifyllda uppgifter (`tests/fixtures/*-ifylld.json`) på porten `E2E_PORT_IFYLLD`, och till `dist-tom/` med tomma uppgifter (`tests/fixtures/*-tom.json`) på porten `E2E_PORT_TOM`. Utan dem används de portarna efter `E2E_PORT` (standard 4321, 4322 och 4323; `dist-av/` får 4324). Den vanliga sajten i `dist/` bygger du själv innan. Testerna som kontrollerar att tomma fält inte syns går mot `dist-tom/`.

## Funktionsflaggor

Flaggorna i `src/data/funktioner.json` styr om en sida eller ett element visas. Föreningen kan ändra dem i Pages CMS under Funktioner. Sajten är statisk, så en flagga läses när sajten byggs: en ändring kräver ett nytt bygge och en ny publicering, som tar några minuter. Varje flagga har ett av tre lägen:

- `pa`: visas överallt.
- `av`: visas ingenstans.
- `ejProduktion`: visas lokalt och i bygget på andra grenar än `master`, men inte i produktion.

Produktion är bygget på `master`. CI sätter `MILJO=produktion` där (se `ci.yml`). Lokalt och på andra grenar är `MILJO` inte satt. Vill du pröva produktionsläget lokalt kör du `MILJO=produktion npm run build`.

I `.astro`-filer läser du flaggorna med `hamtaFunktioner()` från `src/lib/funktioner.ts`:

```astro
---
import { hamtaFunktioner } from "@/lib/funktioner";
const { engagera } = hamtaFunktioner();
---
{engagera && <a href="/engagera-dig">Engagera dig</a>}
```

- **Ett element** som är avstängt renderas inte alls. Dölj det aldrig med CSS, för då ligger innehållet kvar i HTML:en.
- **En sida** bygger man med en dynamisk rutt (till exempel `src/pages/[historia].astro`) vars `getStaticPaths()` returnerar en tom lista när flaggan är av. Då skapas inte sidan, och adressen ger 404. En vanlig sidfil kan inte utebli ur bygget.
- **Läs aldrig flaggorna i en React-ö** (`.tsx`), för modulen läser en fil med `node:fs`. Läs dem i `.astro`-filen och skicka värdet som prop.
- **Namnge flaggan efter funktionen**, inte efter platsen, så att sidan, menyraden och rutan på startsidan läser samma flagga.

En ny flagga läggs till på fyra ställen: listan `FUNKTIONER` i `src/lib/funktioner.ts`, datafilen, ett fält i `.pages.yml` och en rad i `tests/fixtures/funktioner-av.json`. Enhetstestet och bygget stoppar om något av dem saknas. En flagga som saknas i datafilen stoppar bygget i stället för att tyst bli av eller på.

Webbläsartesterna bygger sajten en tredje gång till `dist-av/`, som produktion med flaggorna från `tests/fixtures/funktioner-av.json` (via `FUNKTIONER_FIL` och `MILJO`), på porten `E2E_PORT_AV` (standard `E2E_PORT` + 3, alltså 4324). `tests/e2e/funktioner.spec.ts` kontrollerar att sidorna ger 404 och att länkarna saknas.

## Ge ett julpaket och Repejo

Sidan ”Ge ett julpaket” (`src/pages/julpaket.astro`, `/julpaket`) bäddar in Repejos checkout och insamlingsmätare via `src/components/Repejo.astro`. Värd, organisations-id och insamlingens kortkod finns i `src/lib/repejo.ts`. Under checkouten och mätaren finns en länk till Repejos kampanjsida, så att besökaren kan ge även om Repejo inte fungerar. Bara på sidan Bli fadder saknas länken under checkouten (`utanReserv`), som i sidans design. Ge ett julpaket har ingen funktionsflagga. Den går efter `startdatum` och `slutdatum` i `src/data/julkampanj.json` (formatet ÅÅÅÅ-MM-DD, båda ifyllda, annars finns ingen julinsamling). Medan den pågår syns länken i menyn, rutan på startsidan och julpaketets checkout på `/julpaket`. Före och efter den visar `/julpaket` Repejos Swish-checkout (`SWISH_KORTKOD`) och en text om att insamlingen startar eller är avslutad, och menylänken och rutan på startsidan saknas. Beräkningen finns i `src/lib/julinsamling.ts` och `src/lib/julperiod.ts`.

Sajten är statisk men behöver inget nattligt bygge. Bygget skriver sidan som den ser ut på byggdagen och sparar de andra varianterna i `<template>` (`src/components/Julvaxel.astro`). Ett litet skript sist på varje sida (`JulinsamlingSkript.astro`) jämför webbläsarens datum, i svensk tid, med datumen och byter ut det som skiljer, och menyn (`MainNav.tsx`) läser resultatet från `<html data-julinsamling>`. Den som har JavaScript avstängt ser sidan som den var vid senaste bygget. Under `astro dev` pågår Ge ett julpaket alltid, men med `?dag=2026-12-28` i adressen prövar du en annan dag (`?dag=` utan datum tar bort valet). Valet gäller resten av fliken och påverkar bara menyn, rutan på startsidan och sidan Ge ett julpaket, inte nedräkningen i rutan. Webbläsartesterna sätter dagen med `page.clock` (till exempel `page.clock.setFixedTime`) och behöver inget särskilt bygge. Webbläsartesterna stubbar Repejo och läser kampanjens uppgifter från `tests/fixtures/julkampanj-ifylld.json` och `julkampanj-tom.json` (via `JULKAMPANJ_FIL`).

Kampanjen är säsongsbunden. Efter jul kan sidan tas bort, eller kortkoden bytas, utan att något annat ändras.

## Bli fadder

Formuläret för att bli fadder ligger på Bli fadder (`src/pages/bli-fadder.astro`, `/bli-fadder`) och är Repejos checkout (`<repejo-checkout>`) med kortkoden `FADDER_KORTKOD` i `src/lib/repejo.ts`. Sidan laddar Repejos skript, och formuläret visas utan reservlänk under sig (`utanReserv`). Startsidan laddar inte Repejo: dess fält ”Bli fadder” länkar till sidan Bli fadder. Det besökaren fyller i går till Repejo.

Sidan Engagera dig (`src/pages/[engagera].astro`, `/engagera-dig`, bakom flaggan `engagera`) låter besökaren starta en egen insamling hos Repejo. Tillfällena (Födelsedag, Jubileum, Sportevent) visas som en lista med ikoner (`Kategoriikon.astro`, ikoner ur Phosphor Icons), och bredvid finns en enda Repejo-knapp `<repejo-p2p-create-button>` utan kategori, så Repejos egen dialog frågar efter tillfället. `Repejo.astro` kan fortfarande ge en knapp en kategori (`kategori`, värdena i `INSAMLINGSKATEGORI` i `src/lib/repejo.ts`: `birthday`, `anniversary` och `sport_event`). Sidan visar inte Repejos lista med pågående insamlingar, men `Repejo.astro` har kvar den (`del="insamlingar"`). Materialet för att hitta nya faddrar (affisch, folder, bilder) läggs till när föreningen har gjort det.

## Publicering

GitHub Actions kör typkontroll, enhetstester, bygge och webbläsartester på varje push. När allt går igenom på `master` publiceras sajten på GitHub Pages på https://www.streetlight.nu (`streetlight.nu` skickas vidare dit).

Det föreningen sparar i Pages CMS (`src/data/`, `src/content/` och `src/assets/`) går en snabbare väg: `innehall.yml` kör bara enhetstester och bygge (bygget validerar all data mot sina scheman) och publicerar sedan. Typkontrollen och webbläsartesterna hoppas över, eftersom ingen kod har ändrats. `ci.yml` hoppar över pushar som bara rör de sökvägarna. Rör en commit något annat kör `ci.yml` allt, som vanligt. Båda publicerar via samma `concurrency`-grupp `pages`, så två publiceringar körs aldrig samtidigt.

Redaktörer skriver Nyheter i [Pages CMS](https://app.pagescms.org), som läser `.pages.yml` och committar direkt till `master`. Instruktionen för redaktörer finns i [docs/redaktorer.md](docs/redaktorer.md). Bilder laddas upp till `src/assets/nyheter/` och optimeras vid bygget.

Domänen `www.streetlight.nu` är satt under Settings › Pages (GitHub skickar `streetlight.nu` vidare dit), och repovariablerna `SITE_URL` (`https://www.streetlight.nu`) och `BASE_PATH` (`/`) är satta. DNS hos domänleverantören har fyra A-poster mot GitHub Pages (185.199.108.153 till 185.199.111.153) och en CNAME för `www` mot `streetlight-nu.github.io`. Utan variablerna bygger CI för `https://streetlight-nu.github.io/web/`.

## Mätning

Sajten mäter besök och gåvor med föreningens Google Tag Manager-container ([ADR 0004](docs/adr/0004-sajten-laddar-google-tag-manager-efter-kakval.md)). Containerns id står i `src/data/matning.json` (`gtmId`, fylls i i Pages CMS under Mätning). Utan id laddas ingenting och ingen Kakruta visas. Med id visar `src/components/Kakruta.astro` en ruta längst ned, och containern laddas först efter Acceptera, då Repejos element också får attributet `user-has-consented-to-marketing-cookies`. Valet sparas i `localStorage` (nyckeln `kakval`). Webbläsartesterna börjar som en besökare som har avvisat, utom `tests/e2e/matning.spec.ts`, och stubbar Google. De bygger med `tests/fixtures/matning-ifylld.json` och `matning-tom.json` (via `MATNING_FIL`).
