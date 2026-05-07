import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  cta?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, cta, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("premium-empty-state mx-auto flex w-full flex-col items-center text-center", className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-input)] text-[var(--text-secondary)] [&_svg]:size-6">
          {icon}
        </div>
      )}

      <h2 className="text-lg font-semibold leading-tight text-[var(--text-primary)]">{title}</h2>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      )}

      {cta && <div className="mt-5 flex w-full justify-center">{cta}</div>}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
