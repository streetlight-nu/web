import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Input in Streetlight style (design system FormField): a white field with an ink edge,
 * a green ring with air around it on focus, and a red edge when `aria-invalid` is set.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border-2 border-input bg-white px-3.5 py-[13px] font-text text-body text-ink caret-thread-red transition-[border-color] duration-200",
        "hover:border-ink/50 focus:border-green focus:outline-3 focus:outline-offset-2 focus:outline-green",
        "aria-invalid:border-thread-red",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
