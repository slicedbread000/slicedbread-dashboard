// Generic type-guard for your dashboard payload
export function isOk<T extends object = Record<string, unknown>>(
  data: any
): data is { ok: true } & T {
  return !!data && typeof data === "object" && data.ok === true;
}
