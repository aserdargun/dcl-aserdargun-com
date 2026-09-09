import type {
  Candidate,
  CandidateDataProvider,
  CandidateOverride,
  Evidence,
} from "../core/types";
import { freshness } from "../core/freshness";
const educational: Evidence = {
  status: "EDUCATIONAL_DEFAULT",
  source: "DCL synthetic teaching profile v1",
  verifiedAt: null,
  assumptions: [
    "Illustrative capacity, power and prices; no purchasable product or provider quote. Validate the exact model, device and runtime before deployment.",
    "Örnek kapasite, güç ve fiyatlar; gerçek ürün veya sağlayıcı teklifi değildir. Dağıtımdan önce model, cihaz ve çalışma zamanını doğrulayın.",
  ],
};
const common = {
  purchaseCost: 0,
  hourlyCost: 0,
  managedPremium: 0,
  power: { idle: 0, normal: 0, peak: 0 },
  peakShare: 0.1,
  inputPrice: 0,
  outputPrice: 0,
  maxContext: 131072,
  maxParametersB: 405,
  maxReplicas: 1,
  availability: "single" as const,
  evidence: educational,
  performance: {
    latency: "Unknown" as const,
    ttftMs: null,
    throughput: null,
    evidence: educational,
  },
};
export const candidates: Candidate[] = [
  {
    ...common,
    id: "nvidia",
    name: "Local NVIDIA",
    category: "LOCAL_NVIDIA",
    color: "#91bd70",
    hardware: [
      "48 GiB discrete accelerator profile",
      "48 GiB ayrık hızlandırıcı profili",
    ],
    memory: {
      kind: "discrete",
      capacityGiB: 48,
      reservedGiB: 2,
      offloadPoolGiB: 0,
    },
    purchaseCost: 6000,
    power: { idle: 70, normal: 420, peak: 600 },
    privacyScore: 100,
    operationsScore: 35,
    scaleScore: 20,
    control: ["Local system", "Yerel sistem"],
    scaling: ["Fixed single-node capacity", "Sabit tek düğüm kapasitesi"],
    strengths: [
      "Local control; CUDA runtime ecosystem to investigate.",
      "Yerel kontrol; incelenebilecek CUDA çalışma zamanı ekosistemi.",
    ],
    weaknesses: [
      "Upfront purchase; limited VRAM; cooling and maintenance.",
      "İlk yatırım; sınırlı VRAM; soğutma ve bakım.",
    ],
    maxConcurrency: 32,
    runtimes: {
      vLLM: "UNKNOWN",
      "TensorRT-LLM": "UNKNOWN",
      "llama.cpp": "UNKNOWN",
      MLX: "UNSUPPORTED",
    },
  },
  {
    ...common,
    id: "amd",
    name: "Local AMD",
    category: "LOCAL_AMD",
    color: "#dfb45e",
    hardware: [
      "96 GiB discrete accelerator profile",
      "96 GiB ayrık hızlandırıcı profili",
    ],
    memory: {
      kind: "discrete",
      capacityGiB: 96,
      reservedGiB: 4,
      offloadPoolGiB: 128,
    },
    purchaseCost: 8500,
    power: { idle: 80, normal: 480, peak: 650 },
    privacyScore: 100,
    operationsScore: 30,
    scaleScore: 20,
    control: ["Local system", "Yerel sistem"],
    scaling: [
      "Fixed node; offload is not VRAM",
      "Sabit düğüm; aktarım belleği VRAM değildir",
    ],
    strengths: [
      "Local accelerator capacity; ROCm ecosystem to investigate.",
      "Yerel hızlandırıcı kapasitesi; incelenebilecek ROCm ekosistemi.",
    ],
    weaknesses: [
      "Verify exact GPU/runtime support; offload speed unknown.",
      "GPU/çalışma zamanı desteğini doğrulayın; aktarım hızı bilinmiyor.",
    ],
    maxConcurrency: 32,
    runtimes: {
      vLLM: "UNKNOWN",
      SGLang: "UNKNOWN",
      "llama.cpp": "UNKNOWN",
      MLX: "UNSUPPORTED",
      "TensorRT-LLM": "UNSUPPORTED",
    },
  },
  {
    ...common,
    id: "apple",
    name: "Local Apple",
    category: "LOCAL_APPLE",
    color: "#79deba",
    hardware: [
      "192 GiB unified-memory profile",
      "192 GiB birleşik bellek profili",
    ],
    memory: {
      kind: "unified",
      capacityGiB: 192,
      reservedGiB: 24,
      offloadPoolGiB: 0,
    },
    purchaseCost: 7000,
    power: { idle: 25, normal: 180, peak: 300 },
    privacyScore: 100,
    operationsScore: 55,
    scaleScore: 15,
    control: ["Shared local memory pool", "Paylaşılan yerel bellek havuzu"],
    scaling: [
      "Fixed memory; no automatic upgrades",
      "Sabit bellek; otomatik yükseltme yok",
    ],
    strengths: [
      "Shared CPU/GPU memory architecture; local data control.",
      "Paylaşılan CPU/GPU bellek mimarisi; yerel veri kontrolü.",
    ],
    weaknesses: [
      "OS shares the pool; bandwidth and runtime limits remain.",
      "İşletim sistemi aynı havuzu kullanır; bant genişliği ve çalışma zamanı sınırları sürer.",
    ],
    maxConcurrency: 32,
    runtimes: {
      MLX: "UNKNOWN",
      "llama.cpp": "UNKNOWN",
      Ollama: "UNKNOWN",
      "TensorRT-LLM": "UNSUPPORTED",
      vLLM: "UNKNOWN",
    },
  },
  {
    ...common,
    id: "cloud",
    name: "Cloud GPU VM",
    category: "CLOUD_VM",
    color: "#80b6de",
    hardware: [
      "256 GiB effective accelerator-memory profile",
      "256 GiB etkin hızlandırıcı belleği profili",
    ],
    memory: {
      kind: "discrete",
      capacityGiB: 256,
      reservedGiB: 16,
      offloadPoolGiB: 0,
    },
    hourlyCost: 4,
    privacyScore: 65,
    operationsScore: 30,
    scaleScore: 70,
    control: ["Private rented infrastructure", "Özel kiralık altyapı"],
    scaling: [
      "One provisioned unit; quota-dependent expansion",
      "Tek ayrılmış birim; kotaya bağlı genişleme",
    ],
    strengths: [
      "No purchase; choose and operate your serving stack.",
      "Satın alma yok; servis yazılımını seçin ve yönetin.",
    ],
    weaknesses: [
      "Idle billing, storage and egress; operator manages uptime.",
      "Boşta fatura, depolama ve çıkış trafiği; çalışma süresini operatör yönetir.",
    ],
    maxConcurrency: 64,
    maxReplicas: 4,
    runtimes: {
      vLLM: "UNKNOWN",
      SGLang: "UNKNOWN",
      "TensorRT-LLM": "UNKNOWN",
      "llama.cpp": "UNKNOWN",
      MLX: "UNSUPPORTED",
    },
  },
  {
    ...common,
    id: "managed",
    name: "Managed inference",
    category: "MANAGED_INFERENCE",
    color: "#aea9e8",
    hardware: [
      "512 GiB dedicated-endpoint teaching profile",
      "512 GiB ayrılmış uç nokta eğitim profili",
    ],
    memory: {
      kind: "discrete",
      capacityGiB: 512,
      reservedGiB: 32,
      offloadPoolGiB: 0,
    },
    hourlyCost: 5,
    managedPremium: 0.3,
    privacyScore: 45,
    operationsScore: 85,
    scaleScore: 85,
    control: [
      "Provider-operated dedicated endpoint",
      "Sağlayıcının işlettiği ayrılmış uç nokta",
    ],
    scaling: [
      "Configured endpoint; scaling requires quota and billing",
      "Yapılandırılmış uç nokta; ölçekleme kota ve fatura gerektirir",
    ],
    strengths: [
      "Bring model weights with less infrastructure operation.",
      "Model ağırlıklarınızı daha az altyapı yönetimiyle kullanın.",
    ],
    weaknesses: [
      "Hourly endpoint plus 30% synthetic premium; verify service terms.",
      "Saatlik uç nokta ve varsayımsal %30 ek ücret; servis koşullarını doğrulayın.",
    ],
    maxConcurrency: 100,
    maxReplicas: 8,
    availability: "redundant",
    runtimes: { vLLM: "UNKNOWN", SGLang: "UNKNOWN", MLX: "UNSUPPORTED" },
  },
  {
    ...common,
    id: "api",
    name: "Token API",
    category: "TOKEN_API",
    color: "#cca1e7",
    hardware: [
      "Provider-managed model-class alternative",
      "Sağlayıcı yönetiminde model sınıfı alternatifi",
    ],
    memory: {
      kind: "provider",
      capacityGiB: 0,
      reservedGiB: 0,
      offloadPoolGiB: 0,
    },
    inputPrice: 1,
    outputPrice: 3,
    privacyScore: 15,
    operationsScore: 100,
    scaleScore: 90,
    control: ["External request processing", "Harici istek işleme"],
    scaling: [
      "Assumed service ceiling; verify quotas",
      "Varsayılan servis sınırı; kotaları doğrulayın",
    ],
    strengths: [
      "No hardware purchase; no idle token charges.",
      "Donanım yatırımı yok; boşta token ücreti yok.",
    ],
    weaknesses: [
      "Model equivalence unverified; provider dependency; quotas.",
      "Model eşdeğerliği doğrulanmadı; sağlayıcı bağımlılığı; kotalar.",
    ],
    maxConcurrency: 100,
    maxParametersB: 70,
    availability: "redundant",
    runtimes: {
      vLLM: "UNSUPPORTED",
      "llama.cpp": "UNSUPPORTED",
      MLX: "UNSUPPORTED",
    },
  },
];
export function applyOverride(
  c: Candidate,
  override: CandidateOverride | undefined,
): Candidate {
  if (!override || Object.keys(override).length === 0) return c;
  for (const value of Object.values(override))
    if (!Number.isFinite(value) || value < 0)
      throw new Error("Invalid candidate override");
  return {
    ...c,
    ...override,
    evidence: { ...c.evidence, status: "USER_OVERRIDE" },
  };
}
export const staticProvider: CandidateDataProvider = {
  getCandidates: () => structuredClone(candidates),
  getPricing: () =>
    Object.fromEntries(
      candidates.map((c) => [
        c.id,
        {
          purchaseCost: c.purchaseCost,
          hourlyCost: c.hourlyCost,
          inputPrice: c.inputPrice,
          outputPrice: c.outputPrice,
        },
      ]),
    ),
  getFreshness: (now) =>
    Object.fromEntries(
      candidates.map((c) => [c.id, freshness(c.evidence, now)]),
    ),
};
