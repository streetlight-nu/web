import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export interface NavLink {
  label: string;
  href: string;
  current?: boolean;
}

interface Props {
  links: NavLink[];
  sponsorHref: string;
  /**
   * How "Bli fadder" shows: "gold" on most pages; "line" on a page whose own main action is gold (the campaign page);
   * "current" on the page it leads to (Stöd oss), a line marked as the current page.
   */
  sponsor?: "gold" | "line" | "current";
}

/**
 * The main menu. On wide screens the links sit in a row; under 900 px they fold
 * into a disclosure opened by the "Meny" button. Escape closes it and returns focus.
 */
export default function MainNav({ links, sponsorHref, sponsor = "gold" }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <ul
        id={listId}
        className={`order-3 m-0 w-full list-none flex-col p-0 font-medium min-[901px]:order-none min-[901px]:flex min-[901px]:w-auto min-[901px]:min-w-0 min-[901px]:flex-row min-[901px]:flex-wrap min-[901px]:justify-center min-[901px]:gap-x-[clamp(14px,1.6vw,28px)] min-[901px]:gap-y-1 min-[901px]:whitespace-nowrap ${open ? "flex" : "hidden"}`}
      >
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="block border-t border-mint/20 py-3 text-cotton no-underline hover:underline hover:decoration-gold aria-[current=page]:underline aria-[current=page]:decoration-gold aria-[current=page]:decoration-[3px] min-[901px]:border-0 min-[901px]:py-0 min-[901px]:opacity-90 min-[901px]:hover:opacity-100 min-[901px]:aria-[current=page]:opacity-100"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-2.5 max-[400px]:gap-2">
        <Button asChild variant={sponsor === "gold" ? "gold" : "line"} size="small" className="whitespace-nowrap max-[520px]:px-4 max-[400px]:px-3.5">
          <a href={sponsorHref} aria-current={sponsor === "current" ? "page" : undefined}>
            Bli fadder
          </a>
        </Button>
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border-2 border-cotton/55 bg-transparent px-3.5 py-2.5 text-label font-semibold text-cotton aria-expanded:border-cotton aria-expanded:bg-cotton/10 min-[901px]:hidden max-[520px]:w-11 max-[520px]:justify-center max-[520px]:p-0"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true" className="size-[18px]">
            <path d="M3 5h12M3 9h12M3 13h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="max-[520px]:sr-only">Meny</span>
        </button>
      </div>
    </>
  );
}
