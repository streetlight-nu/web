# Tjänster för Nyheter med e-post: jämförelse och rekommendation

Hämtat och sammanställt 2026-11-03. Underlag för föreningens val av tjänst och personuppgiftsbiträde. Inget i repot är kopplat; se sista avsnittet om `src/lib/prenumeration.ts`.

## Läs detta först: begränsning i hur källorna hämtades

Sessionen kunde inte öppna leverantörernas sidor direkt. Alla `WebFetch`-anrop (www.brevo.com, help.brevo.com, www.mailerlite.com, www.mailjet.com) misslyckades med `getaddrinfo ENOTFOUND`, eftersom värdarna inte ligger i sessionens tillåtna nätverksdomäner. Samma sak gäller antagligen övriga leverantörers domäner. Därför:

- Varje påstående nedan kommer från ett `WebSearch` begränsat till leverantörens egen domän (till exempel `help.brevo.com`, `mailerlite.com`, `developers.kit.com`). Sökverktyget returnerar en sammanfattning av sidan, inte sidans fulltext. URL:en anger vilken primärsida påståendet hör till. Hämtningsdatum är 2026-11-03 för alla.
- Inget är därmed läst ord för ord i primärkällan. Priser, gränsvärden och DPA-villkor ska kontrolleras på sidan innan beslut. Det som sammanfattningarna själva sa var motstridigt eller saknades är markerat **OVERIFIERAT**.
- Betygen (G2, Capterra, Trustpilot) är sekundära omdömen och hämtades via sökning begränsad till de tre betygssajterna. Priserna anges i den valuta sammanfattningen angav (ofta USD). Omräkning till SEK är inte gjord.
- För att göra om hämtningen på riktigt: lägg till leverantörernas domäner i sessionens tillåtna nätverksdomäner och kör om. Då går varje rad i tabellen att kontrollera mot fulltext.

## Sammanfattning och rekommendation

Kravbilden: litet antal mottagare (högst några hundra), Repejos webhook vid ny fadder ska skapa kontakten och starta onboarding-mejl, mejlen ska se ut som Streetlight, redaktörerna är icke-tekniska, GDPR och EU-hosting väger tungt.

1. **Brevo (förstahandsval).** Franskt bolag med servrar i EU. Dokumentationen anger OVH i Frankrike och Tyskland samt Google Cloud i Belgien. DPA ingår i användarvillkoren. Har inkommande webhooks som kan skapa/uppdatera kontakt och starta en automation, vilket är det närmaste en direkt koppling från Repejo. Funktionen rullas dock ut stegvis och planbehovet står inte i källan (OVERIFIERAT). Reservväg: API med kontakt-upsert och DOI-endpoint. Egna typsnitt via @font-face-CSS-länk, egen HTML-import och utvecklarläge finns. Ideella får 20 % rabatt på betalda planer. Gratisplanen tillåter 300 mejl per dag och 100 000 kontakter, och automation i någon form, men uppgifterna om automationsgränsen (300 respektive 2 000 kontakter) och vilken plan som krävs för automation går isär (se öppna frågor).
2. **MailerLite (andrahandsval).** 30 % rabatt för ideella (kräver dokumentation inom 14 dagar). DPA finns, och kunder inom EES betjänas av MailerLite Limited med data kvar inom EU. Automation med trigger "Joins a group", API med upsert som lägger kontakten i grupp, och webhooks ut. Ingen inkommande webhook hittades, så Repejo måste gå via en serverless-funktion (eller Zapier/Make/n8n). Egna typsnitt hanteras genom att klistra in en Google Fonts-länk i ett eget kodblock, och typsnittet syns bara i förhandsvisning/test/utskick, inte i editorn. Om egenhostade Bricolage/Familjen går att länka på samma sätt är OVERIFIERAT.
3. **Villkorligt tredjeval: tyska rapidmail eller CleverReach.** Båda tyska, rapidmail med 20–50 % rabatt till föreningar. Men datacenterplats, DPA och API/automation kunde inte beläggas i sökningarna, så de kan inte rekommenderas före verifiering. Värda en kort fråga till leverantören om Brevo faller bort.

