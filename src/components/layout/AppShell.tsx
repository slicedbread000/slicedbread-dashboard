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
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col border-r">
          <div className="px-6 py-5">
            <div className="text-sm font-semibold tracking-tight">Slicedbread</div>
            <div className="text-xs text-muted-foreground">Trading Dashboard</div>
          </div>

          <Separator />

          <nav className="px-3 py-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                className="block rounded-md px-3 py-2 hover:bg-accent"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-6 py-4 text-xs text-muted-foreground">
            Hyperliquid • Internal
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="border-b">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Dashboard</div>
                <div className="text-xs text-muted-foreground">
                  Auto-updated from Sheets API
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
