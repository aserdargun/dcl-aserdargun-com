import { expect, it } from "vitest";
import { validNumber } from "../src/core/input";
import { calculateCost } from "../src/core/economics";
import { evaluateCandidates } from "../src/core/decision";
import {
  defaultWorkload as w,
  defaultConstraints as h,
  defaultEconomics as e,
  balanced as p,
} from "../src/data/defaults";
import { candidates } from "../src/data/candidates";
import { scenarios } from "../src/core/scenarios";

it.each(["", " ", "NaN", "Infinity", "1.5", "0", "1001"])(
  "rejects invalid sequence count %s",
  (value) => {
    expect(validNumber(value, 1, 1000, 1)).toBe(false);
  },
);
it("accepts configured fractional steps without floating-point rejection", () => {
  expect(validNumber("0.075", 0, 10, 0.025)).toBe(true);
  expect(validNumber("0.03", 0, 10, 0.025)).toBe(false);
  expect(validNumber("1.5", 0.5, 4, 0.5)).toBe(true);
  expect(validNumber("0", 0, 1e9, 1)).toBe(true);
});
it.each(["always", "ha"] as const)(
  "%s bills a full month even when shutdown switches are off",
  (availability) => {
    const work = {
      ...w,
      availability,
      hoursPerDay: 24,
      daysPerMonth: 30,
      shape: "continuous" as const,
      utilization: 0,
    };
    const cloud = candidates.find((c) => c.id === "cloud")!;
    const local = candidates.find((c) => c.id === "apple")!;
    expect(calculateCost(cloud, work, e).billableHours).toBe(730);
    expect(calculateCost(local, work, e).idleHours).toBe(730);
    const changedSchedule = { ...work, hoursPerDay: 8 };
    expect(calculateCost(cloud, changedSchedule, e).billableHours).toBe(730);
    expect(calculateCost(local, changedSchedule, e).idleHours).toBe(730);
  },
);
it("cannot recommend free compute for positive demand in a zero-hour window", () => {
  const results = evaluateCandidates(
    candidates,
    { ...w, hoursPerDay: 0 },
    h,
    p,
    e,
  );
  expect(
    results.every(
      (r) =>
        !r.eligible && r.failures.some((f) => f.metric === "workload-schedule"),
    ),
  ).toBe(true);
});
it("retains non-fit evidence when the memory constraint is relaxed", () => {
  const nvidia = evaluateCandidates(
    candidates,
    w,
    { ...h, mustFit: false },
    p,
    e,
  ).find((r) => r.candidate.id === "nvidia")!;
  expect(nvidia.reasons.some((r) => r.metric === "memory-unverified")).toBe(
    true,
  );
});
it("all preset outputs are finite, serializable and have valid demand schedules", () => {
  for (const scenario of scenarios) {
    const results = evaluateCandidates(
      candidates,
      scenario.workload,
      scenario.constraints,
      scenario.preferences,
      e,
    );
    expect(results.some((r) => r.eligible)).toBe(true);
    for (const result of results) {
      expect(Object.values(result.cost).every(Number.isFinite)).toBe(true);
      expect(Number.isFinite(result.score)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  }
});

it("does not admit a configuration that exceeds all memory pools when must-fit is disabled", () => {
  const result = evaluateCandidates(
    candidates,
    w,
    { ...h, mustFit: false },
    p,
    e,
  );
  expect(result.find((r) => r.candidate.id === "nvidia")!.eligible).toBe(false);
  expect(result.find((r) => r.candidate.id === "amd")!.eligible).toBe(true);
});

it("API capacity respects model class and context despite provider-managed memory", async () => {
  const { evaluateCapacity } = await import("../src/core/scale");
  const api = candidates.find((c) => c.id === "api")!;
  expect(
    evaluateCapacity(api, { ...w, parametersB: api.maxParametersB + 1 }, 1)
      .state,
  ).toBe("limit");
  expect(
    evaluateCapacity(api, { ...w, maxContext: api.maxContext + 1 }, 1).state,
  ).toBe("limit");
});
it("a single eligible path cannot imply a preference with all weights zero", async () => {
  const { recommendation } = await import("../src/core/decision");
  const prefs = { cost: 0, privacy: 0, operations: 0, scale: 0 };
  const results = evaluateCandidates(
    candidates,
    { ...w, privacy: "local" },
    h,
    prefs,
    e,
  );
  const decision = recommendation(results, prefs);
  expect(decision.eligible).toHaveLength(1);
  expect(decision.unweighted).toBe(true);
  expect(decision.tied).toBe(true);
});