Bortvalda kort: se avsnittet "Bortvalda och varför".

## Repejo som trigger (verifiering av webhooks)

**Resultat: webhookens händelser, payload, signering och retry går inte att verifiera.** Två dokumentationssökningar hittade ingen utvecklardokumentation, bara översiktssidor.

| Fråga | Läge | Källa (hämtad 2026-11-03, via sökning) |
| --- | --- | --- |
| Har Repejo webhooks och API? | Ja, enligt marknadsföring: "öppna API:er", webhooks och färdiga integrationer som kan skicka givardata, betalningsstatus och händelser till andra system | https://repejo.se/en/produkt/integrationer/ |
| Vilka händelser (t.ex. ny betalning, nytt autogiro)? | **OVERIFIERAT** | Ej i någon källa |
| Payload: e-post, namn | **OVERIFIERAT** | Ej i någon källa |
| Payload: medgivanden/kryssrutor | **OVERIFIERAT** | Ej i någon källa |
| Signering/autentisering | **OVERIFIERAT** | Ej i någon källa |
| Retry vid fel | **OVERIFIERAT** | Ej i någon källa |
| Zapier-koppling | Hittades inte (integrationssidan nämner Samfora för synk av givardata, inte Zapier) | https://repejo.se/en/produkt/integrationer/ |

Åtgärd för föreningen: be Repejo om webhookspecifikationen (händelselista, exempel-payload, signeringsmetod, retry-regler, om e-post skickas med och om ett nyhetsmedgivande kan samlas in i kassan). Utan den går det inte att välja mellan "direkt inkommande webhook" och "serverless-funktion som tar emot".

## Jämförelsetabell

Förklaring: **V** = stöds enligt leverantörens sida (via sökning), **?** = OVERIFIERAT/saknas i källan. Priser gäller läget 2026-11-03 enligt sammanfattning och ska kontrolleras.

