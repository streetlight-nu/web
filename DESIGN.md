---
name: Streetlight
description: A street at night with one lamp post as its spine; hope is light that reaches each section in turn.
colors:
  asphalt: "#424242"
  asphalt-deep: "#2f2f2f"
  asphalt-line: "#5e5e5e"
  road: "#383838"
  pole-grey: "#7a7a7a"
  lamp-yellow: "#FFD200"
  lamp-yellow-hover: "#ffe04a"
  ethiopia-green: "#B8E986"
  white: "#FFFFFF"
  white-dim: "rgba(255, 255, 255, 0.88)"
typography:
  display:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 5.4vw, 4.9rem)"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.8vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.65
    letterSpacing: "0.06em"
  body:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  wordmark:
    fontFamily: "Nunito Wordmark, Open Sans, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "10px"
  pill: "999px"
spacing:
  gutter: "88px"
  pad: "clamp(1.25rem, 5vw, 4.5rem)"
  band: "clamp(4rem, 8vw, 6.5rem)"
  gap: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.lamp-yellow}"
    textColor: "{colors.asphalt}"
    rounded: "{rounded.md}"
    padding: "1rem 1.9rem"
  button-primary-hover:
    backgroundColor: "{colors.lamp-yellow-hover}"
  button-text:
    textColor: "{colors.white}"
    padding: "1rem 0.25rem"
  pill-fadder:
    backgroundColor: "{colors.lamp-yellow}"
    textColor: "{colors.asphalt}"
    rounded: "{rounded.pill}"
    padding: "0.65rem 1.4rem"
  placeholder-todo:
    textColor: "{colors.asphalt}"
    rounded: "{rounded.sm}"
    padding: "0.1rem 0.7rem"
  spine:
    backgroundColor: "{colors.asphalt-deep}"
    width: "88px"
---

# Design System: Streetlight

## Overview

**Creative North Star: "The Lamp Post at Night"**

The page is a street after dark. A darker lamp-post gutter runs down the left edge as the spine; a flame-headed lamp travels it as the visitor scrolls, and each section is lit in turn by a soft pool of yellow on asphalt. Dark asphalt stands for the hardship the work answers; yellow is the light of hope, spent deliberately. Two sections are fully drenched in yellow, so the page alternates between night and lit street.

