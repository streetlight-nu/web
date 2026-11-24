# Sajten laddar Google Tag Manager efter Kakval

Föreningen vill veta hur många av dem som besöker sajten som blir faddrar eller ger en gåva. Repejo skickar sina händelser (`begin_checkout`, `add_payment_info` och `purchase`) till `window.dataLayer`, i GA4:s format, men bara när besökaren har godkänt marknadsföringskakor. Repejos egen instrumentpanel visar nya månadsgåvor och engångsgåvor, men ingen konverteringsgrad och ingen uppdelning per checkout. För inbäddade checkouter laddar Repejo inte containern åt oss. Den måste finnas på sajten.

Därför laddar sajten själv föreningens Google Tag Manager-container (id i `src/data/matning.json`) och mäter med GA4. Det är sajtens första egna anrop till en tredje part, och det sker bara efter att besökaren har accepterat i Kakrutan (se Kakval och Kakrutan i `GLOSSARY.md`).

- **Före ett val laddas ingenting.** Avvisa laddar ingenting heller. Valet sparas i `localStorage` och går att ändra med länken Kakval i sidfoten. Ett nytt val laddar om sidan, så att Repejos checkout och containern alltid utgår från samma val.
- **Repejo får veta samtycket.** Efter Acceptera sätter sajten attributet `user-has-consented-to-marketing-cookies="true"` på Repejos element. Då skickar Repejo sina händelser. Skriptet ligger sist i `body`, före Repejos `defer`-skript, så att attributet finns när `checkout.js` startar.
- **Tomt id betyder ingen mätning.** Utan `gtmId` visas ingen ruta, ingen länk och inget laddas.
- **Ingen persondata.** Vi slår inte på Repejos `user_data` (hashad e-post och telefon) och inte reläet via Measurement Protocol. Vi mäter antal och belopp, inte vem som gav.
- **Konverteringarna skiljs åt utan egen kod.** `donation_type` `recurring` på `/bli-fadder` är en ny fadder, `onetime` på `/bli-fadder` är en Swish-gåva från en givare och `onetime` på `/julpaket` är ett julpaket. Repejo lägger ingen kortkod i dataLayer, så vi skiljer på sidans adress i GA4. Om en checkout flyttas till en annan sida ändras mätningen, och då ska GA4-målen ses över.

## Övervägda alternativ

- **Bara Repejos instrumentpanel**: ingen ny tredje part, men ingen konverteringsgrad och ingen koppling mellan besök och gåvor.
- **Ett kakfritt verktyg som Plausible**: skulle inte se något av det Repejo skickar, eftersom Repejo kräver samtycke till marknadsföringskakor.
- **Cookiebot eller liknande**: Repejo läser det automatiskt, men det är en ny extern tjänst och troligen en månadsavgift.
- **Att ladda containern direkt, som Googles standardsnippet**: besökaren mäts innan hen har valt något.

## Öppna frågor

- Repejo dokumenterar inte om samtyckesattributet fungerar på alla deras element eller om det går att ändra efter att elementen har startat. Därför laddas sidan om vid ett nytt val.
- Containern kan ladda vad föreningen lägger in i Google Tag Manager, inte bara GA4. Det som föreningen lägger dit omfattas inte av byggets kontroller. Föreningen bör som med Metas pixel (ADR 0003) bestämma att inget annat än GA4 läggs i containern, eller skriva det på en integritetssida.
