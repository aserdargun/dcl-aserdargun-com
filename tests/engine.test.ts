import { describe, it, expect } from "vitest";
import {
  estimateModelMemory,
  estimateRuntimeMemory,
  evaluateMemoryFit,
} from "../src/core/memory";
import {
  calculateCost,
  calculateApiCost,
  calculateBreakEven,
  calculateCloudCost,
} from "../src/core/economics";
import {
  defaultWorkload as w,
  defaultEconomics as e,
} from "../src/data/defaults";
import { candidates, applyOverride } from "../src/data/candidates";
import { freshness } from "../src/core/freshness";
const local = candidates[0];
describe("Memory units and peak runtime", () => {
  it("converts B parameters and quantization to binary GiB", () => {
    expect(estimateModelMemory(70, 4)).toBeCloseTo(32.59629, 4);
    expect(estimateModelMemory(70, 8)).toBe(2 * estimateModelMemory(70, 4));
  });
  it("sizes full KV cache from maximum context and peak, independent of Q4 weights", () => {
    const a = estimateRuntimeMemory(w);
    expect(a.kv).toBe(100);
    expect(estimateRuntimeMemory({ ...w, bits: 8 }).kv).toBe(a.kv);
    expect(estimateRuntimeMemory({ ...w, maxContext: 32768 }).kv).toBe(200);
    expect(estimateRuntimeMemory(w, false).kv).toBe(50);
  });
  it("accounts for metadata, workspace and headroom", () => {
    const m = estimateRuntimeMemory(w);
    expect(m.total).toBeCloseTo((m.weights * 1.08 + m.kv + m.workspace) * 1.2);
  });
  it("classifies limits deterministically and excludes system reserve", () => {
    expect(evaluateMemoryFit(local, 47)).toBe("DOES_NOT_FIT");
    expect(evaluateMemoryFit(local, 44)).toBe("LIMITED");
    expect(evaluateMemoryFit(local, 30)).toBe("COMFORTABLE");
  });
  it("honors a zero weight override", () => {
    expect(estimateRuntimeMemory({ ...w, weightOverrideGiB: 0 }).weights).toBe(
      0,
    );
  });
});
describe("Cash outlay", () => {
  it("keeps capex with zero use and zero API tokens", () => {
    expect(calculateCost(local, { ...w, utilization: 0 }, e).capex).toBe(6000);
    expect(calculateApiCost(0, 0, 1, 3)).toBe(0);
  });
  it("calculates asymmetric token charges per million", () =>
    expect(calculateApiCost(2e6, 1e6, 1, 3)).toBe(5));
  it("models weighted load power and idle power", () => {
    const c = calculateCost(local, w, e);
    expect(c.electricity).toBeCloseTo(((438 * 88 + 70 * 88) / 1000) * 0.2);
    expect(c.year1).toBeCloseTo(6000 + 12 * c.monthly);
    expect(c.year3).toBeCloseTo(6000 + 36 * c.monthly);
    expect(
      calculateCost(local, { ...w, utilization: 1 }, e).electricity,
    ).toBeGreaterThan(c.electricity);
  });
  it("calculates cloud premium explicitly", () =>
    expect(calculateCloudCost(2, 100, 0.25)).toBe(250));
  it("reports actual crossings only", () => {
    expect(
      calculateBreakEven(
        { capex: 6000, monthly: 100 },
        { capex: 0, monthly: 600 },
        36,
      ),
    ).toBe(12);
    expect(
      calculateBreakEven(
        { capex: 6000, monthly: 100 },
        { capex: 0, monthly: 600 },
        6,
      ),
    ).toBeNull();
    expect(
      calculateBreakEven(
        { capex: 6000, monthly: 100 },
        { capex: 0, monthly: 50 },
        36,
      ),
    ).toBeNull();
    expect(
      calculateBreakEven(
        { capex: 0, monthly: 100 },
        { capex: 0, monthly: 100 },
        36,
      ),
    ).toBeNull();
  });
  it("applies zero-price overrides without mutation", () => {
    const c = applyOverride(local, { purchaseCost: 0 });
    expect(c.purchaseCost).toBe(0);
    expect(local.purchaseCost).toBe(6000);
    expect(c.evidence.status).toBe("USER_OVERRIDE");
    expect(() => applyOverride(local, { purchaseCost: -1 })).toThrow();
  });
});
it("treats age and missing timestamps honestly", () => {
  const source = {
    ...local.evidence,
    status: "VERIFIED" as const,
    verifiedAt: "2026-01-01",
  };
  expect(freshness(source, new Date("2026-01-20"))).toBe("CURRENT");
  expect(freshness(source, new Date("2026-03-01"))).toBe("AGING");
  expect(freshness(source, new Date("2026-09-01"))).toBe("STALE");
  expect(freshness(local.evidence, new Date())).toBe("UNKNOWN");
  expect(freshness({ ...source, verifiedAt: "bad" }, new Date())).toBe(
    "UNKNOWN",
  );
});

