import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-lg)] text-sm font-semibold tracking-[0.01em] ring-offset-background transition-[transform,opacity,background-color,border-color,box-shadow,filter,color] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:opacity-90 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-themed text-primary-foreground hover:shadow-glow",
        primary: "btn-themed text-primary-foreground hover:shadow-glow",
        destructive: "bg-destructive text-destructive-foreground shadow-control hover:bg-destructive/90",
        outline:
          "border border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--text-primary)] shadow-control hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-hover)]",
        secondary: "premium-surface text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
        ghost: "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        link: "h-auto min-h-0 rounded-none px-0 text-primary underline-offset-4 hover:underline active:scale-100",
        icon: "border border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--text-primary)] shadow-control hover:bg-[var(--surface-hover)]",
        chip: "border border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-10 rounded-[var(--radius-md)] px-3 py-1.5 text-xs",
        lg: "min-h-12 rounded-[var(--radius-xl)] px-6 py-3 text-base",
        icon: "size-11 rounded-full",
        chip: "min-h-8 rounded-full px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
