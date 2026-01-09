import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { isOk } from "@/lib/typeguards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardOkShape = {
  meta?: { generatedAt?: string };
  bots?: { rows?: any[] };
};

export default async function BotsPage() {
  const data = await fetchDashboardData();

  const rows = isOk<DashboardOkShape>(data) ? (data.bots?.rows ?? []) : [];

  const subtitle = isOk<DashboardOkShape>(data)
    ? `Last refresh: ${data.meta?.generatedAt ?? "Unknown"}`
    : `Data error: ${(data as any)?.error ?? "Unknown error"}`;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Bots</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Bot Rolling PF (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No bot data.</div>
            ) : (
              <div className="text-sm">Loaded {rows.length} rows.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
