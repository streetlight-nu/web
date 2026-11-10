---
name: Streetlight
description: En handvävd shemma-duk med en gatlykta. Vita och gröna fält, vävda band, och guld är ljuset.
colors:
  cotton: "#FBFBF8"
  white: "#FFFFFF"
  green: "#0E4A38"
  green-deep: "#093428"
  ink: "#0B2E24"
  ink-soft: "#3D5E53"
  mint: "#CFE3D8"
  gold: "#F4B400"
  light-high: "#FFDB73"
  light-mid: "#FFCF45"
  gold-soft: "#FFD45C"
  thread-red: "#D64527"
  thread-cobalt: "#1F4FA8"
  error: "#A52E15"
  rule: "rgba(11, 46, 36, 0.16)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Familjen Grotesk, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  quote:
    fontFamily: "Bricolage Grotesque, Familjen Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5.4vw, 4.6rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, Familjen Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  step:
    fontFamily: "Bricolage Grotesque, Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.6vw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 600
    lineHeight: 1.3
  ethiopic:
    fontFamily: "Noto Sans Ethiopic, Nyala, Abyssinica SIL, serif"
    fontSize: "3.2rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "3px"
  md: "4px"
  lg: "6px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "56px"
  section: "clamp(64px, 9vw, 120px)"
  wrap: "1180px"
components:
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "17px 26px"
    typography: "{typography.body}"
    height: "44px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cotton}"
    rounded: "{rounded.pill}"
    padding: "17px 26px"
    typography: "{typography.body}"
  button-line:
    textColor: "{colors.cotton}"
    rounded: "{rounded.pill}"
    padding: "17px 26px"
  button-line-ink:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "17px 26px"
  button-small:
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "13px 14px"
    typography: "{typography.body}"
  chip-todo:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "2px 10px"
    typography: "{typography.label}"
  photo-placeholder:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.mint}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: Streetlight

## Overview

**Creative North Star: "Duken och lyktan"**

Sidan är en handvävd shemma-duk. Rena vita bomullsfält och djupgröna fält växlar med hårda kanter och fogas ihop av vävda tibeb-band, som sömmarna i ett tyg. Mitt i duken står en gatlykta, och guldet är dess ljus. Ljuset är det enda som lyser på sidan. Det visar vägen till det viktigaste: att bli fadder, ljuset i lyktan och några få betoningsord på grönt.

Känslan är varm och stadig, aldrig flashig. Typografin är tung och nära i rubrikerna och lugn och läsbar i brödtexten. Tryckytorna är stora och sidan är skriven så att både äldre läsare och en förälder som läser med sitt barn hänger med. Det lilla formatet syns i detaljerna. Bandet med 20 ljus har exakt ett ljus per barn, och guldtråden binder ihop steg och tidslinjer som en tråd genom tyget.

Designen ersätter varumärkesguiden med Open Sans, #FFD200, #FF1736 och asfalt, och de tidigare varianterna ”Vägmärken i natten” (ADR 0002). Den ska inte återuppstå.

**Key Characteristics:**
- Fält i `cotton` och `green` som växlar med hårda kanter eller ett tibeb-band, aldrig toningar.
- Guld är ljuset och används sparsamt, bara för det viktigaste.
- Ljussken ritas i tre hårda steg, aldrig som toning.
- Bricolage Grotesque ExtraBold i rubriker och Familjen Grotesk i all löptext.
- Romben finns bara i vävningen: i band, markörer och knutar på guldtråden.
- Platt, med skugga bara på guldknappen och formulärpanelen.

## Colors

En palett av vit bomull, djup tibeb-grön och ett enda guldljus, med röd och kobolt som tråd i vävningen.

### Primary
- **Lyktans guld** (`gold`): ljuset. Den används till primärknappen (”Bli fadder”), det gula fadderfältet, ljusets nedersta steg och betoningsord på grönt (5,5:1). Fokusringen på gröna ytor är också guld.
- **Ljusets steg** (`light-mid`, `light-high`): ljusets mellersta och översta steg i loggan och lyktan. De används aldrig ensamma som ytfärg.
- **Mjukt guld** (`gold-soft`): överstrykning bakom nyckelord och hovringsmarkering under länkar.

### Secondary
- **Tibeb-grön** (`green`): sidhuvud, gröna fält och mörk logobakgrund. Text på den är `cotton`, och sekundär text är `mint` (7,6:1).
- **Djup tibeb-grön** (`green-deep`): sidfot, bandet med 20 ljus och fotoplatshållare. Sekundär text på den är `mint` (10,2:1).

