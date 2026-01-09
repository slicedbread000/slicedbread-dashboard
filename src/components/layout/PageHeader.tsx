"use client";

import React from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  title: string;
  subtitle?: string;
  status?: "ok" | "error";
  pillText?: string; // e.g. "Last refresh: 2026-01-09 12:46"
  rightSlot?: React.ReactNode; // optional extra action (future)
};

export function PageHeader({ title, subtitle, status = "ok", pillText, rightSlot }: Props) {
  const dot =
    status === "ok"
      ? "bg-primary/90 shadow-[0_0_0_4px_hsl(var(--primary)/0.14)]"
      : "bg-red-500/90 shadow-[0_0_0_4px_rgba(239,68,68,0.18)]";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xl font-semibold tracking-tight">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>

      <div className="flex items-center gap-2">
        {pillText ? (
          <span
            className={cx(
              "inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1.5",
              "text-xs text-muted-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.05)]"
            )}
          >
            <span className={cx("h-1.5 w-1.5 rounded-full", dot)} />
            <span className="whitespace-nowrap">{pillText}</span>
          </span>
        ) : null}

        {rightSlot ? rightSlot : null}
      </div>
    </div>
  );
}
