import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MetricsPage() {
  const data = await fetchDashboardData();

  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Risk State (preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">
              Headers: {JSON.stringify((data?.riskState?.raw ?? [])[0] ?? [])}
            </div>
            <pre className="text-xs overflow-auto rounded-xl border p-3">
              {JSON.stringify((data?.riskState?.rows ?? []).slice(0, 10), null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Profit Factor (preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">
              Headers: {JSON.stringify((data?.profitFactor?.raw ?? [])[0] ?? [])}
            </div>
            <pre className="text-xs overflow-auto rounded-xl border p-3">
              {JSON.stringify((data?.profitFactor?.rows ?? []).slice(0, 10), null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