### Tertiary
- **Röd tråd** (`thread-red`): kanter och rombkärnor i tibeb-banden, och kanten på ett ogiltigt fält. Den används aldrig som text eller knapp.
- **Koboltblå tråd** (`thread-cobalt`): tråd i banden och ämnesfärg för nyheter från föreningen. Den används bara i vävning och ämnesmarkörer.

### Neutral
- **Bomull** (`cotton`): sidans grund, en ren vit bomull. Den är aldrig gräddvit.
- **Vitt** (`white`): bara inmatningsfält och platshållarchips, så att de lyfter från bomullen.
- **Bläck** (`ink`): rubriker och brödtext på bomull och guld (14,2:1 på cotton, 7,9:1 på gold). Fokusring på ljusa och gula ytor.
- **Mjukt bläck** (`ink-soft`): sekundär text på bomull, som ingresser, datum och bildtexter (6,9:1).
- **Mint** (`mint`): sekundär text på grönt. Den används aldrig på bomull.
- **Linje** (`rule`): tunna avdelare mellan rader på bomull.
- **Fel** (`error`): felmeddelanden i formulär (6,75:1 på cotton).

### Named Rules
**The Ett ljus Rule.** Guld lyser bara på det viktigaste: Bli fadder, ljuset och betoningsord på grönt. Om två saker i samma vy är guld måste den ena bli något annat.

**The Hårda kanter Rule.** Fälten växlar med en hård kant eller ett tibeb-band. Inga toningar mellan ytor och inga färgade glödskenor.

**The Tråden är ingen text Rule.** `thread-red` och `thread-cobalt` finns bara i vävningen och i ämnesmarkörer, aldrig i text, knappar eller ikoner.

## Typography

**Display Font:** Bricolage Grotesque (med Familjen Grotesk, system-ui)
**Body Font:** Familjen Grotesk (med system-ui)
**Label/Mono Font:** Noto Sans Ethiopic, endast för ብርሃን

**Character:** En tung, nära grotesk med lite handgjord kant i rubrikerna, mot en vänlig och öppen grotesk i brödtexten. Rubrikerna talar högt och kort, och texten under pratar som en vän.

Alla tre typsnitten ligger på egen server via Fontsource. De laddas aldrig från Google Fonts (GDPR).

### Hierarchy
- **Display** (800, `clamp(3rem, 7.4vw, 6rem)`, 0,95): endast startsidans huvudrubrik.
- **Quote** (800, `clamp(2.2rem, 5.4vw, 4.6rem)`, 1,02): visionscitatet, med rader på högst 17 tecken.
- **Headline** (800, `clamp(2.1rem, 4.6vw, 3.6rem)`, 1,02): avsnittsrubriker (h2) och undersidornas h1.
- **Title** (800, 1,5rem, 1,15): kort- och listrubriker, formulärrubrik och ordmärket i menyn.
- **Step** (600, 1,4rem, 1,3): stegen längs guldtråden.
- **Lede** (400, `clamp(1.15rem, 1.6vw, 1.35rem)`, 1,6): ingress under en avsnittsrubrik, högst 58 tecken per rad.
- **Body** (400, 18 px, 1,6): all löptext, 52–75 tecken per rad.
- **Label** (600, 15,7 px, 1,3): formuläretiketter, datum, ämnen och menyknappar. Det är den minsta textstorleken på sidan.
- **Ethiopic** (600, Noto Sans Ethiopic): ብርሃን (”ljus” på amhariska), alltid i guld med uttalet under: ”uttalas birhan”.

### Named Rules
**The Aldrig under 18 Rule.** Brödtext är 18 px och aldrig mindre, även på mobil. Etiketten är den enda mindre storleken.

**The Färg, inte kursiv Rule.** Betoning görs med färg (guld på grönt) eller överstrykning i `gold-soft`, aldrig med kursiv.

**The Balanserade rubriker Rule.** Rubriker har negativ spärrning och `text-wrap: balance`. Stycken har `text-wrap: pretty`.

## Layout

Innehållet ligger i en centrerad spalt som är högst 1180 px bred (`band-inner`). Sidmarginalen är minst 16 px och följer telefonens säkra zon (`env(safe-area-inset-*)`). Fälten går alltid i full bredd, och bara innehållet hålls i spalten.

Ett avsnitt har `clamp(64px, 9vw, 120px)` luft upptill och nedtill. Inom ett avsnitt används en 4-baserad skala: 4, 8, 12, 16, 24, 32 och 56 px. Det är tätt inom en grupp (8–16 px mellan etikett och fält eller rubrik och ingress) och generöst mellan grupper (32–56 px).

