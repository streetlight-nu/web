# Externa tjänster som Repejo får anropas

Sajten hade regeln att den aldrig anropar tredje part. Julkampanjen ”Ge en julklapp” behöver en betalning och en insamlingsmätare, och föreningen samlar redan in med Repejo. Därför får en sida nu anropa en extern tjänst när en funktion kräver det. Repejo är det första fallet: sidan `/julklapp` laddar Repejos `checkout.js` och bäddar in `<repejo-checkout>` och `<repejo-progress-bar>`. Föreningen slipper bygga och sköta en egen betalning, och besökaren kan ge utan att lämna sidan.

Gränserna är:

- Bara en sida som behöver tjänsten anropar den. Startsidan, nyheterna och historien anropar ingenting utifrån.
- Webbläsartesterna har en tillåtelselista per sida (`tests/e2e/tredje-part.spec.ts`). En ny tjänst eller en ny sida som anropar en tjänst läggs till där med flit, och testerna stubbar tjänsten så att de inte behöver nätet.
- Typsnitten ligger kvar på egen server via Fontsource (ADR 0002). Ett typsnitt från en annan värd får testet att fallera, även på en sida som får anropa en tjänst.
- Sidan säger vilken tjänst som används, och om sajten får en integritetssida ska tjänsten stå där.
- Om tjänstens skript inte laddas visar sidan en länk till tjänstens egen sida, så att besökaren kan ge ändå.

Välj tjänster som tar GDPR på allvar. Det som besökaren fyller i Repejos formulär går till Repejo och aldrig till sajten.

## Övervägda alternativ

- **Bara en länk till Repejos kampanjsida**: inga anrop utifrån, men besökaren lämnar Streetlights sida och kampanjen ser inte ut som Streetlight.
- **En egen betalning med till exempel Stripe eller Swish**: mer att bygga och sköta för en liten ideell förening, och fortfarande en extern tjänst.
