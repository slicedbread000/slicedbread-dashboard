import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BotsPage() {
  const data = await fetchDashboardData();
  const rows = (data?.bots?.rows ?? []) as any[];

  return (
    <AppShell>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Bots
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            {rows.length} rows • Last refresh:{" "}
            {data?.meta?.generatedAt ?? "Unknown"}
          </div>

          <div className="divide-y rounded-xl border">
            {rows.slice(0, 200).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
              >
                {/* Bot Name */}
                <div className="text-sm font-medium">
                  {r["bots"] ?? `Bot ${i + 1}`}
                </div>

                {/* Metrics */}
                <div className="text-right">
                  <div className="text-sm">
                    PF (30d):{" "}
                    <span className="font-medium">
                      {r["Rolling PF (30d)"] ?? "—"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r["date"] ?? ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