Den viktigaste brytpunkten är 901 px. Över den lägger sig avsnitt i två spalter (`minmax(0,0.9fr) minmax(0,1.1fr)`) och menyn ligger i en rad. Under 900 px staplas spalterna och menyn fälls ihop bakom knappen ”Meny”. Mindre justeringar sker vid 520 och 400 px, där logotypen krymper och mellanrummen stramas åt. Sidfoten har en spalt på mobil, två från 521 px och tre från 901 px. Under spalterna ligger en rad med ”Streetlight” och årtalet (utan ©) och organisationsnumret till vänster och ”Följ oss” med Facebook och Instagram till höger. Länkarna har ritade linjeikoner i textens färg, aldrig i guld eftersom ብርሃን är sidfotens ljus. Samma länkar står som ”Följ oss på Facebook” och ”Följ oss på Instagram” sist i uppgifterna under Kontakt på Om föreningen. Adresserna fylls i bland föreningsuppgifterna, och saknas en visas ”länk fylls i”.

### Named Rules
**The Listor, inte kort Rule.** Det som något består av visas som en lista mellan tjocka bläcklinjer (Ledger), inte som ett rutnät av likadana kort.

## Elevation & Depth

Duken är platt. Djup visas med färgfält och vävda band, inte med skuggor. Två saker får lyfta: guldknappen, som ska kännas som något man kan trycka på, och formulärpanelen på det gula fältet. Båda skuggorna är neutrala och mörkgröna med en förskjutning nedåt, aldrig ett färgat sken.

### Shadow Vocabulary
- **Knapp** (`box-shadow: 0 6px 18px -8px rgba(4, 24, 18, 0.55)`): guldknappen i vila.
- **Panel** (`box-shadow: 0 24px 60px -30px rgba(11, 46, 36, 0.55)`): formulärpanelen på gult fält.

### Named Rules
**The Platt duk Rule.** Inga andra ytor får skugga. Behövs avgränsning används ett fält, ett band eller en linje.

## Shapes

Formerna är raka och vävda. Fält och band har räta kanter. Hörnen är nästan raka på det som bär innehåll: 3 px på chips, 4 px på fotoplatshållare och kort på grönt, och 6 px på formulärpanel och fält. Knappar och valchips är helt rundade (999 px), som det enda mjuka på sidan.

Romben är vävningens enhet. Den finns i tibeb-bandens mönster, som ljus i bandet med 20 ljus, som markör i Ledger och Steps och som knut på guldtråden. Den används aldrig som logotyp eller fristående ikon.

Lyktans ljus är en trapets i tre lika höga guldsteg, ljusast överst. Samma form blir pricken över i:et i ordmärket.

Guldtråden är en streckad guldlinje som är 3 px bred, med 14 px streck och 8 px mellanrum.

## Components

### Buttons
Varma och stadiga, med stora tryckytor som är lätta att träffa.
- **Shape:** helt rundade (999 px), med en kant på 2 px och minst 44 px hög.
- **Gold (primär):** guld med bläcktext, 17 × 26 px padding och knappskugga. Det finns en per vy och område, och den används för ”Bli fadder” och det viktigaste steget.
- **Ink:** bläck med bomullstext. Den används för att skicka formulär.
- **Line:** genomskinlig med en bomullskant på 55 %. Den används för sekundära val på grönt.
- **Line-ink:** genomskinlig med bläckkant. Den används för sekundära val på ljust.
- **Small:** 12 × 20 px padding med etikettstorlek, till exempel ”Bli fadder” i menyn.
- **Hover / Focus:** guld och bläck lyfter 2 px under 300 ms med `cubic-bezier(0.16, 1, 0.3, 1)`. Line-varianterna fyller i en svag ton i stället. Fokus är en ring på 3 px med 3 px luft: bläck på ljusa ytor och guld på grönt.
- **Pil:** en knapp som leder vidare kan ha en ritad pil efter texten (18 px, linje 2 px med runda ändar, i textens färg). Den är dekorativ och döljs för skärmläsare.

### Chips
- **”Fylls i” (`sl-todo`):** en streckad bläckkant på 2 px, 3 px hörn och vit bomull på 45 %. På grönt är kanten mint och texten bomull. Chipet markerar ett faktum föreningen inte har gett än, i stället för att något hittas på. Skriv vad som saknas, till exempel ”nummer fylls i”.

### Cards / Containers
- **Ledger (i stället för kort):** en 3 px bläcklinje upptill och nedtill och 1,5 px linjer mellan raderna, med 26 px luft per rad. Varje rad har en vävd rombmarkör: guld med röd, kobolt eller grön kärna.
- **Fotoplatshållare (`sl-photo`):** djupgrön yta i 16:9, 4 px hörn och en streckad guldkant (55 %) inskjuten 10 px. Lyktan visas i mint och guld med en text om vilket foto som ska in. Ett påhittat foto används aldrig i stället.

