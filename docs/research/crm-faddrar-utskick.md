# CRM för faddrar och utskick: kandidater och rekommendation för Streetlight

Hämtat och sammanställt 2026-11-03. Bygger vidare på `docs/research/epostutskick-tjanster.md` (SaaS-jämförelse, Repejo-webhook, GDPR-avsnitt), `docs/research/epostutskick-sjalvhostat.md` (listmonk, Keila, Mautic m.fl.) och `docs/research/epostutskick-cms.md` (Pages CMS + Action + Brevo). Det som redan står där upprepas inte; hänvisningar görs till filerna. Inget i repot är ändrat eller kopplat.

Frågan: vilket CRM kan Streetlight använda för att hantera faddrar (fadderskap och månadsgåvor) och utskick?

## Läs detta först: märkning och hur källorna hämtades

- **[P]** = sidan eller källfilen hämtades 2026-11-03 och påståendet är läst i leverantörens egen sida, dokumentation, prissida eller källkodsrepo.
- **[S]** = sekundär källa (söksammanfattning från `WebSearch`, forum, jämförelseblogg). Används bara där det anges och ska kontrolleras mot primärkälla.
- **OVERIFIERAT** = gick inte att belägga. Det betyder inte att funktionen saknas.
- **Egen slutsats** = min läsning av flera belagda fakta. Inte ett uttalande från leverantören och inte juridisk rådgivning.

Hämtning och begränsningar:

- Sidor hämtades med `curl` (text utdragen ur HTML) och GitHub-metadata via `api.github.com`. `WebSearch` användes bara för att hitta primär-URL, men tre sökningar (Zoho, Airtable, Capsule) gav sammanfattningar; där uppgiften sedan lästes på leverantörens egen sida står [P], annars [S].
- Sidor som gav 403/404 eller blockerades (Wint, Anpassa, Pipedrive, Givebutters hjälpartikel om länder, Donorbox hjälpsidor, Airtable data residency, flera FAQ-svar som laddas med JavaScript hos Baserow) är inte lästa och märkta OVERIFIERAT.
- Priser anges i den valuta sidan visar (USD/EUR/GBP), exklusive moms om inget annat sägs. Ingen omräkning till SEK. "Räknat" betyder min egen multiplikation.
- Hänvisning "grannfilen" = `epostutskick-tjanster.md` om inget annat sägs.

## Vad en fadder är här, och vad ett CRM faktiskt behöver klara

Från `GLOSSARY.md`, `PRODUCT.md` och `README.md` [P, lokala filer]:

- Streetlight är en ideell förening i Sverige och Etiopien som stöttar 20 fadderbarns skolgång. Det är 20 barn, inte tusentals.
- **Fadder** = person som ger regelbundet och stöttar alla 20 barnen tillsammans (normalfallet). **Fadder för ett barn** = variant där faddern följer ett barn. **Intresseanmälan** = första steget. **Prenumeration** = Nyheter med e-post, med fyra **Ämnen** och ett separat, aldrig förkryssat **Medgivande**.
- Intresseanmälan i `src/lib/intresseanmalan.ts` är inte kopplad till någon tjänst (`inte-kopplat`).
- Samtycke för foton och berättelser om barn är en annan sak (familjens samtycke) och hör inte hemma i ett fadder-CRM utan i redaktörernas rutiner.

Datamängden är liten: troligen några tiotal till några hundra faddrar, 20 barn, fyra Ämnen. Dataform som behöver kunna hållas: person, intresse (alla / ett barn / veta mer), fadderstatus, månadsgåva (belopp, betalsätt, status), vilket barn (om "fadder för ett barn"), Prenumeration per Ämne med tidpunkt och ordalydelse för Medgivande.

**Viktigaste fyndet (Egen slutsats):** Repejo, som föreningen redan har pekat ut som kassa, är i sig ett givarregister med återkommande gåvor. Frågan är därför inte "vilket CRM ersätter ett kalkylblad" utan "vad behöver läggas till ovanpå Repejo, och är det värt en egen systemdel".

## Sammanfattning och rekommendation

1. **Köp inget fullständigt CRM nu (Egen slutsats).** Repejo [P] samlar betalningar, månadsgåvor, autogiro, Swish för återkommande betalningar, transaktionshistorik, paus/avslut och skickade mejl på givarens profil. Brevo (grannfilen) tar hand om Prenumeration, Ämnen och avanmälan. Det som saknas är bara koppling fadder↔barn och en samtyckeslogg; båda är små att lösa. Ett CRM tillför då mest en tredje plats där personuppgifter ligger och ett tredje personuppgiftsbiträde.
2. **Fadder↔barn (20 barn) kan modelleras utan CRM:** som ett fält på Brevo-kontakten (till exempel `FADDER_FOR` med barnets förnamn eller kod) eller i Repejos fält `note`, `external_id` och `metadata` på givaren [P, `app.repejo.se/docs/api-payer`]. Om och hur kassan kan fånga barnval i checkouten är OVERIFIERAT.
3. **Om ett riktigt CRM ändå behövs, i denna ordning:**
   - **Samfora.io** (svenskt, "all data stannar i EU", Swish, Autogiro och Stripe, integration med Repejo) [P] är det enda testade alternativet byggt för svenska betalsätt. Men det lanseras 2026 "med ett begränsat antal organisationer", pris och villkor är inte publika och bolaget är nytt [P]. Fråga, lita inte på ännu.
   - **EspoCRM Cloud** (tyska servrar, 12,90 EUR per användare och månad, minst 3 användare, räknat 38,70 EUR/mån) [P]: EU-hosting, webhooks och massmejl finns, men det är ett säljCRM utan inbyggd donations- eller faddermodell; vilar helt på egen konfiguration.
   - **CiviCRM Spark** (hostad CiviCRM, 13/26/45 EUR per månad, obegränsat antal användare) [P] om föreningen vill ha ett verkligt ideellt CRM med återkommande bidrag, relationer och grupper med prenumerationshistorik. Datacenterplats och DPA är OVERIFIERADE, ingen Swish/autogiro är belagd, och Spark är uttryckligen inte öppet för komplexa anpassningar [P].
