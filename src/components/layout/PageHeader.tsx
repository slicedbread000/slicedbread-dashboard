import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-primary/85 shadow-[0_0_0_6px_hsl(var(--primary)/0.10)]" />
          <div className="text-xl font-semibold tracking-tight">{title}</div>
        </div>

        {subtitle ? (
          <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>

      {right ? <div className="pt-1">{right}</div> : null}
    </div>
  );
}
