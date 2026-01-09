import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/dashboardApi";
import { isOk } from "@/lib/typeguards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OkShape = {
  meta?: { generatedAt?: string };
  riskState?: { raw?: any[][]; rows?: any[] };
  equityCurve?: { raw?: any[][]; rows?: any[] };
  netWorth?: { raw?: any[][]; rows?: any[] };
  bots?: { raw?: any[][]; rows?: any[] };
  profitFactor?: { raw?: any[][]; rows?: any[] };
};

function headersFrom(raw?: any[][]) {
  return (raw?.[0] ?? []) as any[];
}

export default async function MetricsPage() {
  const data = await fetchDashboardData();

  const ok = isOk<OkShape>(data);
  const generatedAt = ok ? data.meta?.generatedAt : undefined;
  const err = !ok ? (data as any)?.error : undefined;

  const riskRaw = ok ? data.riskState?.raw : undefined;
  const riskRows = ok ? data.riskState?.rows : undefined;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">Metrics (Debug)</div>
          <div className="text-sm text-muted-foreground">
            {ok
              ? `Last refresh: ${generatedAt ?? "Unknown"}`
              : `Data error: ${err ?? "Unknown error"}`}
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Risk State sample</CardTitle>
          </CardHeader>
          <CardContent>
            {!ok ? (
              <div className="text-sm text-muted-foreground">
                No data (API error). This page is safe to deploy.
              </div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground mb-2">
                  Headers: {JSON.stringify(headersFrom(riskRaw))}
                </div>
                <pre className="text-xs overflow-auto rounded-xl border p-3">
                  {JSON.stringify((riskRows ?? []).slice(0, 10), null, 2)}
                </pre>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