4. **Faller bort:** HubSpot (rabatten gäller bara Nordamerika, Australien och Nya Zeeland [P]); amerikanska givarplattformar som Bloomerang, Donorbox och Givebutter (ingen belagd EU-hosting, inget belagt Swish/autogiro, Donorbox/Givebutter/Raisely tar avgifter på gåvor eller tips); självhostade CRM utan driftresurser (se driftavsnittet).
5. **Villkor och osäkerheter** står i avsnitten "Rekommendation och villkor" och "Lista över OVERIFIERAT".

## Jämförelsetabell

Förklaring: **Fadder↔barn** = hur ett fadderskap kopplat till ett barn kan modelleras. **Månadsgåva** = om återkommande gåvor finns inbyggt. **Utskick** = segmentering, avanmälan, dubbel opt-in. **EU/DPA** = belagd hosting och biträdesavtal. **Swish/AG** = Swish respektive autogiro. Alla fakta i tabellen har [P]-belägg i avsnitten nedan om inget annat anges. "?" = OVERIFIERAT.

| Kandidat | Fadder↔barn | Månadsgåva | Utskick | EU/DPA | Swish/AG | Pris för liten förening | API/webhook | Drift |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Repejo** (redan känd; kassa + givarregister) | Fälten `note`, `external_id`, `metadata` på givaren; kassaval ? | Ja, med historik och paus | Egna tack-mejl; ingen serie | Sverige/Finland/NL; PDF med biträdesavtal gav 404 (grannfilen) | Ja / Ja | 595 kr/mån + 3 kr per gåva; API-tillval 959 kr/mån (planbehov för webhook ?) | Webhooks med HMAC (grannfilen) | Ingen |
| **Brevo** (grannfilen) | Kontaktattribut; custom objects bara Pro/Enterprise | Nej | Listor, segment, DOI via API | OVH FR + Google BE, DPA i villkoren | Nej | Free 0; Starter från 9 USD; 20 % ideell | API | Ingen |
| **Samfora.io** | Datamodell "för ideell sektor" ? | Ja (via betalningsmodulen) | E-post, SMS, marknadsautomation | "All data stannar i EU", lagras i Sverige; DPA ? | Ja / Ja | Ej publikt | ? (Repejo-integration finns) | Ingen (hostat); lansering 2026, begränsat antal |
| **CiviCRM Spark** | Egna relationstyper; barn som kontakter eller fält | Ja, "ask for recurring support" i bidragssidor | CiviMail, grupper, prenumerationshistorik | Ej belagt; DPA-länk finns, ej läst | Stripe, SEPA; Swish/AG ? | 13/26/45 EUR/mån | APIv4 REST finns i CiviCRM; i Spark ? | Ingen (hostat) |
| **CiviCRM självhostat** | Som ovan, full anpassning | Ja | Som ovan | Eget val av plats | Eget val; Swish/AG ? | 0 + server | APIv4 REST | Hög (PHP 8.3+, MySQL 8+, cron) |
| **EspoCRM Cloud** | Egen entitet via Entity Manager | Eget bygge | Massmejl, målgrupper, egen avanmälningssida | Tyska servrar | Nej | 12,90 EUR/användare, minst 3 | REST + webhooks med signatur | Ingen |
| **Twenty** | Egen datamodell | Eget bygge | Begränsat belagt | Cloud-plats ? | Nej | 9 USD/användare (Pro); self-host gratis | REST, GraphQL, webhooks | Cloud: ingen; self-host: hög |
| **SuiteCRM** | Eget bygge | Eget bygge | Kampanjer (ej närmare läst) | Eget val | Nej | Hostat från 50 GBP/mån | ? | Hög |
| **Airtable** | Länkade tabeller | Eget bygge | Inget eget | Plats ? | Nej | Free; ideell 12 USD/redigerare/mån | API, webhooks | Ingen |
| **Baserow** | Länkade tabeller | Eget bygge | Inget eget | Plats ? | Nej | Free (3 000 rader); betald från ca 10 USD | Radwebhooks | Cloud: ingen |
| **NocoDB** | Länkade tabeller | Eget bygge | Inget eget | ? | Nej | Free upp till 3 användare; ingen ideell rabatt | ? | Self-host: hög |
| **HubSpot** | Anpassade objekt | Via Stripe/Commerce Hub | Ja | Ej läst | Nej | 40 % rabatt, men ej i Sverige | Ja | Ingen |
| **Zoho CRM** | Anpassade moduler | Eget bygge | Via Zoho Campaigns | Ej läst | Nej | Free för 3 användare; ideell kredit som täcker upp till 50 % | Ja | Ingen |
| **Capsule** | Anpassade fält | Nej | Via Mailchimp m.fl. | ? | Nej | 30 % ideell rabatt; gratisplan 250 kontakter | Ja | Ingen |
| **Salesforce Power of Us** | Egna objekt | Nonprofit Cloud har gåvomodell (ej närmare läst) | Via Marketing Cloud (ej läst) | EU-region ? | Nej | 10 gratislicenser; behörighet i Sverige ? | Ja | Hög konfiguration |
| **Bloomerang / Donorbox / Givebutter / Raisely** | Nej / begränsat | Ja | Ja | Ej belagt | Nej (ej belagt) | Se avsnitt 1 | Varierar | Ingen |
| **Beacon** (UK) | Egna fält | Ja | Ja | ? | Nej | Från 37 GBP/mån | Ja | Ingen |
| **listmonk** (grannfilen) | Attribut (JSON) | Nej | Listor, segment, avanmälan | Eget val | Nej | 0 + server | REST | Hög |