### Inputs / Fields
- **Style:** vitt fält, en kant på 2 px i bläck (28 %), 6 px hörn, 13 × 14 px padding och 18 px text. Markören (caret) är röd tråd.
- **Focus:** kanten blir grön och får en grön ring på 3 px med 2 px luft.
- **Error:** kanten blir `thread-red` (`aria-invalid`) och meddelandet står i `error`.

### Navigation
- **Style:** ligger på grönt sidhuvud, med logotypen till vänster och länkarna ”Om oss”, ”Nyheter” och ”Frågor” i etikettstorlek i bomull. ”Bli fadder” är en liten guldknapp. På en sida vars eget huvudsteg är guld blir den en linjeknapp (The Ett ljus Rule): på startsidan, där heron har sin guldknapp ”Bli fadder”, och på julkampanjens sida med ”Ge en julklapp”. På Stöd oss, dit knappen leder, är den också en linjeknapp och markeras som aktuell sida.
- **Säsong:** medan julkampanjen pågår finns länken ”Ge en julklapp” sist i menyn, som en smal pill med 2 px bomullskant och en liten pil. Vid hovring, fokus och på kampanjsidan fylls pillen med bomull från vänster under 450 ms och texten blir bläck, och pilen flyttar sig 3 px åt höger. Med reducerad rörelse byter bara färgen. Föreningen slår på och av länken i Pages CMS.
- **States:** hovring ger understrykning. Aktuell sida markeras med `aria-current`.
- **Mobile:** under 900 px fälls länkarna ihop bakom knappen ”Meny”. Escape stänger och lämnar fokus tillbaka på knappen.

### Sidfot
Sidfoten ligger på djupgrönt under det fulla tibeb-bandet, med brödtext i 18 px och `mint`. Ordningen är densamma i alla bredder: loggan med en mening om föreningen och ብርሃን, sedan ”Stöd oss”, sedan ”Webbplatsen”. Fadderskapet kommer före webbplatslänkarna eftersom det är sidans viktigaste väg.
- **Stöd oss:** en mening och därefter ”Bli fadder” som liten linjeknapp, med textlänken ”Swisha en gåva” bredvid. Knappen är aldrig guld i sidfoten (The Ett ljus Rule).
- **Webbplatsen:** en egen navigering med etikett. Varje länk är en hel rad på 44 px.
- **Länkar:** `mint` i vila. Vid hovring blir texten bomull och får en understrykning i `gold-soft`.
- **Rubriker:** bomull, 1,1rem Bricolage ExtraBold, 12 px ovanför sitt innehåll.
- **Luft:** 56 px under bandet och 48 px mellan grupperna. ብርሃን står 24 px under beskrivningen.
- **Nederkant:** en tunn mintlinje (20 %) och en rad i etikettstorlek. Till vänster står ”Streetlight 2026” (namnet och innevarande år, utan ©-tecken) och organisationsnumret, till höger ”Följ oss” med Facebook och Instagram (se Layout). Numret kommer från föreningsuppgifterna, och saknas det står chipet ”nummer fylls i”.

### Bli fadder-dockan
På 900 px och smalare ligger en guldknapp ”Bli fadder” i full bredd fast längst ner på startsidan, inom räckhåll för tummen. Dockan är grön med en 3 px guldlinje upptill och följer telefonens säkra zon. Den glider upp (350 ms, `cubic-bezier(0.16, 1, 0.3, 1)`) bara när toppens huvudknapp har rullat ur bild och det gula fadderfältet ännu inte syns, så att det aldrig finns två guldknappar i samma vy. När den är dold ligger den utanför tabbordningen, och utan JavaScript syns den inte alls.

### Repejos ram
Repejos formulär och insamlingsmätare ritas av Repejos eget skript. Vi reserverar platsen i förväg (480 px för formuläret och 56 px för mätaren) så att sidan inte hoppar. Tills skriptet har laddat visar ytan en streckad kant på 2 px i textens färg, 6 px hörn och en text om vad som ska synas där. Under formuläret finns en reservlänk på 44 px, ”Fungerar inte betalningen?”, i halvfet understruken text.

### Tibeb-band (signatur)
Den vävda bården är sidans fog och går alltid i full bredd. Det fulla bandet (46 px) har röda och vita kanter och guldromber med röd kärna på grönt. Det markerar stora skiften och sitter ovanför sidfoten. Det tunna bandet (22 px) har guldkant och röda romber och markerar mindre skiften, till exempel in i det gula fadderfältet.

