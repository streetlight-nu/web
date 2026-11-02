import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui RadioGroup in Streetlight style, used as ChoiceChips (design system ChoiceChips):
 * radio buttons as pill-shaped chips, for one choice out of at most four. The recommended
 * choice comes first and is preselected.
 */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("flex flex-wrap gap-2.5", className)} {...props} />
  );
}

/** The round radio mark. */
function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-full border-2 border-ink/60 bg-white outline-none data-[state=checked]:border-green",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-green" />
    </RadioGroupPrimitive.Item>
  );
}

type ChoiceChipProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & { id: string };

/**
 * One chip: the radio mark and its text. The whole pill is the touch target (at least 44 px);
 * the checked chip gets a green edge and a faint green tone.
 */
function ChoiceChip({ id, children, ...props }: ChoiceChipProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border-2 border-input px-4 py-[9px] text-label font-medium text-ink has-data-[state=checked]:border-green has-data-[state=checked]:bg-green/8 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
    >
      <RadioGroupItem id={id} {...props} />
      {children}
    </label>
  );
}

export { RadioGroup, RadioGroupItem, ChoiceChip };
