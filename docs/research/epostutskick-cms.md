# Publicera Nyheter och skicka e-post i ett steg: CMS, utskicksväg och Google Workspace

Hämtat och sammanställt 2026-11-03. Bygger vidare på `docs/research/epostutskick-tjanster.md` (SaaS-jämförelse, Repejo, GDPR-avsnitt, Googles och Yahoos avsändarkrav) och `docs/research/epostutskick-sjalvhostat.md` (egenhostat). Det som redan står där upprepas inte här; hänvisningar görs till filerna. Inget i repot är ändrat eller kopplat.

Frågan: vilket CMS (helst headless eller git-baserat) kan Streetlight använda för att publicera en Nyhet på webben och samtidigt skicka samma inlägg som e-post, så att styrelsen slipper två steg? Är Google Workspace-reläet rätt väg för utskicken?

## Läs detta först: märkning och hur källorna hämtades

- **[P]** = sidan eller källfilen hämtades i fulltext 2026-11-03 och påståendet är läst i primärkällan (leverantörens egen dokumentation, prissida, DPA, källkod i GitHub, Googles hjälpsidor).
- **[S]** = sekundär källa (forum, söksammanfattning, jämförelseblogg). Används bara där det anges och ska kontrolleras mot primärkälla.
- **OVERIFIERAT** = gick inte att belägga. Det betyder inte att funktionen saknas.
- **Egen slutsats** = min läsning av flera belagda fakta. Inte ett uttalande från leverantören och inte juridisk rådgivning.

Hämtning och begränsningar:

- Sidor hämtades med `curl` (text utdragen ur HTML) och, för GitHub-innehåll, via `raw.githubusercontent.com` och `api.github.com`. `WebSearch` användes bara för att hitta rätt primär-URL (Googles "SMTP relay spam policy" ligger på `support.google.com/a/answer/6389191`; de länkade "knowledge.workspace.google.com"-sidorna är samma innehåll). Brevos hjälpartiklar lästes via Zendesk-API:t `help.brevo.com/api/v2/help_center/en-us/articles/<id>.json` eftersom artikelsidorna ger 403 (samma metod som i grannfilen). Brevos API-dokumentation lästes som Markdown (`developers.brevo.com/reference/*.md`).
- Pages CMS-repot heter `hunvreus/pagescms` (`pages-cms/pages-cms` på GitHub omdirigerar dit). Källfilerna lästes på `main`. Senaste release vid hämtning: 2.1.8 (2026-06-08).
- `buttondown.com/pricing` visar baspriset med ett JavaScript-reglage, så priset per antal prenumeranter gick inte att läsa; tillvalen gick att läsa.
- `contentful.com/pricing` gav ingen läsbar text; Contentful är därför inte omläst. Sanity, Storyblok, Directus och Strapi lästes bara på prissidans nivå (se avsnittet om bortfall).
- Priser anges i den valuta sidan visar (USD/EUR) och är exklusive moms om inget annat sägs. Ingen omräkning till SEK. Rabattberäkningar är märkta "räknat".

## Sammanfattning och rekommendation

1. **Pages CMS kan behållas och kan trigga en GitHub Action.** Pages CMS 2.1.0 (2026-03-31) har en funktion "Actions": en egen knapp i redigeringsvyn som kör `workflow_dispatch` mot en workflow i repot, med inläggets filsökväg i en JSON-payload [P]. Det är den enda koppling mellan CMS och utskick som hittades hos de git-baserade CMS:en. Den kopplar inte "Spara" till "Skicka" av sig själv (se avsnitt 2).
2. **Förstahandsval: Pages CMS + egen liten GitHub Action som skapar och skickar en kampanj via Brevos API till en lista per Ämne (kandidat A).** Redaktören sparar, väntar tills sidan är uppe och trycker på knappen "Skicka som e-post" (två klick), eller kryssar i "Skicka som e-post" före Spara (ett klick, högre risk för misstag). Samtyckesregeln upprätthålls av samma Zod-schema som bygget. Brevo sköter avanmälan, studsar, lagring av Medgivande och EU-hosting (grannfilen). Kräver en utvecklare som skriver ett skript på ca 100 rader och ett separat sätt att samla in prenumeranter (redan planerat i `prenumeration.ts`).
3. **Näst bäst: RSS-till-mejl (kandidat B)** om föreningen vill ha noll kod. Brevo och MailerLite kollar flödet högst dagligen (inte direkt), MailerLite kräver betald plan, och redaktören får ingen "skicka inte mejl för just det här inlägget" om inte ett separat utskicksflöde byggs (en egen `utskick.xml` i Astro). Kräver ändå en liten ändring i Astro-sajten.
4. **Google Workspace är sannolikt en dålig utskicksmotor för detta (kandidat D).** Googles sidor förbjuder inte opt-in-utskick, men SMTP-reläet beskrivs för enheter och applikationer, IP-allowlisting fungerar inte från GitHub-runners, lösenordsinloggning för tredjepartsappar är avstängd (app-lösenord är ett undantag som kanske inte finns för arbetskonton), och Gmail ger varken avanmälan, studsar eller samtyckeslagring. Använd Workspace till avsändardomän och mottagare av svar (avsnitt 6).
5. **Ghost (kandidat C) publicerar och mejlar i ett steg**, men ersätter både Pages CMS och markdown-schemat, flyttar samtyckesregeln ur bygget (Ghost skickar mejlet innan något bygge kan stoppa det) och löser inte att sajten ligger på GitHub Pages. Rekommenderas inte. Övriga headless CMS faller bort (avsnitt 5).

Villkor och osäkerheter står i avsnitt 8 och 9.

## Jämförelsetabell

Förklaring: **Klick** = antal handlingar för redaktören efter att texten är skriven. **Kod** = vad en utvecklare måste göra. Alla fakta i tabellen har [P]-belägg i avsnitten nedan om inget annat anges.

