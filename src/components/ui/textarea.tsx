import * as React from "react";

import { cn } from "@/lib/utils";

/** shadcn/ui Textarea in Streetlight style: the same field as Input (design system FormField). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[110px] w-full min-w-0 resize-y rounded-lg border-2 border-input bg-white px-3.5 py-[13px] font-text text-body text-ink caret-thread-red transition-[border-color] duration-200",
        "hover:border-ink/50 focus:border-green focus:outline-3 focus:outline-offset-2 focus:outline-green",
        "aria-invalid:border-thread-red",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
