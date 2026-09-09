import type { Evaluation, MemoryEstimate, Workload } from "../core/types";
import { estimateRuntimeMemory } from "../core/memory";
import {
  External,
  Num,
  Section,
  useCandidateName,
  useT,
  useText,
  fitText,
} from "./ui";
const colors = ["#79deba", "#b7decf", "#80b6de", "#aea9e8", "#dfb45e"];
export function MemoryBar({
  memory,
  capacity,
}: {
  memory: MemoryEstimate;
  capacity: number;
}) {
  const t = useT();
  const values = [
    memory.weights,
    memory.metadata,
    memory.kv,
    memory.workspace,
    memory.headroom,
  ];
  const labels = [
    t("Weights", "Ağırlıklar"),
    t("Metadata", "Üst veri"),
    t("KV cache", "KV önbelleği"),
    t("Runtime", "Çalışma alanı"),
    t("Headroom", "Güvenlik payı"),
  ];
  return (
    <>
      <div
        className="memory-bar"
        role="img"
        aria-label={values
          .map((v, i) => `${labels[i]} ${v.toFixed(1)} GiB`)
          .join(", ")}
      >
        {values.map((v, i) => (
          <span
            key={i}
            style={{
              width: `${(v / Math.max(memory.total, capacity, 1)) * 100}%`,
              background: colors[i],
            }}
          />
        ))}
      </div>
      <div className="memory-legend">
        {values.map((v, i) => (
          <span key={i}>
            <i style={{ background: colors[i] }} />
            {labels[i]} <b>{v.toFixed(1)}</b>
          </span>
        ))}
      </div>
    </>
  );
}
export function MemoryPanel({
  w,
  setW,
  results,
}: {
  w: Workload;
  setW: (w: Workload) => void;
  results: Evaluation[];
}) {
  const name = useCandidateName();
  const t = useT(),
    txt = useText();
  const peak = estimateRuntimeMemory(w),
    avg = estimateRuntimeMemory(w, false);
  const field = (
    key: keyof Workload,
    label: string,
    min = 0,
    max = 1024,
    step = 1,
  ) => (
    <Num
      label={label}
      key={key}
      value={w[key] as number}
      min={min}
      max={max}
      step={step}
      onChange={(n) => setW({ ...w, [key]: n ?? 0 })}
    />
  );
  return (
    <Section
      title={t(
        "The model fits. Does the workload?",
        "Model sığıyor. Peki iş yükü?",
      )}
      description={t(
        "Weights are just the beginning. Context and simultaneous sequences add runtime state. Capacity is checked against maximum context × peak concurrency.",
        "Ağırlıklar yalnızca başlangıç. Bağlam ve eşzamanlı diziler ek bellek kullanır. Kapasite, azami bağlam × tepe eşzamanlılığa göre denetlenir.",
      )}
    >
      <div className="metric-grid">
        <div>
          <span>{t("Weights only", "Yalnızca ağırlıklar")}</span>
          <strong>
            {peak.weights.toFixed(1)} <small>GiB</small>
          </strong>
        </div>
        <div>
          <span>{t("Typical runtime total", "Tipik toplam bellek")}</span>
          <strong>
            {avg.total.toFixed(1)} <small>GiB</small>
          </strong>
        </div>
        <div>
          <span>{t("Peak reserved total", "Tepe için ayrılan toplam")}</span>
          <strong data-testid="memory-peak">
            {peak.total.toFixed(1)} <small>GiB</small>
          </strong>
        </div>
      </div>
      <div className="source-line estimated">
        {t(
          "ESTIMATE · DENSE GQA TEACHING ARCHITECTURE",
          "TAHMİN · YOĞUN GQA EĞİTİM MİMARİSİ",
        )}
      </div>
      <MemoryBar memory={peak} capacity={peak.total} />
      <div className="memory-candidates">
        {results.map((r) => (
          <div key={r.candidate.id}>
            <header>
              <strong>{name(r.candidate)}</strong>
              <span className={`fit ${r.memoryFit.toLowerCase()}`}>
                {txt(fitText[r.memoryFit])}
              </span>
            </header>
            {r.candidate.memory.kind === "provider" ? (
              <p>
                {t(
                  "Physical capacity is not exposed. Context/model/quota assumptions are checked separately; model equivalence needs validation.",
                  "Fiziksel kapasite görünmüyor. Bağlam/model/kota varsayımları ayrıca denetlenir; model eşdeğerliği doğrulanmalıdır.",
                )}
              </p>
            ) : (
              <>
                <div className="capacity-track">
                  <span
                    style={{
                      width: `${Math.min(100, (peak.total / r.usableMemory) * 100)}%`,
                      background:
                        peak.total > r.usableMemory
                          ? "#c88f83"
                          : peak.total > r.usableMemory * 0.85
                            ? "#dfb45e"
                            : "#79deba",
                    }}
                  />
                </div>
                <p>
                  {peak.total.toFixed(1)} / {r.usableMemory} GiB{" "}
                  {t("usable", "kullanılabilir")} ·{" "}
                  {r.candidate.memory.reservedGiB} GiB{" "}
                  {t("system reserve", "sistem rezervi")}
                  {r.candidate.memory.offloadPoolGiB > 0 &&
                    ` · ${r.candidate.memory.offloadPoolGiB} GiB ${t("separate host offload pool (not VRAM)", "ayrı ana bellek aktarım havuzu (VRAM değil)")}`}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="architecture-pair">
        <article>
          <h3>{t("Discrete GPU memory", "Ayrık GPU belleği")}</h3>
          <div className="pool-row">
            <span>CPU RAM</span>
            <b>↔ PCIe ↔</b>
            <span>GPU VRAM</span>
          </div>
          <p>
            {t(
              "Separate physical pools. Host RAM is not automatically usable VRAM. Offload adds data movement and requires runtime validation.",
              "Ayrı fiziksel havuzlar. Ana bellek otomatik olarak VRAM olmaz. Aktarım veri taşımayı artırır ve çalışma zamanında doğrulama gerektirir.",
            )}
          </p>
        </article>
        <article>
          <h3>{t("Apple unified memory", "Apple birleşik bellek")}</h3>
          <div className="unified-pool">
            <span>
              CPU · GPU · {t("System accelerators", "Sistem hızlandırıcıları")}
            </span>
            <strong>
              {t(
                "Shared physical memory pool",
                "Paylaşılan fiziksel bellek havuzu",
              )}
            </strong>
          </div>
          <p>
            {t(
              "CPU and GPU access a shared memory architecture. OS use, bandwidth, allocation limits and software support still matter. This profile reserves 24 GiB for the system.",
              "CPU ve GPU ortak bellek mimarisini kullanır. İşletim sistemi, bant genişliği, ayırma sınırları ve yazılım desteği hâlâ önemlidir. Bu profil sisteme 24 GiB ayırır.",
            )}
          </p>
        </article>
      </div>
      <details className="settings" open>
        <summary>
          {t("Inspect the memory equation", "Bellek denklemini incele")}
        </summary>
        <div className="equation">
          {t("Weights", "Ağırlıklar")} = {w.parametersB} × 10⁹ × {w.bits} / 8 /
          2³⁰ GiB
          <br />
          KV = 2 × {w.layers} × {w.kvHeads} × {w.headDim} × {w.kvBytes} ×{" "}
          {w.maxContext} × {w.peakConcurrency} / 2³⁰ GiB
        </div>
        <p>
          {t(
            "KV dimensions: key + value × layers × KV heads × head dimension × bytes per cache element × resident tokens × sequences. Q4 weights do not imply Q4 KV cache.",
            "KV boyutları: anahtar + değer × katman × KV başlığı × başlık boyutu × önbellek elemanı baytı × bellekteki token × dizi. Q4 ağırlık, Q4 KV önbelleği demek değildir.",
          )}
        </p>
        <div className="settings-grid">
          <div>
            {field("layers", t("Layers", "Katman"), 1, 1024)}
            {field("kvHeads", t("KV heads", "KV başlığı"), 1, 256)}
            {field("headDim", t("Head dimension", "Başlık boyutu"), 1, 1024)}
            {field(
              "kvBytes",
              t("KV bytes/element", "KV bayt/eleman"),
              0.5,
              4,
              0.5,
            )}
            <Num
              label={t(
                "Weight override GiB (blank = formula)",
                "Ağırlık GiB (boş = formül)",
              )}
              value={w.weightOverrideGiB}
              optional
              step={0.1}
              onChange={(n) => setW({ ...w, weightOverrideGiB: n })}
            />
          </div>
          <div>
            <Num
              label={t(
                "Weight metadata overhead (%)",
                "Ağırlık üst veri ek yükü (%)",
              )}
              value={w.weightOverhead * 100}
              max={100}
              onChange={(n) => setW({ ...w, weightOverhead: (n ?? 0) / 100 })}
            />
            {field(
              "workspaceGiB",
              t("Base workspace GiB", "Temel çalışma alanı GiB"),
              0,
              1024,
              0.5,
            )}
            {field(
              "workspacePerSequence",
              t("Workspace GiB/sequence", "Çalışma alanı GiB/dizi"),
              0,
              10,
              0.025,
            )}
            <Num
              label={t("Safety headroom (%)", "Güvenlik payı (%)")}
              value={w.headroom * 100}
              max={100}
              onChange={(n) => setW({ ...w, headroom: (n ?? 0) / 100 })}
            />
          </div>
        </div>
        <p className="muted">
          {t(
            "Static educational defaults: 8% weight metadata, 4 GiB workspace + 0.025 GiB/sequence, 20% reserve. Total = (weights + metadata + KV + workspace) × (1 + reserve). Limited headroom means total exceeds 85% of usable memory.",
            "Sabit eğitim varsayımları: %8 ağırlık üst verisi, 4 GiB çalışma alanı + 0,025 GiB/dizi, %20 pay. Toplam = (ağırlık + üst veri + KV + çalışma alanı) × (1 + pay). Sınırlı boşluk, toplamın kullanılabilir belleğin %85’ini aşmasıdır.",
          )}
        </p>
        <small>
          {t(
            "Dense full-attention approximation. No sliding windows, prefix sharing, cache eviction, sharding duplication or runtime-specific alignment modeled. Parameter count alone does not specify architecture.",
            "Yoğun tam dikkat yaklaşımı. Kayan pencere, ortak önek, önbellek tahliyesi, bölmede çoğaltma veya çalışma zamanına özgü hizalama modellenmez. Parametre sayısı tek başına mimariyi belirlemez.",
          )}
        </small>
      </details>
      <div className="links-row">
        <External href="https://lcl.aserdargun.com/">
          {t("Local hardware → LCL", "Yerel donanım → LCL")}
        </External>
        <External href="https://tfl.aserdargun.com/">
          {t("Serving impact → TFL", "Servis etkisi → TFL")}
        </External>
        <External href="https://huggingface.co/docs/transformers/kv_cache">
          {t("KV cache reference", "KV önbelleği kaynağı")}
        </External>
        <External href="https://github.com/ml-explore/mlx">MLX</External>
      </div>
    </Section>
  );
}