| Krav | Brevo | MailerLite | Kit | Mailchimp | Loops | Resend | Buttondown | CleverReach | rapidmail | Apsis One | Mailjet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bolag/EU-hosting | V: FR-bolag, servrar FR/DE/BE | V: EES-kunder via MailerLite Limited, data i EU (DE klassiska, NL nya) | ? DPA/plats ej belagt | Servrar i USA, DPF + SCC | ? plats ej belagd, DPA finns | ? ej belagt | ? ej belagt | DE-bolag; hosting ? | DE; hosting ? | Data i Irland, backup i Tyskland; svenskgrundat | ? ej belagt |
| DPA | V (i villkoren) | V | ? | V (inbyggd i villkoren) | V (publik DPA) | ? | ? | ? | ? | V (anges i marknadsföring) | ? |
| Rabatt ideella | 20 % betalda planer, ansökan via support | 30 % betalda planer, dokumentation inom 14 dagar | ? | 15 % (ej årsplaner) | ? | ? | ? | Ja, uppgifter går isär (30 %, eller 12 mån gratis i äldre pressmeddelande) | 20–50 % (50 % med rapidmail-banner) | ? | 20 % månadsplaner |
| Gratisplan | 300 mejl/dag, upp till 100 000 kontakter | 250 prenumeranter, 2 500 mejl/mån (uppgift går att ifrågasätta, se öppna frågor) | Gratis under 10 000 prenumeranter, men inga visuella automationer | 250 kontakter, 500 mejl/mån | 1 000 kontakter | 1 000 kontakter | 100 prenumeranter | Lite: 1 000 mejl/mån | ? | Ingen, 14 dagars provperiod | 6 000 mejl/mån, 200/dag, 1 000 kontakter |
| Pris vid ~100–500 | Starter från 9 USD/mån (5 000 mejl, upp till 500 kontakter); Standard från 18 USD/mån | Betalt från 12 USD/mån; exakt pris vid 500 ? | Creator 33–39 USD/mån vid 1 000 | 9,99–13 USD (Essentials), siffror går isär | Gratis upp till 1 000 | Gratis upp till 1 000 | 9 USD/mån vid 1 000 | Basic 15 EUR/mån | 15/25/35 EUR/mån vid 500 mottagare | Från 110 EUR/mån | Starter 9 USD, Essential 19 USD |
| Egna typsnitt/HTML/varumärke | V: CSS-länk (@font-face), HTML-import, utvecklarläge, varumärkesbibliotek | Delvis: Google Fonts-länk i kodblock, varumärkesstilar; HTML-import ? | V: egna mallar med HTML/CSS, även gratis | ? ej belagt | ? | HTML via API | ? | ? | ? | ? | ? |
| Ta emot Repejo-anrop direkt | Delvis: inkommande webhooks (stegvis utrullning, max 20, endast första JSON-nivån); planbehov ? | Nej hittat: ingen inkommande webhook, API krävs | Nej hittat, API/tagg | Nej hittat, API | Event-API ? | API | API | ? | ? | Open API (Automate-nivå) | API/Webhooks (ut) |
| Kontakt-upsert via API | V: skapa/uppdatera, DOI-endpoint | V: upsert, grupper tillkommer bara | V: v4, `email_address`, skapar om saknas | V: PUT med `status_if_new` | V: contacts/create | V | V | ? | ? | ? | ? |
| Trigger för onboarding-serie | V: "Contact added to list", custom event | V: "Joins a group" | V: tagg/formulär som ingång (ej gratis) | ? ej belagt | Workflows i alla planer | Resend Automations på marknadsplaner | ? | ? | 1 automation (Essential), 5 (Performance) | Flöden på Automate-nivå | Premium först (enligt jämförelsesida, ej primärkälla) |
| Dubbel opt-in | V: DOI-endpoint, mall kan egna | V: inställning "Double opt-in for API and integrations" måste slås på; ingen omsändning till obekräftade | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| Svenskt gränssnitt/anmälningsmejl | ? ej belagt (hjälpsidor på engelska; egen svensk DOI-mall är möjlig) | ? ej belagt | ? | ? | ? | ? | ? | ? | ? | Svenskgrundat, språk ? | ? |
| Visuell editor för icke-tekniska | V: drag-och-släpp | V: drag-och-släpp och enkel editor | V | V | ? | Mest API/kod | ? | ? | ? | ? | ? |

Allt markerat ? är inte belagt i de sammanfattningar som hämtades. Det betyder inte att funktionen saknas.

## Betyg (sekundära omdömen, ej leverantörens egna)

Hämtat 2026-11-03 via sökning på g2.com, capterra.com och trustpilot.com. Sammanfattningen noterade själv att ögonblicksbilderna inte stämmer överens sinsemellan. Behandla som riktvärden.

| Tjänst | G2 | Capterra | Trustpilot |
| --- | --- | --- | --- |
| Brevo | ca 4,5 (ca 2 600 omdömen) | 4,6 (3 526) | 4,2 (ca 7 000), äldre ögonblicksbild 4,0 |
| MailerLite | 4,6 (1 114) | 4,7 (2 322) | 4,1 (3 394) |
| Kit | 4,4 (236), osäkert | 4,6 (241) | ej funnet |
| Mailchimp | 4,3 (12 988) | 4,48 (17 604) | 2,5 (sekundär listning) |
| Övriga | ej sökta | ej sökta | ej sökta |

Källor: https://www.g2.com/products/brevo-marketing-platform/reviews, https://www.capterra.com/p/132996/brevo/reviews/, https://www.trustpilot.com/review/www.brevo.com, https://www.capterra.com/p/136603/MailerLite/reviews/, https://www.trustpilot.com/review/mailerlite.com, https://www.g2.com/products/convertkit-kit/reviews, https://www.g2.com/compare/mailerlite-vs-brevo-marketing-platform.

## Per tjänst

Alla källor hämtade 2026-11-03 via domänbegränsad sökning (se begränsningen överst).

### Brevo (ex Sendinblue)