Density is calm and editorial: one wide column family, generous vertical bands, Light-weight headlines, no cards. Structure is drawn with hairlines, dashed rules and dots (the road's lane marking, a chain of lamps), not boxes. Depth comes from light, never from elevation.

Brand source: the palette and Open Sans come from the Streetlight brand style guide. The guide is inspiration, not a cage; the build departs from it where noted below.

**Key Characteristics:**
- Asphalt ground, one fixed darker spine, white text, yellow as light.
- Open Sans Light for headlines, Semibold and Bold for emphasis.
- Flame symbol (SVG, one shared symbol) is the only icon and the only bullet.
- Glow and radial pools instead of shadows or cards.
- Dashed asphalt-line rules for connection and unfinished things.
- Motion is light: slow lamp travel, a gentle flicker, lamps lighting in sequence.

## Colors

A two-voice night palette: neutral asphalt greys carry the page, one saturated yellow carries meaning, and a single green marks the Ethiopian organisation.

### Primary
- **Lamp Yellow** (#FFD200): the light. Primary button and pill fills, flame symbols, lit spine nodes, caret and selection, focus-adjacent glows, and the two drenched `light` bands (Familjerna, Bli fadder) where it becomes the background with asphalt text.
- **Lamp Yellow Hover** (#ffe04a): hover fill for the yellow button and pill only.

### Secondary
- **Ethiopia Green** (#B8E986): reserved for the Etiopien organisation (its top rule, its heading, and the arrival colour of the travelling dot). Nowhere else.

### Neutral
- **Asphalt** (#424242): page ground, text on yellow, dashed borders on yellow bands.
- **Deep Asphalt** (#2f2f2f): the spine gutter, the footer, the scrollbar track.
- **Asphalt Line** (#5e5e5e): dashed and hairline rules on the dark ground (lamp row baseline, chain, list dividers, placeholder slots).
- **Road** (#383838): the strip under the hero carrying the lane marking.
- **Pole Grey** (#7a7a7a): the lamp pole and base on the spine (inactive node dots use a neighbouring #8d8d8d, a one-off).
- **White** (#FFFFFF) and **Dim White** (rgba 255,255,255,.88): headlines and body text on asphalt.

### Named Rules
**The Light Is Rare Rule.** Yellow means light or the next action. On asphalt it appears as small glows, flames, one button and a pill; large yellow fields are limited to the two `light` bands.
**The One Green Rule.** Green belongs to the Ethiopian side of the organisation story and to nothing else.
**The Asphalt-On-Yellow Rule.** Text on yellow is always Asphalt, never white; the focus ring flips from white to Asphalt there.

## Typography

**Display / Body Font:** Open Sans (self-hosted TTF at 300, 400, 600, 700; fallback system-ui, sans-serif). Comes from the brand style guide.
**Wordmark Font:** Nunito Black Italic, loaded as "Nunito Wordmark", used only inside the logo.

**Character:** A friendly, humanist sans that goes quiet at large sizes (Light) and firm at small ones (Bold caps). Hierarchy is weight-led more than size-led.

### Hierarchy
- **Display** (300, clamp(2.6rem, 5.4vw, 4.9rem), 1.04, -0.02em): the single H1, the vision line.
- **Headline** (600, clamp(1.9rem, 3.8vw, 3rem), 1.12, -0.01em, max 20ch): section H2s. The statement band overrides to weight 300 at clamp(2rem, 4vw, 3.25rem) for the quiet declaration.
- **Title** (700, 1.25rem, uppercase, 0.06em): H3 organisation names.
- **Lead** (400, 1.25rem): the single hero sentence under the H1.
- **Body** (400, 1.125rem, 1.65; 1.0625rem under 520px; max 62ch, dim white on dark): section paragraphs.
- **List display** (300, clamp(1.35rem, 2.6vw, 2rem)): the school-needs list; the family steps use 600 at clamp(1.3rem, 2.4vw, 1.85rem).
- **Label** (700, 0.9375rem, uppercase, 0.05em): definition terms in the payment list.

### Wordmark (stand-in)
The wordmark is a stand-in: Nunito Black Italic with an SVG flame positioned over a dotless i, until the real Panton ExtraBold Italic logo file is supplied. Replace it with the supplied asset when it arrives; do not treat Nunito as a brand typeface. Footer uses a smaller 1.6rem size.

### Named Rules
**The Light-Weight Voice Rule.** Big type is Light (300). Weight rises as size falls.
**The Caps Are Headings Only Rule.** Uppercase with tracking appears on H3 titles and definition terms, which are real headings or terms, not decorative labels.

## Layout

A fixed 88px spine gutter on the left; main and footer are offset by it. Content sits in a 1180px centred wrap with fluid side padding (clamp 1.25rem, 5vw, 4.5rem). Sections are full-bleed bands with vertical padding clamp(4rem, 8vw, 6.5rem). The hero fills 100svh above a 64px road strip, with a large lamp SVG pinned right.

The workhorse pattern is a two-equal-column split (gap clamp 2.5rem to 6rem) of heading plus paragraph against a list. Other recurring forms: a 20-column row of flames, a three-column chain, a Sverige / link / Etiopien triad. Spacing is rhythmic rather than tokenised: 1rem, 1.5rem, 2rem, 2.5rem steps inside bands.

Responsive: at 960px the gutter collapses to zero and the spine becomes a 60px top bar (horizontal pole, nodes at 14% steps, no hover labels); splits stack; the lamp row goes to 10 columns (5 under 520px); the chain and organisation link turn vertical; the Bli fadder pill moves to the bottom right and hides over the hero and at the page end. The pill is always one tap away.

## Elevation & Depth

Flat and luminous. Surfaces do not lift; light does. Depth is conveyed by radial yellow pools on bands as they are reached, drop-shadow glows on flames, and tonal steps between asphalt, deep asphalt and road.

### Shadow Vocabulary
- **Flame glow** (`filter: drop-shadow(0 0 14px rgba(255,210,0,.75)) drop-shadow(0 0 4px rgba(255,210,0,.6))`): the lamp head on the spine; row flames use a lighter `0 0 10px rgba(255,210,0,.5)`.
- **Dot glow** (`box-shadow: 0 0 16px rgba(255,210,0,.6)`): chain nodes and the travelling dot.
- **Button hover bloom** (`0 10px 30px -8px rgba(255,210,0,.55)`): primary button on hover, with a 2px lift.
- **Pill ring** (`0 0 0 2px #424242, 0 8px 24px -8px rgba(0,0,0,.5)`): separates the fixed pill from any band beneath it.
- **Band light pool** (`radial-gradient(ellipse 60% 55% at 0% 40%, rgba(255,210,0,.24), transparent 70%)`): fades in on a section when the lamp reaches it.

### Named Rules
**The Glow, Not Shadow Rule.** Yellow things emit light outward in yellow; nothing casts a hard or offset shadow.

## Shapes

Soft but plain. Buttons and dashed slots use 10px corners; small tags and tooltips 6px; the skip link 8px; focus ring 4px; the pill is fully round; nodes and dots are circles. The flame is the signature silhouette. Lines are the structural device: 1px solid dividers, 2px dashed connectors, 3px dashed outlines and a 4px top rule on each organisation. Dashed means connection or not-yet-supplied.

## Components

### Buttons
- **Shape:** 10px radius, padding 1rem 1.9rem, Open Sans 700 at 1.0625rem.
- **Primary:** Lamp Yellow fill, Asphalt text.
- **Hover / Focus:** fill to #ffe04a, lifts 2px, yellow bloom. Focus is a 3px white outline at 3px offset (Asphalt on light bands).
- **Text link:** white, underlined with a 3px yellow rule at 6px offset; the rule turns white on hover.
- **Disabled (placeholder):** transparent, 3px dashed Asphalt border, `not-allowed` cursor, used while contact details are missing.

### Pill (Bli fadder)
Fixed top right, fully round, yellow with asphalt text and the pill ring. Fades out and nudges away at the end of the page (and over the hero on mobile).

### Navigation (the Spine)
A fixed deep-asphalt gutter with a grey pole, seven node dots (44px hit area, 10px dot), and a flaming lamp head that glides to the active section over 1s. Active node is yellow; hover scales the dot 1.5x and shows a white label tooltip (Open Sans 600, 0.875rem, 6px radius). A small vertical current-section name sits beside the head. On mobile it becomes a horizontal top bar.

### Flame List
List items marked by the shared flame symbol in yellow (school needs), or by plain dots on a dashed vertical line (family steps, last dot yellow with an asphalt ring).

### Placeholder Tag
A dashed 2px Asphalt outline, 6px radius, labelled "läggs till" or similar. It marks every unsupplied fact (photos, stories, report, payment details); never replace one with invented content.

### Organisation Pair
Two open columns, each with a 4px top rule (yellow for Sverige, green for Etiopien) and an uppercase H3, joined by a dashed link with a dot that travels from yellow to green.

## Do's and Don'ts

### Do:
- **Do** let light be the only emphasis: yellow glows, flames and a single primary action per view.
- **Do** keep Light (300) for large type and step to 600 or 700 as size falls.
- **Do** draw structure with 1px solid or 2px to 3px dashed lines in Asphalt Line (#5e5e5e); on yellow bands use Asphalt.
- **Do** use the one shared flame symbol for every icon and bullet.
- **Do** mark every missing fact with the dashed placeholder tag.
- **Do** keep text on yellow in Asphalt (#424242) and flip the focus ring to Asphalt there.
- **Do** disable motion under `prefers-reduced-motion` (all animation and transitions are already switched off).

### Don't:
- **Don't** use cards, boxed tiles or hard offset shadows; the world is open bands and light.
- **Don't** use green anywhere except the Etiopien organisation.
- **Don't** use photography of children as decoration or invented numbers, quotes or payment details.
- **Don't** treat the Nunito wordmark as a brand face or reuse it in headings.
- **Don't** use the red accent from the brand guide until a surface calls for it; the build uses none.
