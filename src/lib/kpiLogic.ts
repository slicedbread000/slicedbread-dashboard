// src/lib/kpiLogic.ts
export type KpiIntent = "good" | "bad" | "neutral";

export function toNumber(x: any): number | null {
  if (x === null || x === undefined) return null;
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  const n = Number(String(x).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize a percent-like value into a signed percent number.
 * Examples:
 * - "-0.04" => -4
 * - "-4" => -4
 * - "-4%" => -4
 * - "0.19" (already a fraction but not necessarily %; caller decides)
 */
export function normalizePercentLike(x: any): number | null {
  const n = toNumber(x);
  if (n === null) return null;
  // If it's a small magnitude (e.g. 0.04), treat as fraction -> percent
  if (Math.abs(n) <= 1.5) return n * 100;
  // Otherwise treat as already percent
  return n;
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

export function formatCurrencyUSD(value: any, decimals = 0) {
  const n = toNumber(value);
  if (n === null) return value ?? "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(n);
}

/**
 * Smart percent formatter:
 * - If 0 <= |n| <= 1.5 => treat as fraction (0.19 -> 19%)
 * - Else treat as already percent (19 -> 19%)
 */
export function formatPercentSmart(value: any, decimals = 1) {
  const n = toNumber(value);
  if (n === null) return value ?? "—";

  const pct = Math.abs(n) <= 1.5 ? n * 100 : n;

  return (
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    }).format(pct) + "%"
  );
}

/**
 * Simple rule:
 * - below 0 bad
 * - above 0 good
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

/**
 * Drawdown % intent by ABS magnitude (in percent units).
 * bad if |dd| >= badAbsGte
 * neutral if between
 * good if |dd| < goodAbsLt
 */
export function intentAbsBands(
  percentValue: any,
  cfg: { goodAbsLt: number; badAbsGte: number }
): KpiIntent {
  const n = toNumber(percentValue);
  if (n === null) return "neutral";
  const a = Math.abs(n);

  if (a >= cfg.badAbsGte) return "bad";
  if (a < cfg.goodAbsLt) return "good";
  return "neutral";
}