- **Planer och pris.** Fem planer: Free (0), Starter (från 9 USD/mån), Standard (från 18 USD/mån), Professional (från 499 USD/mån), Enterprise. Free: 300 mejl/dag, lagring av upp till 100 000 kontakter. Starter har ingen dagsgräns; lägsta nivån är 5 000 mejl/mån och upp till 500 kontakter. Standard lägger till marknadsföringsautomation utan kontaktgräns. Källa: https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans, https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- **Rabatt.** 20 % på månads- och årsplaner för verifierade ideella organisationer; ansökan via supportärende med bevis på status (till exempel intyg eller organisationsnummer). Källa: https://www.brevo.com/company/ngos/, https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- **Inkommande webhook.** Brevo kan ta emot ett anrop och antingen utlösa en egen händelse (custom event) eller skapa/uppdatera en kontakt. E-postattributet är enda obligatoriska fältet. Högst 20 inkommande webhooks per konto, endast första nivån i JSON-payloaden. Funktionen rullas ut stegvis och finns kanske inte på alla konton. Planbehov står inte i artikeln. Custom event-triggern kräver att händelsen är definierad och spårad. Källa: https://help.brevo.com/hc/en-us/articles/24645462216466-Create-inbound-webhooks-to-receive-real-time-data-from-another-app-in-Brevo
- **API och DOI.** Egen endpoint för kontakt med dubbel opt-in: tar e-post, lista, omdirigerings-URL och DOI-mallens id; mallen använder `params.DOIurl`. Källa: https://developers.brevo.com/reference/create-doi-contact. För formulär utanför Brevo rekommenderas en temporär lista, en automation som skickar bekräftelsen och en "Ja"-gren som lägger kontakten i slutlistan. Källa: https://help.brevo.com/hc/en-us/articles/27353832123026-Set-up-a-double-opt-in-process-for-a-sign-up-form-created-outside-of-Brevo. Om kontakten har gått igenom DOI räknas den som tillagd först när den klickat på länken. Att starta DOI via den generiska skapa-kontakt-endpointen hittades inte (OVERIFIERAT).
- **Automation.** Triggern "Contact added to list" startar en automation när kontakten läggs i en viss lista; den utlöses inte när en kontakt flyttas från en lista till en annan. Källa: https://help.brevo.com/hc/en-us/articles/15445989568402-Available-triggers-actions-and-rules-in-an-automation, https://help.brevo.com/hc/en-us/articles/21203352470034-Use-a-trigger-to-start-an-automation
- **Design.** Google- och egna typsnitt läggs till under "Manage web fonts" med länk till en CSS-fil som innehåller @font-face och ligger på en publik URL; fallback-typsnitt rekommenderas eftersom alla e-postklienter inte stöder webbtypsnitt. Egna HTML-mallar kan importeras, och drag-och-släpp-editorn har utvecklarläge. Det finns ett varumärkesbibliotek. Källa: https://help.brevo.com/hc/en-us/articles/360017970099-Add-Google-custom-and-fallback-fonts-to-your-email-design, https://help.brevo.com/hc/en-us/articles/360013295520-Use-the-developer-mode-for-advanced-customization-of-email-designs, https://help.brevo.com/hc/en-us/articles/7868807168274-Save-your-brand-s-assets-in-the-brand-library
- **GDPR/plats.** Servrarna ligger i EU: OVH i Frankrike och Tyskland, data lagras på Google Cloud i Belgien. DPA ligger i användarvillkoren; Brevo är biträde och kunden personuppgiftsansvarig. Underbiträdeslistan nämner OVH, Scaleway och Google Cloud, samt Cloudflare (USA, med DPF/SCC). En äldre arkiverad lista visade även affiliates med åtkomst från USA, Kanada och Indien; kontrollera aktuell lista. Källa: https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location, https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA, https://www.brevo.com/legal/termsofuse/
- **Språk.** Om gränssnittet eller standardmejlen finns på svenska gick inte att belägga (OVERIFIERAT). Egen svensk DOI-mall går att göra. Källa: https://help.brevo.com/hc/en-us/articles/360019540880-Create-a-custom-double-opt-in-DOI-email-template-for-a-sign-up-form-created-in-Brevo

