import type { Candidate, MemoryEstimate, MemoryFit, Workload } from "./types";
export const GIB = 2 ** 30;
export function estimateModelMemory(parametersB: number, bits: number): number {
  return (parametersB * 1e9 * bits) / 8 / GIB;
}
/** Dense full-attention GQA illustration; no cache sharing, eviction, or offload. */
export function estimateRuntimeMemory(
  w: Workload,
  peak = true,
): MemoryEstimate {
  const weights =
    w.weightOverrideGiB ?? estimateModelMemory(w.parametersB, w.bits);
  const metadata = weights * w.weightOverhead;
  const sequences = peak ? w.peakConcurrency : w.concurrency;
  const context = peak ? w.maxContext : w.context;
  const kv =
    (2 * w.layers * w.kvHeads * w.headDim * w.kvBytes * context * sequences) /
    GIB;
  const workspace = w.workspaceGiB + w.workspacePerSequence * sequences;
  const headroom = (weights + metadata + kv + workspace) * w.headroom;
  return {
    weights,
    metadata,
    kv,
    workspace,
    headroom,
    total: weights + metadata + kv + workspace + headroom,
  };
}
export const usableMemory = (c: Candidate) =>
  Math.max(0, c.memory.capacityGiB - c.memory.reservedGiB);
export function evaluateMemoryFit(
  c: Candidate,
  requirement: number,
): MemoryFit {
  if (c.memory.kind === "provider") return "PROVIDER_MANAGED";
  const available = usableMemory(c);
  if (requirement > available)
    return c.memory.offloadPoolGiB > 0 &&
      requirement <= available + c.memory.offloadPoolGiB
      ? "OFFLOAD"
      : "DOES_NOT_FIT";
  return requirement > available * 0.85 ? "LIMITED" : "COMFORTABLE";
}
