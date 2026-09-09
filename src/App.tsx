import { useEffect, useState } from "react";
import { ArrowRight, Download, RotateCcw, Info } from "lucide-react";
import type {
  CandidateOverride,
  Locale,
  Preferences,
  Workload,
} from "./core/types";
import { candidates, applyOverride } from "./data/candidates";
import { defaultEconomics } from "./data/defaults";
import { scenarios } from "./core/scenarios";
import { estimateRuntimeMemory } from "./core/memory";
import { evaluateCandidates } from "./core/decision";
import {
  Language,
  External,
  Select,
  useCandidateName,
  useT,
  useText,
} from "./components/ui";
import { WorkloadControls } from "./components/WorkloadControls";
import { Comparison } from "./components/Comparison";
import { CandidateDetail, DecisionPanel } from "./components/DecisionPanel";
import { CostPanel } from "./components/CostPanel";
import { MemoryPanel } from "./components/MemoryPanel";
import { ScalePanel } from "./components/ScalePanel";
import { LearnPanel } from "./components/LearnPanel";
import { DeploymentWorld } from "./visualization/DeploymentWorld";
type Mode = "compare" | "cost" | "memory" | "scale" | "decide" | "learn";
function initialLocale(): Locale {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "tr" || q === "en") return q;
  try {
    return localStorage.getItem("dcl-locale") === "tr" ? "tr" : "en";
  } catch {
    return "en";
  }
}
export default function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("dcl-locale", locale);
    } catch {
      /* Storage is optional. */
    }
    const url = new URL(location.href);
    url.searchParams.set("lang", locale);
    history.replaceState(null, "", url);
  }, [locale]);
  return (
    <Language.Provider value={locale}>
      <Workbench locale={locale} setLocale={setLocale} />
    </Language.Provider>
  );
}
function Workbench({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  const name = useCandidateName();
  const t = useT(),
    txt = useText();
  const [scenarioId, setScenarioId] = useState("team70"),
    [w, setWorkload] = useState({ ...scenarios[0].workload }),
    [h, setH] = useState({ ...scenarios[0].constraints }),
    [p, setP] = useState({ ...scenarios[0].preferences }),
    [e, setE] = useState({ ...defaultEconomics }),
    [overrides, setOverrides] = useState<Record<string, CandidateOverride>>({}),
    [mode, setMode] = useState<Mode>("compare"),
    [selected, select] = useState("apple"),
    [modified, setModified] = useState(false),
    [showWorld, setShowWorld] = useState(true);
  const setW = (next: Workload) => {
    if (next.privacy !== w.privacy)
      setP((current) => ({
        ...current,
        privacy: { low: 10, medium: 20, high: 30, local: 30 }[next.privacy],
      }));
    setWorkload(next);
    setModified(true);
  };
  const profileCandidates = candidates.map((c) =>
    applyOverride(c, overrides[c.id]),
  );
  const results = evaluateCandidates(profileCandidates, w, h, p, e);
  const memory = estimateRuntimeMemory(w),
    eligible = results.filter((r) => r.eligible),
    winner = eligible[0],
    tied =
      winner &&
      eligible.filter((r) => Math.abs(r.score - winner.score) < 0.01).length >
        1;
  const detail = results.find((r) => r.candidate.id === selected)!;
  const switchScenario = (id: string) => {
    const s = scenarios.find((s) => s.id === id)!;
    setScenarioId(id);
    setWorkload({ ...s.workload });
    setH({ ...s.constraints });
    setP({ ...s.preferences });
    setModified(false);
  };
  const nav: readonly [Mode, string][] = [
    ["compare", t("Compare", "Karşılaştır")],
    ["cost", t("Cost", "Maliyet")],
    ["memory", t("Memory", "Bellek")],
    ["scale", t("Scale", "Ölçek")],
    ["decide", t("Decide", "Karar")],
    ["learn", t("Learn", "Öğren")],
  ];
  const exportReport = () => {
    const report = {
      schema: "dcl-decision-report/v1",
      createdAt: new Date().toISOString(),
      scenarioId,
      workload: w,
      constraints: h,
      preferences: p,
      economics: e,
      overrides,
      assumptions:
        "Educational defaults. No verified prices or performance. USD base; manual display FX. Fixed-demand cash outlay, excluding taxes, labor, financing, depreciation and residual value.",
      memory,
      results,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "dcl-decision-report.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const experiment = (action: "context" | "usage" | "privacy") => {
    if (action === "context") {
      setW({ ...w, maxContext: Math.min(131072, w.maxContext * 2) });
      setMode("memory");
    } else if (action === "usage") {
      setW({ ...w, utilization: 0.15 });
      setMode("cost");
    } else {
      setW({ ...w, privacy: "local" });
      setMode("compare");
    }
  };
  return (
    <>
      <a href="#workbench" className="skip-link">
        {t("Skip to workbench", "Çalışma alanına geç")}
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="DCL home">
          <b>DCL</b>
          <span>Deployment Choice Laboratory</span>
        </a>
        <div className="header-links">
          <External href="https://aserdargun.com/">AI Learning System</External>
          <div className="language">
            <button
              aria-label="English"
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
            <span>/</span>
            <button
              aria-label="Türkçe"
              aria-pressed={locale === "tr"}
              onClick={() => setLocale("tr")}
            >
              TR
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="intro">
          <div>
            <h1>
              {t(
                "Choose where the workload should run.",
                "İş yükünün nerede çalışacağına karar verin.",
              )}
            </h1>
            <p>
              {t(
                "One workload. Six deployment paths. Understand the trade-offs.",
                "Bir iş yükü. Altı dağıtım seçeneği. Ödünleşimleri anlayın.",
              )}
            </p>
          </div>
          <div className="intro-actions">
            <button
              className="icon-button"
              aria-label={t(
                "Reset entire laboratory",
                "Tüm laboratuvarı sıfırla",
              )}
              onClick={() => {
                switchScenario("team70");
                setE({ ...defaultEconomics });
                setOverrides({});
                select("apple");
                setMode("compare");
              }}
            >
              <RotateCcw />
            </button>
            <button onClick={exportReport}>
              <Download />
              {t("Export decision", "Kararı dışa aktar")}
            </button>
          </div>
        </div>
        <div className="scenario-rail">
          <Select
            label={t("Scenario", "Senaryo")}
            value={scenarioId}
            onChange={switchScenario}
            options={scenarios.map((s) => [s.id, txt(s.title)])}
          />
          <div className="scenario-shortcuts">
            {scenarios.slice(0, 4).map((s) => (
              <button
                key={s.id}
                aria-pressed={scenarioId === s.id}
                onClick={() => switchScenario(s.id)}
              >
                {txt(s.title)}
              </button>
            ))}
          </div>
        </div>
        <p className="scenario-description">
          {txt(scenarios.find((s) => s.id === scenarioId)!.description)}
          {modified && (
            <span> · {t("Modified inputs", "Değiştirilmiş girdiler")}</span>
          )}
          {Object.values(overrides).some((o) => Object.keys(o).length > 0) && (
            <span>
              {" "}
              ·{" "}
              {t("Price overrides retained", "Fiyat değişiklikleri korunuyor")}
            </span>
          )}
        </p>
        <div className="workbench-layout">
          <WorkloadControls
            w={w}
            setW={setW}
            h={h}
            setH={(next) => {
              setH(next);
              setModified(true);
            }}
          />
          <div className="workbench-main" id="workbench">
            <div className="workbench-surface">
              <nav
                className="mode-nav"
                aria-label={t("Laboratory modes", "Laboratuvar görünümleri")}
              >
                {nav.map(([id, label]) => (
                  <button
                    key={id}
                    aria-current={mode === id ? "page" : undefined}
                    onClick={() => setMode(id)}
                  >
                    {label}
                  </button>
                ))}
                <span>{t("Educational defaults", "Eğitim varsayımları")}</span>
              </nav>
              {mode === "compare" && (
                <>
                  <div className="view-options">
                    <span>
                      {t(
                        "PERFORMANCE UNKNOWN · LOW EVIDENCE",
                        "PERFORMANS BİLİNMİYOR · DÜŞÜK KANIT",
                      )}
                    </span>
                    <button
                      onClick={() => setShowWorld(!showWorld)}
                      aria-pressed={showWorld}
                    >
                      {showWorld
                        ? t("Hide topology", "Topolojiyi gizle")
                        : t("Show topology", "Topolojiyi göster")}
                    </button>
                  </div>
                  {showWorld && (
                    <DeploymentWorld
                      results={results}
                      w={w}
                      selected={selected}
                      select={select}
                    />
                  )}
                  <div className="metric-grid" aria-live="polite">
                    <div>
                      <span>
                        {t("Peak memory estimate", "Tepe bellek tahmini")}
                      </span>
                      <strong data-testid="peak-memory">
                        {memory.total.toFixed(1)} <small>GiB</small>
                      </strong>
                    </div>
                    <div>
                      <span>
                        {t("Conditional paths", "Koşullu seçenekler")}
                      </span>
                      <strong data-testid="eligible-count">
                        {eligible.length} <small>/ 6</small>
                      </strong>
                    </div>
                    <div>
                      <span>{t("Horizon", "Zaman ufku")}</span>
                      <strong>
                        {w.horizon} <small>{t("months", "ay")}</small>
                      </strong>
                    </div>
                  </div>
                  <Comparison
                    results={results}
                    e={e}
                    horizon={w.horizon}
                    selected={selected}
                    select={select}
                  />
                </>
              )}
              {mode === "cost" && (
                <CostPanel
                  results={results}
                  w={w}
                  setW={setW}
                  e={e}
                  setE={setE}
                  overrides={overrides}
                  setOverrides={setOverrides}
                />
              )}
              {mode === "memory" && (
                <MemoryPanel w={w} setW={setW} results={results} />
              )}
              {mode === "scale" && (
                <ScalePanel results={results} w={w} setW={setW} />
              )}
              {mode === "decide" && (
                <DecisionPanel
                  results={results}
                  p={p}
                  setP={(next: Preferences) => {
                    setP(next);
                    setModified(true);
                  }}
                  w={w}
                  e={e}
                />
              )}
              {mode === "learn" && <LearnPanel experiment={experiment} />}
            </div>
            {mode === "compare" && (
              <>
                <div className="recommendation-strip" aria-live="polite">
                  <Info />
                  <div>
                    <strong data-testid="recommendation">
                      {!winner
                        ? t(
                            "No eligible deployment",
                            "Uygun dağıtım seçeneği yok",
                          )
                        : tied
                          ? t("No unique recommendation", "Tek bir öneri yok")
                          : `${t("Conditional recommendation", "Koşullu öneri")}: ${name(winner.candidate)}`}
                    </strong>
                    <p>
                      {t(
                        "Can run is not the same as should run. Inspect constraints, assumptions and unknowns.",
                        "Çalışabilir olmak, doğru seçim olmak değildir. Kısıtları, varsayımları ve bilinmeyenleri inceleyin.",
                      )}
                    </p>
                  </div>
                  <button onClick={() => setMode("decide")}>
                    {t("Why?", "Neden?")}
                    <ArrowRight />
                  </button>
                </div>
                <CandidateDetail
                  result={detail}
                  w={w}
                  e={e}
                  override={overrides[detail.candidate.id]}
                />
              </>
            )}
          </div>
        </div>
        <footer>
          <span>
            DCL ·{" "}
            {t(
              "An educational decision laboratory",
              "Bir eğitim ve karar laboratuvarı",
            )}
          </span>
          <div className="links-row">
            <External href="https://lcl.aserdargun.com/">LCL</External>
            <span>+</span>
            <External href="https://cld.aserdargun.com/">CLD</External>
            <span>→ DCL →</span>
            <External href="https://tfl.aserdargun.com/">TFL</External>
          </div>
          <span>
            {t(
              "No live prices. No measured performance.",
              "Canlı fiyat veya ölçülmüş performans içermez.",
            )}
          </span>
        </footer>
      </main>
    </>
  );
}