Bedömning, i ordning: se "Rekommendation och villkor".

## 1. Ideella och insamlings-CRM

### Repejo som ersättning för ett CRM (det som redan är på plats)

Källor, alla [P], hämtade 2026-11-03: https://repejo.se/funktioner/givarrelationer/, https://repejo.se/produkt/integrationer/, https://repejo.se/faq/, https://repejo.se/priser/, https://app.repejo.se/docs/api-payer, https://app.repejo.se/docs/api-webhooks.

- **Vad Repejo har:** för varje givare syns aktiva och avslutade givanden, månadsgivande, engångsgåvor och medlemsavgifter, betalmetod och betalstatus, transaktionshistorik och ändringar i belopp eller intervall. Ni kan uppdatera belopp och intervall, pausa eller avsluta givande och registrera autogiro manuellt från telefon eller blankett. All kommunikation som skickas via Repejo (mejl, sms) sparas på givarens profil.
- **Betalsätt:** Swish för engångs- och återkommande betalningar (kräver eget Swish-konto aktiverat för återkommande betalningar och att både förening och givare har banker som stödjer det), autogiro via Bankgirot som servicebyrå, kort via Stripe, identifiering via BankID. Om givarens bank saknar stöd för återkommande Swish erbjuds autogiro.
- **Datamodell för integration:** Payer har bland annat `note`, `external_id`, `reference_value`, `metadata` (nyckel–värde), `tracking`, `contact_consent`, `anonymized_at`. Subscription-, transaction- och receivable-händelser bäddar in payer.
- **Integrationer:** Samfora (givardata synkas till CRM), Callmaker, Hitrate, Meta, samt "API och webhooks ... skicka givardata, betalstatus och händelser till andra system".
- **Vad som saknas eller är oklart:** koppling till ett barn finns inte som inbyggd modell. Om `metadata` kan fyllas från kassan (till exempel via URL-parameter eller ett fält), och om webhooks ingår i grundpriset eller kräver API-tillvalet (959 kr/mån), är OVERIFIERAT (grannfilen). Segmentering efter Ämne finns inte i Repejo (boolean `contact_consent` skiljer inte på ämnen).

### Samfora.io (svenskt, nytt)

Källor [P], hämtade 2026-11-03: https://samfora.io/, https://samfora.org/, https://repejo.se/produkt/integrationer/.

- Beskrivs som "Donor Data Platform" för svensk ideell sektor: CRM, e-post, SMS, betalningar, marknadsautomation, peer-to-peer och analys i ett system. Betalningar via Stripe, Swish och Autogiro. Samtycken uppdateras i givarprofilen ("Adressbyte? Samtycken? Uppdateras automatiskt").
- Säkerhet: "All data stannar i EU", givaruppgifter lagras krypterat i Sverige, hosting och lagring inom EU/EES, används aldrig för att träna AI, export med ett klick.
- Mognad: "Vi lanserar 2026 med ett begränsat antal organisationer." Samfora AB, Norrsken House, Stockholm. Kundnamn på sidan: CureFAchildren, ALS-Fonden (styrelseledamot citerad), UN Women Sverige och Operation Aid (utvecklat tillsammans med). Samfora.org är en separat gratis donationsplattform som visar över 70 organisationer.
- Repejo har en dokumenterad integration mot Samfora (givardata och arbetsflöden synkas).
- **Pris, DPA, fadder↔barn-modell, API, avtalsvillkor och svar på "är ni mogna nog" och "kan vi drifta själva":** FAQ-svaren laddades inte i den hämtade texten. OVERIFIERAT. Ett bolag grundat 2025 enligt [S] (söksammanfattning) är en leverantörsrisk för en förening utan reservplan.
- Egen slutsats: det mest relevanta alternativet för just svenska betalsätt, men går inte att rekommendera förrän pris och villkor är kända. Ställ frågorna i slutlistan.

### CiviCRM Spark (hostad CiviCRM)

Källor [P], hämtade 2026-11-03: https://civicrm.com/spark/, https://docs.civicrm.org/user/en/latest/organising-your-data/relationships/, https://docs.civicrm.org/user/en/latest/organising-your-data/groups-and-tags/, https://docs.civicrm.org/user/en/latest/contributions/payment-processors/, https://docs.civicrm.org/dev/en/latest/api/v4/rest/, https://api.github.com/repos/civicrm/civicrm-core.

