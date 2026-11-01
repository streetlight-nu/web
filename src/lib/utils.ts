import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the Streetlight sizes and colours, so that e.g. `text-label`
// (a size) does not clash with `text-ink` (a colour), or `border-cotton/55` with `border-2`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["body", "label", "title", "lede", "headline", "display"],
      color: [
        "cotton", "white", "green", "green-deep", "ink", "ink-soft", "mint", "gold",
        "light-high", "light-mid", "gold-soft", "thread-red", "thread-cobalt", "error", "rule",
      ],
      radius: ["sm", "md", "lg", "pill"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefixes an internal path with the site's base path (GitHub Pages sub-path). */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
