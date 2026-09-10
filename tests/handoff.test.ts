import { describe, it, expect } from "vitest";
import {
  buildLearningLink,
  validateSemanticLearningContext,
  type SemanticContext,
} from "@aserdargun/lab-core";
import { learningGraph } from "../src/ils/graph";
import {
  readAdaptation,
  inferenceFromAdaptation,
  servingContext,
  servingLink,
} from "../src/ils/handoff";
import { defaultWorkload } from "../src/data/defaults";
import { estimateRuntimeMemory } from "../src/core/memory";
const context: SemanticContext<"model-workload"> = {
  version: "0.1",
  id: "test-adp",
  sourceLab: "adp",
  sourceExperiment: "memory",
  sourceConcept: "concept:training-memory",
  targetLab: "dcl",
  targetConcept: "concept:capacity-planning",
  intent: "continue-workload",
  profile: "model-workload",
  payload: {
    modelClass: "dense-decoder",
    parameterClass: "14b",
    precision: "q4",
    adaptation: "qlora",
    sequenceLength: 8192,
    estimatedMemoryGiB: 42,
    workloadType: "training",
  },
  returnTo: {
    appId: "adp",
    experimentId: "memory",
    conceptId: "concept:training-memory",
  },
};
describe("DCL semantic boundary", () => {
  it("requires deliberate inference projection and never imports training memory into runtime memory", () => {
    const url = new URL(
      buildLearningLink(learningGraph, { targetApp: "dcl", context }),
    );
    expect(readAdaptation(url)).toEqual(context);
    const w = inferenceFromAdaptation(context);
    expect(w).toMatchObject({
      parametersB: 14,
      bits: 4,
      context: 8192,
      concurrency: 1,
      layers: 40,
      weightOverrideGiB: null,
    });
    expect(estimateRuntimeMemory(w)).toEqual(
      estimateRuntimeMemory(
        inferenceFromAdaptation({
          ...context,
          payload: { ...context.payload, estimatedMemoryGiB: 1000 },
        }),
      ),
    );
    const serving = servingContext(
      { ...w, concurrency: 4, peakConcurrency: 16 },
      "personal",
    )!;
    expect(validateSemanticLearningContext(serving, learningGraph).ok).toBe(
      true,
    );
    expect(serving.payload).not.toHaveProperty("estimatedMemoryGiB");
    expect(new URL(servingLink(w, "personal", "tr")).hostname).toBe(
      "tfl.aserdargun.com",
    );
  });
  it("fails safely on malformed, unsupported and secret-bearing payloads", () => {
    for (const patch of [
      { version: "9" },
      { payload: { ...context.payload, apiKey: "secret" } },
      { payload: { ...context.payload, modelClass: "mixture-of-experts" } },
    ]) {
      const u = new URL("https://dcl.aserdargun.com");
      u.searchParams.set("ils", JSON.stringify({ ...context, ...patch }));
      expect(readAdaptation(u)).toBeNull();
    }
    expect(
      readAdaptation(new URL("https://dcl.aserdargun.com/?ils=no")),
    ).toBeNull();
    expect(servingContext(defaultWorkload, "team70")).toBeNull();
  });
});