- **Vad det är:** hostad, begränsad CiviCRM för små organisationer. Obegränsat antal användare, 5 000 kontakter (Starter) respektive 10 000 (Pro). Priser vid val av EUR: Starter 13, Essentials 26 och Pro 45 EUR per månad. Essentials ger Mosaico (HTML-mejl) och upp till 10 000 mejl; Pro ger extra tillägg, upp till 50 000 mejl och egen domän. Avgiftsfri avbeställning, 30 dagars pengarna-tillbaka, "No price increases". Inga ideella rabatter; "sponsorer" kan ge rabatt eller gratis.
- **Mejl:** sidan listar CiviMail både i Starter och "för pro-prenumeranter"; vilken plan som faktiskt ger bulkmejl är därför OVERIFIERAT.
- **Bidrag:** bidragssidor kan "ask for recurring support". Medföljande tillägg inkluderar Stripe, SEPA, GDPR, Tax Receipts, CiviRules, API Key (vilket plan som har vad gick inte att läsa ur tabellen).
- **Modell:** egna relationstyper och egna fält på relationer (dokumentationen listar "Creating new relationship types" och "Creating custom fields on relationships"); exempeltyp "Sibling". En fadder kan alltså kopplas till ett barn som kontakt, eller barnet kan vara ett fält. Några färdiga fadder- eller sponsormodeller hittades inte.
- **Grupper och samtycke:** grupper stöder prenumerera/avanmäla "and a history of these actions is kept in the system", med gruppstatus added/removed/pending (pending kan användas för bekräftelse). En färdig dubbel opt-in-flöde är inte läst; OVERIFIERAT. Ordalydelse för medgivandet sparas inte av sig själv; kräver aktivitet eller fält.
- **Betalsätt:** ca 15 betalprocessorer ingår; Swish och svenskt autogiro är OVERIFIERADE (sidan för Swish-tillägg gav 404).
- **API:** APIv4 REST med autentiseringsparameter `_authx`. Om Spark ger åtkomst till API och om en GitHub Action kan nå det är OVERIFIERAT.
- **EU/DPA:** Spark-sidan har länkar för "General Data Protection Regulation" och "Data Processing Agreement" men de är inte lästa. CiviCRM LLC är ett kaliforniskt bolag med team "located around the world". Plats för Sparks servrar är OVERIFIERAD.
- **Begränsningar:** "Not open to complex customizations", inget stöd annat än community eller partners.
- **Självhostat CiviCRM:** AGPL-3.0, aktivt repo (senaste push 2026-11-03) [P, GitHub API]. Kräver PHP 8.3–8.5 och MySQL 8+/MariaDB 11.4+ [P]. Samma driftkrav som Mautic i grannfilen eller tyngre. Hostade partners finns, men ingen svensk eller EU-partner är undersökt. OVERIFIERAT.

### Bloomerang, Donorbox, Givebutter, Raisely, Beacon (amerikanska, australiska, brittiska)

Källor [P], hämtade 2026-11-03: https://bloomerang.com/pricing, https://bloomerang.com/gdpr, https://donorbox.org/pricing, https://givebutter.com/pricing, https://www.raisely.com/pricing, https://www.beaconcrm.org/pricing.

- **Bloomerang:** prissidan visar 40, 119 och 125 USD per månad vid årsbetalning; vilken siffra som hör till vilken plan lästes inte ut (söksammanfattning anger 119 USD för upp till 1 000 poster, [S]). GDPR-sidan beskriver att en opt-in-ruta visas för EU-adresser och att samtycke spåras via "Communication Restrictions" och "Email Interests". Sidans text daterar sig till 2018. Hosting-plats, DPA, Swish och autogiro: OVERIFIERAT.
- **Donorbox:** gratisnivå ("Standard Plan: Free"), Pro 150 USD/mån; avgifter mellan 2,95 % och 3,95 % på gratisnivån, 1,75–2 % på Pro, plus återkommande gåvor och CRM. Stöd för SEK, Swish och autogiro: OVERIFIERAT (hjälpsidan gav 403).
- **Givebutter:** gratis CRM och ingen plattformsavgift med frivilliga "tips" från givare; stänger ni av tips tas 3 % plattformsavgift. Länder som stöds (Sverige?): OVERIFIERAT (hjälpartikeln gav 404).
- **Raisely:** frivilliga tips eller 4 % fast avgift, 2 % avgift vid migrering av återkommande givare; priserna utgår från australiska Stripe-satser. Sverige och EU-hosting: OVERIFIERAT.
- **Beacon (UK):** Starter 37 GBP/mån (33,50 vid årsbetalning, tolkning av sidan). Plats och DPA: OVERIFIERAT.
- Egen slutsats: ingen av dessa är belagd för EU-hosting eller för svenska betalsätt, och avgiftsmodellerna bygger på amerikanska givarvanor ("tips"). Inget skäl att gå vidare utan att leverantören skriftligt svarar på Swish, autogiro, EU-region och DPA.

### Svenska namn i uppdraget, vad som gick att verifiera

