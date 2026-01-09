// src/lib/kpiLogic.ts
export type KpiIntent = "good" | "bad" | "neutral";

export function toNumber(x: any): number | null {
  if (x === null || x === undefined) return null;
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  const n = Number(String(x).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function formatNumber(
  value: any,
  opts?: { decimals?: number; suffix?: string; multiply?: number }
) {
  const n0 = toNumber(value);
  if (n0 === null) return value ?? "—";

  const multiply = opts?.multiply ?? 1;
  const n = n0 * multiply;

  const decimals = opts?.decimals ?? 2;
  const suffix = opts?.suffix ?? "";

  return (
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    }).format(n) + suffix
  );
}

/**
 * Simple rule you asked for:
 * - anything below 0 is bad
 * - above 0 is good
 * - 0 neutral
 */
export function intentPosNeg(value: any): KpiIntent {
  const n = toNumber(value);
  if (n === null) return "neutral";
  if (n > 0) return "good";
  if (n < 0) return "bad";
  return "neutral";
}

/**
 * Higher is better (optional thresholds)
 */
export function intentHigherBetter(
  value: any,
  cfg?: { goodGte?: number; badLte?: number }
): KpiIntent {
  const n = toNumber(value);
  if (n === null) return "neutral";
  const goodGte = cfg?.goodGte;
  const badLte = cfg?.badLte;

  if (goodGte !== undefined && n >= goodGte) return "good";
  if (badLte !== undefined && n <= badLte) return "bad";

  return "neutral";
}
