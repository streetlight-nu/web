---
name: Streetlight V2
description: Vägmärken i natten. A road at night lined with sign plates; each fact is a plate that shines where light reaches it.
colors:
  asfalt: "#424242"
  asfalt-djup: "#353535"
  vagbana: "#2f2f2f"
  linje: "#5c5c5c"
  stal: "#8d8d8d"
  gul: "#FFD200"
  gul-ljus: "#ffe04a"
  gron: "#B8E986"
  tejp-rod: "#c4001f"
  tejp-rod-djup: "#a8001a"
  tejp-vit: "#f2f2f2"
  reflex-slackt: "#8a7a2a"
  vit: "#FFFFFF"
  vit-dov: "rgba(255, 255, 255, .86)"
typography:
  display:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5.3vw, 5.1rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.008em"
  headline:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)"
    fontWeight: 300
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline-plate:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  place-name:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.005em"
  place-name-amharic:
    fontFamily: "Noto Sans Ethiopic, Nyala, Kefa, Abyssinica SIL, sans-serif"
    fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)"
    fontWeight: 600
  title:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title-small:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(1.1rem, 1.9vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.2
  lead:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.25vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
rounded:
  post: "4px"
  sm: "8px"
  arrow: "10px"
  plate: "14px"
  plate-lg: "22px"
spacing:
  pad: "clamp(1.25rem, 5vw, 4.5rem)"
  band: "clamp(5rem, 10vw, 8.5rem)"
  plate-border: "7px"
  plate-border-lg: "10px"
  post-width: "14px"
  container: "1240px"
components:
  sign-plate:
    backgroundColor: "{colors.gul}"
    textColor: "{colors.asfalt}"
    rounded: "{rounded.plate}"
    padding: "1.4rem 1.5rem"
  sign-plate-hero:
    backgroundColor: "{colors.gul}"
    textColor: "{colors.asfalt}"
    typography: "{typography.display}"
    rounded: "{rounded.plate-lg}"
    padding: "clamp(1.75rem, 3.6vw, 3.4rem) clamp(1.75rem, 4vw, 3.8rem)"
  supplementary-plate:
    backgroundColor: "{colors.vit}"
    textColor: "{colors.asfalt}"
    typography: "{typography.lead}"
    rounded: "{rounded.plate}"
    padding: "1.15rem 1.5rem 1.25rem"
  place-name-plate:
    backgroundColor: "{colors.gron}"
    textColor: "{colors.asfalt}"
    typography: "{typography.place-name}"
    rounded: "{rounded.plate}"
    padding: "clamp(1.8rem, 4vw, 3rem) clamp(1.6rem, 4vw, 3.2rem)"
  arrow-sign:
    backgroundColor: "{colors.gul}"
    textColor: "{colors.asfalt}"
    rounded: "{rounded.sm}"
    padding: "1.15rem 3.6rem 1.15rem 1.6rem"
  arrow-sign-hover:
    backgroundColor: "{colors.gul-ljus}"
  nav-plate:
    backgroundColor: "{colors.asfalt-djup}"
    textColor: "{colors.vit}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: ".5rem .9rem"
  nav-arrow:
    backgroundColor: "{colors.gul}"
    textColor: "{colors.asfalt}"
    rounded: "{rounded.sm}"
    padding: ".55rem 1.6rem .55rem 1rem"
  tape-label:
    backgroundColor: "{colors.tejp-rod}"
    textColor: "{colors.vit}"
    rounded: "{rounded.post}"
    padding: ".2rem .8rem"
  sign-post:
    backgroundColor: "{colors.stal}"
    rounded: "{rounded.post}"
    width: "14px"
---

# Design System: Streetlight V2

Scope: public/v2/index.html only. V1 (public/index.html) stays documented in DESIGN.md; the two systems share brand colors and Open Sans but not their world.

## Overview

**Creative North Star: "Vägmärken i natten" (road signs at night)**

The page is a road at night. The ground is asphalt, a darker road strip with a dashed white center line closes the hero and opens the footer, and every fact is mounted as a Swedish road-sign plate on steel posts: flat brand yellow with an inset asphalt border line and rounded corners, lettered in bold Open Sans. Directional facts become arrow-shaped signs, a table of school costs becomes a route-direction sign with pictograms, Addis Abeba is a green place-name sign, the two organisations are opposite arms on one post, and twenty delineator posts stand for twenty children.

Light is the only depth. Plates are night-dimmed at rest and brighten where light reaches them: a retroreflective prism pattern and a pale hot core follow the pointer on fine-pointer devices; on touch (and with reduced motion) the light is fixed at 50% / 32% of the viewport and the signs scroll past it. A streetlight arm enters the hero from the top-right and its pool always rests on the vision sign's upper-right corner. The twenty reflectors light up one by one when their row reaches the light.

Facts not yet supplied are never invented. They are covered signs: a plate crossed with red and white tape and a small "läggs till" label, the road-works convention for a sign not yet valid.

**Key Characteristics:**
- Asphalt ground, yellow sign plates with an inset asphalt border line, steel posts.
- Bold (700) lettering on plates, light (300) display on asphalt.
- Arrows, route numbers, delineators, posts and arms instead of cards, icons-in-circles or counters.
- Depth only as light: radial pools, plate sheen, reflector glow. No cast shadows.
- Missing facts shown as taped-over signs, never fabricated.
- Real logotype and flame symbol, extracted as vectors from the supplied brand style guide PDF.

## Colors

Night palette: three asphalt greys and steel for the street furniture, brand yellow for every plate, green reserved for Ethiopia, red only as tape.

### Primary
- **Sign Yellow** (gul): the material of every sign plate, the arrow signs, the route-number shield, lit reflectors, the "Bli fadder" band and the text-link arrow. Text on it is always asphalt.
- **Hot Yellow** (gul-ljus): hover state of yellow arrow signs only.

### Secondary
- **Ethiopia Green** (gron): the Addis Abeba place-name plate, the Etiopien arm sign and the chain markers in the authorities list. Nothing else.

### Tertiary
- **Tape Red** (tejp-rod) with **Tape Red Deep** (tejp-rod-djup) and **Tape White** (tejp-vit): only on covered signs and "läggs till" labels. The build uses this darker red instead of brand red #FF1736 so white label text stays legible (about 5.9:1).

### Neutral
- **Asphalt** (asfalt): page ground, all text on plates, the inset border line of plates.
- **Deep Asphalt** (asfalt-djup): nav plates, footer ground, the black band on delineator posts.
- **Road** (vagbana): the road strip carrying the dashed center line.
- **Verge Line** (linje): the ground line posts stand in.
- **Steel** (stal): sign posts, the crossing post, the streetlight arm.
- **Unlit Reflector** (reflex-slackt): delineator reflectors before the light reaches them.
- **White** (vit) and **Dim White** (vit-dov): headlines on asphalt; body copy on asphalt.

### Named Rules
**The Plate Material Rule.** Yellow is a material, not an accent: it appears as whole sign plates and arrow signs with asphalt lettering, never as yellow text on asphalt (the only exceptions are small arrow glyphs and lit reflectors, which are light sources).

**The Green Means Ethiopia Rule.** Green is used only for things that are in Ethiopia.

**The Red Means Not Yet Rule.** Red appears only as tape over facts that have not been supplied.

## Typography

**Display Font:** Open Sans (self-hosted 300/400/600/700, with system-ui, sans-serif)
**Place-name Font:** Noto Sans Ethiopic 600 for the Amharic place name only (Google Fonts subset of the glyphs used, with Nyala, Kefa, Abyssinica SIL fallbacks)

**Character:** One family doing two jobs. Bold Open Sans is sign lettering; light Open Sans is the night voice speaking on the asphalt between signs.

### Hierarchy
- **Display** (700, clamp 2.3 to 5.1rem, 1.04): the vision on the hero sign, max 16ch, balanced.
- **Headline** (300, clamp 2.1 to 3.6rem, 1.08, -0.02em): section headlines on asphalt, max 17ch.
- **Headline Plate** (700, same size, -0.025em): a headline set on a yellow surface (the Bli fadder band).
- **Place Name** (700, clamp 2.2 to 4rem, 1): place-name plates; Amharic below it at 600.
- **Title** (700, clamp 1.25 to 1.75rem, 1.2): rows on route-direction signs; arm signs use 700 at clamp 1.5 to 2.4rem.
- **Title Small** (700, clamp 1.1 to 1.5rem, 1.2): small roadside plates.
- **Lead** (400, clamp 1 to 1.1875rem, 1.5): the supplementary plate under the hero sign, max 52ch.
- **Body** (400, 1.125rem, 1.65; 1.0625rem under 520px): prose on asphalt in dim white, max 58ch.
- **Label** (600, 0.9375rem): nav plates, text links, footer.

### Named Rules
**The Weight Follows Surface Rule.** Type on a plate is 700; display type on asphalt is 300. A headline that moves onto a yellow surface becomes 700.

**The No Caps Rule.** Sign lettering is sentence case with no tracking added; no uppercase labels.

## Layout

Single column of full-width bands (vertical padding clamp 5 to 8.5rem) inside a 1240px container with fluid side padding (clamp 1.25 to 4.5rem). Most sections are a two-column split (text on one side, a mounted sign or a row of signs on the other) collapsing to one column at 860px. Signs stand on two posts placed 14 to 16% in from the plate edges, rising from a 3px verge line; rows of signs (covered signs, the three family signs) sit on a shared baseline with varied post heights, as if receding along a road. Posts shrink to 1.5rem when rows stack on mobile.

Hero: full viewport height; a 7.2 / 2.8 grid in a 1400px frame. Left: the vision sign, its posts, a white supplementary plate carrying the one-sentence lead, and posts continuing down to the road. Right: the arrow-shaped "Bli fadder" sign and a quieter dashed "Så arbetar vi" link, standing in the lamp light. The road strip (56 to 76px) closes the viewport. Under 860px the hero stacks and the lamp moves behind the sign.

Header floats over the hero: white logotype left; small route-style nav plates plus a yellow "Bli fadder" arrow right. The section plates hide under 1080px, leaving the logo and the arrow.

## Elevation & Depth

No cast shadows. Depth and emphasis come from light alone: a faint radial yellow pool on the asphalt that follows the light source (34vmax, 7% yellow), plate sheen (a pale radial core plus a 60-degree prism pattern masked to a 260px circle around the light), a darkened rim on plates away from the light, and glow halos on light sources (the lamp, lit reflectors, the destination sign). Inset box-shadows are used, but only to draw the border line of a plate, never to lift it.

### Shadow Vocabulary
- **Plate border line** (`box-shadow: inset 0 0 0 7px #FFD200, inset 0 0 0 10px #424242`): every yellow plate; 10px/14px on the hero sign, 6px/9px on small plates.
- **Destination glow** (`0 0 60px -10px rgba(255, 210, 0, .55)` added to the plate border): the last sign of a route only.
- **Reflector glow** (`0 0 12px 3px rgba(255, 210, 0, .7), 0 0 34px 6px rgba(255, 210, 0, .28)`): lit delineator reflectors.
- **Lamp glow** (`drop-shadow(0 0 18px rgba(255, 228, 92, .9))`): the streetlight lens.

### Named Rules
**The Retroreflection Rule.** Plates are night-dimmed at rest and brighten only where light reaches them. Any new sign takes the plate class so it joins the light.

**The Light Not Lift Rule.** Glows are light sources; nothing ever casts a shadow onto the asphalt.

## Shapes

Rounded rectangles (14px; 22px on the hero sign) with an inset border line read as sign plates. Arrow signs are clip-path pentagons with a 30px point (14px in the nav, 26px on arm signs), rounded only on the flat end. Posts are 14 to 16px steel bars with 4px corners. Delineators are white bars with a dark band and a small rounded reflector. Pictograms and arrows are solid filled SVG silhouettes in asphalt, sign-style, never outline icons. The road strip uses a 72px dash and 60px gap center line.

## Components

### Sign Plate
Flat yellow plate, asphalt lettering, inset asphalt border line, rounded 14px, with the retroreflective sheen layers. Variants: hero (22px radius, 10px border inset, flame symbol above the H1, fixed lamp pool on its upper-right), small roadside plate (title-small, centered), destination plate (adds glow), route-direction sign (large up arrow beside a list of pictogram rows divided by 3px asphalt rules), place-name plate (green).

### Supplementary Plate (tilläggstavla)
White plate with an inset asphalt border line, hung under a main sign on the same posts, inset 8% from its edges. Carries one short sentence in the lead style. Intentional deviation from the direction contract, which put the lead as plain text on asphalt.

### Arrow Sign (primary action)
Yellow pentagon pointing right with an inner asphalt border line following the arrow outline. Hover: hot yellow and a 6px slide in the arrow's direction (0.35s, cubic-bezier(.16, 1, .3, 1)). In the hero it stands to the right of the supplementary plate in the lamp light, an intentional deviation from the contract's placement below it. The nav carries a smaller version without the inner line.

### Nav Plates
Small deep-asphalt plates with a white inset border line, 600 label text. Hover turns the border line yellow.

### Text Link
Secondary action: 600 weight, 3px dashed white underline that turns solid on hover, a small yellow arrow glyph.

### Route Number and Delineators
A number set in an inline yellow route shield (10px radius, inset border line) inside a headline. Twenty delineator posts in a row; their reflectors light in sequence (90ms stagger) the first time the row enters the light, and are lit outright without JS or with reduced motion.

### Arm Signs
Two arrow signs on one central steel post pointing in opposite directions: yellow for Sweden, green for Ethiopia, with a short paragraph under each. On mobile the post moves left and both arms point right.

### Covered Sign and Tape Label
The placeholder convention. A plate crossed by two 22px red/white striped tapes at plus and minus 21 degrees, with a small yellow label naming the missing content and "läggs till". In running lists the placeholder is a small red diagonally striped tape label (white 600 text, rotated -1.5 degrees). A not-yet-usable action is a dashed asphalt outline button, disabled.

### Bli fadder Band
The section itself is a sign: a full-width yellow band with a thick inset asphalt border line; headline switches to 700, rules and focus outlines switch to asphalt.

## Do's and Don'ts

### Do:
- **Do** mount every fact on a plate with posts, or on an arrow, shield, delineator or arm; plates carry the 7px/3px inset border line and rounded 14px corners.
- **Do** let plates join the light: dimmed at rest, sheen and bright core where the pointer (or the fixed touch light) reaches them.
- **Do** set lettering on plates at 700 in asphalt and headlines on asphalt at 300 in white.
- **Do** show missing facts as covered signs or red tape labels reading "läggs till".
- **Do** use the real vector logotype and flame symbol from public/v2/assets/.
- **Do** keep the pointer light off for reduced-motion users and light reflectors outright.

### Don't:
- **Don't** cast shadows or lift plates; glow belongs only to light sources and the destination sign.
- **Don't** use green outside Ethiopia or red outside tape.
- **Don't** set yellow text on asphalt for content; yellow is plate material.
- **Don't** invent payment details, photos, quotes or figures to fill a covered sign.
- **Don't** use outline or circle-badge icons; pictograms are solid sign silhouettes.
