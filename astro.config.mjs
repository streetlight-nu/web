// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves the site from a sub-path until a custom domain is set up.
// CI passes the values from actions/configure-pages; locally the site runs at "/".
export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4321",
  base: process.env.BASE_PATH || "/",
  trailingSlash: "ignore",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
