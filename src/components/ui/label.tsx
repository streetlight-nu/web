import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Label in Streetlight style (design system FormField): always visible, above the field.
 * Mark an optional field with <span>(valfritt)</span>, which is shown in ink-soft.
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("text-label font-semibold text-ink [&_span]:font-normal [&_span]:text-ink-soft", className)}
      {...props}
    />
  );
}

export { Label };
