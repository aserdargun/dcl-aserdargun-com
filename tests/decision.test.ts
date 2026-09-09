import { it, expect, describe } from "vitest";
import { evaluateCandidates, normalizedWeights } from "../src/core/decision";
import { candidates } from "../src/data/candidates";
import {
  defaultWorkload as w,
  defaultConstraints as h,
  defaultEconomics as e,
  balanced as p,
} from "../src/data/defaults";
import { scenarios } from "../src/core/scenarios";
const evaluate = (work = w, constraints = h, prefs = p) =>
  evaluateCandidates(candidates, work, constraints, prefs, e);
describe("Hard constraints dominate preferences", () => {
  it("removes all external candidates under local-only", () => {
    const r = evaluate({ ...w, privacy: "local" });
    expect(
      r
        .filter((x) => x.eligible)
        .every((x) => x.candidate.category.startsWith("LOCAL")),
    ).toBe(true);
    expect(
      r
        .find((x) => x.candidate.id === "api")!
        .failures.some((x) => x.metric === "privacy"),
    ).toBe(true);
  });
  it("excludes above-capex and unsupported or unknown required runtimes", () => {
    expect(
      evaluate(w, { ...h, maxCapex: 100 }).find(
        (x) => x.candidate.id === "apple",
      )!.eligible,
    ).toBe(false);
    expect(
      evaluate(w, { ...h, runtime: "MLX" }).every((x) => !x.eligible),
    ).toBe(true);
  });
  it("excludes nonfit despite maximal privacy preference", () =>
    expect(
      evaluate(w, h, { cost: 0, privacy: 100, operations: 0, scale: 0 }).find(
        (x) => x.candidate.id === "nvidia",
      )!.eligible,
    ).toBe(false));
  it("requires exact model and eliminates assumed API equivalence", () =>
    expect(
      evaluate(w, { ...h, exactModel: true }).find(
        (x) => x.candidate.id === "api",
      )!.eligible,
    ).toBe(false));
  it("treats no feasible result explicitly", () =>
    expect(
      evaluate({ ...w, privacy: "local" }, { ...h, maxCapex: 0 }).some(
        (x) => x.eligible,
      ),
    ).toBe(false));
  it("rejects a physical-memory minimum for opaque API", () =>
    expect(
      evaluate(w, { ...h, minMemory: 1 }).find((x) => x.candidate.id === "api")!
        .eligible,
    ).toBe(false));
  it("distinguishes measured performance from eligibility", () =>
    expect(
      evaluate()
        .filter((x) => x.eligible)
        .every((x) => x.candidate.performance.throughput === null),
    ).toBe(true));
});
it("normalizes weights and does not inject preferences into zero weights", () => {
  expect(
    normalizedWeights({ cost: 2, privacy: 2, operations: 0, scale: 0 }).cost,
  ).toBe(0.5);
  expect(
    evaluate(w, h, { cost: 0, privacy: 0, operations: 0, scale: 0 })
      .filter((x) => x.eligible)
      .every((x) => x.score === 0),
  ).toBe(true);
});
it("winner is an outcome of scenario data: API, local, cloud", () => {
  const winners = ["startup", "always", "company"].map((id) => {
    const s = scenarios.find((s) => s.id === id)!;
    return evaluate(s.workload, s.constraints, s.preferences).find(
      (x) => x.eligible,
    )!.candidate.category;
  });
  expect(winners).toEqual(["TOKEN_API", "LOCAL_APPLE", "CLOUD_VM"]);
});
it("contributions sum exactly to the displayed score", () => {
  for (const r of evaluate()) {
    expect(
      Object.values(r.contributions).reduce((a, b) => a + b, 0),
    ).toBeCloseTo(r.score);
  }
});
it("blocks impossible token/context and average/peak combinations", () => {
  expect(
    evaluate({ ...w, inputTokens: 16000, outputTokens: 1000 }).every(
      (x) => !x.eligible,
    ),
  ).toBe(true);
  expect(
    evaluate({ ...w, concurrency: 30, peakConcurrency: 20 }).every(
      (x) => !x.eligible,
    ),
  ).toBe(true);
});
it("known hourly constraints and high availability exclude incompatible designs", () => {
  const hourly = evaluate(w, { ...h, maxHourly: 4 });
  expect(hourly.find((x) => x.candidate.id === "managed")!.eligible).toBe(
    false,
  );
  expect(hourly.find((x) => x.candidate.id === "cloud")!.eligible).toBe(true);
  expect(
    evaluate({ ...w, availability: "ha" })
      .filter((x) => x.eligible)
      .every((x) => x.candidate.availability === "redundant"),
  ).toBe(true);
});
it("only explicitly supported runtime satisfies a hard runtime requirement", () => {
  const apple = candidates.find((c) => c.id === "apple")!;
  const supported = { ...apple, runtimes: { MLX: "SUPPORTED" as const } };
  expect(
    evaluateCandidates([supported], w, { ...h, runtime: "MLX" }, p, e)[0]
      .eligible,
  ).toBe(true);
  const partial = { ...apple, runtimes: { MLX: "PARTIAL" as const } };
  expect(
    evaluateCandidates([partial], w, { ...h, runtime: "MLX" }, p, e)[0]
      .eligible,
  ).toBe(false);
});
it("a budget-excluded free API cannot win local-only through cost weight", () => {
  const freeApi = {
    ...candidates.find((c) => c.id === "api")!,
    inputPrice: 0,
    outputPrice: 0,
  };
  const result = evaluateCandidates(
    [...candidates.filter((c) => c.id !== "api"), freeApi],
    { ...w, privacy: "local" },
    h,
    { cost: 100, privacy: 0, operations: 0, scale: 0 },
    e,
  );
  expect(result[0].candidate.category.startsWith("LOCAL_")).toBe(true);
  expect(result.find((r) => r.candidate.id === "api")!.eligible).toBe(false);
});