### MailerLite

- **Pris/rabatt.** 30 % rabatt på betalda planer för ideella; 14 dagars provperiod, välj "nonprofit" som bransch och kontakta support inom 14 dagar med underlag. Rabatten kan inte kombineras med årsrabatten. Betalda planer från 12 USD/mån. Källa: https://www.mailerlite.com/mailerlite-for-nonprofits, https://www.mailerlite.com/pricing. Gratisplanen anges som 250 prenumeranter, 2 sätesplatser och 2 500 mejl/mån, med en uppdatering i juni 2026 som öppnade premiumfunktioner. Planernas namn gick isär mellan sidorna (OVERIFIERAT). Källa: https://www.mailerlite.com/help/free-plan-update-faq
- **API.** Skapa/uppdatera-endpointen (upsert) uppdaterar befintlig prenumerant och kan lägga till i grupper; grupper tillkommer bara och tas inte bort. Avregistrerade, studsade och skräpmarkerade kan inte återaktiveras via API. Källa: https://developers.mailerlite.com/api/subscribers
- **Automation.** Triggern "Joins a group" startar flödet när en prenumerant går med i gruppen; nya mottagare via API får mejlet. Går bara att utlösas en gång per 24 timmar. Källa: https://www.mailerlite.com/help/how-to-set-up-automation-triggers, https://www.mailerlite.com/help/does-mailerlite-offer-smtp-simple-mail-transfer-protocol
- **Webhooks.** Endast utgående händelser (till exempel subscriber.created, updated, unsubscribed). Någon inkommande webhook hittades inte. Källa: https://developers.mailerlite.com/api/webhooks
- **Dubbel opt-in.** Inställningen "Double opt-in for API and integrations" måste slås på. Obekräftade prenumeranter får status unconfirmed och bekräftelsemejlet kan inte skickas om. Källa: https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers, https://www.mailerlite.com/help/what-are-unconfirmed-subscribers
- **Design.** Egna typsnitt: Google Fonts-länk i ett eget kodblock och en CSS-regel; syns inte i editorn, bara i förhandsvisning, test och utskick. Varumärkesstilar kan sparas. Källa: https://www.mailerlite.com/help/why-some-web-fonts-change-after-sending-a-newsletter, https://www.mailerlite.com/help/how-to-use-brand-styles
- **GDPR/plats.** MailerLite är biträde för prenumeranternas uppgifter. För kunder i EES, Storbritannien och Schweiz som betjänas av MailerLite Limited lämnar data inte EU. Lagringsplats anges som Tyskland (klassiska) och Nederländerna (nya MailerLite). DPA kan undertecknas. Källa: https://www.mailerlite.com/legal/data-processing-agreement, https://www.mailerlite.com/legal/privacy-policy, https://www.mailerlite.com/help/is-my-data-safe-with-mailerlite. Datumet för DPA-sidan bedömdes som gammalt av sökverktyget; kontrollera aktuell version.

### Kit (ex ConvertKit)

- Gratisplan under 10 000 prenumeranter med obegränsade utskick och formulär, egna HTML/CSS-mallar även gratis. Visuella automationer ingår inte i gratisplanen utan i Creator (33–39 USD/mån vid 1 000 prenumeranter, siffrorna skiljer sig mellan sidorna). Källa: https://kit.com/pricing, https://help.kit.com/en/articles/16627071-the-kit-free-plan, https://help.kit.com/en/articles/4494683-creator-plan-vs-creator-pro-plan
- API v4: `email_address` används för att lägga till; lägga till i sekvens skapar prenumeranten om den saknas; tagg eller formulär kan vara ingång till automation. Källa: https://developers.kit.com/api-reference/upgrading-to-v4, https://help.kit.com/en/articles/4257108-tags-and-segments-in-kit-and-when-to-use-which
- DPA och serverplats: **OVERIFIERAT** (inget hittat).
- Bedömning: tekniskt användbar men saknar belagd EU-hosting och DPA. Därför inte i topp.

