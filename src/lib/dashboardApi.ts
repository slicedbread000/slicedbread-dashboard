export async function fetchDashboardData() {
  const baseUrl = process.env.DASHBOARD_API_URL;
  const token = process.env.DASHBOARD_API_TOKEN;

  if (!baseUrl) throw new Error("Missing DASHBOARD_API_URL in .env.local");
  if (!token) throw new Error("Missing DASHBOARD_API_TOKEN in .env.local");

  const url = `${baseUrl}?token=${encodeURIComponent(token)}`;

  const res = await fetch(url, {
    // Auto-refresh cache (5 min). Change to 3600 (hourly) or 86400 (daily) if you want.
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dashboard API error (${res.status}): ${text}`);
  }

  return res.json();
}
