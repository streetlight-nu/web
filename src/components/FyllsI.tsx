import type { ReactNode } from "react";

/**
 * The chip "fylls i" for React islands: the same markup as FyllsI.astro (`sl-todo`, styled in
 * global.css). Say what is missing in the children, e.g. "e-post fylls i".
 */
export default function FyllsI({ children = "fylls i" }: { children?: ReactNode }) {
  return <span className="sl-todo">{children}</span>;
}
