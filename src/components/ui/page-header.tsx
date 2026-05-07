import * as React from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  safeTop?: boolean;
}

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      title,
      subtitle,
      action,
      showBackButton = false,
      onBack,
      safeTop = false,
      className,
      ...props
    },
    ref,
  ) => (
    <header
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 px-4 pb-4",
        safeTop ? "safe-top pt-3" : "pt-4",
        className,
      )}
      {...props}
    >
      {showBackButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Volver"
          onClick={onBack}
          disabled={!onBack}
          className="shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] font-bold leading-tight tracking-normal text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--text-secondary)]">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  ),
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
