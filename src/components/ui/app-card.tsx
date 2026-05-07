import * as React from "react";

import { cn } from "@/lib/utils";

type AppCardVariant = "default" | "elevated" | "interactive" | "hero" | "danger";

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AppCardVariant;
}

const variantClasses: Record<AppCardVariant, string> = {
  default: "premium-card",
  elevated: "premium-card border-[var(--surface-border-strong)] shadow-card-hover",
  interactive: "premium-card premium-card-interactive",
  hero: "premium-card border-[var(--trade-green-border)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-glass))] shadow-glow",
  danger: "premium-card border-destructive/30 bg-destructive/10",
};

const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  (
    {
      children,
      className,
      variant = "default",
      onClick,
      onKeyDown,
      role,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const isInteractive = Boolean(onClick) || variant === "interactive";

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (!onClick || event.defaultPrevented) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <div
        ref={ref}
        role={onClick ? "button" : role}
        tabIndex={onClick ? tabIndex ?? 0 : tabIndex}
        className={cn(
          "relative overflow-hidden p-4 text-left text-[var(--text-primary)] outline-none",
          variantClasses[variant],
          isInteractive &&
            "pressable cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AppCard.displayName = "AppCard";

export { AppCard };
