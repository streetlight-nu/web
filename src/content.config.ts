import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { inlaggSchema } from "@/lib/nyheter-schema";

// Nyheter: one Markdown file per post. The slug in /nyheter/<slug> is the file name.
// A post that breaks the schema stops the build.
const nyheter = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/nyheter",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) => inlaggSchema(image()),
});

export const collections = { nyheter };
