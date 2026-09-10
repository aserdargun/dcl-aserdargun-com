import type { Evaluation, Workload } from "../core/types";
import { evaluateCapacity } from "../core/scale";
import { Section, Select, Slider, useCandidateName, useT } from "./ui";
import { isLocal } from "../core/economics";
export function ScalePanel({
  results,
  w,
  setW,
}: {
  results: Evaluation[];
  w: Workload;
  setW: (w: Workload) => void;
}) {
  const name = useCandidateName();
  const t = useT();
  const multipliers =
    w.growth === "rapid"
      ? [1, 2.5, 5]
      : w.growth === "moderate"
        ? [1, 1.5, 2]
        : [1, 1, 1];
  return (
    <Section
      title={t(
        "Size for the peak. Pay for the pattern.",
        "Kapasiteyi tepeye, maliyeti kullanıma göre düşünün.",
      )}
      description={t(
        "A capacity stress test with fixed hardware. Future demand is illustrative; no automatic upgrades, replicas or perfectly linear throughput are assumed.",
        "Sabit donanımla kapasite deneyi. Gelecek talep örnektir; otomatik yükseltme, kopya veya kusursuz doğrusal hız varsayılmaz.",
      )}
    >
      <Slider
        label={t("Average utilization", "Ortalama kullanım oranı")}
        value={w.utilization * 100}
        onChange={(v) => setW({ ...w, utilization: v / 100 })}
      />
      <Select
        label={t("Growth stress pattern", "Büyüme deneyi")}
        value={w.growth}
        options={[
          ["static", t("Static · 1× / 1× / 1×", "Sabit · 1× / 1× / 1×")],
          ["moderate", t("Moderate · 1× / 1.5× / 2×", "Orta · 1× / 1,5× / 2×")],
          ["rapid", t("Rapid · 1× / 2.5× / 5×", "Hızlı · 1× / 2,5× / 5×")],
        ]}
        onChange={(v) => setW({ ...w, growth: v })}
      />
      <div className="growth-years">
        {multipliers.map((factor, i) => (
          <div key={i}>
            <span>
              {t("Year", "Yıl")} {i + 1}
            </span>
            <strong>
              {Math.ceil(w.concurrency * factor)} {t("users", "kullanıcı")}
            </strong>
            <small>
              {Math.ceil(w.peakConcurrency * factor)}{" "}
              {t("peak sequences", "tepe dizi")}
            </small>
          </div>
        ))}
      </div>
      <div className="scale-list">
        {results.map((r) => (
          <article key={r.candidate.id}>
            <h3>{name(r.candidate)}</h3>
            <div className="capacity-years">
              {multipliers.map((factor, i) => {
                const {
                  peak,
                  memory: demand,
                  state,
                } = evaluateCapacity(r.candidate, w, factor);
                return (
                  <div key={i} className={state}>
                    <b>
                      {state === "limit"
                        ? t("LIMIT", "SINIR")
                        : state === "pressure"
                          ? t("PRESSURE", "BASKI")
                          : t("OK*", "UYGUN*")}
                    </b>
                    <small>
                      {w.maxContext / 1024}K / {r.candidate.maxContext / 1024}K{" "}
                      {t("context", "bağlam")}
                    </small>
                    {r.candidate.memory.kind === "provider" && (
                      <small>
                        {w.parametersB}B / {r.candidate.maxParametersB}B{" "}
                        {t("model class", "model sınıfı")}
                      </small>
                    )}
                    <small>
                      {r.candidate.memory.kind === "provider"
                        ? `${peak} / ${r.candidate.maxConcurrency} ${t("quota", "kota")}`
                        : `${demand.total.toFixed(0)} / ${r.usableMemory} GiB`}
                    </small>
                  </div>
                );
              })}
            </div>
            {!r.eligible && (
              <p className="warning">
                {t(
                  "Ineligible under current constraints. Capacity alone cannot establish eligibility.",
                  "Mevcut kısıtlarla uygun değil. Kapasite tek başına uygunluk sağlamaz.",
                )}
              </p>
            )}
            <p>
              {isLocal(r.candidate)
                ? t(
                    "Fixed local ceiling: reduce the workload, upgrade, or evaluate another deployment. Adding a node is a separate design.",
                    "Sabit yerel sınır: yükü azaltın, yükseltin veya başka dağıtımı değerlendirin. Düğüm eklemek ayrı bir tasarımdır.",
                  )
                : t(
                    "Capacity expansion needs provider quotas, configuration, and additional billing; this test keeps the current allocation fixed.",
                    "Kapasite artışı sağlayıcı kotası, yapılandırma ve ek fatura gerektirir; bu deney mevcut tahsisi sabit tutar.",
                  )}
            </p>
          </article>
        ))}
      </div>
      <p className="muted">
        {t(
          "* OK describes assumed memory/quota capacity only. It does not override privacy, software or performance constraints. Year-2/3 demand is not included in the constant-demand TCO chart.",
          "* UYGUN yalnızca varsayılan bellek/kota kapasitesini belirtir. Gizlilik, yazılım veya performans kısıtlarını geçersiz kılamaz. 2./3. yıl talebi sabit talepli TCO grafiğine dahil değildir.",
        )}
      </p>
      <div className="insight">
        <strong>
          {t(
            "A hybrid path is a future experiment.",
            "Hibrit seçenek gelecekteki bir deneydir.",
          )}
        </strong>
        <p>
          {t(
            "Local baseline + cloud peaks may be useful, but sensitive data cannot overflow to an external provider when local-only is required. Hybrid routing is outside this core model.",
            "Yerel temel yük + bulut tepe yükü yararlı olabilir; fakat yalnızca yerel işleme gerekiyorsa hassas veri harici sağlayıcıya taşamaz. Hibrit yönlendirme bu çekirdek modelin dışındadır.",
          )}
        </p>
      </div>
    </Section>
  );
}
