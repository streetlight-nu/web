import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { inlaggSchema } from "@/lib/nyheter-schema";
import { fragaSchema } from "@/lib/vanliga-fragor";

// Nyheter: one Markdown file per inlägg. The slug in /nyheter/<slug> is the file name.
// An inlägg that breaks the schema stops the build.
const nyheter = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/nyheter",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) => inlaggSchema(image()),
});

// Vanliga frågor: one Markdown file per question; the answer is the body. The file name is the
// question's anchor. FRAGOR_MAPP points elsewhere, so the browser tests can build with test questions.
const fragor = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: process.env.FRAGOR_MAPP || "./src/content/fragor",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: fragaSchema,
});

export const collections = { nyheter, fragor };
