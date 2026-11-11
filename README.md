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

Typsnitten läggs på egen server via Fontsource, och sajtens egen kod hämtar dem aldrig från Google Fonts. En sida får anropa en extern tjänst ([ADR 0003](docs/adr/0003-externa-tjanster-som-repejo-far-anropas.md)). I dag använder julkampanjen, Bli fadder och Engagera dig Repejo. Repejos skript hämtar själv andra tjänster på `/julklapp`: typsnitt från Google, Stripe, Adyen, BankID och kanske Metas pixel. ADR 0003 listar dem.

## Föreningsuppgifter och Pages CMS

Föreningsuppgifterna (organisationsnummer, 90-konto, Swish-nummer, kontaktperson, kontakt-e-post och länken till årsredovisningen) finns bara i `src/data/foreningsuppgifter.json`. Föreningen fyller i dem i [Pages CMS](https://pagescms.org) med formuläret i `.pages.yml`. Redaktörer loggar in med ett GitHub-konto som har skrivrätt, och det som sparas committas direkt till `master`.

Komponenterna läser uppgifterna med `hamtaForeningsuppgifter()` från `src/lib/foreningsuppgifter.ts` och skriver aldrig in ett värde själva. Ett tomt fält visas som chipet ”fylls i” (`FyllsI.astro`). Ett felaktigt värde, till exempel en e-post som inte är en e-postadress, stoppar bygget.

`npm run test:e2e` bygger själv sajten tre gånger till (den tredje, `dist-av/`, för funktionsflaggorna, se Funktionsflaggor), med testfiler i stället för datafilerna (via `FORENINGSUPPGIFTER_FIL` och `JULKAMPANJ_FIL`), och med de påhittade exempelinläggen i `tests/fixtures/nyheter/` i stället för Nyheter (via `NYHETER_MAPP`), så att testerna aldrig beror på vad föreningen har fyllt i: till `dist-ifylld/` med ifyllda uppgifter (`tests/fixtures/*-ifylld.json`) på porten `E2E_PORT_IFYLLD`, och till `dist-tom/` med tomma uppgifter (`tests/fixtures/*-tom.json`) på porten `E2E_PORT_TOM`. Utan dem används de portarna efter `E2E_PORT` (standard 4321, 4322 och 4323; `dist-av/` får 4324). Den vanliga sajten i `dist/` bygger du själv innan. Testerna som letar efter ”fylls i” går mot `dist-tom/`.

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
const { julklapp } = hamtaFunktioner();
---
{julklapp && <JulkampanjPaStartsidan />}
```

- **Ett element** som är avstängt renderas inte alls. Dölj det aldrig med CSS, för då ligger innehållet kvar i HTML:en.
- **En sida** bygger man med en dynamisk rutt (`src/pages/[julklapp].astro`) vars `getStaticPaths()` returnerar en tom lista när flaggan är av. Då skapas inte sidan, och adressen ger 404. En vanlig sidfil kan inte utebli ur bygget.
- **Läs aldrig flaggorna i en React-ö** (`.tsx`), för modulen läser en fil med `node:fs`. Läs dem i `.astro`-filen och skicka värdet som prop.
- **Namnge flaggan efter funktionen**, inte efter platsen, så att sidan, menyraden och rutan på startsidan läser samma flagga.

En ny flagga läggs till på fyra ställen: listan `FUNKTIONER` i `src/lib/funktioner.ts`, datafilen, ett fält i `.pages.yml` och en rad i `tests/fixtures/funktioner-av.json`. Enhetstestet och bygget stoppar om något av dem saknas. En flagga som saknas i datafilen stoppar bygget i stället för att tyst bli av eller på.

Webbläsartesterna bygger sajten en tredje gång till `dist-av/`, som produktion med flaggorna från `tests/fixtures/funktioner-av.json` (via `FUNKTIONER_FIL` och `MILJO`), på porten `E2E_PORT_AV` (standard `E2E_PORT` + 3, alltså 4324). `tests/e2e/funktioner.spec.ts` kontrollerar att sidorna ger 404 och att länkarna saknas.

## Julkampanjen och Repejo

Sidan ”Ge en julklapp” (`src/pages/[julklapp].astro`, `/julklapp`) bäddar in Repejos checkout och insamlingsmätare via `src/components/Repejo.astro`. Värd, organisations-id och kampanjens kortkod finns i `src/lib/repejo.ts`. Under checkouten och mätaren finns en länk till Repejos kampanjsida, så att besökaren kan ge även om Repejo inte fungerar. Bara på sidan Bli fadder saknas länken under checkouten (`utanReserv`), som i sidans design. Kampanjens egna uppgifter (sista dagen, vad julklappen gör och en e-post för frågor) finns i `src/data/julkampanj.json` och fylls i i Pages CMS under Julkampanjen. Webbläsartesterna stubbar Repejo och läser kampanjens uppgifter från `tests/fixtures/julkampanj-ifylld.json` och `julkampanj-tom.json` (via `JULKAMPANJ_FIL`).

Kampanjen är säsongsbunden. Efter jul kan sidan tas bort, eller kortkoden bytas, utan att något annat ändras.

## Bli fadder

Formuläret för att bli fadder ligger på Bli fadder (`src/pages/bli-fadder.astro`, `/bli-fadder`) och är Repejos checkout (`<repejo-checkout>`) med kortkoden `FADDER_KORTKOD` i `src/lib/repejo.ts`. Sidan laddar Repejos skript, och formuläret visas utan reservlänk under sig (`utanReserv`). Startsidan laddar inte Repejo: dess fält ”Bli fadder” länkar till sidan Bli fadder. Det besökaren fyller i går till Repejo.

Sidan Engagera dig (`src/pages/engagera-dig.astro`, `/engagera-dig`) låter besökaren starta en egen insamling hos Repejo. Varje tillfälle (Födelsedag, Jubileum, Sportevent) har Repejos knapp `<repejo-p2p-create-button>` med sin kategori, som står i `INSAMLINGSKATEGORI` i `src/lib/repejo.ts`. En kategori som är `null` visar chipet ”knapp fylls i” i stället för en knapp. Kategorierna är `birthday`, `anniversary` och `sport_event`. Repejos lista med pågående insamlingar och materialet för att hitta nya faddrar (affisch, folder, bilder) visas med ”fylls i” tills föreningen har gett dem.

## Publicering

GitHub Actions kör typkontroll, enhetstester, bygge och webbläsartester på varje push. När allt går igenom på `master` publiceras sajten på GitHub Pages på https://streetlight-nu.github.io/web/.

Det föreningen sparar i Pages CMS (`src/data/`, `src/content/` och `src/assets/`) går en snabbare väg: `innehall.yml` kör bara enhetstester och bygge (bygget validerar all data mot sina scheman) och publicerar sedan. Typkontrollen och webbläsartesterna hoppas över, eftersom ingen kod har ändrats. `ci.yml` hoppar över pushar som bara rör de sökvägarna. Rör en commit något annat kör `ci.yml` allt, som vanligt. Båda publicerar via samma `concurrency`-grupp `pages`, så två publiceringar körs aldrig samtidigt.

Redaktörer skriver Nyheter i [Pages CMS](https://app.pagescms.org), som läser `.pages.yml` och committar direkt till `master`. Instruktionen för redaktörer finns i [docs/redaktorer.md](docs/redaktorer.md). Bilder laddas upp till `src/assets/nyheter/` och optimeras vid bygget.

Vid egen domän: lägg till domänen under Settings › Pages och sätt repovariablerna `SITE_URL` (till exempel `https://streetlight.nu`) och `BASE_PATH` (`/`). Ingen kod behöver ändras.
