import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.01em] transition-colors [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
  {
    variants: {
      variant: {
        default: "border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] text-primary",
        secondary: "border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--text-secondary)]",
        destructive: "border-destructive/30 bg-destructive/15 text-destructive",
        outline: "border-[var(--surface-border)] text-[var(--text-primary)]",
        success: "border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] text-primary",
        warning: "border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
