# Streetlight

Webbplatsen för Streetlight, en ideell förening i Sverige och Etiopien som stöttar 20 fadderbarns skolgång och deras familjer i Addis Abeba.

Byggd med Astro, React-öar, shadcn/ui och Tailwind v4 ([ADR 0001](docs/adr/0001-astro-med-react-oar.md)) enligt designsystemet "Streetlight Designsystem" ([ADR 0002](docs/adr/0002-designsystemet-ersatter-varumarkesguiden.md)). Ord och begrepp finns i [GLOSSARY.md](GLOSSARY.md).

## Kom igång

Kräver Node 22 (se `.nvmrc`).

```bash
npm install
npm run dev
```

| Kommando | Vad det gör |
| --- | --- |
| `npm run dev` | Startar utvecklingsservern på http://localhost:4321 |
| `npm run build` | Bygger den statiska sajten till `dist/` |
| `npm run preview` | Visar det byggda resultatet lokalt |
| `npm run check` | Typkontroll |
| `npm test` | Enhetstester (Vitest) |
| `npm run test:e2e` | Webbläsartester och tillgänglighet med axe (Playwright, kräver bygge först) |

## Design

Färger, typsnitt och avstånd kommer från designsystemets `tokens.json`, som finns i `src/styles/tokens.json`. De är mappade för hand till Tailwind-temat och shadcn-variablerna i `src/styles/global.css`. Ändra först i designsystemet och för sedan över ändringen hit.

I `.astro`-filer används `buttonVariants()` direkt på `<a>`. React-komponenten `Button` med `asChild` fungerar bara inne i React-öar.

Typsnitten läggs på egen server via Fontsource. Sajten gör inga anrop till tredje part, och ett test kontrollerar det.

## Publicering

GitHub Actions kör typkontroll, enhetstester, bygge och webbläsartester på varje push. När allt går igenom på `master` publiceras sajten på GitHub Pages på https://streetlight-nu.github.io/web/.

Vid egen domän: lägg till domänen under Settings › Pages och sätt repovariablerna `SITE_URL` (till exempel `https://streetlight.nu`) och `BASE_PATH` (`/`). Ingen kod behöver ändras.
