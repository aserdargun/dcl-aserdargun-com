import type {
  CandidateOverride,
  Economics,
  Evaluation,
  Workload,
} from "../core/types";
import { calculateBreakEven, isLocal, usage } from "../core/economics";
import {
  Check,
  Money,
  Num,
  Section,
  Select,
  Slider,
  useCandidateName,
  useT,
} from "./ui";
export function CostPanel({
  results,
  w,
  setW,
  e,
  setE,
  overrides,
  setOverrides,
  localId,
  setLocalId,
  remoteId,
  setRemoteId,
}: {
  localId: string;
  setLocalId: (id: string) => void;
  remoteId: string;
  setRemoteId: (id: string) => void;
  results: Evaluation[];
  w: Workload;
  setW: (w: Workload) => void;
  e: Economics;
  setE: (e: Economics) => void;
  overrides: Record<string, CandidateOverride>;
  setOverrides: (o: Record<string, CandidateOverride>) => void;
}) {
  const name = useCandidateName();
  const t = useT();
  const a = results.find((r) => r.candidate.id === localId)!,
    b = results.find((r) => r.candidate.id === remoteId)!;
  const cross = calculateBreakEven(a.cost, b.cost, w.horizon);
  const u = usage(w);
  const maxCost = Math.max(a.cost.total, b.cost.total, 1) * 1.12;
  const point = (month: number, c: Evaluation) =>
    `${65 + (month / w.horizon) * 685},${240 - ((c.cost.capex + c.cost.monthly * month) / maxCost) * 210}`;
  const money = (n: number) => <Money value={n} e={e} />;
  return (
    <Section
      title={t(
        "Cost is a curve, not a price tag.",
        "Maliyet bir etiket değil, zaman içinde bir eğridir.",
      )}
      description={t(
        "Cumulative cash outlay. Local starts with a purchase; rented capacity and token services accumulate usage charges.",
        "Birikimli nakit harcaması. Yerel sistem satın almayla başlar; kiralık kapasite ve token servislerinde kullanım ücretleri birikir.",
      )}
    >
      <div className="source-line calculated">
        {t(
          "CALCULATED RESULT · EDUCATIONAL PRICING",
          "HESAPLANAN SONUÇ · EĞİTİM FİYATLARI",
        )}
      </div>
      <p className="muted">
        {t(
          "Always-on and high-availability requirements keep provisioned capacity on for 730 hours/month, regardless of the warm/idle switches. Demand uses the configured active days.",
          "7/24 ve yüksek erişilebilirlik gereksinimleri, açık/boşta anahtarlarından bağımsız olarak ayrılmış kapasiteyi ayda 730 saat açık tutar. Talep, yapılandırılan aktif günleri kullanır.",
        )}
      </p>
      <div className="cost-controls">
        <Select
          label={t("Local baseline", "Yerel karşılaştırma")}
          value={localId}
          onChange={setLocalId}
          options={results
            .filter((r) => isLocal(r.candidate))
            .map((r) => [r.candidate.id, name(r.candidate)])}
        />
        <Select
          label={t("Compare against", "Karşı seçenek")}
          value={remoteId}
          onChange={setRemoteId}
          options={results
            .filter((r) => !isLocal(r.candidate))
            .map((r) => [r.candidate.id, name(r.candidate)])}
        />
      </div>
      <figure className="cost-chart">
        <svg
          viewBox="0 0 800 285"
          role="img"
          aria-labelledby="cost-title cost-description"
        >
          <title id="cost-title">
            {t("Cumulative cost over time", "Zaman içinde birikimli maliyet")}
          </title>
          <desc id="cost-description">
            {name(a.candidate)}: {a.cost.total.toFixed(0)} USD.{" "}
            {name(b.candidate)}: {b.cost.total.toFixed(0)} USD.{" "}
            {cross === null
              ? t(
                  "No crossing within the selected horizon.",
                  "Seçili dönemde kesişim yok.",
                )
              : `${cross.toFixed(1)} ${t("month break-even", "ay başa baş")}`}
          </desc>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line
                x1="65"
                x2="750"
                y1={240 - v * 210}
                y2={240 - v * 210}
                stroke="#344247"
                strokeDasharray="3 5"
              />
              <text x="55" y={244 - v * 210} textAnchor="end">
                {(
                  (maxCost * v * (e.currency === "USD" ? 1 : e.fx)) /
                  1000
                ).toFixed(1)}
                k
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text key={v} x={65 + 685 * v} y="265" textAnchor="middle">
              {Number((w.horizon * v).toFixed(2))}
            </text>
          ))}
          <text x="65" y="15">
            {e.currency}
          </text>
          <text x="750" y="282" textAnchor="end">
            {t("months", "ay")}
          </text>
          {[a, b].map((r) => (
            <polyline
              key={r.candidate.id}
              points={`${point(0, r)} ${point(w.horizon, r)}`}
              fill="none"
              stroke={r.candidate.color}
              strokeWidth="3"
            />
          ))}
          {cross !== null && (
            <g>
              <line
                x1={65 + (cross / w.horizon) * 685}
                x2={65 + (cross / w.horizon) * 685}
                y1="30"
                y2="240"
                stroke="#dfb45e"
                strokeDasharray="5 4"
              />
              <circle
                cx={65 + (cross / w.horizon) * 685}
                cy={
                  240 -
                  ((a.cost.capex + a.cost.monthly * cross) / maxCost) * 210
                }
                r="5"
                fill="#dfb45e"
              />
            </g>
          )}
        </svg>
        <figcaption>
          <span style={{ color: a.candidate.color }}>
            ━ {name(a.candidate)} · {money(a.cost.total)}
          </span>
          <span style={{ color: b.candidate.color }}>
            ━ {name(b.candidate)} · {money(b.cost.total)}
          </span>
        </figcaption>
      </figure>
      <div className="insight">
        <strong>
          {cross === null
            ? t(
                "No break-even in this horizon.",
                "Bu dönemde başa baş noktası yok.",
              )
            : `${cross.toFixed(1)} ${t("months to break-even", "ayda başa baş")}`}
        </strong>
        <p>
          {cross === null
            ? t(
                "The calculated lines do not cross. Change usage or prices to test another assumption.",
                "Hesaplanan çizgiler kesişmiyor. Başka bir varsayımı denemek için kullanım veya fiyatları değiştirin.",
              )
            : t(
                "Equal cumulative spending at this point, assuming constant prices and demand. This does not establish performance equivalence.",
                "Sabit fiyat ve talep varsayımıyla bu noktada birikimli harcama eşittir. Bu, performans eşdeğerliğini göstermez.",
              )}
        </p>
        {(!a.eligible || !b.eligible) && (
          <p className="warning">
            {t(
              "Economics only: at least one selected candidate is ineligible. A cost crossing cannot override that constraint.",
              "Yalnızca ekonomi: seçilen adaylardan en az biri uygun değil. Maliyet kesişimi bu kısıtı geçersiz kılamaz.",
            )}
          </p>
        )}
      </div>
      <Slider
        label={t("Utilization experiment", "Kullanım oranı deneyi")}
        value={w.utilization * 100}
        onChange={(n) => setW({ ...w, utilization: n / 100 })}
      />
      <p className="muted">
        {u.requests.toLocaleString()} {t("requests/month", "istek/ay")} ·{" "}
        {(u.input / 1e6).toFixed(2)}M {t("input", "girdi")} +{" "}
        {(u.output / 1e6).toFixed(2)}M {t("output tokens", "çıktı token")}
      </p>
      <details className="data-table">
        <summary>
          {t(
            "Chart data & cost components",
            "Grafik verileri ve maliyet bileşenleri",
          )}
        </summary>
        <div className="scroll-table">
          <table>
            <caption>
              {t(
                "Both horizons are always calculated",
                "Her iki dönem de her zaman hesaplanır",
              )}
            </caption>
            <thead>
              <tr>
                <th>{t("Component", "Bileşen")}</th>
                <th>{name(a.candidate)}</th>
                <th>{name(b.candidate)}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  "capex",
                  "electricity",
                  "infrastructure",
                  "tokens",
                  "storage",
                  "egress",
                  "maintenance",
                  "monthly",
                  "year1",
                  "year3",
                ] as const
              ).map((key, i) => (
                <tr key={key}>
                  <th>
                    {
                      [
                        t("Purchase once", "Tek seferlik satın alma"),
                        t("Electricity / month", "Elektrik / ay"),
                        t("Infrastructure / month", "Altyapı / ay"),
                        t("Tokens / month", "Token / ay"),
                        t("Storage / month", "Depolama / ay"),
                        t("Egress / month", "Çıkış trafiği / ay"),
                        t("Maintenance / month", "Bakım / ay"),
                        t("Total recurring / month", "Tekrarlayan toplam / ay"),
                        t("1-year total", "1 yıllık toplam"),
                        t("3-year total", "3 yıllık toplam"),
                      ][i]
                    }
                  </th>
                  <td>{money(a.cost[key])}</td>
                  <td>{money(b.cost[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <caption>
              {t("Cumulative cost by month", "Aya göre birikimli maliyet")}
            </caption>
            <thead>
              <tr>
                <th>{t("Month", "Ay")}</th>
                <th>{name(a.candidate)}</th>
                <th>{name(b.candidate)}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: w.horizon + 1 }, (_, i) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{money(a.cost.capex + a.cost.monthly * i)}</td>
                  <td>{money(b.cost.capex + b.cost.monthly * i)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details className="settings" open>
        <summary>
          {t(
            "Pricing & billing assumptions",
            "Fiyat ve faturalama varsayımları",
          )}
        </summary>
        <div className="settings-grid">
          <div>
            <Num
              label={t("Electricity (USD/kWh)", "Elektrik (USD/kWh)")}
              value={e.electricity}
              max={100}
              step={0.01}
              onChange={(n) => setE({ ...e, electricity: n ?? 0 })}
            />
            <Num
              label={t(
                "Local maintenance / month (USD)",
                "Yerel bakım / ay (USD)",
              )}
              value={e.maintenanceMonthly}
              onChange={(n) => setE({ ...e, maintenanceMonthly: n ?? 0 })}
            />
            <Num
              label={t(
                "Cloud storage / month (USD)",
                "Bulut depolama / ay (USD)",
              )}
              value={e.storageMonthly}
              onChange={(n) => setE({ ...e, storageMonthly: n ?? 0 })}
            />
            <Num
              label={t(
                "Cloud egress / month (USD)",
                "Bulut çıkış trafiği / ay (USD)",
              )}
              value={e.egressMonthly}
              onChange={(n) => setE({ ...e, egressMonthly: n ?? 0 })}
            />
            <Check
              label={t(
                "Keep cloud provisioned all month (730 h)",
                "Bulutu ay boyunca açık tut (730 saat)",
              )}
              checked={e.keepCloudWarm}
              onChange={(v) => setE({ ...e, keepCloudWarm: v })}
            />
            <Check
              label={t(
                "Keep local system on all month (730 h)",
                "Yerel sistemi ay boyunca açık tut (730 saat)",
              )}
              checked={e.keepLocalOn}
              onChange={(v) => setE({ ...e, keepLocalOn: v })}
            />
          </div>
          <div>
            <Select
              label={t("Display currency", "Gösterim para birimi")}
              value={e.currency}
              options={[
                ["USD", "USD"],
                ["EUR", "EUR"],
                ["TRY", "TRY"],
              ]}
              onChange={(v) => setE({ ...e, currency: v, fx: 1 })}
            />
            {e.currency !== "USD" && (
              <>
                <Num
                  label={`1 USD = ? ${e.currency}`}
                  value={e.fx}
                  min={0.0001}
                  max={1e6}
                  step={0.0001}
                  onChange={(n) => setE({ ...e, fx: n ?? 1 })}
                />
                <p className="warning">
                  {t(
                    "USER INPUT: enter your exchange rate. Initial 1:1 is a placeholder, not a live rate. All price inputs remain in USD.",
                    "KULLANICI GİRDİSİ: döviz kurunuzu girin. Başlangıçtaki 1:1 canlı kur değildir. Tüm fiyat girdileri USD olarak kalır.",
                  )}
                </p>
              </>
            )}
            <p>
              {t(
                "Business/continuous: bill the active window. Bursty/batch: assume scheduled shutdown outside load hours. Warm billing overrides both.",
                "İş saatleri/sürekli: aktif pencere faturalanır. Aralıklı/toplu: yük saatleri dışında zamanlanmış kapanış varsayılır. Sürekli açık faturalama her ikisini geçersiz kılar.",
              )}
            </p>
            <small>
              {t(
                "No startup delay, minimum bill, tax, financing, depreciation, resale, labor or upgrade cost modeled. Maintenance defaults to zero, not to “free operation”. Display conversion uses your manual rate.",
                "Başlatma gecikmesi, asgari fatura, vergi, finansman, amortisman, satış değeri, işçilik veya yükseltme maliyeti modellenmez. Varsayılan sıfır bakım, ücretsiz işletim anlamına gelmez. Gösterim dönüşümü elle girilen kurla yapılır.",
              )}
            </small>
          </div>
        </div>
        <h3>
          {t(
            "Candidate price overrides · USD",
            "Aday fiyat değişiklikleri · USD",
          )}
        </h3>
        <div className="override-grid">
          {results.map((r) => {
            const c = r.candidate;
            const set = (key: keyof CandidateOverride, n: number | null) => {
              const next = { ...overrides[c.id] };
              if (n === null) delete next[key];
              else next[key] = n;
              setOverrides({ ...overrides, [c.id]: next });
            };
            return (
              <fieldset key={c.id}>
                <legend>{name(c)}</legend>
                <div className="source-line">
                  {Object.keys(overrides[c.id] ?? {}).length
                    ? t("USER OVERRIDE", "KULLANICI DEĞİŞİKLİĞİ")
                    : t("EDUCATIONAL DEFAULT", "EĞİTİM VARSAYIMI")}
                </div>
                {isLocal(c) ? (
                  <Num
                    label={t("Purchase price", "Satın alma fiyatı")}
                    value={c.purchaseCost}
                    step={0.01}
                    onChange={(n) => set("purchaseCost", n)}
                  />
                ) : c.category === "TOKEN_API" ? (
                  <>
                    <Num
                      label={t("Input / 1M tokens", "Girdi / 1M token")}
                      value={c.inputPrice}
                      step={0.1}
                      onChange={(n) => set("inputPrice", n)}
                    />
                    <Num
                      label={t("Output / 1M tokens", "Çıktı / 1M token")}
                      value={c.outputPrice}
                      step={0.1}
                      onChange={(n) => set("outputPrice", n)}
                    />
                  </>
                ) : (
                  <Num
                    label={t("Base hourly rate", "Temel saatlik ücret")}
                    value={c.hourlyCost}
                    step={0.1}
                    onChange={(n) => set("hourlyCost", n)}
                  />
                )}
                <button
                  onClick={() => setOverrides({ ...overrides, [c.id]: {} })}
                >
                  {t("Reset profile price", "Profil fiyatını sıfırla")}
                </button>
              </fieldset>
            );
          })}
        </div>
      </details>
    </Section>
  );
}