- **Repejo:** verifierad, se ovan.
- **Samfora:** verifierad, se ovan.
- **CGI medlemssystem:** bygger på Microsoft Dynamics 365, riktat mot bland annat givarorganisationer [P, https://www.cgi.com/se/sv/tjanster/affarssystem/dynamics-365/crm/medlemssystem]. Enterprise-produkt; inget pris. Egen slutsats: överdimensionerat för 20 barn.
- **Spiir:** inte ett CRM för föreningar. `spiir.com` meddelar att tjänsten (personlig ekonomi) läggs ned 2026-06-08 [P]. Stryks.
- **Idealistas:** `idealistas.se` är ett bokförlag för civilsamhället [P], inte ett CRM. Stryks.
- **Wint, Anpassa, Upright:** `wint.se` och `anpassa.se` blockerade automatisk hämtning (Cloudflare respektive brandvägg); `upright.se` pekar på en hosting-sida. Inget är lästa. OVERIFIERAT att de passar eller ens finns som fadder-CRM.
- **Fortnox-integration, Sverok-verktyg:** ingen primärkälla hittades eller lästes. OVERIFIERAT. Sverok är en spel-/kulturförening och inget givar-CRM; ingen anledning att anta att verktygen passar.
- En allmän sökning på svenska medlemsregister (https://clickup.com/sv/blog/74330/medlemshanteringsprogramvara/ och liknande) gav [S] i form av jämförelsebloggar och ändrade ingenting.

## 2. Allmänna CRM med ideell rabatt

- **HubSpot:** 40 % rabatt för ideella, men villkoret är "located and registered as a nonprofit in North America, Australia, or New Zealand", ny kund, årsavtal, och bara Professional/Enterprise-nivå (Starter undantas) [P, https://www.hubspot.com/nonprofits]. Sverige faller utanför. Stryks.
- **Zoho:** Zoho for Nonprofits ger 5 000 USD i kreditpoäng som täcker "up to 50 %" av prenumerationskostnaden, verifieras via TechSoup eller registreringsbevis; engångs [P, https://www.zoho.com/nonprofits/]. Zoho CRM har en gratisplan för 3 användare ("Free forever for 3 users") [P, https://www.zoho.com/crm/zohocrm-pricing.html]. Datacenter i EU, DPA, svenska ideella föreningar som godkänd målgrupp: OVERIFIERAT (villkorssidan är inte läst i detalj).
- **Pipedrive:** prissidan svarade 403 och rabattsidan 404. OVERIFIERAT.
- **Capsule:** "30% discount for non-profits" [P, https://capsulecrm.com/industries/crm-for-nonprofits/]; gratisplan med 250 kontakter [P, https://capsulecrm.com/signup/, detaljen max 2 användare och 5 egna fält är [S]]. Integrationer med Mailchimp, Xero, QuickBooks och Zapier [P]. Hosting-plats, DPA: OVERIFIERAT.
- **Brevo CRM:** del av samma konto som e-posttjänsten (grannfilen: 20 % rabatt, EU-hosting, DPA). Egna objekt ("custom objects") finns men bara för Pro- eller Enterprise-konton [P, https://developers.brevo.com/docs/custom-objects-management.md]. På gratisplanen får ni kontakter med egna attribut; för 20 barn räcker ett attribut. Egen slutsats: det billigaste CRM-lika sättet, eftersom det redan är utskickstjänsten.
- **Salesforce Power of Us:** "Each eligible nonprofit receives 10 Salesforce Nonprofit Cloud Core licenses, at no cost"; premiumsupport aktiveras först vid första betalda köp; fler licenser till rabatt [P, https://www.salesforce.com/nonprofit/pricing/]. Behörighet beror på "eligibility guidelines" (egen PDF) som inte lästs; om svenska ideella föreningar kvalificerar, och vilken datacenterregion som gäller, är OVERIFIERAT. Egen slutsats: gratis licens men stor konfigurations- och förvaltningsbörda, och sidan nämner ingen Swish/autogiro.
- **Airtable:** ideell plan 50 % rabatt på Team, 12 USD per redigerare och månad; "international customers are eligible"; legala handlingar krävs [P, https://support.airtable.com/articles/4920135568-applying-for-non-profit-education-and-student-airtable-plans]. Gratisplanen är gratis för alla användare [P, https://airtable.com/pricing]. Datalagring i EU: OVERIFIERAT (data residency-sidan gav 404). Inget eget utskick.
- **Baserow:** gratisplan (3 000 rader per workspace), betalplaner från ca 10–12 USD per användare [P, tolkning av https://baserow.io/pricing]; radwebhooks för skapad/uppdaterad/borttagen rad [P, https://baserow.io/user-docs/webhooks]; kärnan är MIT, men mappar `premium/` och `enterprise/` har egen licens [P, https://raw.githubusercontent.com/baserow/baserow/develop/LICENSE]. Serverplats för Baserow Cloud: OVERIFIERAT (svaret i FAQ laddades inte). Ideell rabatt: OVERIFIERAT.
- **NocoDB:** licensen är "Sustainable Use License", alltså inte öppen källkod enligt OSI [P, https://raw.githubusercontent.com/nocodb/nocodb/develop/LICENSE.md]. Ingen ideell rabatt: "we do not offer separate discounts for non-profits" [P, https://nocodb.com/pricing]; gratis upp till 3 användare i molnet. EU-hosting: OVERIFIERAT.
- **Egen slutsats om lättviktsalternativ:** Airtable/Baserow/NocoDB ger bra tabeller och länkade poster för "fadder → barn", men ingen avanmälan, ingen samtyckeslogg och inget utskick; allt det måste ligga i Brevo i alla fall. De tillför då en tredje plats för personuppgifter utan att lösa det som är svårt.

## 3. Självhostat

Alla källor [P], hämtade 2026-11-03. Driftbördan är densamma som grannfilen (`epostutskick-sjalvhostat.md`, kärnfråga 2 och 3): patchning, backup, incidentberedskap, domänautentisering. Ingen person i föreningen har åtagit sig drift (premiss från uppdraget).

| Verktyg | Licens | Senaste version vid hämtning | Mejl | API/webhook | Hostat alternativ |
| --- | --- | --- | --- | --- | --- |
| CiviCRM | AGPL-3.0 | repo aktivt (push 2026-11-03) | CiviMail | APIv4 REST | Spark (se avsnitt 1) |
| EspoCRM | AGPL-3.0 (licensfil) | 10.0.11, 2026-10-23 | Massmejl, målgrupper, egen avanmälningssida | REST; webhooks `ENTITY.create/update/delete` med signaturkontroll | Cloud, tyska servrar, 12,90–59 EUR/användare/mån |
| Twenty | "Mostly AGPLv3", vissa filer under kommersiell licens | v2.55.0, 2026-11-03 | Begränsat belagt | REST, GraphQL, webhooks, OAuth | Cloud, 9 USD/användare (Pro) |
| SuiteCRM | Öppen källkod (licenstyp ej verifierad här) | v7.15.2, 2026-07-31 | Kampanjer (ej närmare läst) | ? | Hostat från 50 GBP/mån, supportpaket 960 GBP/år |
| listmonk | AGPL-3.0 (grannfilen) | 6.2.0 stabil enligt grannfilen | Listor, segment, avanmälan | REST | Inget belagt |

- **EspoCRM:** hostningsplatsen "Germany ... EU hosting for GDPR-related data needs" [P, https://www.espocrm.com/cloud/]. Basic 12,90 EUR, Enterprise 22 EUR, Business 59 EUR per användare och månad, minst 3/5/10 användare, betalas 6 månader eller 1 år i förväg [P]. Räknat: 3 användare på Basic = 38,70 EUR/månad. Ingen ideell rabatt hittades. Funktionslistan nämner massmejl, mejlmallar, Stripe-betalningar, bokningssidor, portal [P, https://www.espocrm.com/features/]; ingen donationsmodell. Webhooks och signering: https://docs.espocrm.com/administration/webhooks/.
- **Twenty:** `LICENSE` anger "mostly AGPLv3" och att vissa filer har kommersiell licens [P, https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE]. Användarvillkoren: egen data, ingen AI-träning på data, export när som helst [P, https://twenty.com/terms]. Molnets datacenterplats, DPA och svensk eller svenskanpassad tilltalstext: OVERIFIERAT. Projektet är ungt (version 2.x med mycket snabba utgåvor); stabilitet över tid är OVERIFIERAT.
- **SuiteCRM:** förvaltas av ett bolag som säljer hosting och support; fri nedladdning, men "Pay only for the hosting, setup, and support you actually need" [P, https://suitecrm.com/pricing/]. Tungt för 20 barn.
- **listmonk:** passar som ren utskickslösning, inte som CRM. Se grannfilen för krav och drift. Egen slutsats: om föreningen vill ha självhostat är listmonk plus en tabell mer rimligt än ett fullständigt CRM, men grannfilen kommer redan fram till att SaaS är billigare tillsammans med drift.

## Jämförelse per kriterium

### Fadder↔barn och månadsgåvor

- Inbyggd modell för återkommande gåvor finns i Repejo (med svenska betalsätt), Samfora (Stripe, Swish, Autogiro; återkommande ej närmare läst), CiviCRM (bidragssidor med återkommande) och i de amerikanska givarplattformarna.
- Inbyggd koppling mellan en person och ett enskilt barn (sponsring) hittades ingenstans som färdig funktion. Samtliga kräver eget fält, egen relationstyp eller eget objekt. Med 20 barn är det trivialt i alla verktyg som tillåter egna fält. Egen slutsats.

### Utskick, segmentering, dubbel opt-in, avanmälan

- Brevo: grannfilen. API med DOI-endpoint, listor, segment, avanmälan.
- CiviCRM: grupper med prenumerationshistorik och status pending/added/removed. Färdigt DOI-flöde ej läst.
- EspoCRM: målgrupper och avanmälan; DOI ej läst.
- Zoho/HubSpot/Capsule: utskick via separata produkter eller integrationer; ej undersökt.
- Samfora: e-post och marknadsautomation nämns; funktioner ej undersökta.
- Gemensamt: ordalydelsen och tidpunkten för Medgivande måste sparas av föreningen i alla fall, eftersom GDPR kräver att personuppgiftsansvarig kan visa samtycket (art. 7.1, grannfilens GDPR-avsnitt). Ingen kandidat är belagd att göra det av sig själv. Egen slutsats.

### GDPR och EU

- Belagt EU: Brevo (OVH FR, Google BE), EspoCRM Cloud (Tyskland), Samfora (Sverige/EU, enligt egen webbplats), Repejo (Sverige, Finland, Nederländerna enligt grannfilen).
- Ej belagt: CiviCRM Spark, Twenty Cloud, Airtable, Baserow, NocoDB, Zoho, Capsule, Salesforce, Bloomerang, Donorbox, Givebutter, Raisely, Beacon.
- För varje tillkommande personuppgiftsbiträde behövs ett biträdesavtal (grannfilen, GDPR-avsnittet) och en uppdaterad integritetstext. Egen slutsats: varje extra system ökar den administrativa bördan mer än det sparar för 20 barn.

### Pris för liten förening (räknat bara där antalet är givet)

- Repejo (redan planerat): 595 kr/mån + 3 kr per gåva.
- Brevo: 0 (Free) eller från 9 USD/mån; ideell rabatt 20 %.
- CiviCRM Spark: 13 EUR/mån (Starter).
- EspoCRM Cloud: 38,70 EUR/mån (räknat, 3 användare).
- Twenty Pro: 9 USD/användare och månad.
- Airtable ideell: 12 USD/redigerare och månad; gratisplan finns.
- Samfora: okänt.

### API och GitHub Actions

- En GitHub Action kan anropa REST hos Brevo, CiviCRM (APIv4), EspoCRM, Twenty, Airtable, Baserow och Repejo (webhooks in till en liten funktion, grannfilen). Ingen kandidat behöver en server hos föreningen; en liten serverless-funktion eller Action räcker, vilket grannfilerna redan förutsätter.
- Inkommande webhooks direkt till Brevo är inte realistiska (Professional, grannfilen); därför behövs ändå ett mellanled för Repejo.

## Rekommendation och villkor

**Rekommendation (Egen slutsats):**

1. **Behåll arkitekturen från grannfilerna: Repejo som kassa och givarregister, Brevo för utskick.** Lägg faddern i Brevo som kontakt med två attribut, till exempel `FADDERFORM` (alla / ett barn / ingen) och `FADDER_FOR` (barn), och med Prenumeration per Ämne i listor eller attribut. Barnets namn är en personuppgift om ett barn: använd en kod eller förnamn och avgör med familjens samtycke vad som får stå var (`PRODUCT.md`: "Samtycke först").
2. **Kopplingen fadder→barn utanför Brevo är ett beslut för föreningen** och kan lagras i Repejos `note`/`external_id`/`metadata` om kassan stöder det (OVERIFIERAT), annars som ett fält i Brevo.
3. **Skaffa inget separat CRM för 20 barn.** Det tillför ett tredje system med personuppgifter men ingen funktion som saknas.
4. **Revidera när något av villkoren nedan inträffar:**
   - *Samfora* blir tillgängligt med publikt pris, DPA, Repejo-integration och rimlig avtalstid: då är det ett naturligt nästa steg, eftersom det är byggt för Swish/autogiro och EU.
   - *Fler än några hundra faddrar eller flera typer av stöd* (medlemmar, evenemang, företagsgåvor): då är CiviCRM Spark eller EspoCRM Cloud värda att jämföra, men först efter att datacenter och DPA är kända.
   - *Någon person åtar sig drift skriftligt* och vill ha full kontroll: självhostat CiviCRM eller Twenty, annars inte.
5. **Använd inte** HubSpot (ej behörig), amerikanska givarplattformar utan EU-/Swish-belägg, eller Salesforce (konfigurationsbörda) för detta.

**Villkor som skulle ändra svaret:**

- Kassan (Repejo) kan inte bära barnval eller ett eget nyhetsmedgivande → Brevo-attribut och ett separat formulär tar över; ändrar inte valet av verktyg.
- Repejos webhook kräver API-tillvalet (959 kr/mån) → mellanledet blir dyrare än e-posttjänsten (grannfilen); då kan Samfora, om det har rimligt pris, väga över.
- Föreningen vill ha avstämning mot bokföring (Fortnox m.m.) → inget belagt här; undersök separat.

## Lista över OVERIFIERAT och frågor att ställa

**Till Repejo** (utöver grannfilens punkter):
1. Kan checkouten ta ett val (alla barnen / ett barn / vilket barn) och spara det i `metadata` eller `note`? Kan en egen kryssruta för "Nyheter med e-post" skapas?
2. Ingår webhooks i grundpriset eller kräver de API-tillvalet (959 kr/mån)?

**Till Samfora:**
3. Pris för en förening med några hundra givare, avtalstid, uppsägning och exporträtt.
4. Biträdesavtal och underbiträden; var exakt lagras data; hur loggas samtycke (tid, ordalydelse, ämne)?
5. Finns API och webhooks? Går det att modellera fadder↔barn? Kan de ta in en liten förening när lanseringen sker (2026 "begränsat antal")?
6. Hur ser reservplan ut om bolaget läggs ned (tidigt skede, grundat 2025 [S])?

**Till CiviCRM Spark / CiviCRM-partner:**
7. Var ligger Sparks servrar? Läs DPA-länken på `civicrm.com/spark/`.
8. Vilken plan har CiviMail och API Key? Går Swish/autogiro att koppla (OVERIFIERAT; ingen Swish-tillägg hittades)?
9. Finns en EU-baserad CiviCRM-partner med fast pris?

**Till övriga:**
10. EspoCRM Cloud: DPA, datacenter-leverantör, ideell rabatt, DOI i massmejl.
11. Twenty Cloud: datacenterplats och DPA.
12. Zoho: EU-datacenter, DPA, om svenska ideella föreningar godkänns; Capsule: hosting och DPA; Pipedrive: rabatt (sidan gick inte att läsa).
13. Airtable, Baserow, NocoDB: EU-region och DPA (inget av det lästes).
14. Salesforce Power of Us: godkänns svenska ideella föreningar, och i så fall i vilken region ligger datan? Läs "eligibility guidelines".
15. Bloomerang, Donorbox, Givebutter, Raisely, Beacon: stöd för Sverige, SEK, Swish, autogiro, EU-hosting och DPA.
16. Wint, Anpassa, Upright, Fortnox-integration: gick inte att läsa; lägg till i en senare omgång bara om föreningen faktiskt använder dem.

**Juridik och rutin:**
17. Samtyckeslogg: vilket system är sanningskälla för Medgivandets tidpunkt och ordalydelse (Brevo, Repejo eller egen tabell)? Gäller även grannfilens öppna juridiska frågor om onboarding-mejl till betalande faddrar.
18. Barnets uppgifter i ett CRM: avgör med den etiopiska systerföreningen och familjerna vad som får lagras, och var, innan fadder↔barn läggs in i något system.

## Källförteckning (alla hämtade 2026-11-03)

[P] Repejo: https://repejo.se/funktioner/givarrelationer/, https://repejo.se/produkt/integrationer/, https://repejo.se/faq/, https://repejo.se/priser/, https://app.repejo.se/docs/api-payer, https://app.repejo.se/docs/api-webhooks

[P] Samfora: https://samfora.io/, https://samfora.org/

[P] CiviCRM: https://civicrm.com/spark/, https://civicrm.com/, https://docs.civicrm.org/user/en/latest/organising-your-data/relationships/, https://docs.civicrm.org/user/en/latest/organising-your-data/groups-and-tags/, https://docs.civicrm.org/user/en/latest/contributions/payment-processors/, https://docs.civicrm.org/user/en/latest/contributions/key-concepts-and-configurations/, https://docs.civicrm.org/dev/en/latest/api/v4/rest/, https://docs.civicrm.org/installation/en/latest/requirements/, https://api.github.com/repos/civicrm/civicrm-core

[P] EspoCRM: https://www.espocrm.com/cloud/, https://www.espocrm.com/features/, https://docs.espocrm.com/administration/webhooks/, https://docs.espocrm.com/user-guide/mass-email/, https://raw.githubusercontent.com/espocrm/espocrm/master/LICENSE.txt, https://api.github.com/repos/espocrm/espocrm/releases/latest

[P] Twenty: https://twenty.com/pricing, https://twenty.com/terms, https://docs.twenty.com/developers/introduction, https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE, https://api.github.com/repos/twentyhq/twenty/releases/latest

[P] SuiteCRM: https://suitecrm.com/pricing/, https://api.github.com/repos/SuiteCRM/SuiteCRM/releases/latest

[P] Brevo: https://developers.brevo.com/docs/custom-objects-management.md, https://developers.brevo.com/reference/create-contact.md, https://www.brevo.com/pricing/; rabatt, DPA och DOI via grannfilen

[P] Baserow: https://baserow.io/pricing, https://baserow.io/user-docs/webhooks, https://baserow.io/privacy-policy, https://raw.githubusercontent.com/baserow/baserow/develop/LICENSE

[P] NocoDB: https://nocodb.com/pricing, https://raw.githubusercontent.com/nocodb/nocodb/develop/LICENSE.md

[P] Airtable: https://airtable.com/pricing, https://support.airtable.com/articles/4920135568-applying-for-non-profit-education-and-student-airtable-plans

[P] HubSpot: https://www.hubspot.com/nonprofits

[P] Zoho: https://www.zoho.com/nonprofits/, https://www.zoho.com/nonprofits/terms.html, https://www.zoho.com/crm/zohocrm-pricing.html

[P] Capsule: https://capsulecrm.com/industries/crm-for-nonprofits/, https://capsulecrm.com/signup/

[P] Salesforce: https://www.salesforce.com/nonprofit/pricing/

[P] Bloomerang: https://bloomerang.com/pricing, https://bloomerang.com/gdpr; Donorbox: https://donorbox.org/pricing; Givebutter: https://givebutter.com/pricing; Raisely: https://www.raisely.com/pricing; Beacon: https://www.beaconcrm.org/pricing

[P] Svenska: https://www.cgi.com/se/sv/tjanster/affarssystem/dynamics-365/crm/medlemssystem, https://www.spiir.com/, https://idealistas.se/

[S] Söksammanfattningar (WebSearch): Samforas ålder och kundtal, Bloomerangs 119 USD per 1 000 poster, Salesforce Power of Us landsurval, Capsule gratisplanens gränser, Airtable internationella behörighet. Alla ska kontrolleras mot primärkälla.

Lokala filer: `GLOSSARY.md`, `PRODUCT.md`, `README.md`, `src/lib/intresseanmalan.ts`, `docs/research/epostutskick-tjanster.md`, `docs/research/epostutskick-sjalvhostat.md`, `docs/research/epostutskick-cms.md`.