| | A. Pages CMS + Action + Brevo-API | B. RSS-till-mejl (Brevo / MailerLite / Buttondown) | C. Ghost(Pro) | D. Pages CMS + Action + Gmail API/Workspace |
| --- | --- | --- | --- | --- |
| Behåller Pages CMS och markdown | Ja | Ja | Nej (byter CMS, innehåll flyttas) | Ja |
| Klick för webb + mejl | 2 (Spara, sedan "Skicka som e-post") eller 1 (kryssruta + Spara) | 1 (Spara, flödet gör resten med fördröjning) | 1 ("Publish and email") | 2 eller 1, som A |
| Kod/utvecklare | Skript + workflow (ca 100 rader), formulär till Brevo | Ett RSS-flöde per Ämne i Astro; ingen mejlkod | Astro-front mot Content API, webhook till bygge, flytt av innehåll | Skript + workflow + egen avanmälan och studshantering |
| Direkt eller fördröjt | Direkt efter bygget | Brevo/MailerLite: dagligen/veckovis/månadsvis; Buttondown: var 30:e minut | Direkt | Direkt |
| Kostnad vid några hundra mottagare | Brevo Free 0 (max 300 mejl/dag, Brevo-logga) eller Starter från 9 USD/mån (räknat 7,20 USD med 20 % ideell rabatt) | Brevo: planbehov OVERIFIERAT; MailerLite Comfort 12 USD/11 EUR vid 500 (räknat ca 8,40 USD med 30 % rabatt); Buttondown: +9 USD RSS-tillval ovanpå bas som inte gick att läsa | Starter 18 USD/mån vid årsbetalning, 1 000 medlemmar | Workspace-licens för avsändarkontot; ingen utskickskostnad, men egen drift |
| Driftansvar | Litet: ett skript, en API-nyckel | Mycket litet | Ghost(Pro) driver; Astro-bygge och bryggan är föreningens | Stort: avanmälan, studsar, kvoter |
| EU-hosting/DPA | Brevo: OVH FR + Google BE, DPA i villkoren (grannfilen) | Brevo som ovan; MailerLite: DE/NL men DPA tillåter "anywhere in the world"; Buttondown: USA, SCC | DPA finns; EU-data lagras "within and outside" EU; Annex A ej läst | Workspace-avtal ej läst; abonnentlista måste ligga någon annanstans |
| Samtyckesregel för mejlet | Samma schema som bygget, plus kontroll i skriptet | Följer av att flödet bara innehåller byggda inlägg; kräver separat flöde för "med e-post" | Kan inte upprätthållas före utskick | Som A |
| Avanmälan, studsar | Brevo hanterar | Leverantören hanterar | Ghost hanterar | Egen byggnad (OVERIFIERAT hur Gmail beter sig) |
| Bedömning | **Rekommenderas** | Reservväg utan kod | Rekommenderas inte | Rekommenderas inte |

## 1. Vad som är nytt jämfört med de två tidigare filerna

- De tidigare filerna utgår från Repejo som trigger. Den här frågan gäller en annan trigger: att en redaktör publicerar en Nyhet. Båda flödena kan bo i samma Brevo-konto: Repejo lägger faddrar i onboarding-flödet, redaktörens Nyhet går till listorna per Ämne.
- Nya primärfynd: Pages CMS Actions (källkod och dokumentation), Googles SMTP-relä-spampolicy, Workspace användningsvillkor, Gmail API:s kvoter och GitHub-runnernas IP-adresser, Brevos RSS- och kampanj-API, MailerLites RSS-krav, Buttondowns RSS-funktion och DPA, Ghosts webhooks och DPA.
- Rättelse mot grannfilen: Buttondown har en publik DPA på `buttondown.com/legal/data-processing-agreement` (uppdaterad 2026-10-23) [P]. Grannfilen skrev att `/legal/dpa` gav 404; det stämmer, men DPA:n ligger på en annan adress. Den säger uttryckligen att Buttondown, LLC är USA-baserat, att personuppgifter överförs till och behandlas i USA och att EU:s standardavtalsklausuler (SCC) gäller [P]. Underbiträdeslistan (`buttondown.com/legal/subprocessors`) svarar 200 men lästes inte.

## 2. Pages CMS Actions: vad de gör, exakt

Källor: https://pagescms.org/docs/configuration/actions/ (hämtad 2026-11-03), `lib/actions.ts`, `app/api/[owner]/[repo]/[branch]/actions/route.ts` och `lib/token.ts` i https://github.com/hunvreus/pagescms (raw.githubusercontent.com, `main`), releasen 2.1.0 https://api.github.com/repos/hunvreus/pagescms/releases (2026-03-31: "Added the new Actions feature set, including action pages, run tracking, updates, and cancellation support").

Fynd [P]:

- **Actions är knappar som startar en GitHub Actions-workflow med `workflow_dispatch`.** De kan ligga på databasnivå (sidopanelen) eller i rubriken på en samlings-, post-, fil- eller mediasida. Nycklar: `name`, `label`, `workflow` (filnamn i `.github/workflows/`), `ref` (`current` = grenen som är öppen i Pages CMS), `scope` (`collection` eller `entry`), `cancelable`, `confirm` (dialog med egen titel, text och knapptext), `fields` (extra fält: `text`, `textarea`, `select`, `checkbox`, `number`).
- **Payload:** workflowen ska ha en indata `payload` (string) och får ett JSON-objekt med `source: "pages-cms"`, `action`, `repository` (owner, repo, ref, sha), `triggeredAt`, `triggeredBy` (namn, e-post, GitHub-användarnamn), `context` (`type`, `name`, `path` till inlägget, `data`) och `inputs` (de extra fälten). För en post med `scope: entry` finns alltså inläggets filsökväg, till exempel `src/content/nyheter/skolstart-i-addis-abeba.md`.
- **Körningen sker med redaktörens GitHub-token** om redaktören har åtkomst till repot, annars med GitHub App-installationens token för inbjudna kollaboratörer (`getToken` i `lib/token.ts`). Anropet är `octokit.rest.actions.createWorkflowDispatch`. Pages CMS visar körningens status (köad, kör, lyckad, misslyckad) och kan avbryta den.
- **Pages CMS har inga webhooks, ingen schemaläggning och ingen e-postfunktion.** Ingen sådan kod hittades i de filer som lästes och dokumentationens innehållsförteckning har inga sådana sidor.
- **"Spara" och "Skicka" är två skilda handlingar.** En Action körs bara när någon trycker på knappen. Att "Spara" committar till `master` (befintligt beteende, `.pages.yml`-kommentaren) triggar bara CI. Det går att koppla ihop dem på två sätt (kandidat A, variant 1 och 2).
- **Okänt:** om den hostade appen `app.pagescms.org` kör version 2.1.x med behörigheten "Actions: write" för GitHub App-installationen. Releasenotes visar att funktionen finns i koden; att den är påslagen i den hostade appen och att GitHub App-installationen för `streetlight-nu` har rätt behörighet är **OVERIFIERAT** och ska testas först. En enkel provknapp som bara skriver ut `payload` räcker.

