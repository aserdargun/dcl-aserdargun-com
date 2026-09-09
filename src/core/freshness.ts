import type { Evidence } from "./types";
export function freshness(
  e: Evidence,
  now: Date,
): "CURRENT" | "AGING" | "STALE" | "UNKNOWN" {
  if (e.status !== "VERIFIED" || !e.verifiedAt) return "UNKNOWN";
  const age = (now.getTime() - new Date(e.verifiedAt).getTime()) / 86400000;
  if (!Number.isFinite(age) || age < 0) return "UNKNOWN";
  return age <= 30 ? "CURRENT" : age <= 90 ? "AGING" : "STALE";
}