### Mailchimp

- Gratis: 250 kontakter, 500 mejl/mån. Betalda planer 9,99–13 USD (Essentials) och 14,99–20 USD (Standard), siffrorna går isär mellan sidor. Källa: https://mailchimp.com/pricing/marketing/, https://mailchimp.com/pricing/compare-plans/
- Ideella: 15 %, inte på årsplaner. Källa: https://mailchimp.com/help/about-nonprofit-discount/
- GDPR: servrar i USA, överföring via EU-US Data Privacy Framework och SCC, DPA ingår i villkoren utan signatur. Källa: https://mailchimp.com/help/mailchimp-european-data-transfers/, https://mailchimp.com/gdpr/
- API: PUT-upsert på listmedlem med `status_if_new`. Källa: https://mailchimp.com/developer/marketing/api/list-members/add-or-update-list-member/
- Bedömning: fungerar rent tekniskt men USA-hosting ger sämre passform med föreningens GDPR-ambition.

### Loops

- Prissätts per prenumererad kontakt; gratis upp till 1 000, Growth 49 USD/mån upp till 5 000. Workflows, events och contact properties ingår i alla planer. Publik DPA och DPF-listning; **EU-lagring ej belagd**. Källa: https://loops.so/pricing, https://loops.so/privacy, https://loops.so/docs/account/billing
- Byggd för SaaS och produktmejl, inte för redaktörer. Webhooks ej belagda.

### Resend

- Marknadsplaner prissatta per kontakt: gratis 1 000, Pro från 40 USD/mån för 5 000. Contacts-API (skapa, uppdatera, segment), Broadcasts och Automations. Broadcast kräver att kontakten ligger i ett segment. EU-region och DPA: **OVERIFIERAT**. Källa: https://resend.com/pricing, https://resend.com/docs/dashboard/contacts/introduction
- Utvecklarverktyg; redaktörerna skulle behöva kod eller mallar gjorda av någon annan. Passar inte kravet på visuell editor.

### Buttondown

- Gratis 100 prenumeranter, från 9 USD/mån vid 1 000. API-skapande av prenumeranter fungerar även gratis (POST /v1/subscribers, enligt blogginlägg 2023). DPA och EU-hosting: **OVERIFIERAT**. Källa: https://buttondown.com/blog/2022-05-13-repricing, https://buttondown.com/blog/2023-12-13
- Bedömning: enkelt men ingen belagd GDPR-grund.

### CleverReach (DE)

- Lite gratis (1 000 mejl/mån), Basic 15 EUR/mån, Pro 18 EUR/mån. Rabatt till ideella finns men uppgifterna går isär. Datacenter, DPA, API och svenska: **OVERIFIERAT**. Källa: https://www.cleverreach.com/en/plans-and-pricing/, https://www.cleverreach.com/en/industry-solutions/clubs-associations/

### rapidmail (DE)

- 15/25/35 EUR/mån vid 500 mottagare; ideella får 20 % (utan banner) till 50 % (med rapidmail-banner). Essential har 1 automation, Performance 5. Datacenter, DPA och API: **OVERIFIERAT**. Källa: https://www.rapidmail.com/pricing, https://www.rapidmail.de/newsletter-guides/nonprofit-email-marketing

### Apsis One (svenskgrundat)

- Från 110 EUR/mån för upp till 1 000 kontakter, Automate från 300 EUR/mån. Faktureras per profil, och profiler utan medgivande räknas ändå. Data i Irland med backup i Tyskland enligt integritetssidan (inte Sverige). Open API på Automate-nivå. Källa: https://www.apsis.com/price-calculator, https://help.apsis.one/en/articles/9018553-account-usage-pricing-model, https://www.apsis.com/privacy
- Det enda svenska alternativet som hittades. Mycket dyrare än behovet vid några hundra mottagare.

### Mailjet

