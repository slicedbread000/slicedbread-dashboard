"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const nav = [
  { href: "/", label: "Command Center" },
  { href: "/performance", label: "Performance Summary" },
  { href: "/bots", label: "Bot States" },
  { href: "/risk", label: "Risk State" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Premium dark background + subtle green glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_800px_at_18%_10%,hsl(var(--primary)/0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_82%_20%,hsl(var(--primary)/0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background)))]" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-72 md:flex-col border-r border-border/70 bg-card/35 backdrop-blur">
          <div className="px-6 py-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.16)]" />
              <div className="text-sm font-semibold tracking-tight">Slicedbread</div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Trading Dashboard</div>
          </div>

          <Separator className="opacity-60" />

          <nav className="px-3 py-3 text-sm space-y-1">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition",
                    "border border-transparent",
                    "hover:bg-accent/50 hover:border-border/60",
                    active && "bg-accent/55 border-border/70"
                  )}
                >
                  {/* Active green rail */}
                  <span
                    className={cx(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition",
                      active ? "bg-primary/90" : "bg-primary/0 group-hover:bg-primary/40"
                    )}
                  />
                  <span className={cx("font-medium", active ? "text-foreground" : "text-foreground/90")}>
                    {item.label}
                  </span>
                  <span
                    className={cx(
                      "h-1.5 w-1.5 rounded-full transition",
                      active ? "bg-primary/90" : "bg-primary/0 group-hover:bg-primary/70"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-6 py-5">
            <div className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3 shadow-[0_0_0_1px_hsl(var(--primary)/0.06)]">
              <div className="text-xs font-medium text-foreground/90">Hyperliquid</div>
              <div className="text-[11px] text-muted-foreground">Internal • Auto-updated daily</div>
              <div className="mt-2 h-px bg-border/60" />
              <div className="mt-2 text-[11px] text-muted-foreground">
                Theme: <span className="text-foreground/80">Dark Emerald</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="border-b border-border/70 bg-card/25 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold tracking-tight">Dashboard</div>
                <div className="text-xs text-muted-foreground">Auto-updated from Sheets API</div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 shadow-[0_0_0_1px_hsl(var(--primary)/0.06)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/90" />
                  Secure
                </span>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8">
            {/* Content wrapper with subtle structure */}
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
