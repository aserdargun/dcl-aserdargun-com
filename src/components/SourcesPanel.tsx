import { useContext } from "react";
import {
  browserChecks,
  concepts,
  localize,
  sharedLab,
  sourceById,
  sourcePolicy,
  sources,
} from "../ils/evidence";
import { External, Language, Section, useT } from "./ui";

/**
 * The dated evidence surface. It renders records only: sources that back
 * concepts, the concept bodies, the browser checks that were actually executed
 * and the shared-laboratory scope. It introduces no new measurement.
 */
export function SourcesPanel() {
  const t = useT();
  const locale = useContext(Language);
  return (
    <Section
      title={t(
        "Sources, evidence and shared scope",
        "Kaynaklar, kanıt ve ortak kapsam",
      )}
      description={t(
        "Dated records behind the concepts, the concept explanations, the browser checks that were actually executed, and the laboratories that share this vocabulary.",
        "Kavramların arkasındaki tarihli kayıtlar, kavram açıklamaları, gerçekten çalıştırılan tarayıcı kontrolleri ve bu sözlüğü paylaşan laboratuvarlar.",
      )}
    >
      <div className="evidence-block" data-testid="source-ledger">
        <h3>
          {t("Source ledger", "Kaynak defteri")}{" "}
          <span className="source-line">
            {sources.length} {t("dated records", "tarihli kayıt")}
          </span>
        </h3>
        <p>{localize(sourcePolicy, locale)}</p>
        <div className="ledger">
          {sources.map((s) => (
            <article key={s.id} data-testid="source-record">
              <header>
                <h4>{s.title}</h4>
                <span className="source-line">{s.publisher}</span>
              </header>
              <p className="source-meta">
                {t(
                  "Published as stated by the source",
                  "Kaynağın belirttiği yayın",
                )}
                : <b>{s.published ?? t("none on the page", "sayfada yok")}</b> ·{" "}
                {t("Accessed", "Erişim")}: <b>{s.accessed}</b>
              </p>
              <p>
                <b>{t("Supports", "Destekler")}:</b>{" "}
                {localize(s.supports, locale)}
              </p>
              <p className="warning">
                <b>{t("Does not support", "Desteklemez")}:</b>{" "}
                {localize(s.doesNotSupport, locale)}
              </p>
              <div className="links-row">
                <External href={s.url}>
                  {t("Open the source", "Kaynağı aç")}
                </External>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="evidence-block" data-testid="concept-list">
        <h3>
          {t("Concepts explained", "Açıklanan kavramlar")}{" "}
          <span className="source-line">
            {concepts.length} {t("records", "kayıt")}
          </span>
        </h3>
        <div className="concept-list">
          {concepts.map((c) => (
            <article key={c.id}>
              <h4>{localize(c.label, locale)}</h4>
              <p>{localize(c.body, locale)}</p>
              {c.sourceRefs.length > 0 ? (
                <p className="source-meta">
                  {t("Backed by", "Dayanak:")}{" "}
                  {c.sourceRefs.map((id, i) => (
                    <span key={id}>
                      {i > 0 && " · "}
                      <External href={sourceById.get(id)!.url}>
                        {sourceById.get(id)!.publisher} ·{" "}
                        {sourceById.get(id)!.published ??
                          t("no date", "tarih yok")}
                      </External>
                    </span>
                  ))}
                </p>
              ) : (
                <p className="warning">
                  {t(
                    "No dated public source is attached to this concept. It is described from the laboratory's own model and stays unverified.",
                    "Bu kavrama tarihli bir kamu kaynağı bağlı değildir. Laboratuvarın kendi modelinden açıklanır ve doğrulanmamış kalır.",
                  )}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="evidence-block" data-testid="verified-behavior">
        <h3>
          {t("Verified behavior", "Doğrulanmış davranış")}{" "}
          <span className="source-line">
            {t("executed", "çalıştırıldı")} {browserChecks.date}
          </span>
        </h3>
        <p>
          {t(
            `${browserChecks.checks.length} regression checks were executed in a browser against a local production build on ${browserChecks.date}. They are a dated record of what was tested, not a live result of this build, and they describe decision rules over synthetic profiles — not vendor behaviour.`,
            `${browserChecks.checks.length} regresyon kontrolü ${browserChecks.date} tarihinde, yerel üretim yapısına karşı tarayıcıda çalıştırıldı. Bunlar neyin test edildiğine dair tarihli bir kayıttır, bu yapının canlı bir sonucu değildir; sentetik profiller üzerindeki karar kurallarını anlatır — sağlayıcı davranışını değil.`,
          )}
        </p>
        <p className="source-meta">
          {t("Method", "Yöntem")}: {browserChecks.method} ·{" "}
          {t("Environment", "Ortam")}: {browserChecks.productionURL} ·{" "}
          {t("Full record in the repository", "Tüm kayıt depoda")}:{" "}
          docs/browser-checks.json
        </p>
        <p className="source-meta">
          {t(
            "Check names, scenario outcomes, source titles, publisher names and laboratory names are reproduced in the record's original wording in every locale.",
            "Kontrol adları, senaryo sonuçları, kaynak başlıkları, yayıncı adları ve laboratuvar adları her dilde kaydın özgün ifadesiyle aynen aktarılır.",
          )}
        </p>
        <ul className="check-grid">
          {browserChecks.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
        <table className="scenario-outcomes">
          <caption>
            {t(
              "Scenario outcomes at the recorded date — regression outcomes for the synthetic dataset, not vendor endorsements.",
              "Kayıt tarihindeki senaryo sonuçları — sentetik veri kümesi için regresyon sonuçları, sağlayıcı onayı değil.",
            )}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("Scenario", "Senaryo")}</th>
              <th scope="col">{t("Recorded outcome", "Kayıtlı sonuç")}</th>
            </tr>
          </thead>
          <tbody>
            {browserChecks.scenarioChecks.map((row) => (
              <tr key={row.scenario}>
                <th scope="row">{row.scenario}</th>
                <td>{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="evidence-block" data-testid="shared-lab">
        <h3>
          {t("Shared laboratory scope", "Ortak laboratuvar kapsamı")}{" "}
          <span className="source-line">
            {sharedLab.applications.length} {t("laboratories", "laboratuvar")} ·{" "}
            {sharedLab.conceptCount} {t("concepts", "kavram")} ·{" "}
            {sharedLab.edgeCount} {t("relationships", "ilişki")}
          </span>
        </h3>
        <p>
          {t(
            "DCL is one laboratory inside a shared vocabulary. Sharing a concept name is not sharing a measurement: every laboratory keeps its own assumptions, its own synthetic data and its own evidence. DCL reads no numbers from the others, and the others read none from DCL.",
            "DCL, ortak bir sözlük içinde yer alan bir laboratuvardır. Bir kavram adını paylaşmak ölçüm paylaşmak değildir: her laboratuvar kendi varsayımlarını, kendi sentetik verisini ve kendi kanıtını tutar. DCL diğerlerinden hiçbir sayı okumaz, onlar da DCL'den okumaz.",
          )}
        </p>
        <ul className="lab-list">
          {sharedLab.applications.map((a) => (
            <li key={a.appId} data-testid="lab-entry">
              <b>{a.appId.toUpperCase()}</b>
              <External href={a.canonicalUrl}>{a.name}</External>
              <span className="source-line">
                {a.status === "live"
                  ? t(
                      "status: live in the shared graph",
                      "durum: ortak grafikte canlı",
                    )
                  : t(
                      "status: not recorded in the shared graph",
                      "durum: ortak grafikte kayıtlı değil",
                    )}
              </span>
            </li>
          ))}
        </ul>
        <p>
          {t(
            `DCL places ${sharedLab.dclConceptIds.length} of those concepts on its own surfaces: ${sharedLab.dclConceptIds.join(", ")}.`,
            `DCL, bu kavramlardan ${sharedLab.dclConceptIds.length} tanesini kendi yüzeylerine yerleştirir: ${sharedLab.dclConceptIds.join(", ")}.`,
          )}
        </p>
        {sharedLab.paths.length > 0 && (
          <p>
            {t(
              "Paths that pass through this laboratory:",
              "Bu laboratuvardan geçen yollar:",
            )}{" "}
            {sharedLab.paths
              .map((p) => `${localize(p.title, locale)} (${p.id})`)
              .join(" · ")}
          </p>
        )}
      </div>
    </Section>
  );
}