## 3. Kandidat A: Pages CMS + GitHub Action + Brevo-API (rekommenderad)

### Hur ett Spara ger webb och mejl

Två varianter, båda med samma skript:

- **Variant 1: knapp (två klick, tydligt val).** I `.pages.yml` läggs en Action på samlingen Nyheter med `scope: entry`, `workflow: skicka-epost.yml` och en bekräftelsedialog ("Detta skickar inlägget till prenumeranterna på Ämnet. Det går inte att ta tillbaka."). Redaktören sparar, väntar tills inlägget syns på sajten och trycker på knappen. Workflowen läser `payload.context.path`.
- **Variant 2: kryssruta (ett klick).** Ett nytt boolean-fält `epost` ("Skicka som e-post", aldrig förkryssat) i `.pages.yml` och i `nyheter-schema.ts`. CI-workflowens `deploy`-jobb får ett efterföljande jobb `skicka` (`needs: deploy`, bara på `master`) som tittar på commitens ändrade filer och skickar inlägg med `epost: true` och utan `skickat`. Nackdel: redaktören får ingen bekräftelsedialog, och en felaktigt ikryssad ruta skickar mejl till alla.

Gemensamt för båda (egen designförslag, inte belagt som färdig lösning):

1. Skriptet läser inlägget och kör **samma `inlaggSchema`** som bygget. Om inlägget bryter samtyckesregeln (`topic: familj` utan `consent`, eller `showsChildren` utan `consent`) avbryter skriptet innan något skickas.
2. **Skicka först när sidan är uppe**, annars leder länkarna i mejlet ingenstans. Variant 1 löser det för hand, variant 2 genom `needs: deploy`. GitHub Pages-deployen är ett separat steg i `ci.yml`.
3. Skriptet anropar Brevo: `POST /v3/emailCampaigns` (skapar kampanj som utkast; fält: `name`, `sender`, `subject`, `htmlContent` eller `templateId`, `recipients` med lista eller segment, `scheduledAt`) och därefter `POST /v3/emailCampaigns/{campaignId}/sendNow` [P: https://developers.brevo.com/reference/create-email-campaign.md, https://developers.brevo.com/reference/send-email-campaign-now.md]. Mottagarlistan väljs av inläggets `topic`: en Brevo-lista per Ämne, så prenumeranter som valt Ämnen får rätt inlägg.
4. **Idempotens:** kampanjens `name` sätts till inläggets slug. Skriptet slår upp kampanjer med samma namn (`GET /emailCampaigns`) innan det skapar en ny, och skriver sist `skickat: <datum>` i inläggets frontmatter med en commit. GitHub-dokumentationen säger att en commit gjord med `GITHUB_TOKEN` inte startar nya workflow-körningar [P: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow], så commit:en ger ingen ny deploy och ingen slinga. Det betyder också att `skickat` inte hamnar på den publicerade sajten förrän nästa bygge, vilket är ofarligt. Fältet bör tas med i schemat och `.pages.yml` som skrivskyddat (`tests/unit/pages-cms.test.ts` kräver att de stämmer överens).
5. Workflowen behöver `contents: write` bara för att skriva `skickat`. API-nyckeln läggs som repository secret.

### Vad redaktören gör, vad som kräver en utvecklare

- Redaktören: skriver inlägget som idag. Variant 1: trycker på "Skicka som e-post" och bekräftar. Variant 2: kryssar i rutan.
- Utvecklare: workflowfilen och skriptet, ett HTML-mejl i föreningens utseende (Brevo-mall med egna typsnitt via `@font-face`, belagt i grannfilen), Brevo-konto med listor per Ämne, avsändardomän (avsnitt 6), prenumerationsformuläret mot Brevos DOI-endpoint (finns beskrivet i grannfilen, anslutningen i `src/lib/prenumeration.ts` är ännu inte gjord).
- Driftansvar: litet. Brevo sköter leverans; föreningen håller API-nyckeln, mallen och skriptet.

### Kostnad

Brevo Free: 300 mejl/dag, Brevo-logga, 100 000 kontakter [P, grannfilen]. Med några hundra prenumeranter och ett Ämne per inlägg går ett inlägg till en delmängd, men över 300 mottagare per dag skickas bara 300 och resten måste köas om manuellt [P, grannfilen], så Free är bräckligt. Starter från 9 USD/mån (5 000 mejl/mån, upp till 500 kontakter, utan dagsgräns), ideell rabatt 20 % [P, grannfilen]. Att API-nyckel och kampanj-API fungerar på Free är **OVERIFIERAT**; Brevos sida om hastighetsgränser anger bara att den allmänna nivån gäller alla kontotyper inklusive Free [P: https://developers.brevo.com/docs/api-limits.md].

### GDPR och samtycke

- Plats, DPA, underbiträden, dubbel opt-in och avanmälan: se Brevo-avsnittet i `epostutskick-tjanster.md` (OVH Frankrike, Google Cloud Belgien, DPA i villkoren, DOI-endpoint, egen svensk DOI-mall, avanmälan i kampanjen). Brevos kampanjer är marknadsföringsutskick med avanmälningslänk; det är därför kampanj-API:t och inte transaktionsmejl ska användas.
- Medgivandet (prenumerantens ja) lagras hos Brevo när DOI bekräftats. Hur tidpunkt och ordalydelse exporteras är **OVERIFIERAT**; föreningen bör spara tidpunkt och formulärtext själv i funktionen som tar emot formuläret (samma slutsats som för Repejo i grannfilen).
- **Samtyckesregeln för barn (webbplatsens Samtycke) upprätthålls för mejlet** eftersom skriptet kör samma schema och skickar efter ett lyckat bygge. Mejlets bildlänkar ska peka på sajtens redan optimerade bilder. Ett inlägg med `topic: familj` kan inte skickas utan `consent: true`.

### Migrationsarbete

Pages CMS, `.pages.yml` och markdown-schemat behålls. Tillägg: ett fält (`epost` i variant 2, `skickat` i båda), en workflowfil, ett skript, ett Astro-mejlunderlag (HTML-mall eller render av brödtexten). Ingen datamigrering.

## 4. Kandidat B: RSS-till-mejl

Förutsättning i alla tre: Astro-sajten publicerar ett RSS/Atom-flöde. I dag finns inget (sökning i `src/` efter RSS gav inga träffar och `@astrojs/rss` finns inte i `package.json`). En utvecklare lägger till flöden; ett flöde per Ämne (fyra) eller ett flöde med bara de inlägg som ska mejlas (`utskick.xml`).

### Vad leverantörerna faktiskt stöder

| | Brevo | MailerLite | Buttondown |
| --- | --- | --- | --- |
| Funktion | RSS Campaign-integration; kollar flödet dagligen, veckovis eller månadsvis, klockslag valt av dig; skickar bara om nytt innehåll finns [P] | RSS-kampanj; dagligen/veckovis/månadsvis; flödet kollas 5 minuter före utskick; skickar bara om nytt inlägg [P] | RSS-to-email; kollar var 30:e minut; nytt mejl per nytt inlägg, eller veckovis/månadsvis [P] |
| Direkt eller fördröjt | Fördröjt till nästa schemalagda kontroll; publicera minst 1 timme före [P] | Fördröjt till nästa schemalagda tillfälle [P] | Nära direkt (30 min) [P] |
| Plan | Planbehov står inte i artikeln: **OVERIFIERAT** | Betald plan, Comfort eller Power [P] | Tillval "RSS-to-email support" +9 USD/mån [P] |
| Mottagare | Exakt en kontaktlista per integration; fler listor kräver fler integrationer [P] | En RSS-kampanj per flöde, till grupp(er) [P] (grupptilldelning ej läst i detalj) | Hela listan eller tagg (taggar: tillval +9 USD/mån) [P] |
| Utkast eller direkt | Automatiskt eller som utkast för manuell sändning [P] | Utkast ej belagt | Skicka direkt eller skapa utkast som redaktören redigerar [P] |
| Dubblettskydd | Skickas bara vid nytt innehåll; hur "nytt" avgörs står inte i artikeln [P] | GUID i flödet; ändras GUID efter ändring av ett gammalt inlägg skickas det igen, annars inte [P] | `guid`, annars länken [P]; "skip old items" hoppar över inlägg äldre än ett dygn när de upptäcks [P] |
| Maxgräns | 10 inlägg per kampanj; 100 000 uppgifter/mån [P] | OVERIFIERAT | OVERIFIERAT |
| Mejlets utseende | Standardmall eller egen mall, en mall för alla RSS-kampanjer [P] | Text kan inte formateras i RSS-kampanjer, bara i RSS-block [P] | Django-mallar med `item.title`, `item.content`, `item.url`, `item.enclosure` [P] |

Källor: https://help.brevo.com/hc/en-us/articles/360013130059 (uppdaterad 2026-11-02), https://www.mailerlite.com/help/how-to-create-an-rss-campaign, https://docs.buttondown.com/rss-to-email, https://buttondown.com/pricing.

### Hur ett Spara ger webb och mejl, och vad som är problemet

- Pages CMS committar, bygget deployar, flödet uppdateras, leverantören hämtar flödet vid nästa kontroll och skickar. Redaktören gör inget mer. Det är verkligen ett steg, men mejlet går ut först vid nästa kontrolltidpunkt.
- **Problem 1: alla publicerade inlägg i flödet mejlas.** Ska en redaktör kunna publicera en rättelse utan mejl behövs ett fält (`epost`) och ett separat flöde. Flödet blir då styrt av samma kryssruta som i kandidat A variant 2.
- **Problem 2: ingen kontroll innan utskick.** Är utskicket inställt på "automatiskt" finns inget stopp. Brevo och Buttondown kan skapa utkast i stället, men då loggar redaktören in i leverantörens verktyg och trycker Skicka. Det är ett andra steg och ett andra verktyg att lära sig.
- **Problem 3: per Ämne.** Brevo ger en lista per integration, så fyra Ämnen kräver fyra integrationer och fyra flöden. MailerLite har samma begränsning per RSS-kampanj ("only one RSS feed per newsletter" [P]).
- **Problem 4: ändrade inlägg.** Brevo, MailerLite och Buttondown skiljer på ändrade och nya inlägg via GUID/länk. Sajtens URL är titelns slug och ändras inte [P: `.pages.yml`], vilket är bra; en ändrad text i ett gammalt inlägg mejlas inte igen [P: MailerLite].

### GDPR och samtycke

- Brevo: se kandidat A. MailerLite: se grannfilen (DPA tillåter behandling "anywhere in the world", SCC mot MailerLite, Inc.). **Buttondown: USA-hosting enligt egen DPA, SCC** [P] och därför inte förstahandsval för en förening som vill ha EU-hosting.
- Samtyckesregeln: flödet byggs av Astro från samma samling som sajten, och bygget stoppas om samtycke saknas, så ett inlägg utan samtycke kommer aldrig in i flödet. Det är en starkare garanti än i kandidat A: leverantören kan bara skicka det som redan byggts.
- Nonprofit-rabatt: Brevo 20 %, MailerLite 30 % (grannfilen), Buttondown 50 % för 501(c)(3) "or your country's equivalent" [P: https://buttondown.com/pricing]. Om en svensk förening kvalificerar sig hos Buttondown är **OVERIFIERAT**.

### Slutsats för B

Rimlig reservväg om föreningen inte vill ha ett skript. Den kräver en liten Astro-ändring, kostar en betald plan hos MailerLite eller ett RSS-tillval hos Buttondown och ger sämre kontroll över när ett mejl går ut.

## 5. Kandidat C: headless CMS med egen utskicksfunktion eller webhook

Tabell över det som lästs, i ordning efter hur nära kravet det kommer.

### Ghost (ingår: gör publicering och utskick i ett steg)

- **Funktion [P]:** Ghost skickar nyhetsbrev till medlemmar (alla, fria, betalande eller ett segment). Standardsajten har ett nyhetsbrev, fler kan skapas så att medlemmar väljer vilket innehåll de får (https://docs.ghost.org/newsletters). Ghost(Pro) inkluderar utskick; självhostat kräver Mailgun, som är den enda stödda leverantören av bulkmejl (samma sida).
- **Ett steg:** Ghosts publiceringsmeny har valen "Publish and email", "Publish only" och "Email only" [S: forumet, https://forum.ghost.org/t/email-subscribers-without-publishing-a-post/15496]. Adminapi:t har `email_only` och parametern `newsletter` [S via sökresultat; https://docs.ghost.org/admin-api/posts/email-only-posts lästes inte]. Ett inlägg kan bara skickas till ett nyhetsbrev åt gången [S: forumet]. Fyra Ämnen skulle då bli fyra nyhetsbrev i Ghost och ett inlägg hör till exakt ett Ämne, vilket passar.
- **Astro som frontend:** Ghost kan användas som headless CMS (https://ghost.org/docs/) [P]. Webhooks finns (`post.published`, `post.published.edited`, `site.changed` m.fl.); formuläret kräver mål-URL och händelse, svar 2xx räknas som lyckat [P: https://docs.ghost.org/webhooks]. GitHub-API:t för att starta ett bygge (`repository_dispatch`) kräver ett token i `Authorization`-huvud; att Ghosts webhook kan skicka egna huvuden står inte i det som lästes, så en liten funktion mellan Ghost och GitHub behövs sannolikt (egen slutsats; **OVERIFIERAT** om Ghost kan sätta egna huvuden).
- **Mejlets länkar:** hur länkar i Ghost-mejlet pekar mot Astro-sajten och inte mot Ghosts egen publika sajt är **OVERIFIERAT**.
- **Kostnad [P: https://ghost.org/pricing/, hämtad 2026-11-03]:** Starter 18 USD/mån (faktureras årsvis), 1 000 medlemmar, 1 staff-användare, "email newsletter" ingår, egen domän, vitmärkt. Publisher 29 USD/mån, tre staff-användare. Månadspris utan årsbetalning står inte på sidan. Antalet staff-användare (1) är för litet för flera redaktörer på Starter; hur många redaktörer föreningen har är inte känt.
- **GDPR [P]:** Ghost har en DPA (https://ghost.org/dpa/) där Ghost Foundation är personuppgiftsbiträde och underbiträden listas i Annex A (listan läste jag inte). DPA 6.1: Ghost "stores and processes EU Data in data centres located within and outside the European Union", överföringar med standardavtalsklausuler. Integritetspolicyn: "Ghost Foundation's servers are located in Amsterdam, The Netherlands" men lägger till att tredjepartsleverantörer kan ligga i andra länder (https://ghost.org/privacy/). Därmed är "allt i EU" inte belagt.
- **Samtyckesregeln:** Ghost skickar mejlet i samma ögonblick inlägget publiceras. Astro-bygget som stoppar publicering av ett inlägg utan samtycke körs först efteråt; ett barninlägg skulle alltså kunna mejlas innan något stoppas. Kan förebyggas med en regel utanför Ghost (en tagg som kräver samtycke, procedur) men inte med den hårda spärren som finns idag.
- **Migrering:** Pages CMS och markdown-schemat (inklusive `consent`, `showsChildren`, `imageAlt`) ersätts av Ghost. De fyra befintliga inläggen flyttas, bilder flyttas, `nyheter-schema.ts` och testerna byggs om till Content API, och redaktörsinstruktionen skrivs om.
- **Slutsats:** möter kravet "ett steg" bäst, men på bekostnad av hård samtyckesregel, hela CMS-stacken och en månadskostnad. Rekommenderas inte så länge kandidat A går att bygga.

### Git-baserade CMS: Decap, Keystatic, TinaCMS

- **Decap:** git-baserat. GitHub-backend kräver en OAuth-server ("GitHub requires a server for authentication"; alternativ: Netlify eller betalda Decap Turbo) [P: https://decapcms.org/docs/github-backend/]. "Editorial workflow" (`publish_mode: editorial_workflow`) ger en utkast/granska/publicera-process via grenar [P: https://decapcms.org/docs/configuration-options/]. Någon utskicks- eller webhook-funktion hittades inte. Händelsekrokar i webbläsaren (rubriken "Registering to CMS Events") fanns men innehållet lästes inte: **OVERIFIERAT**. Ger ingen fördel jämfört med Pages CMS Actions.
- **Keystatic:** GitHub-läget kräver körning på servern i Astro: "Because Keystatic needs to run serverside code and use Node.js APIs, you will need to add an Astro adapter to deploy your project" [P: https://keystatic.com/docs/installation-astro]. Det bryter "statisk build på GitHub Pages". Faller bort.
- **TinaCMS:** innehållet ligger i markdown/JSON men CMS:et kräver Tinas moln (gratisplan med 2 användare) eller en egen backend-funktion med databas, auth och git-provider [P: https://tina.io/pricing, https://tina.io/docs/self-hosted/overview/]. Ingen utskicksfunktion hittades. Faller bort: mer drift än Pages CMS utan vinst.

### API-baserade och självhostade CMS: Sanity, Storyblok, Contentful, Payload, Directus, Strapi

Gemensamt: ingen av dem skickar nyhetsbrev. De kan skicka webhooks (Sanity har utgående webhooks och egna "Functions" [P: https://www.sanity.io/docs/webhooks]), men då behövs ändå en egen mejlmotor, en webhook till GitHub och en flytt av allt innehåll från markdown, med den hårda samtyckesregeln omskriven som valideringsregler i CMS:et. Därför faller de bort för en förening utan driftresurser:

- **Sanity:** gratisplan med upp till 20 användare [P: https://www.sanity.io/pricing]; hostad. Passar tekniskt (webhook → bygge) men löser inte utskicken.
- **Storyblok:** gratis Starter "för test och personliga projekt" [P: https://www.storyblok.com/pricing]; hostad. Samma slutsats.
- **Contentful:** prissidan gav ingen text. Inte omläst.
- **Payload, Directus, Strapi:** körs som server med databas. Payload är "the Next.js fullstack framework" som man driftar själv [P: https://payloadcms.com/docs/getting-started/what-is-payload]; Directus kan hostas själv eller i molnet och har en gratisnivå "Open Innovation Grant" för små organisationer [P: https://directus.io/pricing]; Strapi Cloud har rabatt till ideella [P: https://strapi.io/pricing-cloud]. Alla kräver drift av en server och databas, vilket föreningen inte har, och passar inte statisk build på GitHub Pages.

## 6. Google Workspace som utskicksmotor

Källor (alla hämtade 2026-11-03 [P]): SMTP-relä https://support.google.com/a/answer/2956491 (uppdaterad 2026-10-26), apparna https://support.google.com/a/answer/176600 (uppdaterad 2026-10-26), spampolicy https://support.google.com/a/answer/6389191, gränser https://support.google.com/a/answer/166852, avsändarkrav https://support.google.com/mail/answer/81126, övergången från lösenord till OAuth https://support.google.com/a/answer/14114704, app-lösenord https://support.google.com/accounts/answer/185833, delegering https://support.google.com/a/answer/162106, Gmail API https://developers.google.com/workspace/gmail/api/reference/quota, användningsvillkor https://workspace.google.com/terms/use_policy.html (ändrad 2026-10-12), GitHub-runnernas IP https://docs.github.com/en/actions/reference/runners/github-hosted-runners, Googles Actions-autentisering https://github.com/google-github-actions/auth.

### Är det tillåtet?

- **Användningsvillkoren** förbjuder att "generate, distribute, publish or facilitate unsolicited mass email, promotions, advertisements, or other solicitations ('spam')". De förbjuder alltså oombedd massutskick. Ett utskick till personer som aktivt prenumererat är inte "unsolicited", och inget i de lästa sidorna förbjuder opt-in-nyhetsbrev. (Egen slutsats: tillåtet i princip, men ingen sida beskriver Workspace som en tjänst för nyhetsbrev.)
- **SMTP-reläet** beskrivs som "intended for on-premise devices and applications that generate outbound email" och får inte användas för mejl som härrör från Gmail. Sidan nämner varken marknadsföring eller bulk. Gränser: 10 000 meddelanden och 10 000 unika mottagare per användare och dygn, högst 100 mottagare per SMTP-transaktion, 4,6 miljoner mottagare per organisation och dygn [P].
- **Spampolicyn för reläet:** Google övervakar utskick; vid "large amounts of spam" kommer en varning till superadministratörerna, och om ett Gmail-konto efter 24 timmar fortfarande skickar spam stängs kontot av (inloggning och utskick stoppas, inkommande mejl levereras) [P]. Policyn säger "If you use Gmail for bulk sending, review sending best practices", alltså räknar Google med att Gmail används för bulk, men det gör det till användarens ansvar. Stängs det konto av som också är föreningens vanliga brevlåda, drabbas allt.
- **Gmail (webb/API) per användare:** 2 000 meddelanden per dygn (1 500 för mail merge), 3 000 unika mottagare per dygn varav 2 000 externa, 10 000 mottagare totalt, 500 mottagare per meddelande via Gmail API [P: gränssidan]. Gränserna räknas över rullande 24 timmar och kan ändras utan förvarning [P]. För några hundra mottagare räcker kvoterna.
- **Avsändarkrav [P, grannfilen och Googles sida]:** för alla som skickar till Gmail: SPF eller DKIM, PTR, TLS, spamfrekvens under 0,3 %. Ett-klicks-avanmälan krävs över 5 000 mejl/dag, men Google skriver även under den gränsen: "Always give recipients an easy way to unsubscribe" och bekräfta varje prenumerant innan prenumeration.

### Hur autentiserar en GitHub Action mot Workspace?

| Väg | Läge |
| --- | --- |
| **SMTP-relä med IP-allowlist** | Fungerar inte. Reläet kan kräva att anrop kommer från angivna IP-adresser (upp till 65 536 i ett intervall) [P]. GitHub-hostade runners har många IP-intervall som uppdateras en gång i veckan, och GitHub avråder uttryckligen från att använda dem som allowlist; rekommendationen är större runners med statisk IP eller egna runners [P]. Att släppa in alla GitHub-runners vore att öppna reläet för alla som kan köra en workflow. |
| **SMTP-relä med "Require SMTP Authentication"** | Inställningen finns i reläets regler, men beskrivs som kontroll av "the user Google Workspace email address and password" [P]. Sedan 2025 stöder Workspace inte längre appar som loggar in med användarnamn och lösenord, "with the exception of app passwords" [P]. Om SMTP-relä accepterar app-lösenord är **OVERIFIERAT**. |
| **smtp.gmail.com med app-lösenord** | Beskrivs som option 2 för appar: port 465/587, "complete Google Workspace email address and an app password", gräns 2 000 meddelanden/dygn [P]. App-lösenord kräver 2-stegsverifiering och Googles sida varnar att alternativet kan saknas för "a work, school, or another organization account" [P]. Om det går för föreningens Workspace-domän är **OVERIFIERAT**; Google avråder också från app-lösenord ("aren't recommended and are unnecessary in most cases"). |
| **Gmail API med servicekonto och domänövergripande delegering** | Den vedertagna vägen. Servicekontot agerar som en Workspace-användare utan samtyckesskärm; kräver superadministratör som godkänner scope i Admin-konsolen, och scopet bör vara så litet som möjligt [P: https://support.google.com/a/answer/162106]. Från GitHub Actions kan `google-github-actions/auth` användas med Workload Identity Federation och `access_token_subject` för delegering (token högst 1 timme), så ingen långlivad nyckelfil behövs [P]. Gmail API: `messages.send` kostar 100 kvotenheter, gräns 6 000 enheter per minut och användare, alltså ca 60 mejl i minuten; kvoterna ändrades 2026-05-01 för nya molnprojekt och "daily billing threshold" införs; fakturadetaljer ska meddelas senare i 2026 [P]. Kräver en licensierad användare (avsändarkonto) i Workspace. |

Egen slutsats: Gmail API med servicekonto är tekniskt möjlig från GitHub Actions utan lösenord eller IP-regler, men kräver ett Google Cloud-projekt, delegering som superadministratör godkänner och ett skript som skickar ett meddelande per mottagare.

### Avanmälan och studsar om man skickar själv

Googles sidor tillhandahåller ingen prenumerationslista, ingen avanmälningslänk, ingen studshantering och ingen samtyckeslagring i Gmail eller SMTP-reläet; sidan om reläet beskriver bara gränser och spamövervakning [P]. Därför (egen slutsats):

- En avanmälningslänk måste peka på något som kan ändra listan. Sajten är statisk; det krävs en funktion (serverless) och en lagring av listan, och `List-Unsubscribe` (RFC 2369/8058 enligt Googles sida) måste byggas.
- Studsade meddelanden hamnar som vanliga mejl i avsändarkontots brevlåda; någon måste läsa dem och ta bort adresser. Hur Gmail/Workspace beter sig vid studsar från Gmail API är **OVERIFIERAT** i Googles dokumentation.
- Googles råd att "automatically unsubscribe recipients who have multiple bounced messages" [P] blir föreningens eget jobb.

### Slutsats om Workspace-reläet

Workspace-reläet och Gmail API är **dålig passform som utskicksmotor** här. Det är inte förbjudet, men det är byggt för enhetsmejl och person-till-person, ger inget av det som lagen och Googles egna riktlinjer kräver av ett prenumerationsutskick, och lägger driftansvar på föreningen. Två av autentiseringsvägarna är avstängda eller osäkra, och den fungerande kräver en Cloud-uppsättning.

### Vad Workspace ändå ska användas till

- **Avsändardomän och autentisering:** föreningens domän (om den finns; `ci.yml` anger att sajten ligger på `streetlight-nu.github.io` tills en egen domän är uppsatt, så att Streetlight har en domän och Workspace på den är **OVERIFIERAT**). Brevo och MailerLite kräver autentiserad egen domän [grannfilen]. Sätt SPF och DKIM per leverantör; Googles SPF-guide säger att SPF ska lista alla avsändare (`include:_spf.google.com` för Workspace) [P: https://support.google.com/a/answer/10685031]. Brevos guide beskriver en delegerad subdomän så att SPF hanteras där [grannfilen].
- **DMARC:** publicera en DMARC-post med rapportadress (`rua=`) till en Workspace-brevlåda eller grupp; Google rekommenderar DMARC och rapporter [P: https://support.google.com/mail/answer/81126].
- **Svar och kontakt:** `Reply-To` och sändaradress till en grupp eller delad brevlåda i Workspace (till exempel `info@`) som en person läser, så att svar på nyhetsmejl hamnar hos någon.
- **Övervakning:** Google Postmaster Tools för domänens spamfrekvens (under 0,3 %) [P: avsändarkraven].
- **Test:** redaktörens testmejl till egen adress.

## 7. Kandidat D: Pages CMS (behålls) + separat prenumerationsverktyg + egen Action via Gmail API

- Teknik som A, men sändningen går via Gmail API. Prenumerantlistan, Medgivandet, avanmälan och studsar måste bo någonstans: antingen i ett separat verktyg (Brevo/MailerLite som enbart adressbok) eller i ett egenbyggt lager.
- **Om adressboken ligger i Brevo:** skriptet hämtar kontakter via API och skickar via Gmail. Då omfattas inte utskicken av Brevos avanmälningslänk, studshantering eller rapporter, eftersom de bara följer med Brevos egna utskick [egen slutsats]. Man betalar för Brevo och bygger ändå avanmälan själv.
- **Om det är egenbyggt:** en funktion (serverless), en lagring, tokenbaserade avanmälningslänkar, studsparsning, DOI-bekräftelser, samtyckeslogg och GDPR-radering. Det är ett litet system som föreningen skulle driva. Grannfilen `epostutskick-sjalvhostat.md` visar att listmonk/Keila redan gör detta bättre än något hemmabygge.
- **Slutsats:** D tillför ingenting jämfört med A utom att Workspace-licensen utnyttjas. Den är dyrare i arbete och riskablare. Rekommenderas inte.

## 8. Rekommendation, villkor och val

**Rekommenderat: kandidat A, variant 1 först.** Pages CMS behålls; ett skript i en GitHub Action skapar och skickar en Brevo-kampanj till Ämnets lista; Workspace används för domän och svar.

Villkor och steg:

1. **Testa att Pages CMS Actions fungerar i den hostade appen** (en knapp som bara skriver ut payload). Om det inte fungerar: variant 2 (kryssruta + `needs: deploy`) fungerar utan Actions-funktionen och kräver bara ändringar i repot.
2. **Börja med variant 1 (knapp med bekräftelse)** eftersom ett skickat mejl inte kan tas tillbaka. Gå till variant 2 först när teamet litar på flödet, och då med testsändning till en egen adress.
3. **Brevo-konto på Starter eller med ideell rabatt** om listan väntas överstiga 300 mottagare per dag; ansök om 20 % [grannfilen]. Gör dubbel opt-in med svensk mall, en lista per Ämne, DPA i villkoren, och spara själv tidpunkt och text för Medgivandet.
4. **Skriptet kör `inlaggSchema`** och vägrar skicka vid bruten samtyckesregel; kontrollera dessutom att `example: true`-inlägg aldrig skickas.
5. **Egen domän med SPF/DKIM/DMARC** innan första utskicket.
6. **Behåll kandidat B (RSS) som reserv** om ingen vill underhålla skriptet; i så fall MailerLite Comfort eller Brevo (om RSS ingår i planen) med ett separat `utskick.xml`.
7. **Ghost bara om styrelsen hellre byter hela verktygskedjan** än behåller markdown och spärren i bygget.

Anslutning till befintlig kod: `src/lib/prenumeration.ts` är fortfarande en stub. Att samla in Medgivandet (formuläret) är en annan väg in än redaktörens utskick och hör till grannfilens anteckning om `skickaPrenumeration`; Ämnen mappas där till Brevo-listor, vilket kandidat A förutsätter.

## 9. OVERIFIERAT eller att fråga innan beslut

Fråga föreningen eller leverantören:

1. **Pages CMS (hostad app):** är Actions aktiverade och har GitHub App-installationen rätt behörighet (Actions: write)? Testa med en provknapp.
2. **Brevo:** fungerar API-nyckel och kampanj-API på Free? Ingår RSS-integrationen i Free/Starter? Kan DOI-tidpunkt och ordalydelse exporteras? Skickar Brevo ett-klicks-`List-Unsubscribe` (OVERIFIERAT i grannfilen)?
3. **Domän och Workspace:** har föreningen egen domän och Workspace på den? Vem är superadministratör? Vilket Workspace-avtal (och därmed vilken behandling av data i Google) gäller? Avtalstexten lästes inte.
4. **Google:** fungerar SMTP-relä eller `smtp.gmail.com` med app-lösenord för arbetskonton i föreningens domän? (Behövs bara om D övervägs.) Hur studsar från Gmail API visar sig? Kommer Gmail API-faktureringen från 2026 att gälla små projekt?
5. **Brevo Free och 300 mejl/dag:** hur många mottagare väntas första året (grannfilen utgår från högst några hundra)?
6. **Juridik:** om marknadsföringslagen gäller föreningens Nyheter med e-post är fortfarande obesvarat (grannfilen, fråga 11). Föreningens egen regel (Medgivande, aldrig förkryssat) gäller oavsett.
7. **Ghost (om det ändå övervägs):** Annex A (underbiträden), om Starter ger flera nyhetsbrev och flera redaktörer, om mejlets länkar kan peka på Astro-sajten, om det finns ideell rabatt, samt månadspris utan årsbetalning.
8. **Buttondown:** baspris vid föreningens storlek (reglaget gick inte att läsa), om en svensk förening får 50 % rabatt, underbiträdeslistan.
9. **Contentful, Decap-händelsekrokar, Sanity/Storyblok datalagring:** inte omlästa eller inte lästa.
10. **Hur många redaktörer?** Påverkar valet av Ghost-plan men inte kandidat A.

## Källförteckning (hämtade 2026-11-03)

- Pages CMS: https://pagescms.org/docs/configuration/actions/, https://github.com/hunvreus/pagescms (källfiler `lib/actions.ts`, `lib/token.ts`, `app/api/[owner]/[repo]/[branch]/actions/route.ts`), https://api.github.com/repos/hunvreus/pagescms/releases
- GitHub: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow, https://docs.github.com/en/actions/reference/runners/github-hosted-runners, https://github.com/google-github-actions/auth
- Google: https://support.google.com/a/answer/2956491, https://support.google.com/a/answer/176600, https://support.google.com/a/answer/6389191, https://support.google.com/a/answer/166852, https://support.google.com/mail/answer/81126, https://support.google.com/a/answer/14114704, https://support.google.com/accounts/answer/185833, https://support.google.com/a/answer/162106, https://support.google.com/a/answer/10685031, https://developers.google.com/workspace/gmail/api/reference/quota, https://workspace.google.com/terms/use_policy.html
- Brevo: https://help.brevo.com/hc/en-us/articles/360013130059, https://developers.brevo.com/reference/create-email-campaign.md, https://developers.brevo.com/reference/send-email-campaign-now.md, https://developers.brevo.com/docs/api-limits.md
- MailerLite: https://www.mailerlite.com/help/how-to-create-an-rss-campaign, https://developers.mailerlite.com/docs/campaigns.html
- Buttondown: https://docs.buttondown.com/rss-to-email, https://buttondown.com/pricing, https://buttondown.com/legal/data-processing-agreement
- Ghost: https://ghost.org/pricing/, https://docs.ghost.org/newsletters, https://docs.ghost.org/webhooks, https://ghost.org/docs/, https://ghost.org/dpa/, https://ghost.org/privacy/, https://ghost.org/help/ghost-gdpr-compliance/; [S] forumet https://forum.ghost.org/t/email-subscribers-without-publishing-a-post/15496
- Decap, Keystatic, Tina: https://decapcms.org/docs/github-backend/, https://decapcms.org/docs/configuration-options/, https://keystatic.com/docs/installation-astro, https://keystatic.com/docs/github-mode, https://tina.io/pricing, https://tina.io/docs/self-hosted/overview/
- Övriga CMS (prissidor): https://www.sanity.io/pricing, https://www.sanity.io/docs/webhooks, https://www.storyblok.com/pricing, https://payloadcms.com/docs/getting-started/what-is-payload, https://directus.io/pricing, https://strapi.io/pricing-cloud
