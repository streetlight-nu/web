# Externa tjänster som Repejo får anropas

Sajten hade regeln att den aldrig anropar tredje part. Julkampanjen ”Ge en julklapp” behöver en betalning och en insamlingsmätare, och föreningen samlar redan in med Repejo. Därför får en sida nu anropa en extern tjänst när en funktion kräver det. Repejo är det första fallet: sidan `/julklapp` laddar Repejos `checkout.js` och bäddar in `<repejo-checkout>` och `<repejo-progress-bar>`. Föreningen slipper bygga och sköta en egen betalning, och besökaren kan ge utan att lämna sidan.

Gränserna är:

- Bara en sida som behöver tjänsten anropar den. Startsidan, nyheterna och historien anropar ingenting utifrån.
- Webbläsartesterna har en tillåtelselista per sida (`tests/e2e/tredje-part.spec.ts`) för vad sajtens egen kod anropar. En ny tjänst eller en ny sida som anropar en tjänst läggs till där med flit. Testerna stubbar tjänsten, så de kontrollerar bara vår egen kod och inte vad tjänstens skript själv hämtar.
- Typsnitten ligger kvar på egen server via Fontsource (ADR 0002). Regeln gäller sajtens egen kod. På `/julklapp` kan vi inte garantera den, eftersom Repejos skript kan hämta typsnitt från Google (se nedan).
- Sidan säger vilken tjänst som används, och om sajten får en integritetssida ska tjänsten stå där.
- Under checkouten och mätaren finns alltid en länk till tjänstens egen sida, så att besökaren kan ge även när skriptet inte laddas eller slutar fungera efter att det har laddats.

Välj tjänster som tar GDPR på allvar. Det som besökaren fyller i Repejos formulär går till Repejo och aldrig till sajten.

## Vad Repejos skript själv hämtar

Vi kan inte ändra Repejos skript. Den 3 november 2026 hämtade vi `https://app.repejo.se/assets/checkout.js` (cirka 1,5 MB) och sökte efter värdar. Utöver `app.repejo.se` kan skriptet hämta eller leda till:

- `fonts.googleapis.com`: typsnittet Outfit. I den versionen fanns länken bara i Repejos andra element (till exempel topplistor och insamlingslistor), inte i de två som vi använder, men det kan ändras när Repejo uppdaterar skriptet.
- `js.stripe.com`: Stripe.js, för kortbetalning.
- `checkoutshopper-live.adyen.com` (eller `-test`): Adyens betalskript och stilmall.
- `app.bankid.com`: en länk som öppnar BankID-appen, när besökaren legitimerar sig med BankID.
- `connect.facebook.net`: Metas pixel (`fbevents.js`). Den laddas bara om föreningen eller kampanjen har ett pixel-id hos Repejo, och i checkouten bara när besökaren har gett samtycke till marknadsföringskakor. Den 3 november 2026 var pixel-id tomt både för föreningen och för kampanjen `TSpuB`.
- `api.qrserver.com`: QR-koder, bara i Repejos element för egna insamlingar (p2p).

Skriptet kan också skicka händelser till Google Tag Manager om kampanjen har ett GTM-id. Det var tomt samma dag.

## Öppen fråga till föreningen

Ska Metas pixel få användas på Streetlights sida? Den kan slås på i Repejo utan att sajten ändras. Föreningen bör bestämma att pixel-id ska förbli tomt, eller, om den ska användas, att det står på en integritetssida och att besökaren först ger samtycke.

## Övervägda alternativ

- **Bara en länk till Repejos kampanjsida**: inga anrop utifrån, men besökaren lämnar Streetlights sida och kampanjen ser inte ut som Streetlight.
- **En egen betalning med till exempel Stripe eller Swish**: mer att bygga och sköta för en liten ideell förening, och fortfarande en extern tjänst.
