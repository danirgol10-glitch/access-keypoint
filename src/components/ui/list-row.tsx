import * as React from "react";

import { cn } from "@/lib/utils";

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  interactive?: boolean;
}

const ListRow = React.forwardRef<HTMLDivElement, ListRowProps>(
  (
    {
      leading,
      title,
      subtitle,
      trailing,
      interactive = false,
      className,
      onClick,
      onKeyDown,
      role,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const isInteractive = interactive || Boolean(onClick);

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
          "flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3 text-left outline-none",
          isInteractive &&
            "tap-target premium-card-interactive pressable cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {leading && <div className="flex shrink-0 items-center justify-center">{leading}</div>}

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-5 text-[var(--text-primary)]">{title}</div>
          {subtitle && <div className="mt-0.5 line-clamp-2 text-xs leading-4 text-[var(--text-secondary)]">{subtitle}</div>}
        </div>

        {trailing && <div className="flex shrink-0 items-center justify-center text-[var(--text-secondary)]">{trailing}</div>}
      </div>
    );
  },
);
ListRow.displayName = "ListRow";

export { ListRow };
