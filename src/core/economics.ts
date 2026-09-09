import type { Candidate, Cost, Economics, Workload } from "./types";
export const isLocal = (c: Candidate) => c.category.startsWith("LOCAL_");
export function usage(w: Workload) {
  const windowHours = w.hoursPerDay * w.daysPerMonth;
  const loadHours = windowHours * w.utilization;
  const requests = w.requestsPerDay * w.daysPerMonth * w.utilization;
  return {
    windowHours,
    loadHours,
    requests,
    input: requests * w.inputTokens,
    output: requests * w.outputTokens,
  };
}
export function calculateApiCost(
  input: number,
  output: number,
  inputPrice: number,
  outputPrice: number,
) {
  return (input * inputPrice + output * outputPrice) / 1e6;
}
export function calculateCloudCost(hourly: number, hours: number, premium = 0) {
  return hourly * hours * (1 + premium);
}
export function calculateLocalTCO(
  capex: number,
  monthly: number,
  months: number,
) {
  return capex + monthly * months;
}
export function calculateCost(c: Candidate, w: Workload, e: Economics): Cost {
  const u = usage(w);
  const local = isLocal(c);
  const api = c.category === "TOKEN_API";
  // Bursty/batch scheduled shutdown is an explicit idealization. Business/continuous retain the active window.
  const billableHours = api
    ? 0
    : e.keepCloudWarm
      ? 730
      : w.shape === "bursty" || w.shape === "batch"
        ? u.loadHours
        : u.windowHours;
  const idleHours = local
    ? Math.max(0, (e.keepLocalOn ? 730 : u.windowHours) - u.loadHours)
    : 0;
  const power = c.power.normal * (1 - c.peakShare) + c.power.peak * c.peakShare;
  const electricity = local
    ? ((power * u.loadHours + c.power.idle * idleHours) / 1000) * e.electricity
    : 0;
  const infrastructure =
    local || api
      ? 0
      : calculateCloudCost(c.hourlyCost, billableHours, c.managedPremium);
  const tokens = api
    ? calculateApiCost(u.input, u.output, c.inputPrice, c.outputPrice)
    : 0;
  const storage = local || api ? 0 : e.storageMonthly,
    egress = local || api ? 0 : e.egressMonthly,
    maintenance = local ? e.maintenanceMonthly : 0;
  const capex = local ? c.purchaseCost : 0;
  const monthly =
    electricity + infrastructure + tokens + storage + egress + maintenance;
  return {
    capex,
    electricity,
    infrastructure,
    tokens,
    storage,
    egress,
    maintenance,
    monthly,
    total: capex + monthly * w.horizon,
    year1: capex + monthly * 12,
    year3: capex + monthly * 36,
    billableHours: local ? 0 : billableHours,
    loadHours: u.loadHours,
    idleHours,
  };
}
/** Affine cumulative cash-outlay crossing. Coincident lines have no unique break-even. */
export function calculateBreakEven(
  a: { capex: number; monthly: number },
  b: { capex: number; monthly: number },
  horizon: number,
): number | null {
  const slope = b.monthly - a.monthly;
  if (Math.abs(slope) < 1e-10) return null;
  const month = (a.capex - b.capex) / slope;
  return month > 0 && month <= horizon ? month : null;
}