describe("All six categories and horizon consistency", () => {
  it("contains six independent candidate types", () =>
    expect(new Set(candidates.map((c) => c.category)).size).toBe(6));
  it("uses unified pool minus OS reserve, without adding host RAM to VRAM", () => {
    const apple = candidates.find((c) => c.id === "apple")!;
    expect(evaluateMemoryFit(apple, 167)).toBe("LIMITED");
    expect(evaluateMemoryFit(apple, 169)).toBe("DOES_NOT_FIT");
    expect(
      evaluateMemoryFit(candidates.find((c) => c.id === "amd")!, 168),
    ).toBe("OFFLOAD");
  });
  it("keeps provisioned business-hour billing at zero utilization unless shutdown policy changes", () => {
    const cloud = candidates.find((c) => c.id === "cloud")!;
    expect(
      calculateCost(cloud, { ...w, utilization: 0 }, e).billableHours,
    ).toBe(176);
    expect(
      calculateCost(cloud, { ...w, shape: "batch", utilization: 0 }, e)
        .billableHours,
    ).toBe(0);
    expect(
      calculateCost(cloud, w, { ...e, keepCloudWarm: true }).billableHours,
    ).toBe(730);
  });
  it("adds monthly extras once and uses consistent TCO horizon", () => {
    const c = calculateCost(
      candidates.find((c) => c.id === "cloud")!,
      { ...w, horizon: 12 },
      { ...e, storageMonthly: 50, egressMonthly: 20 },
    );
    expect(c.monthly).toBe(774);
    expect(c.total).toBe(c.year1);
  });
});

it("freshness boundaries are inclusive and future dates are unknown", () => {
  const evidence = {
    ...local.evidence,
    status: "VERIFIED" as const,
    verifiedAt: "2026-01-01T00:00:00Z",
  };
  expect(freshness(evidence, new Date("2026-01-31T00:00:00Z"))).toBe("CURRENT");
  expect(freshness(evidence, new Date("2026-04-01T00:00:00Z"))).toBe("AGING");
  expect(freshness(evidence, new Date("2025-12-31T00:00:00Z"))).toBe("UNKNOWN");
});
it("a computed crossing equates both cumulative costs", () => {
  const a = { capex: 7000, monthly: 6.7584 },
    b = { capex: 0, monthly: 225.28 };
  const crossing = calculateBreakEven(a, b, 36)!;
  expect(crossing).toBeGreaterThan(0);
  expect(crossing).toBeLessThan(36);
  expect(a.capex + a.monthly * crossing).toBeCloseTo(
    b.capex + b.monthly * crossing,
    8,
  );
});
it("API scales with actual usage and remains free at zero input/output", () => {
  const api = candidates.find((c) => c.id === "api")!;
  expect(calculateCost(api, { ...w, utilization: 1 }, e).tokens).toBeCloseTo(
    2 * calculateCost(api, w, e).tokens,
  );
  expect(
    calculateCost(api, { ...w, inputTokens: 0, outputTokens: 0 }, e).monthly,
  ).toBe(0);
});
