import {
  buildLearningLink,
  semanticContextFromUrl,
  type Locale,
  type SemanticContext,
} from "@aserdargun/lab-core";
import { defaultWorkload } from "../data/defaults";
import type { Workload } from "../core/types";
import { learningGraph } from "./graph";
export function readAdaptation(
  url: URL,
): SemanticContext<"model-workload"> | null {
  const c = semanticContextFromUrl(url, "dcl", learningGraph);
  return c?.profile === "model-workload" &&
    c.sourceLab === "adp" &&
    c.payload.modelClass === "dense-decoder" &&
    c.payload.workloadType === "training" &&
    [128, 512, 1024, 2048, 4096, 8192].includes(c.payload.sequenceLength)
    ? c
    : null;
}
/** Explicit training-to-inference projection. Training memory is informational only. */
export function inferenceFromAdaptation(
  c: SemanticContext<"model-workload">,
): Workload {
  const p = c.payload,
    parametersB = p.parameterClass === "7b" ? 7 : 14;
  return {
    ...defaultWorkload,
    parametersB,
    bits:
      p.precision === "q4"
        ? 4
        : p.precision === "q8"
          ? 8
          : p.precision === "fp32"
            ? 32
            : 16,
    layers: parametersB === 7 ? 32 : 40,
    kvHeads: 8,
    headDim: 128,
    context: p.sequenceLength,
    maxContext: p.sequenceLength,
    inputTokens: Math.min(4000, p.sequenceLength - 64),
    outputTokens: 64,
    concurrency: 1,
    peakConcurrency: 1,
    weightOverrideGiB: null,
  };
}
export function servingContext(
  w: Workload,
  experimentId: string,
): SemanticContext<"serving-workload"> | null {
  if (
    ![7, 14].includes(w.parametersB) ||
    ![4, 8, 16, 32].includes(w.bits) ||
    w.weightOverrideGiB !== null
  )
    return null;
  return {
    version: "0.1",
    id: "dcl-serving",
    sourceLab: "dcl",
    sourceExperiment: experimentId,
    sourceConcept: "concept:kv-cache",
    targetLab: "tfl",
    targetConcept: "concept:kv-cache",
    intent: "continue-workload",
    profile: "serving-workload",
    payload: {
      modelClass: "dense-decoder",
      parameterClass: w.parametersB === 7 ? "7b" : "14b",
      precision:
        w.bits === 4
          ? "q4"
          : w.bits === 8
            ? "q8"
            : w.bits === 32
              ? "fp32"
              : "fp16",
      contextLength: w.context,
      averageConcurrency: w.concurrency,
      peakConcurrency: w.peakConcurrency,
      requestShape:
        w.context >= 8192
          ? "long-context"
          : w.context <= 2048
            ? "short"
            : "balanced",
      memoryPressure: "unknown",
    },
    returnTo: { appId: "dcl", experimentId, conceptId: "concept:kv-cache" },
  };
}
export function servingLink(w: Workload, experimentId: string, locale: Locale) {
  const context = servingContext(w, experimentId);
  return buildLearningLink(learningGraph, {
    targetApp: "tfl",
    experimentId: "kv",
    concept: "concept:kv-cache",
    locale,
    ...(context ? { context } : {}),
  });
}
