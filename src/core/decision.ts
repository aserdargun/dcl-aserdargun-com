import type {
  Candidate,
  Constraints,
  Economics,
  Evaluation,
  MemoryFit,
  Preferences,
  Reason,
  Workload,
} from "./types";
import {
  estimateRuntimeMemory,
  evaluateMemoryFit,
  usableMemory,
} from "./memory";
import { calculateCost, isLocal } from "./economics";
const fail = (metric: string, en: string, tr: string): Reason => ({
  type: "constraint",
  metric,
  impact: "fail",
  explanation: [en, tr],
});
export function evaluateHardConstraints(
  c: Candidate,
  w: Workload,
  h: Constraints,
  fit: MemoryFit,
): Reason[] {
  const out: Reason[] = [];
  if (
    w.hoursPerDay === 0 &&
    w.requestsPerDay > 0 &&
    w.daysPerMonth > 0 &&
    w.utilization > 0
  )
    out.push(
      fail(
        "workload-schedule",
        "Nonzero request demand needs an active processing window. Set active hours above zero or remove the demand.",
        "Sıfırdan büyük istek talebi aktif çalışma süresi gerektirir. Aktif saatleri artırın veya talebi sıfırlayın.",
      ),
    );
  if (w.inputTokens + w.outputTokens > w.maxContext)
    out.push(
      fail(
        "workload-context",
        "Input plus output tokens exceed maximum context. Correct the workload before comparing deployments.",
        "Girdi ve çıktı tokenları azami bağlamı aşıyor. Dağıtımları karşılaştırmadan önce iş yükünü düzeltin.",
      ),
    );
  if (w.concurrency > w.peakConcurrency || w.context > w.maxContext)
    out.push(
      fail(
        "workload-peak",
        "Peak values must cover typical concurrency and context.",
        "Tepe değerleri tipik eşzamanlılık ve bağlamı kapsamalıdır.",
      ),
    );
  if (fit === "DOES_NOT_FIT" || (h.mustFit && fit === "OFFLOAD"))
    out.push(
      fail(
        "memory",
        "Peak memory exceeds permitted capacity. Offload can only be considered when a configured host pool covers the deficit; otherwise a new configuration is required.",
        "Tepe bellek ihtiyacı izin verilen kapasiteyi aşıyor. Aktarım ancak yapılandırılmış ana bellek havuzu açığı karşılıyorsa değerlendirilebilir; aksi halde yeni yapılandırma gerekir.",
      ),
    );
  if (w.privacy === "local" && !isLocal(c))
    out.push(
      fail(
        "privacy",
        "Local processing is required; this path sends processing outside the local system.",
        "Yerel işleme zorunlu; bu seçenek işlemeyi yerel sistemin dışına taşır.",
      ),
    );
  if (h.maxCapex !== null && c.purchaseCost > h.maxCapex)
    out.push(
      fail(
        "capex",
        "Purchase price exceeds the capex ceiling.",
        "Satın alma fiyatı yatırım sınırını aşıyor.",
      ),
    );
  if (
    h.maxHourly !== null &&
    c.hourlyCost * (1 + c.managedPremium) > h.maxHourly
  )
    out.push(
      fail(
        "hourly",
        "Provisioned hourly rate exceeds the ceiling.",
        "Ayrılmış saatlik ücret sınırı aşıyor.",
      ),
    );
  if (h.maxHourly !== null && c.category === "TOKEN_API")
    out.push(
      fail(
        "hourly",
        "A token service cannot guarantee a provisioned hourly budget; set a separate usage budget.",
        "Token servisi ayrılmış saatlik bütçeyi garanti edemez; ayrı kullanım bütçesi belirleyin.",
      ),
    );
  if (
    h.minMemory > 0 &&
    (c.memory.kind === "provider" || usableMemory(c) < h.minMemory)
  )
    out.push(
      fail(
        "minimumMemory",
        "Minimum usable memory is not demonstrated.",
        "Asgari kullanılabilir bellek gösterilemiyor.",
      ),
    );
  if (h.runtime !== "any" && c.runtimes[h.runtime] !== "SUPPORTED")
    out.push(
      fail(
        "runtime",
        `Required ${h.runtime} support is ${c.runtimes[h.runtime] ?? "UNKNOWN"} for this exact profile.`,
        `Bu profil için gereken ${h.runtime} desteği doğrulanmadı veya desteklenmiyor.`,
      ),
    );
  if (w.peakConcurrency > c.maxConcurrency)
    out.push(
      fail(
        "capacity",
        "Peak concurrency exceeds the assumed single-configuration ceiling.",
        "Tepe eşzamanlılık varsayılan tek yapılandırma sınırını aşıyor.",
      ),
    );
  if (w.maxContext > c.maxContext)
    out.push(
      fail(
        "context",
        "Maximum context exceeds the profile contract.",
        "Azami bağlam profil sınırını aşıyor.",
      ),
    );
  if (
    c.category === "TOKEN_API" &&
    (h.exactModel || w.parametersB > c.maxParametersB)
  )
    out.push(
      fail(
        "model",
        "The API profile does not establish availability of these exact weights or this model class.",
        "API profili bu ağırlıkların veya model sınıfının sunulduğunu doğrulamıyor.",
      ),
    );
  if (w.availability === "ha" && c.availability !== "redundant")
    out.push(
      fail(
        "availability",
        "High availability requires a redundant design; this candidate is a single configuration.",
        "Yüksek erişilebilirlik yedekli tasarım gerektirir; bu aday tek yapılandırmadır.",
      ),
    );
  return out;
}
/** Keep all recommendation surfaces consistent, including a sole eligible path with no preferences. */
export function recommendation(results: Evaluation[], p: Preferences) {
  const eligible = results.filter((r) => r.eligible);
  const first = eligible[0];
  const unweighted = Object.values(normalizedWeights(p)).every((v) => v === 0);
  const tied =
    !!first &&
    eligible.filter((r) => Math.abs(r.score - first.score) < 0.01).length > 1;
  return {
    eligible,
    winner: first,
    tied: tied || (!!first && unweighted),
    unweighted,
  };
}
export function normalizedWeights(p: Preferences): Preferences {
  const sum = Object.values(p).reduce((a, b) => a + Math.max(0, b), 0);
  return Object.fromEntries(
    Object.entries(p).map(([k, v]) => [k, sum ? Math.max(0, v) / sum : 0]),
  ) as unknown as Preferences;
}
export function scoreCandidate(factors: Preferences, p: Preferences) {
  const weights = normalizedWeights(p);
  const contributions = Object.fromEntries(
    Object.entries(factors).map(([k, v]) => [
      k,
      v * weights[k as keyof Preferences],
    ]),
  ) as unknown as Preferences;
  return {
    score: Object.values(contributions).reduce((a, b) => a + b, 0),
    contributions,
  };
}
export function explainDecision(
  c: Candidate,
  cost: number,
  fit: MemoryFit,
): Reason[] {
  return [
    {
      type: "strength",
      metric: "economics",
      impact: "pass",
      explanation: [
        `Calculated horizon outlay: ${cost.toFixed(0)} USD before display conversion.`,
        `Hesaplanan dönem harcaması: gösterim dönüşümünden önce ${cost.toFixed(0)} USD.`,
      ],
    },
    {
      type: "strength",
      metric: "control",
      impact: "pass",
      explanation: c.strengths,
    },
    {
      type: "tradeoff",
      metric: "operations",
      impact: "unknown",
      explanation: c.weaknesses,
    },
    {
      type: "evidence",
      metric: "performance",
      impact: "unknown",
      explanation: [
        "Memory feasibility does not verify TTFT or throughput. Benchmark this exact workload in TFL and a real runtime.",
        "Bellek uygunluğu TTFT veya token hızını doğrulamaz. Bu iş yükünü TFL ve gerçek çalışma zamanında inceleyin.",
      ],
    },
    {
      type: "evidence",
      metric: "data",
      impact: "unknown",
      explanation: [
        "LOW EVIDENCE: prices, power, capacity ceilings and preference ratings are teaching assumptions.",
        "DÜŞÜK KANIT: fiyat, güç, kapasite sınırları ve tercih puanları eğitim varsayımlarıdır.",
      ],
    },
    ...(fit === "DOES_NOT_FIT" || fit === "OFFLOAD"
      ? [
          {
            type: "evidence" as const,
            metric: "memory-unverified",
            impact: "unknown" as const,
            explanation: [
              "This configuration does not fit accelerator memory. Relaxing the memory constraint permits exploration only; it does not establish a runnable deployment.",
              "Bu yapılandırma hızlandırıcı belleğine sığmıyor. Bellek kısıtını kaldırmak yalnızca incelemeye izin verir; çalışabilir bir dağıtımı doğrulamaz.",
            ] as const,
          },
        ]
      : []),
    ...(fit === "PROVIDER_MANAGED"
      ? [
          {
            type: "evidence" as const,
            metric: "model-equivalence",
            impact: "unknown" as const,
            explanation: [
              "API model identity, quality and quantization equivalence are unverified. Physical memory is not exposed.",
              "API model kimliği, kalitesi ve nicemleme eşdeğerliği doğrulanmadı. Fiziksel bellek görünmüyor.",
            ] as const,
          },
        ]
      : []),
  ];
}
export function evaluateCandidates(
  cs: Candidate[],
  w: Workload,
  h: Constraints,
  p: Preferences,
  e: Economics,
): Evaluation[] {
  const mem = estimateRuntimeMemory(w);
  const initial = cs.map((c) => {
    const fit = evaluateMemoryFit(c, mem.total);
    const cost = calculateCost(c, w, e);
    const failures = evaluateHardConstraints(c, w, h, fit);
    return {
      candidate: c,
      memoryFit: fit,
      usableMemory: usableMemory(c),
      cost,
      failures,
      eligible: failures.length === 0,
      reasons: explainDecision(c, cost.total, fit),
    };
  });
  const costs = initial.filter((x) => x.eligible).map((x) => x.cost.total);
  const lo = Math.min(...costs),
    hi = Math.max(...costs);
  return initial
    .map((x) => {
      const factors: Preferences = {
        cost: hi === lo ? 100 : (100 * (hi - x.cost.total)) / (hi - lo),
        privacy: x.candidate.privacyScore,
        operations: x.candidate.operationsScore,
        scale: x.candidate.scaleScore,
      };
      const scored = x.eligible
        ? scoreCandidate(factors, p)
        : {
            score: 0,
            contributions: { cost: 0, privacy: 0, operations: 0, scale: 0 },
          };
      return {
        ...x,
        factors: x.eligible
          ? factors
          : { cost: 0, privacy: 0, operations: 0, scale: 0 },
        ...scored,
      };
    })
    .sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) ||
        b.score - a.score ||
        a.candidate.id.localeCompare(b.candidate.id),
    );
}
