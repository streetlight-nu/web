import * as React from "react";

import { valchip } from "@/components/ui/valchip";
import { cn } from "@/lib/utils";

type CheckboxChipProps = Omit<React.ComponentProps<"input">, "type"> & { id: string };

/**
 * A checkbox as a pill-shaped choice chip (design system ChoiceChips), for picking any number of a few
 * choices. The same pill as ChoiceChip; the checked chip gets a green edge, a faint green tone and a
 * filled box with a check mark, so the choice shows by more than colour.
 */
function CheckboxChip({ id, className, children, ...props }: CheckboxChipProps) {
  return (
    <label htmlFor={id} className={cn(valchip, "has-checked:border-green has-checked:bg-green/8")}>
      <span className="relative grid size-[18px] shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          className={cn(
            "peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-[3px] border-2 border-ink/60 bg-white outline-none checked:border-green checked:bg-green",
            className,
          )}
          {...props}
        />
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className="pointer-events-none relative hidden size-3 text-cotton peer-checked:block"
        >
          <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      {children}
    </label>
  );
}

export { CheckboxChip };
