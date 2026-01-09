import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const nav = [
  { href: "/", label: "Command Center" },
  { href: "/performance", label: "Performance Summary" },
  { href: "/bots", label: "Bot States" },
  { href: "/risk", label: "Risk State" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle background texture (dark + green-tinted) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_20%_10%,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_80%_20%,hsl(var(--primary)/0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background)))]" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-72 md:flex-col border-r border-border/60 bg-card/40 backdrop-blur">
          <div className="px-6 py-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
              <div className="text-sm font-semibold tracking-tight">Slicedbread</div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Trading Dashboard</div>
          </div>

          <Separator className="opacity-60" />

          <nav className="px-3 py-3 text-sm space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-foreground/90 hover:bg-accent/60 hover:text-foreground transition"
              >
                <span className="font-medium">{item.label}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/0 group-hover:bg-primary/80 transition" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-6 py-5">
            <div className="rounded-xl border border-border/60 bg-card/50 px-4 py-3">
              <div className="text-xs font-medium text-foreground/90">Hyperliquid</div>
              <div className="text-[11px] text-muted-foreground">Internal • Auto-updated daily</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="border-b border-border/60 bg-card/30 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold tracking-tight">Dashboard</div>
                <div className="text-xs text-muted-foreground">Auto-updated from Sheets API</div>
              </div>

              {/* Right side placeholder for future (account/logout/etc.) */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/90" />
                  Secure
                </span>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8">
            {/* Content surface */}
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