### Ljusbandet med 20 ljus (signatur)
Bandet ligger under startsidans topp och har exakt 20 guldromber, ett ljus per fadderbarn, följt av raden ”20 barn, 20 ljus.” på djupgrönt. Antalet är en del av budskapet och ändras bara om antalet barn ändras. Ljusen tänds ett i taget med 90 ms mellanrum när bandet syns.

### Julkampanjen på startsidan
En kompakt rad direkt under ljusbandet, på djupgrönt och skild från raden ”20 barn, 20 ljus.” med en tunn mintlinje. Den har en ritad adventsljusstake vars fot är ett tibeb-band, med fyra bomullsvita ljus och lågor i ljusets tre guldsteg. Under advent brinner lika många ljus som det har varit adventssöndagar, med en etikett som ”Andra advent, två ljus är tända.”, och resten tänds när man pekar på eller fokuserar knappen. Utanför advent, utan JavaScript och med reducerad rörelse brinner alla fyra. Under ljusen räknas dagarna ner till julafton, morgonen då julkortet kommer fram: siffran i Bricolage ExtraBold i bomull (aldrig guld, eftersom guldet är lågornas) med ”dagar kvar till julafton” i etikettstorlek. Siffran vänder ner de sista nio stegen när raden syns, och på julafton står det ”God jul!”. Nedräkningen syns från 1 november; före det, efter julafton och utan JavaScript syns den inte. En sida som står öppen går vidare till nästa dag vid midnatt. På mobil står ljusen och nedräkningen bredvid varandra på en egen rad ovanför rubriken. Raden har också en rubrik i Title-storlek, en ingress i mint och en linjeknapp, ”Ge en julklapp”. Den får aldrig guld eller en Headline-rubrik, eftersom ”Bli fadder” är startsidans enda guldknapp. Fadderskapet är det regelbundna stödet och julklappen en gåva i jul. Raden syns bara medan föreningen har slagit på julkampanjen.

### Guldtråden (signatur)
Guldtråden är en streckad guldlinje som binder ihop steg och tidslinjer på grönt, med en guldromb vid varje steg. Medan man läser fylls guldet i bakom strecken och varje steg tänds när läsaren når det. Utan JavaScript eller med reducerad rörelse visas tråden i färdigt läge.

### Logotyp
Märket är en gatlykta ritad med en enda linje på ett rutnät om 80 × 80, med ljuset i tre guldsteg. Ordmärket ”streetlight” sätts i gemener som text i Bricolage Grotesque ExtraBold med −4,5 % spärrning, och pricken över i:et är ett litet guldljussken. Stolpen är `cotton` på grönt och `ink` på ljust.

## Do's and Don'ts

### Do:
- **Do** låt fälten växla mellan `cotton` och `green` med en hård kant eller ett tibeb-band.
- **Do** spara guldet till ett ljus per vy: Bli fadder, lyktan eller ett betoningsord på grönt.
- **Do** rita ljussken i tre hårda steg: `light-high`, `light-mid`, `gold`.
- **Do** håll brödtexten på minst 18 px, kontrasten på minst 4,5:1 och tryckytorna på minst 44 px.
- **Do** använd fokusringen bläck på bomull och guld, och guld på grönt.
- **Do** tema webbläsarens egna ytor: markerad text är guld med bläck, rullningslisten grön på bomull och markören i textfält röd tråd.
- **Do** markera det som saknas med chipet ”fylls i” eller fotoplatshållaren.
- **Do** visa allt i färdigt läge med reducerad rörelse. Rörelse förklarar och dekorerar inte.

### Don't:
- **Don't** använd toningar mellan ytor, gräddvit bakgrund eller färgade glödskenor.
- **Don't** sätt guld på guld, varken som text eller som fokusring.
- **Don't** använd `thread-red` eller `thread-cobalt` till text, knappar eller ikoner.
- **Don't** använd romben som logotyp eller fristående ikon. Den finns bara i vävningen.
- **Don't** betona med kursiv.
- **Don't** bygg sidor av rutnät med likadana kort. Använd Ledger, Steps eller guldtråden.
- **Don't** använd emoji eller en ikonuppsättning. De få ikonerna ritas som SVG med samma linjetjocklek.
- **Don't** ladda typsnitt från tredje part i vår egen kod, men en extern tjänst får anropas, som Repejo för julkampanjens betalning. Repejos skript kan själv hämta typsnitt och andra tjänster (ADR 0003).
- **Don't** återinför varumärkesguidens Open Sans, #FFD200, #FF1736 eller asfaltslooken.
