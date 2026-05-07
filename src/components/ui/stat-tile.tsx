import * as React from "react";

import { AppCard } from "@/components/ui/app-card";
import { cn } from "@/lib/utils";

type StatTileTone = "default" | "success" | "warning" | "danger" | "info";

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTileTone;
}

const toneClasses: Record<StatTileTone, { icon: string; value: string }> = {
  default: {
    icon: "border-[var(--surface-border)] bg-[var(--surface-input)] text-[var(--text-secondary)]",
    value: "text-[var(--text-primary)]",
  },
  success: {
    icon: "border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] text-primary",
    value: "text-primary",
  },
  warning: {
    icon: "border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]",
    value: "text-[hsl(var(--warning))]",
  },
  danger: {
    icon: "border-destructive/30 bg-destructive/15 text-destructive",
    value: "text-destructive",
  },
  info: {
    icon: "border-blue-400/30 bg-blue-400/15 text-blue-300",
    value: "text-blue-300",
  },
};

const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ value, label, icon, tone = "default", className, ...props }, ref) => {
    const toneClass = toneClasses[tone];

    return (
      <AppCard ref={ref} className={cn("p-4", className)} {...props}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={cn("truncate text-2xl font-bold leading-none tracking-normal", toneClass.value)}>
              {value}
            </div>
            <div className="mt-2 line-clamp-2 text-xs font-medium leading-4 text-[var(--text-secondary)]">
              {label}
            </div>
          </div>

          {icon && (
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full border [&_svg]:size-5", toneClass.icon)}>
              {icon}
            </div>
          )}
        </div>
      </AppCard>
    );
  },
);
StatTile.displayName = "StatTile";

export { StatTile };
