import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button with Streetlight variants (see the design system's Button):
 * gold for the main action (one per view and area), ink to submit,
 * line for secondary actions on green, line-ink for secondary actions on light.
 */
const buttonVariants = cva(
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-pill border-2 font-text font-semibold leading-none no-underline transition-[transform,box-shadow,background-color] duration-300 ease-light active:translate-y-0 [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        gold: "border-transparent bg-gold text-ink shadow-button hover:-translate-y-0.5",
        ink: "border-transparent bg-ink text-cotton hover:-translate-y-0.5",
        line: "border-cotton/55 bg-transparent text-cotton hover:border-cotton hover:bg-cotton/10",
        "line-ink": "border-ink bg-transparent text-ink hover:bg-ink/5",
      },
      size: {
        default: "px-[26px] py-[17px] text-body",
        small: "px-5 py-3 text-label",
      },
    },
    defaultVariants: { variant: "gold", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
