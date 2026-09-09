export type Text = readonly [string, string];
export type Locale = "en" | "tr";
export type Category =
  | "LOCAL_NVIDIA"
  | "LOCAL_AMD"
  | "LOCAL_APPLE"
  | "CLOUD_VM"
  | "MANAGED_INFERENCE"
  | "TOKEN_API";
export type Runtime =
  | "any"
  | "vLLM"
  | "SGLang"
  | "TensorRT-LLM"
  | "llama.cpp"
  | "MLX"
  | "Ollama";
export type Support = "SUPPORTED" | "PARTIAL" | "UNKNOWN" | "UNSUPPORTED";
export type SourceStatus =
  | "EDUCATIONAL_DEFAULT"
  | "VERIFIED"
  | "ESTIMATED"
  | "USER_OVERRIDE";
export interface Evidence {
  status: SourceStatus;
  source: string;
  verifiedAt: string | null;
  assumptions: Text;
}
export interface Workload {
  parametersB: number;
  bits: number;
  weightOverrideGiB: number | null;
  layers: number;
  kvHeads: number;
  headDim: number;
  kvBytes: number;
  context: number;
  maxContext: number;
  concurrency: number;
  peakConcurrency: number;
  requestsPerDay: number;
  inputTokens: number;
  outputTokens: number;
  hoursPerDay: number;
  daysPerMonth: number;
  utilization: number;
  shape: "bursty" | "business" | "continuous" | "batch";
  ttft: "relaxed" | "interactive" | "strict";
  throughput: number;
  privacy: "low" | "medium" | "high" | "local";
  availability: "best" | "business" | "always" | "ha";
  growth: "static" | "moderate" | "rapid";
  horizon: number;
  weightOverhead: number;
  workspaceGiB: number;
  workspacePerSequence: number;
  headroom: number;
}
export interface Constraints {
  mustFit: boolean;
  maxCapex: number | null;
  maxHourly: number | null;
  minMemory: number;
  runtime: Runtime;
  exactModel: boolean;
}
export interface Preferences {
  cost: number;
  privacy: number;
  operations: number;
  scale: number;
}
export interface Economics {
  electricity: number;
  maintenanceMonthly: number;
  storageMonthly: number;
  egressMonthly: number;
  keepCloudWarm: boolean;
  keepLocalOn: boolean;
  currency: "USD" | "EUR" | "TRY";
  fx: number;
}
export interface Candidate {
  id: string;
  name: string;
  category: Category;
  color: string;
  hardware: Text;
  memory: {
    kind: "discrete" | "unified" | "provider";
    capacityGiB: number;
    reservedGiB: number;
    offloadPoolGiB: number;
  };
  purchaseCost: number;
  hourlyCost: number;
  managedPremium: number;
  power: { idle: number; normal: number; peak: number };
  peakShare: number;
  inputPrice: number;
  outputPrice: number;
  privacyScore: number;
  operationsScore: number;
  scaleScore: number;
  control: Text;
  scaling: Text;
  strengths: Text;
  weaknesses: Text;
  maxConcurrency: number;
  maxContext: number;
  maxParametersB: number;
  maxReplicas: number;
  availability: "single" | "redundant";
  runtimes: Partial<Record<Runtime, Support>>;
  evidence: Evidence;
  performance: {
    latency: "Unknown" | "Excellent" | "Good" | "Acceptable" | "Poor";
    ttftMs: number | null;
    throughput: number | null;
    evidence: Evidence;
  };
}
export type CandidateOverride = Partial<
  Pick<Candidate, "purchaseCost" | "hourlyCost" | "inputPrice" | "outputPrice">
>;
export interface ScenarioDefinition {
  id: string;
  title: Text;
  description: Text;
  workload: Workload;
  constraints: Constraints;
  preferences: Preferences;
  learningObjectives: Text;
}
export interface MemoryEstimate {
  weights: number;
  metadata: number;
  kv: number;
  workspace: number;
  headroom: number;
  total: number;
}
export type MemoryFit =
  | "COMFORTABLE"
  | "LIMITED"
  | "DOES_NOT_FIT"
  | "OFFLOAD"
  | "PROVIDER_MANAGED";
export interface Cost {
  capex: number;
  electricity: number;
  infrastructure: number;
  tokens: number;
  storage: number;
  egress: number;
  maintenance: number;
  monthly: number;
  total: number;
  year1: number;
  year3: number;
  billableHours: number;
  loadHours: number;
  idleHours: number;
}
export interface Reason {
  type: "constraint" | "strength" | "tradeoff" | "evidence";
  metric: string;
  impact: "pass" | "fail" | "unknown";
  explanation: Text;
}
export interface Evaluation {
  candidate: Candidate;
  memoryFit: MemoryFit;
  usableMemory: number;
  cost: Cost;
  failures: Reason[];
  reasons: Reason[];
  eligible: boolean;
  score: number;
  factors: Preferences;
  contributions: Preferences;
}
export interface CandidateDataProvider {
  getCandidates(): Candidate[];
  getPricing(): Record<
    string,
    Pick<
      Candidate,
      "purchaseCost" | "hourlyCost" | "inputPrice" | "outputPrice"
    >
  >;
  getFreshness(now: Date): Record<string, string>;
}
