import type {
  CandidateOverride,
  Economics,
  Evaluation,
  Preferences,
  Workload,
} from "../core/types";
import { normalizedWeights } from "../core/decision";
import { balanced } from "../data/defaults";
import { freshness } from "../core/freshness";
import { isLocal } from "../core/economics";
import {
  External,
  fitText,
  Money,
  Section,
  Slider,
  useCandidateName,
  useT,
  useText,
} from "./ui";
export function CandidateDetail({
  result: r,
  w,
  e,
  override,
}: {
  result: Evaluation;
  w: Workload;
  e: Economics;
  override?: CandidateOverride;
}) {
  const name = useCandidateName();
  const t = useT(),
    txt = useText();
  const c = r.candidate;
  return (
    <section
      className="candidate-detail"
      aria-label={t("Selected candidate detail", "Seçili aday ayrıntısı")}
    >
      <header>
        <div>
          <span className="source-line">
            {t("SELECTED PATH", "SEÇİLİ SEÇENEK")}
          </span>
          <h2>{name(c)}</h2>
          <p>{txt(c.hardware)}</p>
        </div>
        <span className={`status ${r.eligible ? "eligible" : "excluded"}`}>
          {r.eligible
            ? t("Conditionally eligible", "Koşullu uygun")
            : t("Ineligible", "Uygun değil")}
        </span>
      </header>
      {r.failures.length > 0 && (
        <div className="failures">
          <h3>{t("Hard constraints failed", "Geçilemeyen kesin kısıtlar")}</h3>
          <ul>
            {r.failures.map((reason) => (
              <li key={reason.metric}>{txt(reason.explanation)}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="detail-metrics">
        <div>
          <span>{t("Memory", "Bellek")}</span>
          <strong>{txt(fitText[r.memoryFit])}</strong>
        </div>
        <div>
          <span>{t("Horizon outlay", "Dönem harcaması")}</span>
          <strong>
            <Money value={r.cost.total} e={e} />
          </strong>
        </div>
        <div>
          <span>{t("Performance evidence", "Performans kanıtı")}</span>
          <strong>{t("UNKNOWN", "BİLİNMİYOR")}</strong>
        </div>
        <div>
          <span>{t("Software support", "Yazılım desteği")}</span>
          <strong>
            {t(
              "Verify exact model + runtime",
              "Model + çalışma zamanını doğrulayın",
            )}
          </strong>
        </div>
      </div>
      <div className="detail-columns">
        <div>
          <h3>{t("Why consider it?", "Neden düşünülebilir?")}</h3>
          <p>{txt(c.strengths)}</p>
          <h3>{t("What is the trade-off?", "Karşılığında ne var?")}</h3>
          <p>{txt(c.weaknesses)}</p>
        </div>
        <div>
          <h3>{t("Control & scale", "Kontrol ve ölçek")}</h3>
          <p>
            {txt(c.control)}. {txt(c.scaling)}.
          </p>
          <p>
            {t("Assumed ceiling", "Varsayılan sınır")}: {c.maxConcurrency}{" "}
            {t("simultaneous sequences", "eşzamanlı dizi")};{" "}
            {c.maxContext / 1024}K {t("context", "bağlam")}.{" "}
            {t(
              "Memory may impose a lower ceiling.",
              "Bellek daha düşük bir sınır getirebilir.",
            )}
          </p>
        </div>
      </div>
      <p className="warning">
        {t(
          `Target: ${w.throughput} output tokens/s; ${w.ttft} TTFT sensitivity. No benchmark in this profile verifies either requirement.`,
          `Hedef: ${w.throughput} çıktı token/sn; ilk token hassasiyeti ${w.ttft === "strict" ? "sıkı" : w.ttft === "interactive" ? "etkileşimli" : "esnek"}. Bu profil bu gereksinimleri doğrulayan ölçüm içermez.`,
        )}
      </p>
      <details>
        <summary>
          {t(
            "Evidence, compatibility & operating assumptions",
            "Kanıt, uyumluluk ve işletim varsayımları",
          )}
        </summary>
        <div className="source-line estimated">
          {t("LOW EVIDENCE", "DÜŞÜK KANIT")} ·{" "}
          {Object.keys(override ?? {}).length
            ? t("USER PRICE OVERRIDE", "KULLANICI FİYAT DEĞİŞİKLİĞİ")
            : t("EDUCATIONAL DEFAULT", "EĞİTİM VARSAYIMI")}
        </div>
        <p>{txt(c.evidence.assumptions)}</p>
        <p>
          {t("Last verified", "Son doğrulama")}:{" "}
          {c.evidence.verifiedAt ??
            t("Never — synthetic profile", "Yok — sentetik profil")}{" "}
          · {t("Freshness", "Güncellik")}: {freshness(c.evidence, new Date())}
        </p>
        <p>
          {t(
            "Price changes do not verify hardware or performance. Official references support concepts only, not these prices.",
            "Fiyat değişiklikleri donanımı veya performansı doğrulamaz. Resmi kaynaklar bu fiyatları değil, yalnızca kavramları destekler.",
          )}
        </p>
        <div className="runtime-list">
          {["vLLM", "SGLang", "TensorRT-LLM", "llama.cpp", "MLX", "Ollama"].map(
            (name) => (
              <span key={name}>
                {name}
                <b>
                  {c.runtimes[name as keyof typeof c.runtimes] ?? "UNKNOWN"}
                </b>
              </span>
            ),
          )}
        </div>
        {isLocal(c) ? (
          <p>
            {t("Whole-system illustrative power", "Tüm sistem için örnek güç")}:{" "}
            {t("Idle", "Boşta")} {c.power.idle} W · {t("Normal", "Normal")}{" "}
            {c.power.normal} W · {t("Peak", "Tepe")} {c.power.peak} W.{" "}
            {t(
              "Peak occupies 10% of load hours. Remaining load uses normal power. Idle draws power while on; capex persists while off.",
              "Yük saatlerinin %10’u tepe güçtedir. Kalan yük normal güç kullanır. Açıkken boşta güç harcanır; kapalıyken ilk yatırım maliyeti sürer.",
            )}
          </p>
        ) : (
          <p>
            {t("Billable hours/month", "Faturalanan saat/ay")}:{" "}
            {r.cost.billableHours.toFixed(1)}.{" "}
            {c.category === "MANAGED_INFERENCE"
              ? t(
                  "Base rate × 1.30; storage and egress configured separately.",
                  "Temel ücret × 1,30; depolama ve çıkış trafiği ayrı ayarlanır.",
                )
              : c.category === "TOKEN_API"
                ? t(
                    "Only input/output usage is billed in this profile; provider quotas are assumed.",
                    "Bu profilde yalnızca girdi/çıktı kullanımı faturalanır; sağlayıcı kotaları varsayımsaldır.",
                  )
                : t(
                    "No guaranteed autoscaling or redundancy in this fixed VM profile.",
                    "Bu sabit VM profilinde garantili otomatik ölçekleme veya yedeklilik yoktur.",
                  )}
          </p>
        )}
        <p>
          {t("Availability design", "Erişilebilirlik tasarımı")}:{" "}
          {c.availability === "single"
            ? t(
                "Single configuration; failover not modeled.",
                "Tek yapılandırma; yedek geçiş modellenmez.",
              )
            : t(
                "Redundant service assumed; verify SLA and failure domains.",
                "Yedekli servis varsayılır; SLA ve arıza alanlarını doğrulayın.",
              )}
        </p>
        <External href="https://docs.vllm.ai/en/latest/getting_started/installation/">
          {t(
            "Runtime installation requirements",
            "Çalışma zamanı kurulum gereksinimleri",
          )}
        </External>
      </details>
      <div className="links-row">
        <External
          href={
            isLocal(c)
              ? "https://lcl.aserdargun.com/"
              : "https://cld.aserdargun.com/"
          }
        >
          {isLocal(c)
            ? t("Explore local hardware → LCL", "Yerel donanımı keşfet → LCL")
            : t(
                "Explore cloud economics → CLD",
                "Bulut ekonomisini keşfet → CLD",
              )}
        </External>
        <External href="https://tfl.aserdargun.com/">
          {t(
            "Explore serving behavior → TFL",
            "Servis davranışını keşfet → TFL",
          )}
        </External>
      </div>
    </section>
  );
}
export function DecisionPanel({
  results,
  p,
  setP,
  w,
  e,
}: {
  results: Evaluation[];
  p: Preferences;
  setP: (p: Preferences) => void;
  w: Workload;
  e: Economics;
}) {
  const name = useCandidateName();
  const t = useT(),
    txt = useText();
  const eligible = results.filter((r) => r.eligible),
    winner = eligible[0],
    weights = normalizedWeights(p),
    tied =
      winner &&
      eligible.filter((r) => Math.abs(r.score - winner.score) < 0.01).length >
        1;
  const names: Record<keyof Preferences, string> = {
    cost: t("Cost", "Maliyet"),
    privacy: t("Data control", "Veri kontrolü"),
    operations: t("Ease of operations", "İşletim kolaylığı"),
    scale: t("Scaling flexibility", "Ölçekleme esnekliği"),
  };
  return (
    <Section
      title={t(
        "Why this path, for this workload?",
        "Bu iş yükü için neden bu seçenek?",
      )}
      description={t(
        "Hard constraints first. Preferences second. Evidence stays visible.",
        "Önce kesin kısıtlar. Sonra tercihler. Kanıt her zaman görünür.",
      )}
    >
      <div className="recommendation">
        <span className="source-line">
          {t(
            "CONDITIONAL RECOMMENDATION · LOW EVIDENCE",
            "KOŞULLU ÖNERİ · DÜŞÜK KANIT",
          )}
        </span>
        <h2>
          {!winner
            ? t("No eligible deployment", "Uygun dağıtım seçeneği yok")
            : tied
              ? t(
                  "No unique winner — tied preferences",
                  "Tek kazanan yok — tercihler eşit",
                )
              : name(winner.candidate)}
        </h2>
        <p>
          {!winner
            ? t(
                "Inspect failed constraints. Reducing a score cannot make a failed candidate eligible.",
                "Geçilemeyen kısıtları inceleyin. Puan değişikliği elenen adayı uygun yapamaz.",
              )
            : tied
              ? t(
                  "Adjust a weight or compare trade-offs directly.",
                  "Bir ağırlığı değiştirin veya ödünleşimleri doğrudan karşılaştırın.",
                )
              : t(
                  `Highest weighted result among ${eligible.length} eligible profiles, under your ${w.horizon}-month assumptions.`,
                  `${w.horizon} aylık varsayımlarınızla ${eligible.length} uygun profil arasında en yüksek ağırlıklı sonuç.`,
                )}
        </p>
        {winner && !tied && (
          <ul>
            {winner.reasons
              .filter((r) => r.type === "strength")
              .map((r) => (
                <li key={r.metric}>{txt(r.explanation)}</li>
              ))}
          </ul>
        )}
      </div>
      <div className="preference-layout">
        <div>
          <h3>{t("Your preferences", "Tercihleriniz")}</h3>
          {(Object.keys(p) as (keyof Preferences)[]).map((k) => (
            <Slider
              key={k}
              label={`${names[k]} · ${Math.round(weights[k] * 100)}% ${t("normalized", "normalize")}`}
              value={p[k]}
              unit=""
              onChange={(v) => setP({ ...p, [k]: v })}
            />
          ))}
          <button onClick={() => setP({ ...balanced })}>
            {t("Reset to balanced", "Dengeli tercihlere dön")}
          </button>
        </div>
        <div>
          <h3>{t("Inspect every contribution", "Her katkıyı inceleyin")}</h3>
          <p>
            {t(
              "Score = cost × weight + control × weight + operations × weight + scale × weight. The score is a preference result, never a confidence percentage.",
              "Puan = maliyet × ağırlık + kontrol × ağırlık + işletim × ağırlık + ölçek × ağırlık. Puan bir tercih sonucudur; güven yüzdesi değildir.",
            )}
          </p>
          <p>
            {t(
              "Cost: 100 for the least expensive eligible profile, 0 for the most expensive; linear between them. If costs tie, all receive 100. Other factors are explicit synthetic 0–100 ratings below.",
              "Maliyet: en ucuz uygun profil 100, en pahalı 0; arası doğrusaldır. Maliyetler eşitse tümü 100 alır. Diğer etkenler aşağıdaki açık sentetik 0–100 değerlendirmelerdir.",
            )}
          </p>
          <p>
            {t(
              "Zero total weight yields no unique preference. Missing performance is excluded from scoring, not assigned an invented score.",
              "Toplam ağırlık sıfırsa tek bir tercih oluşmaz. Eksik performans puanlamaya katılmaz; uydurma puan atanmaz.",
            )}
          </p>
        </div>
      </div>
      <div className="score-list">
        {results.map((r) => (
          <article key={r.candidate.id}>
            <header>
              <strong>{name(r.candidate)}</strong>
              <b>
                {r.eligible
                  ? `${r.score.toFixed(1)} / 100`
                  : t("INELIGIBLE", "UYGUN DEĞİL")}
              </b>
            </header>
            {r.eligible ? (
              <>
                <div className="score-bar">
                  {(Object.keys(p) as (keyof Preferences)[]).map((k, i) => (
                    <span
                      key={k}
                      style={{
                        width: `${r.contributions[k]}%`,
                        background: [
                          "#79deba",
                          "#80b6de",
                          "#dfb45e",
                          "#aea9e8",
                        ][i],
                      }}
                    />
                  ))}
                </div>
                <p>
                  {(Object.keys(p) as (keyof Preferences)[])
                    .map(
                      (k) =>
                        `${names[k]} ${r.factors[k].toFixed(1)} × ${(weights[k] * 100).toFixed(0)}% = ${r.contributions[k].toFixed(1)}`,
                    )
                    .join(" · ")}
                </p>
                <p>
                  <Money value={r.cost.total} e={e} /> ·{" "}
                  {txt(r.candidate.weaknesses)}
                </p>
              </>
            ) : (
              <ul>
                {r.failures.map((x) => (
                  <li key={x.metric}>{txt(x.explanation)}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
      <p className="warning">
        {t(
          "All current profiles have LOW evidence. Validate exact hardware, model quality, latency, throughput, provider terms and total operating expenses before a real deployment.",
          "Mevcut profillerin tümü DÜŞÜK kanıta sahiptir. Gerçek dağıtımdan önce donanım, model kalitesi, gecikme, hız, sağlayıcı koşulları ve tüm işletim giderlerini doğrulayın.",
        )}
      </p>
    </Section>
  );
}
