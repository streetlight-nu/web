# Funktionsflaggor: finns det något bättre än vår egen lösning?

Hämtat och sammanställt 2026-11-06. Underlag för frågan "finns det något annat befintligt sätt att hantera feature flags, lösningen känns inte helt optimal". Jämför vår egen modul (PR #29, commit 2abdf3c och ccc6045: `src/lib/funktioner.ts`, `src/data/funktioner.json`, `MILJO` i CI, sidor som `[julklapp].astro`) med Astros egna funktioner, OpenFeature, flaggtjänster och GitHub-baserade alternativ. Inget i repot är ändrat av denna research.

## Läs detta först: hur källorna hämtades

Sessionen når bara `raw.githubusercontent.com` och `registry.npmjs.org`. Alla andra värdar (docs.astro.build, openfeature.dev, docs.github.com, leverantörernas webbplatser och prissidor, pagescms.org) svarade inte (`getaddrinfo ENOTFOUND` eller ingen anslutning). `gh api` fick 403 för andra repon. Därför:

- **[P]** = lästes 2026-11-06 i en primärkälla: leverantörens eget repo (dokumentationens källfiler, README, licensfil, kod) eller npm-registrets metadata, eller repots egna filer. Astros dokumentation lästes som källfilerna i `withastro/docs` (gren `main`), inte på docs.astro.build. Det är samma text, men `main` är inte låst till Astro 7.3.8 (det som `node_modules/astro/package.json` rad 3 visar). Där det går har jag kontrollerat mot installerad kod.
- **[A]** = antagande eller slutsats av mig, inte läst i en källa.
- **OVERIFIERAT** = gick inte att belägga. Det gäller framför allt priser och gratisnivåer för SaaS-tjänsterna: ingen prissida var nåbar.

Källbaser som förkortas nedan:

- `ASTRO` = `https://raw.githubusercontent.com/withastro/docs/main/src/content/docs/en/`
- `GHDOCS` = `https://raw.githubusercontent.com/github/docs/main/content/actions/`
- `PCMS` = `https://raw.githubusercontent.com/pagescms/pagescms/main/`

## Sammanfattning

Inget färdigt bibliotek eller verktyg ersätter vår modul på ett sätt som lönar sig. Vår modul är cirka 60 rader plus en JSON-fil, och det är den enda lösning som uppfyller alla tre krav samtidigt: ingen tjänst att driva, ingen tredje part (ADR 0003) och en redaktör som ändrar en flagga i Pages CMS. Det som är värt att göra är att **förenkla** den (avsnitt 5): hämta flaggnamnen ur JSON-filen så att en ny flagga inte kräver en lista till, lägga sidorna utanför `src/pages` och låta en liten lokal integration lägga till rutten med `injectRoute` när flaggan är på, samt ett test som stoppar flaggor i React-öar. En byte till OpenFeature eller en flaggtjänst tillför beroenden och drift utan att lösa något av våra fyra problem.

## 1. Astros egna funktioner

| Funktion | Vad den gör | Räcker den? |
| --- | --- | --- |
| `astro:env` | Typat schema för miljövariabler med `context` (`client`/`server`) och `access` (`public`/`secret`) [P] | Nej som ersättare, ja som komplement |
| `import.meta.env.PROD/DEV/MODE` | `PROD` är `true` vid `astro build`, `DEV` vid `astro dev` [P] | Ersätter inte `ejProduktion` i CI |
| Content collections med `filter` | Utesluter poster vid bygget, t.ex. `draft` [P] | Bara för innehåll, inte för sidor |
| Middleware | Körs vid bygget för förrenderade sidor [P] | Kan inte utelämna en sida |
| `export const prerender` | Väljer förrendering eller on-demand per rutt [P] | Nej: ingen "utelämna" |
| Prefix `_` i `src/pages` | Filen blir ingen rutt [P] | Statiskt, kan inte styras av en flagga |
| `injectRoute` i en integration | Lägger till en rutt från kod vid bygget [P] | Ja, bättre än dynamisk rutt (avsnitt 5) |

Belägg:

- `astro:env` finns sedan 5.0.0 och beskrivs som "lets you configure a type-safe schema for environment variables"; `envField` tar `context` och `access`, och en kombination av `client` och `secret` stöds inte. Källa: `ASTRO`guides/environment-variables.mdx rad 194, 216 och 286, `ASTRO`reference/modules/astro-env.mdx rad 12. Samma sida, rad 349–351: `astro:env` kan inte användas i `astro.config.mjs` eller i skript, där man får använda `process.env`. Alla variabler läses vid bygget i vårt fall; det gör `astro:env` till en bättre ersättare för vår `process.env.MILJO` (typad, med fel om den saknas), inte för flaggfilen. [P] för citaten, [A] för att det räcker att ersätta den raden.
- `ejProduktion` och Vite-variabler: Astro "uses Vite's built-in support for environment variables, which are statically replaced at build time" (`ASTRO`guides/environment-variables.mdx rad 17). `import.meta.env.PROD` är `true` vid `astro build` (rad 56–58). Alla våra CI-byggen är `astro build`, så `PROD` skiljer inte master från grenar. Därför behövs `MILJO` [A]. Observera dessutom att `ci.yml` bara publicerar på master (`.github/workflows/ci.yml` rad 54 och 61). Grenar och pull requests byggs bara för test, utan förhandsvisning på nätet [P, repot]. Läget `ejProduktion` ("bara i testbyggen") syns därför i praktiken bara lokalt i `npm run dev` och i Playwright-bygget. Om det är allt läget ska göra räcker `import.meta.env.DEV` och `MILJO` kan tas bort [A]. Om föreningen vill ha förhandsvisning av grenar behövs ett eget distributionsmål, och det finns inte idag.
- Content collections: "`getCollection()` takes an optional 'filter' callback" och exemplet med `draft` samt `import.meta.env.PROD ? data.draft !== true : true` finns i `ASTRO`guides/content-collections.mdx rad 526–552 [P]. Det passar för nyheter och frågor ("kommande" inlägg), inte för att slå av en sida eller ett element.
- Middleware: "This rendering occurs at build time for all prerendered pages" (`ASTRO`guides/middleware.mdx rad 10). Middleware kan alltså sätta `locals.funktioner` vid bygget, men den kan inte ta bort en rutt, och `locals` är inte tillgängligt i en komponent utan `Astro.locals` [A]. Ingen vinst jämfört med att importera `hamtaFunktioner()`.
- `prerender`: `ASTRO`reference/routing-reference.mdx rad 18–52 beskriver bara `true`/`false`. Det finns ingen "ingen rutt"-form. [P]
- Utesluta en sida: "You can exclude pages or directories within `src/pages` from being built by prefixing their names with an underscore" (`ASTRO`guides/routing.mdx rad 572) [P]. Det är fast i filnamnet och kan inte läsa en flagga.
- Dynamisk rutt: `getStaticPaths()` "must return an array of objects with a `params` property. Each of these objects will generate a corresponding route" (`ASTRO`guides/routing.mdx rad 49). En tom lista ger alltså ingen sida. Det är det vi gör idag. [P]
- `injectRoute`: tar `pattern`, `entrypoint` (sökväg till en `.astro`-sida) och valfritt `prerender` (`ASTRO`reference/integrations-reference.mdx rad 409–430). Exemplet använder `entrypoint: './src/dynamic-page.astro'`. Funktionen finns i installerad kod (`node_modules/astro/dist/integrations/hooks.js`) [P]. Kvar att prova: att `@/`-alias och Tailwind fungerar i en sida som ligger utanför `src/pages` [A].

Slutsats: Astro har ingen inbyggd funktionsflagga. Det närmaste är `astro:env` (miljövariabel med schema) och `injectRoute`.

## 2. OpenFeature

OpenFeature är en "open specification that provides a vendor-agnostic, community-driven API for feature flagging" (`https://raw.githubusercontent.com/open-feature/spec/main/README.md`) [P]. CNCF:s landskapsfil listar projektet som `project: incubating` (`https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml`, rad 10972–10975) [P].

Beroenden (npm-registret, 2026-11-06, alla Apache-2.0) [P]:

| Paket | Version | Beroenden | Storlek (uppackad) |
| --- | --- | --- | --- |
| `@openfeature/server-sdk` | 1.23.0 | inga | cirka 306 kB |
| `@openfeature/web-sdk` | 1.10.0 | inga | cirka 880 kB |
| `@openfeature/flagd-provider` | 0.18.0 | `lru-cache`, `@openfeature/flagd-core` | cirka 712 kB |
| `@openfeature/flagd-web-provider` | 0.8.0 | `@bufbuild/protobuf`, `@connectrpc/*` | cirka 179 kB |

Leverantörer som fungerar utan server [P]:

- **In-memory.** Servern-SDK:n innehåller `InMemoryProvider` och `TypedInMemoryProvider` med flaggor som ett objekt i koden (`https://raw.githubusercontent.com/open-feature/js-sdk/main/packages/server/README.md` rad 296–312; klassen finns i `dist/types.d.ts` i paketet).
- **Env-var-leverantör.** `@openfeature/env-var-provider` läser miljövariabler. README: "doesn't require any infrastructure", men stöder inte "dynamic updates at run-time or contextual flag evaluation" (`https://raw.githubusercontent.com/open-feature/js-sdk-contrib/main/libs/providers/env-var/README.md` rad 3–6).
- **flagd i filläge.** `FlagdProvider` med `resolverType: 'in-process'` och `offlineFlagSourcePath: './flags.json'` utvärderar flaggor från en fil, med `fs.watchFile` som kontrollerar filen var femte sekund (`https://raw.githubusercontent.com/open-feature/js-sdk-contrib/main/libs/providers/flagd/README.md` rad 98–125). Det är byggt för långlivade processer; vid ett engångsbygge tillför det ingenting [A].

Vad vinner man? Ett standardiserat gränssnitt (`client.getBooleanValue('julklapp', false)`) och att man senare kan byta leverantör utan att ändra anropen. Vad kostar det? Ett beroende, asynkrona anrop (SDK:ns utvärdering är asynkron [A]) i `.astro`-filer som idag läser flaggor synkront, och ändå en egen leverantör för tre-lägesmodellen (`pa`/`av`/`ejProduktion`) och för Pages CMS-filen. Boolska flaggor och "Bara i testbyggen" blir en kontext (`miljo`) som vi ändå måste fylla i själva. Standarden löser alltså inte något av våra fyra problem. Den vore motiverad först om föreningen byter till en flaggtjänst (avsnitt 3) [A].

## 3. Flaggtjänster

Gemensamt för alla: de är byggda för att utvärdera flaggor vid körning, antingen i servern eller i webbläsaren. Vid bygget av en statisk sajt blir de bara en fjärrdatabas som vi läser en gång. Sajten anropar då inget i webbläsaren, så ADR 0003 och GDPR påverkas inte av tjänsten själv (ingen besökardata lämnar sajten) [A]. Men bygget på GitHub-löparen anropar tjänsten med en API-nyckel (en hemlighet i Actions) och tjänsten blir ett nytt personuppgiftsbiträde bara om den lagrar personuppgifter. Flaggor med bara på/av innehåller inga [A].

| Verktyg | Licens / paket (npm 2026-11-06) | Självhostat | Kan läsas vid bygget | Redaktör → bygge utan kodändring |
| --- | --- | --- | --- | --- |
| Unleash | Server AGPL-3.0 [P]; `unleash-client` 6.12.2 Apache-2.0 [P] | Ja (Docker, Postgres) [P] | Ja, med Node-klienten [A] | Webbhooks/integrationer finns [A], inte läst |
| Flagsmith | Server BSD-3 [P]; `flagsmith-nodejs` 8.1.2 MIT [P] | Ja (open source-bygge) [P] | Ja [A] | Webhooks [A], inte läst |
| GrowthBook | MIT med delar under annan licens [P]; `@growthbook/growthbook` 2.0.0 MIT, 4,4 MB [P] | Ja (Docker) [P] | Ja [A] | README: "Webhooks and a full REST API" [P] |
| PostHog | MIT med delar under annan licens [P]; `posthog-node` 5.63.1 [P] | Ja, tungt [A] | Ja [A] | Webhooks [A] |
| Vercel `flags` | MIT, 4.4.0 [P] | Nej: byggt för Vercel [A] | OVERIFIERAT | OVERIFIERAT |
| LaunchDarkly, Statsig, ConfigCat, Cloudflare | Slutna tjänster | Nej | OVERIFIERAT | OVERIFIERAT |

Källor för raden: licensfilerna `Unleash/unleash/main/LICENSE`, `Flagsmith/flagsmith/main/LICENSE`, `growthbook/growthbook/main/LICENSE`, `PostHog/posthog/master/LICENSE` på raw.githubusercontent.com (AGPL-3.0 respektive "Portions of this software are licensed as follows"); README för Unleash, Flagsmith och GrowthBook (självhosting och gratis molnkonto nämns, t.ex. GrowthBook-README rad 9, 19 och 41; Unleash-README rad 30–36).

Vad vi kan säga och inte säga:

- **Gratisnivåer och priser: OVERIFIERAT.** Prissidorna gick inte att nå. Unleashs README erbjuder bara en "free 14-day cloud trial" av Enterprise (rad 92–93) [P]; det är ingen gratisnivå.
- **Självhostat betyder en server att drifta.** Det motsvarar kärnfråga 2 i `docs/research/epostutskick-sjalvhostat.md` (driftbörda, uppdateringar, backup, namngiven ansvarig). En tjänst vars enda jobb är två flaggor är orimlig drift för en liten förening [A].
- **Redaktören ändrar flaggan i tjänstens gränssnitt, men ett bygge måste ändå utlösas.** Vägen är tjänstens webhook → en mellanhand som anropar GitHubs `repository_dispatch` med en token → ett nytt workflow (`GHDOCS`reference/workflows-and-actions/events-that-trigger-workflows.md rad 911–913 beskriver `repository_dispatch` för "activity that happens outside of GitHub") [P]. Mellanhanden är en serverlös funktion med en GitHub-token, alltså ny drift och en ny hemlighet [A]. Det är precis det som epostutskick-dokumenten också landade i. Ingen av tjänsterna kan utlösa ett GitHub Pages-bygge direkt [A].
- **Redaktören har redan ett fungerande flöde:** Pages CMS commitar på master och bygget startar. En flaggtjänst lägger en andra plats att ändra på, med egen inloggning.

Passar det ADR 0003? Ja i sak, eftersom anropet sker vid bygget och inte i webbläsaren. Men ADR 0003 gäller "tredje part", och byggmiljön skickar då förfrågningar till en tjänst; det bör skrivas in i ADR:n om något väljs [A]. Ingen av dem ger något som vi behöver.

## 4. GitHub-baserade alternativ

- **Repository-variabler (`vars.X`).** "You can create configuration variables for use across multiple workflows, and can define them at either the organization, repository, or environment level" (`GHDOCS`how-tos/write-workflows/choose-what-workflows-do/use-variables.md rad 66) [P]. Vi använder redan `vars.SITE_URL` och `vars.BASE_PATH` (`ci.yml` rad 20–21) [P, repot]. En flagga som `vars.FUNKTION_JULKLAPP` styrs alltså utan att en fil i repot ändras. Men att ändra en variabel startar inget bygge; det krävs en ny körning [A], och det kräver skrivrättighet i repots inställningar, vilket redaktörerna kanske inte har [A]. Variabeln är också osynlig i Pages CMS och i historiken (ingen commit).
- **Deployment environments med godkännande.** Miljöer har "Required reviewers" (upp till 6), "Wait timer" och "Deployment branches" (`GHDOCS`how-tos/deploy/configure-and-manage-deployments/manage-environments.md rad 59–74) [P]. Fria konton får bara miljöer i publika repon (rad 32) [P]. Vi har redan miljön `github-pages` i `deploy`-jobbet (`ci.yml` rad 66) [P, repot]. En godkännandemiljö löser frågan "vem får publicera", inte "vilka funktioner är på".
- **`workflow_dispatch` med inputs.** Knappen "Run workflow" visas om workflow-filen finns på standardgrenen, och `inputs` kan vara obligatoriska eller ha standardvärden (events-that-trigger-workflows.md rad 1070–1100) [P]. `ci.yml` har redan `workflow_dispatch` utan inputs (rad 7) [P, repot]. En input skulle ge en engångsflagga för just den körningen; nästa push på master bygger om utan den, så flaggan tappas [A]. Inte lämpligt för publicerad status.
- **Pages CMS `actions`.** Pages CMS 2.1.8 har en `actions`-nyckel i konfigurationsschemat med `workflow`, `ref`, `confirm` och `fields` av typen `text`, `textarea`, `select`, `checkbox` eller `number` (`PCMS`lib/config-schema.ts rad 10–100, `PCMS`package.json rad 8) [P]. Det pekar på en knapp i Pages CMS som kör ett workflow med inputs. Att den anropar `workflow_dispatch` med dessa fält har jag inte läst i dispatch-koden [A], och om hostade `app.pagescms.org` kör samma version är OVERIFIERAT. Det löser ändå inte tappet ovan.
- **Pages CMS-fält och tillstånd.** Konfigurationen läses med `YAML.parseDocument` och görs om med `document.toJSON()` (`PCMS`lib/config.ts rad 47 och 457) [P], så YAML-ankare (`&x` och `*x`) fungerar [A, `toJSON` följer alias i `yaml`-paketet; inte provat i Pages CMS]. `<<`-sammanfogning är inte verifierad. Filtypen `file` med `format: json` finns redan i vår `.pages.yml` (rad 87–93) [P, repot].

Slutsats: den bästa GitHub-lösningen är den vi redan har, en commit via Pages CMS. Variabler och dispatch ger flaggor som inte syns i repot och som är lätta att glömma bort.

## 5. Förenklingar av vår egen lösning

Våra fyra ställen idag: `FUNKTIONER` i `src/lib/funktioner.ts` rad 20, nyckeln i `src/data/funktioner.json`, fältet i `.pages.yml` (rad 95 och 105) och fixturerna i `tests/fixtures/` [P, repot].

1. **En källa för namnen.** Låt `FUNKTIONER` komma från JSON-filen (`import data from "@/data/funktioner.json"` och `Object.keys(data)`; TypeScript kräver `resolveJsonModule`, som Astros bas-tsconfig har [A]). Schemat byggs från samma nycklar och typen `Funktion` blir `keyof typeof data`. Då räcker det att lägga till flaggan i JSON-filen. Kostnaden är att "flaggan saknas i filen" inte längre fångas av schemat, utan av typkontrollen när en komponent läser en flagga som inte finns [A]. Det befintliga testet `tests/unit/funktioner.test.ts` kontrollerar redan att `.pages.yml` och schemat stämmer, och bör behållas så att CMS-formuläret inte glider isär.
2. **Fixturer från filen.** Skapa testfixturerna i `tests/` genom att läsa `funktioner.json` och sätta alla flaggor till ett läge, i stället för två handskrivna JSON-filer (`tests/fixtures/funktioner-av.json`, `funktioner-ejproduktion.json`). Fixtur och formulär slutar vara ställen att komma ihåg [A].
3. **Ankare i `.pages.yml`.** De två fälten är identiska utom `name` och `label`. Lägg de tre alternativen under ett ankare (`values: &lagen [...]` och `values: *lagen`). Det sparar upprepningen men inte fältet i sig, eftersom varje flagga måste ha ett eget `name` [A].
4. **Sidor utan `[namn].astro`.** Flytta `julklapp.astro` och `historia.astro` till t.ex. `src/sidor/` (utanför `src/pages`) och lägg en liten lokal integration i `astro.config.mjs` som anropar `injectRoute({ pattern: "/julklapp", entrypoint: "./src/sidor/julklapp.astro" })` när flaggan är på (`ASTRO`reference/integrations-reference.mdx rad 409–430) [P]. Integrationen läser JSON-filen i konfigurationen med `node:fs` (där `astro:env` inte får användas, se avsnitt 1). Då slipper man `getStaticPaths`-tricket och omdöpta filer, och `/julklapp` är ett namn som syns i koden. Nackdelar: en konfigurationsfil som läser data, och att filen inte ligger där man letar efter sidor [A]. Prova först att sidorna bygger och att `@/`-alias och stilar fungerar utanför `src/pages` [A].
5. **Skydd mot flaggor i React-öar.** `hamtaFunktioner()` använder `node:fs`. Ett vitest-test som går igenom `src/**/*.tsx` och misslyckas på import av `@/lib/funktioner` är billigast (repot har inte ESLint, `package.json`) [P, repot]. ESLint-regeln `no-restricted-imports` vore det vanliga alternativet men kräver ett nytt verktyg [A]. Observera att en ö renderas på servern vid bygget (`client:*`), så ett fel kan tyst fungera tills ön hydreras i webbläsaren [A]; testet är därför värt att ha.
6. **`MILJO`.** Se avsnitt 1: antingen ersätt med `import.meta.env.DEV` om `ejProduktion` bara ska gälla lokalt, eller deklarera `MILJO` i `astro:env` (`envField.enum({ context: "server", access: "public", values: ["produktion"], optional: true })`) för ett tydligt fel vid felstavning [A]. Kontrollera att `astro:env` fungerar utanför `.astro`-filer innan det införs; `lasDatafil` är en vanlig modul, vilket sidan listar som stött (environment-variables.mdx rad 341–347) [P].

## Jämförelse på de sex punkterna

| Alternativ | Passar statisk sajt på Pages? | Redaktörens väg | Kostnad / underhåll | Påverkan på ADR 0003 |
| --- | --- | --- | --- | --- |
| Behåll som den är | Ja | Pages CMS, commit, bygge | Cirka 60 rader egen kod; fyra ställen per flagga | Ingen |
| Förenklad egen lösning (avsnitt 5) | Ja | Samma | Något mindre kod; en injektionsintegration att lära sig | Ingen |
| `astro:env` ensam | Ja, men bara miljövariabler | Repo-variabel eller fil, ingen CMS | Ingen kod; ingen filredigering för redaktören | Ingen |
| Content collection med `filter` | Ja, för innehåll | Pages CMS | Låg; fel verktyg för sidor och element | Ingen |
| OpenFeature + in-memory/env | Ja | Som idag (leverantören läser vår fil) | Ett beroende, asynkron läsning, vi skriver ändå leverantören | Ingen |
| OpenFeature + flagd-fil | Ja men onödigt tungt | Samma | Tre till fem beroenden, byggt för långlivade processer | Ingen |
| Unleash / Flagsmith / GrowthBook (självhostat) | Ja vid bygget; egen server krävs | Tjänstens gränssnitt + webhook-mellanhand | Hög: server, backup, uppdateringar, GitHub-token | Bör skrivas in (byggmiljön anropar tjänsten) |
| SaaS (LaunchDarkly, Statsig, ConfigCat m.fl.) | OVERIFIERAT | OVERIFIERAT | OVERIFIERAT (priser ej nåbara) | Nytt biträde om personuppgifter lagras (flaggor gör det inte) [A] |
| GitHub `vars.*` | Ja | Repoinställningar, inte CMS; ny körning krävs | Ingen kod; syns inte i historiken | Ingen |
| `workflow_dispatch` / Pages CMS `actions` | Ja | Knapp i CMS (om `actions` anropar dispatch) | Flaggan tappas vid nästa push | Ingen |

## Rekommendation

**Behåll lösningen och förenkla den.** Byt inte till OpenFeature eller en flaggtjänst.

- Motivering: sajten är statisk och bygger bara på en commit; flaggfilen i Pages CMS är redan det redaktörerna kan. Alla externa alternativ tillför drift, en hemlighet eller ett beroende utan att lösa de fyra problemen (avsnitt 2 och 3), och de som skulle ge ändring utan bygge (körtidsflaggor) kräver anrop från webbläsaren, vilket ADR 0003 vill undvika.
- Gör i den här ordningen: (1) skriv testet mot flaggor i `.tsx` (liten insats, stänger den svagaste punkten); (2) hämta `FUNKTIONER` ur JSON-filen och generera fixturerna; (3) pröva `injectRoute`-varianten på en av sidorna innan den införs på båda; (4) avgör om `ejProduktion` behövs när det i praktiken bara syns lokalt, och ta i så fall bort `MILJO` (avsnitt 1).
- Skulle ändra rekommendationen: krav på att slå av en funktion på minuter utan nytt bygge (då behövs körtidsflaggor och en ändrad ADR 0003); fler än ett tiotal flaggor eller flera sajter som delar flaggor (då lönar OpenFeature plus en tjänst sig); eller att föreningen får en förhandsvisning av grenar, vilket ger `ejProduktion` ett verkligt syfte.

## Öppna frågor och risker

1. **Prissidor och gratisnivåer. Öppen.** Ingen leverantörs prissida var nåbar; allt om SaaS-kostnad är OVERIFIERAT.
2. **Astro-versionen. Delvis besvarad.** Dokumentationen lästes från `main`, inte låst till 7.3.8. `injectRoute` är kontrollerat i installerad kod, men inte provat med `@/`-alias och stilar.
3. **Pages CMS `actions` och ankare. Öppen.** Dispatch med inputs och alias i `.pages.yml` är läst i kod/schema men inte provat; det hostade Pages CMS kan köra en annan version än 2.1.8.
4. **Webhook-vägen. Öppen.** Webhooks hos Unleash, Flagsmith och PostHog är antagna, inte lästa; GrowthBooks README nämner dem.
5. **Behörighet för att ändra `vars.*`. Öppen.** Vilken behörighet som krävs i repot lästes inte (GitHubs dokumentation använder mallvariabler som inte gick att tolka).
