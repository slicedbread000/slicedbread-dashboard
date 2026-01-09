type DashboardOk = { ok: true; [k: string]: any };
type DashboardErr = { ok: false; error: string; meta?: any };
export type DashboardPayload = DashboardOk | DashboardErr;

/**
 * Fetches dashboard JSON from your Apps Script endpoint.
 * - Uses Vercel env vars: DASHBOARD_API_URL, DASHBOARD_API_TOKEN
 * - Fails soft (returns {ok:false,...}) so builds don't crash
 * - Revalidates daily by default (86400s)
 */
export async function fetchDashboardData(): Promise<DashboardPayload> {
  const baseUrl = process.env.DASHBOARD_API_URL;
  const token = process.env.DASHBOARD_API_TOKEN;

  if (!baseUrl) {
    return { ok: false, error: "Missing env var: DASHBOARD_API_URL" };
  }
  if (!token) {
    return { ok: false, error: "Missing env var: DASHBOARD_API_TOKEN" };
  }

  const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      // daily refresh (you asked for daily auto updates)
      next: { revalidate: 86400 },

      // IMPORTANT: Apps Script can be slow; don't let it hang forever.
      // (Next.js fetch doesn't support a timeout option directly; we do AbortController.)
      cache: "force-cache",
      signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Dashboard API error (${res.status}) ${text?.slice(0, 400) || ""}`.trim(),
      };
    }

    const json = (await res.json()) as any;

    // If your Apps Script returns {ok:false,...}, just pass it through.
    if (json && typeof json === "object" && "ok" in json) return json as DashboardPayload;

    // Otherwise wrap it.
    return { ok: true, ...json };
  } catch (err: any) {
    return {
      ok: false,
      error: `Fetch failed: ${err?.message ?? String(err)}`,
    };
  }
}
