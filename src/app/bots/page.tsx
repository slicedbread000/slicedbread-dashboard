import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function isOk(data: any): data is { ok: true; bots?: any } {
  return data && typeof data === "object" && data.ok === true;
}

export default async function BotsPage() {
  const data = await fetchDashboardData();

  const rows = isOk(data) ? ((data.bots?.rows ?? []) as any[]) : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Bots</div>
          <div className="text-sm text-muted-foreground">
            {isOk(data)
              ? `Last refresh: ${data?.meta?.generatedAt ?? "Unknown"}`
              : `Data error: ${data?.error ?? "Unknown error"}`}
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Bot Rolling PF (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No bot data.</div>
            ) : (
              <div className="text-sm">
                {/* Keep it simple: show raw rows count for now */}
                Loaded {rows.length} rows.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
