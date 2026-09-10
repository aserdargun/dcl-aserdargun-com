import type { Candidate, Workload } from "./types";
import { estimateRuntimeMemory, usableMemory } from "./memory";

/** Fixed allocation stress; service ceilings remain binding even with opaque memory. */
export function evaluateCapacity(
  c: Candidate,
  w: Workload,
  multiplier: number,
) {
  const peak = Math.ceil(w.peakConcurrency * multiplier);
  const memory = estimateRuntimeMemory({ ...w, peakConcurrency: peak });
  const ratio = Math.max(
    peak / c.maxConcurrency,
    w.maxContext / c.maxContext,
    c.memory.kind === "provider"
      ? w.parametersB / c.maxParametersB
      : memory.total / usableMemory(c),
  );
  return {
    peak,
    memory,
    state: ratio > 1 ? "limit" : ratio > 0.85 ? "pressure" : "ok",
  };
}