- Gratis 6 000 mejl/mån, 200/dag, 1 000 kontakter, med API, SMTP och webhooks. Ideella: 20 % på månadsplaner (inte årsplaner), ansökan med juridiskt dokument. Automation först på Premium enligt jämförelsesidor (ej primärkälla). Datahosting och DPA: **OVERIFIERAT**. Källa: https://www.mailjet.com/pricing/, https://documentation.mailjet.com/hc/en-us/articles/360043007133-Do-you-have-special-pricing-for-non-profits

## Bortvalda och varför

- **Beehiiv:** inte undersökt. Riktar sig till publicister som tjänar pengar på nyhetsbrev, ingen indikation på bättre passform.
- **Postmark:** transaktionsmejl, inget verktyg för redaktörer. Inte undersökt.
- **Ecomail:** inte undersökt (tidsbrist och blockerad hämtning).
- **Loops, Resend, Buttondown:** för utvecklare eller för små publicister; GDPR-läget är inte belagt (se ovan).
- **Mailchimp, Kit:** USA-hosting respektive obelagd DPA/plats.
- **Apsis:** för dyr för behovet.

## Tre sätt att ta emot Repejos anrop, per tjänst

| Tjänst | Direkt inkommande webhook | Via serverless/Zapier/Make/n8n | Direkt API (upsert + lista/tagg → onboarding) |
| --- | --- | --- | --- |
| Brevo | **Möjlig**, men stegvis utrullning och planbehov OVERIFIERAT. Kräver att Repejos payload har e-post på första JSON-nivån och att Repejo kan skicka utan särskild signering som Brevo inte validerar | Ja, om Repejos payload kräver omformning eller signaturkontroll | Ja: skapa kontakt, lägg i lista, "Contact added to list" startar serien |
| MailerLite | Inte hittad | Ja, krävs i praktiken | Ja: upsert med grupp, "Joins a group" startar serien |
| Kit | Inte hittad | Ja | Ja: v4 med tagg/sekvens (ej gratisplan) |
| Mailchimp | Inte hittad | Ja | Ja: PUT-upsert, journey-trigger OVERIFIERAT |
| Loops/Resend/Buttondown | Inte belagt | Ja | Ja |
| Mailjet | Webhooks ut, inkommande ej belagt | Ja | API finns, automation på dyrare plan |

Slutsats: en serverless-funktion mellan Repejo och tjänsten är den robusta vägen oavsett val, eftersom Repejos signering, retry och payload inte är verifierade. Funktionen kan kontrollera signaturen, filtrera bort dubbletter och bara skicka vidare den e-post och det medgivande som faktiskt finns.

## GDPR: fadderns e-post från Repejo och Prenumeration

- Fadderns e-post kommer in via Repejos kassa i samband med betalning. Att personen har betalat är inte ett medgivande till Nyheter med e-post. **Prenumeration måste vara ett separat, uttryckligt och inte förkryssat Medgivande** (GLOSSARY.md: "Är aldrig förkryssat"). Det gäller även om personen just blivit fadder.
- Konsekvens för automationen: webhooken ska inte lägga alla nya faddrar i prenumerationslistan. Om Repejos kassa inte kan samla in ett eget nyhetsmedgivande ska funktionen antingen (a) skapa kontakten i en separat, icke-prenumerationslista och skicka dubbel opt-in-förfrågan, eller (b) inte skapa något alls förrän personen anmält sig via formuläret på sajten.
- Onboarding-mejl till en ny fadder (välkomsttext, vad som händer härnäst) är en annan sak än Nyheter med e-post. Om det är ett meddelande som hör till själva fadderskapet kan rättslig grund och regler vara annorlunda än för en prenumeration. **Det är en juridisk bedömning som inte gjorts här** och som föreningen bör få bekräftad (till exempel av IMY:s vägledning eller en jurist). Inga svenska rättskällor är hämtade i den här undersökningen.
- Repejo och e-posttjänsten blir två personuppgiftsbiträden för samma person. Föreningen behöver DPA med båda, och uppdatera integritetstexten med vad som förs över och till vem. Detta är föreningens beslut.
- Avanmälan: varje utskick ska ha avanmälningslänk. Brevo och MailerLite hanterar avregistrering; MailerLite kan inte återaktivera avregistrerade via API, vilket är rätt beteende för att inte lägga tillbaka en avanmäld person genom en webhook.

