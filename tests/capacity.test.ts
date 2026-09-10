import { expect, it } from "vitest";
import { evaluateCapacity } from "../src/core/scale";
import { evaluateCandidates, recommendation } from "../src/core/decision";
import { candidates } from "../src/data/candidates";
import {
  defaultWorkload as w,
  defaultConstraints as h,
  defaultEconomics as e,
} from "../src/data/defaults";
import { validNumber } from "../src/core/input";

it("zero preferences cannot recommend even the only eligible path", () => {
  const p = { cost: 0, privacy: 0, scale: 0, operations: 0 };
  const results = evaluateCandidates(
    candidates,
    { ...w, privacy: "local" },
    h,
    p,
    e,
  );
  expect(recommendation(results, p).eligible).toHaveLength(1);
  expect(recommendation(results, p).unweighted).toBe(true);
});

it("opaque API memory cannot conceal an unsupported model class or context", () => {
  const api = candidates.find((c) => c.id === "api")!;
  expect(evaluateCapacity(api, { ...w, parametersB: 405 }, 1).state).toBe(
    "limit",
  );
  expect(evaluateCapacity({ ...api, maxContext: 4096 }, w, 1).state).toBe(
    "limit",
  );
});

it("growth increases both memory and quota pressure with a fixed allocation", () => {
  const cloud = candidates.find((c) => c.id === "cloud")!;
  expect(evaluateCapacity(cloud, w, 1).state).toBe("ok");
  const peak = evaluateCapacity(cloud, w, 5);
  expect(peak.peak).toBe(100);
  expect(peak.state).toBe("limit");
});

it("manual FX defaults and fractional rates match their step base", () => {
  expect(validNumber("1", 0.0001, 1e6, 0.0001)).toBe(true);
  expect(validNumber("38.5678", 0.0001, 1e6, 0.0001)).toBe(true);
});
