import { Num, Select, Check, Slider, useT } from "./ui";
import type { Constraints, Workload } from "../core/types";
export function WorkloadControls({
  w,
  setW,
  h,
  setH,
}: {
  w: Workload;
  setW: (w: Workload) => void;
  h: Constraints;
  setH: (h: Constraints) => void;
}) {
  const t = useT();
  const update = <K extends keyof Workload>(key: K, v: Workload[K]) =>
    setW({ ...w, [key]: v });
  const field = (
    key: keyof Workload,
    label: string,
    min = 0,
    max = 1e7,
    step = 1,
  ) => (
    <Num
      key={key}
      label={label}
      value={w[key] as number}
      min={min}
      max={max}
      step={step}
      onChange={(n) => update(key, n ?? min)}
    />
  );
  return (
    <aside className="workload">
      <details className="workload-disclosure" open>
        <summary>
          {t("What are you trying to run?", "Ne çalıştırmak istiyorsunuz?")}
        </summary>
        <div className="workload-body">
          <div className="source-line user-input">
            {t("USER INPUT", "KULLANICI GİRDİSİ")}
          </div>
          <Select
            label={t("Model class", "Model sınıfı")}
            value={String(w.parametersB)}
            options={["7", "8", "14", "32", "70", "405"].map((n) => [
              n,
              `${n}B ${t("class", "sınıfı")}`,
            ])}
            onChange={(v) =>
              setW({
                ...w,
                parametersB: Number(v),
                layers:
                  v === "7" || v === "8" ? 32 : v === "14" ? 40 : v === "32" ? 64 : v === "70" ? 80 : 126,
                kvHeads: 8,
                headDim: 128,
                weightOverrideGiB: null,
              })
            }
          />
          <Select
            label={t("Precision", "Hassasiyet")}
            value={String(w.bits)}
            options={[
              ["4", "Q4 · 4 bit"],
              ["8", "Q8 · 8 bit"],
              ["16", "BF16 / FP16"],
              ["32", "FP32"],
            ]}
            onChange={(v) => update("bits", Number(v))}
          />
          <Select
            label={t("Typical context", "Tipik bağlam")}
            value={String(w.context)}
            options={[128, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072].map(
              (n) => [String(n), `${n / 1024}K`],
            )}
            onChange={(v) =>
              setW({
                ...w,
                context: Number(v),
                maxContext: Math.max(w.maxContext, Number(v)),
              })
            }
          />
          <Select
            label={t("Maximum context", "Azami bağlam")}
            value={String(w.maxContext)}
            options={[128, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]
              .filter((n) => n >= w.context)
              .map((n) => [String(n), `${n / 1024}K`])}
            onChange={(v) => update("maxContext", Number(v))}
          />
          <Num
            label={t("Concurrent users", "Eşzamanlı kullanıcı")}
            value={w.concurrency}
            min={1}
            max={1000}
            onChange={(n) =>
              setW({
                ...w,
                concurrency: n ?? 1,
                peakConcurrency: Math.max(w.peakConcurrency, n ?? 1),
              })
            }
          />
          <Num
            label={t("Peak concurrency", "Tepe eşzamanlılık")}
            value={w.peakConcurrency}
            min={w.concurrency}
            max={1000}
            onChange={(n) => update("peakConcurrency", n ?? 1)}
          />
          <Select
            label={t("Privacy requirement", "Gizlilik gereksinimi")}
            value={w.privacy}
            options={[
              ["low", t("Low", "Düşük")],
              ["medium", t("Medium", "Orta")],
              ["high", t("High", "Yüksek")],
              [
                "local",
                t(
                  "Local only — hard constraint",
                  "Yalnızca yerel — kesin kısıt",
                ),
              ],
            ]}
            onChange={(v) => update("privacy", v)}
          />
          <small>
            {t(
              "Privacy sets a visible preference weight in Decide. Local only excludes external paths.",
              "Gizlilik, Karar ekranındaki tercih ağırlığını ayarlar. Yalnızca yerel, harici seçenekleri eler.",
            )}
          </small>
          <Slider
            label={t("Expected utilization", "Beklenen kullanım oranı")}
            value={w.utilization * 100}
            onChange={(n) => update("utilization", n / 100)}
          />
          <small>
            {t(
              "Scales daily requests and active load hours. Peak memory stays reserved.",
              "Günlük istekleri ve yük saatlerini ölçekler. Tepe belleği ayrılmış kalır.",
            )}
          </small>
          <div className="horizon">
            <span>{t("Time horizon", "Zaman ufku")}</span>
            <div className="segmented">
              {[1, 12, 36].map((n) => (
                <button
                  key={n}
                  aria-pressed={w.horizon === n}
                  onClick={() => update("horizon", n)}
                >
                  {n === 1
                    ? t("1 month", "1 ay")
                    : n === 12
                      ? t("1 year", "1 yıl")
                      : t("3 years", "3 yıl")}
                </button>
              ))}
            </div>
          </div>
          <details className="sub-controls">
            <summary>
              {t(
                "Demand & service requirements",
                "Talep ve servis gereksinimleri",
              )}
            </summary>
            {field(
              "requestsPerDay",
              t("Requests/day at 100%", "%100 kullanımda istek/gün"),
            )}
            {field(
              "inputTokens",
              t("Input tokens / request", "Girdi token / istek"),
              0,
              w.maxContext,
            )}
            {field(
              "outputTokens",
              t("Output tokens / request", "Çıktı token / istek"),
              0,
              w.maxContext,
            )}
            {w.inputTokens + w.outputTokens > w.maxContext && (
              <p className="warning">
                {t(
                  "Input + output exceeds maximum context. Reduce token counts.",
                  "Girdi + çıktı azami bağlamı aşıyor. Token sayısını azaltın.",
                )}
              </p>
            )}
            {field(
              "hoursPerDay",
              t("Active hours/day", "Aktif saat/gün"),
              0,
              24,
              0.5,
            )}
            {field(
              "daysPerMonth",
              t("Active days/month", "Aktif gün/ay"),
              0,
              30,
            )}
            <Select
              label={t("Load shape", "Yük biçimi")}
              value={w.shape}
              options={[
                ["bursty", t("Bursty", "Aralıklı")],
                ["business", t("Business hours", "İş saatleri")],
                ["continuous", t("Continuous", "Sürekli")],
                ["batch", t("Batch", "Toplu")],
              ]}
              onChange={(v) =>
                setW({
                  ...w,
                  shape: v,
                  ...(v === "continuous"
                    ? { hoursPerDay: 24, daysPerMonth: 30 }
                    : v === "business"
                      ? { hoursPerDay: 8, daysPerMonth: 22 }
                      : {}),
                })
              }
            />
            <Select
              label={t("TTFT sensitivity", "İlk token hassasiyeti")}
              value={w.ttft}
              options={[
                ["relaxed", t("Relaxed / batch", "Esnek / toplu")],
                ["interactive", t("Interactive", "Etkileşimli")],
                ["strict", t("Strict", "Sıkı")],
              ]}
              onChange={(v) => update("ttft", v)}
            />
            {field(
              "throughput",
              t("Target output tokens/s", "Hedef çıktı token/sn"),
              0,
              100000,
            )}
            <Select
              label={t("Availability", "Erişilebilirlik")}
              value={w.availability}
              options={[
                ["best", t("Best effort", "Olanaklar ölçüsünde")],
                ["business", t("Business hours", "İş saatleri")],
                ["always", t("24/7 operation", "7/24 çalışma")],
                [
                  "ha",
                  t(
                    "High availability required",
                    "Yüksek erişilebilirlik gerekli",
                  ),
                ],
              ]}
              onChange={(v) =>
                setW({
                  ...w,
                  availability: v,
                  ...(v === "always" || v === "ha"
                    ? {
                        hoursPerDay: 24,
                        daysPerMonth: 30,
                        shape: "continuous" as const,
                      }
                    : {}),
                })
              }
            />
            <Select
              label={t("Expected growth", "Beklenen büyüme")}
              value={w.growth}
              options={[
                ["static", t("Static", "Sabit")],
                ["moderate", t("Moderate", "Orta")],
                ["rapid", t("Rapid", "Hızlı")],
              ]}
              onChange={(v) => update("growth", v)}
            />
          </details>
          <details className="sub-controls">
            <summary>{t("Hard constraints", "Kesin kısıtlar")}</summary>
            <Check
              label={t(
                "Must fit accelerator memory",
                "Hızlandırıcı belleğine sığmalı",
              )}
              checked={h.mustFit}
              onChange={(v) => setH({ ...h, mustFit: v })}
            />
            <Check
              label={t(
                "Exact model weights required",
                "Aynı model ağırlıkları zorunlu",
              )}
              checked={h.exactModel}
              onChange={(v) => setH({ ...h, exactModel: v })}
            />
            <Num
              label={t("Maximum capex (USD)", "Azami ilk yatırım (USD)")}
              value={h.maxCapex}
              optional
              onChange={(n) => setH({ ...h, maxCapex: n })}
            />
            <Num
              label={t(
                "Maximum hourly rate (USD)",
                "Azami saatlik ücret (USD)",
              )}
              value={h.maxHourly}
              optional
              step={0.1}
              onChange={(n) => setH({ ...h, maxHourly: n })}
            />
            <Num
              label={t("Minimum usable GiB", "Asgari kullanılabilir GiB")}
              value={h.minMemory}
              onChange={(n) => setH({ ...h, minMemory: n ?? 0 })}
            />
            <Select
              label={t("Required runtime", "Gerekli çalışma zamanı")}
              value={h.runtime}
              options={[
                "any",
                "vLLM",
                "SGLang",
                "TensorRT-LLM",
                "llama.cpp",
                "MLX",
                "Ollama",
              ].map((v) => [
                v as Constraints["runtime"],
                v === "any"
                  ? t("No hard requirement", "Kesin gereksinim yok")
                  : v,
              ])}
              onChange={(v) => setH({ ...h, runtime: v })}
            />
            <small>
              {t(
                "Blank budget = no ceiling. Unknown runtime support cannot pass a required-runtime constraint.",
                "Boş bütçe = sınır yok. Bilinmeyen destek, zorunlu çalışma zamanı kısıtını geçemez.",
              )}
            </small>
          </details>
          <button
            className="mobile-continue primary"
            onClick={(event) => {
              event.currentTarget.closest("details")?.removeAttribute("open");
              const target = document.getElementById("workbench");
              target?.focus({ preventScroll: true });
              target?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              });
            }}
          >
            {t("Compare deployment paths", "Dağıtım seçeneklerini karşılaştır")}{" "}
            ↓
          </button>
        </div>
      </details>
    </aside>
  );
}