## Öppna frågor och risker

1. **Repejos webhook** är helt overifierad (händelser, payload, signering, retry, medgivandefält). Blockerar valet mellan direkt koppling och mellanled.
2. **Brevos inkommande webhooks:** utrullning och planbehov oklart. Kontrollera om kontot har funktionen innan den ligger till grund för beslutet.
3. **Brevo, automation på gratisplanen:** sammanfattningarna anger 2 000 kontakter på en jämförelsesida, 300 på en annan, och att automation ingår i Standard (hjälpsidan). Klarlägg om onboarding-serien kräver Standard (18 USD/mån).
4. **MailerLites gratisplan** (250 prenumeranter, 2 500 mejl) och planernas namn stämde inte mellan sidorna. Kontrollera pris vid 500 prenumeranter och vilken plan som ger automation.
5. **Egna typsnitt i mejl:** båda toppkandidaterna kräver en publik CSS/@font-face-URL eller Google Fonts-länk. Föreningens typsnitt ligger egenhostade (Fontsource), och att länka dem från mejl kräver en publik adress; det innebär ett tredjepartsanrop från mejlet till föreningens egen domän, inte till Google. Brevo och MailerLite varnar för att vissa e-postklienter ignorerar webbtypsnitt, så fallback (system-sans) och färger måste bära designen.
6. **Svenskt gränssnitt och svenska anmälningsmejl** gick inte att belägga för någon tjänst. Egna mallar på svenska för bekräftelsemejlet är möjligt hos Brevo (egen DOI-mall) men inte belagt hos MailerLite.
7. **Leveransbarhet:** ingen primärkälla med mätbara siffror hämtades. Bedöm inte på marknadsföringspåståenden. Föreningen bör sätta upp SPF, DKIM och DMARC på egen avsändardomän, oavsett tjänst (allmän branschpraxis, inte hämtad här).
8. **Underbiträden:** Brevos nuvarande underbiträdeslista och MailerLites DPA-version ska kontrolleras mot aktuell fulltext.
9. **Betyg** är sekundära och inkonsekventa mellan ögonblicksbilder.
10. **Valuta/moms:** priser är i USD eller EUR enligt sammanfattning, ofta exkl. moms. Ingen omräkning gjord.

## Anteckning: koppling i `src/lib/prenumeration.ts`

Inget implementeras här. Sajten är statisk och har inga tredjepartsanrop, och API-nycklar får inte ligga i webbläsaren.

- `skickaPrenumeration` är den enda platsen där en Prenumeration lämnar sidan (se filens kommentar). Där ändras bara den funktionen och typen `Svar`; formulärets tackmeddelande ska säga vad de nya svaren betyder.
- Anropet från formuläret bör gå till en egen serverless-funktion (valfri leverantör, föreningens val) som håller API-nyckeln och anropar tjänstens API (till exempel Brevos DOI-endpoint eller MailerLites upsert med `Double opt-in for API and integrations` på). Funktionen svarar sidan med ny `Svar`-status, till exempel "väntar-på-bekräftelse".
- Repejos webhook är en annan väg in och ligger utanför `prenumeration.ts`. Den tas emot av samma eller en annan funktion som kontrollerar signaturen och skapar kontakten för onboarding, men lägger inte personen i prenumerationslistan utan separat Medgivande (se GDPR ovan).
- Ämnen (`amnen`) från formuläret kan mappas till grupper/listor/attribut i tjänsten, en per ämne, så att redaktörerna kan skicka en nyhet till rätt mottagare. Hur detta ska se ut är inte beslutat.
- Ändrad kontrakt kräver också att tester och tackmeddelandet uppdateras, och att integritetstexten säger vilket biträde som används.
