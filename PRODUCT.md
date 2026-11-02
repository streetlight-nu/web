# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Den viktigaste besökaren är en svensk som funderar på att bli fadder. Hen har hört talas om Streetlight, kanske via någon i föreningen, och vill förstå vilka vi är, vart pengarna går och om stödet faktiskt når fram innan hen anmäler intresse.

De blivande faddrarna finns i två grupper:

- **Äldre läsare** som vill ge regelbundet och behöver en text som är lätt att läsa och en sida som är lätt att använda.
- **Barnfamiljer** som vill lära sina egna barn att vara givmilda och tänka på andra. Föräldrarna läser ofta sidan tillsammans med barnen, så texten och berättelserna ska gå att dela med ett barn. De ska förklara vad stödet gör för fadderbarnen, utan att fadderbarnen blir föremål för medlidande.

I andra hand kommer befintliga faddrar och medlemmar, som läser nyheter, följer arbetet och hittar till årsmöte och årsredovisning.

## Product Purpose

Webbplatsen ska få nya faddrar och berätta om arbetet. Streetlight Sverige är en ideell förening som samlar in pengar och stöttar arbetet i Etiopien. Streetlight Etiopien är en fristående ideell förening med egen styrelse som bär arbetet med barnen och familjerna på plats i Addis Abeba. Tillsammans stöttar de 20 fadderbarns skolgång och deras familjer.

Webbplatsen gör sitt jobb när en besökare som funderar på att bli fadder skickar en intresseanmälan, och när faddrar och medlemmar litar på att de vet vad som händer.

## Positioning

Små med flit. Det är 20 barn och 20 ljus, inte tusentals. Föreningen känner varje familj, och stödet når fram. Barnen väljs ut tillsammans med de lokala myndigheterna i Addis Abeba. Två föreningar med var sin styrelse gör ett gemensamt arbete. En stor fadderorganisation kan inte säga samma sak och mena det.

## Operating Context

- En fadder stöttar normalt alla 20 fadderbarnen tillsammans. Varianten ”fadder för ett barn” finns också.
- Första steget är en intresseanmälan, och sedan hör föreningen av sig.
- Redaktörer i föreningen skriver nyheter i Pages CMS utan att kunna programmera (se `docs/redaktorer.md`). Det de sparar committas direkt till `master`.
- Föreningsuppgifterna (organisationsnummer, 90-konto, Swish, kontaktperson, e-post, årsredovisning) fylls i av föreningen i `src/data/foreningsuppgifter.json` och skrivs aldrig in av komponenter.

## Capabilities and Constraints

- Statisk sajt byggd med Astro, React-öar, shadcn/ui och Tailwind v4 (ADR 0001).
- Inga anrop till tredje part. Typsnitten ligger på egen server via Fontsource (GDPR), och ett test kontrollerar det.
- Nyheter har exakt fyra ämnen: Rapport från Addis Abeba, Nyhet från föreningen, Berättelse från en familj och Tack till faddrarna.
- Ett formulär som inte är kopplat ska säga det, även i tackmeddelandet.
- Begrepp och ord som ska undvikas står i `GLOSSARY.md`.

## Brand Commitments

- Designsystemet ”Streetlight Designsystem” gäller och ersätter den äldre varumärkesguiden (ADR 0002).
- Svenska, enkelt och nära, som en medlem som pratar med en vän. Korta meningar och aktiv form.
- Ord vi använder: fadder, fadderbarn, föreningen, Addis Abeba, nyheter (inte ”blogg”) och ”håll ljusen tända”.
- Värdighet: barn och familjer är människor med en framtid, aldrig föremål för medlidande.

## Evidence on Hand

- Föreningen har foton med samtycke från familjerna. De är ännu inte inlagda på sajten.
- Föreningen har fakta om historien sedan 1995: årtal och händelser. De är ännu inte inskrivna, och tidslinjesidan använder platshållare tills de finns.
- Belopp och siffror saknas, till exempel vad ett fadderskap kostar och hur pengarna fördelas. De får inte hittas på och markeras med chipet ”fylls i”.
- Exempelinlägg i Nyheter är påhittade och tydligt märkta ”Exempel”. De tas bort när föreningens egna inlägg finns.

## Product Principles

1. **Hitta aldrig på.** Inga siffror, citat, årtal eller löften som föreningen inte har gett. Det som saknas syns som platshållare.
2. **Samtycke först.** Ingen bild eller berättelse om ett fadderbarn eller en familj publiceras utan familjens samtycke.
3. **Närhet framför skala.** Det lilla formatet är styrkan. Visa att vi känner familjerna, inte hur stora vi är.
4. **Ärlighet i varje läge.** Formulär, tomma fält och exempel säger vad de är.
5. **Lätt för föreningen att sköta.** Innehåll ska kunna uppdateras av redaktörer utan programmering.

## Accessibility & Inclusion

WCAG 2.1 AA. All text har minst 4,5:1 i kontrast, brödtexten är minst 18 px även på mobil och tryckytor är minst 44 px. Varje vy har en h1 och en hopplänk till innehållet. Sidan ska fungera för äldre läsare, och för en förälder och ett barn som läser tillsammans.
