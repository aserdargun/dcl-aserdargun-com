import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { Economics, Evaluation } from "../core/types";
import { fitText, Money, useCandidateName, useT, useText } from "./ui";
export function Comparison({
  results,
  e,
  horizon,
  selected,
  select,
}: {
  results: Evaluation[];
  e: Economics;
  horizon: number;
  selected: string;
  select: (s: string) => void;
}) {
  const name = useCandidateName();
  const t = useT(),
    txt = useText();
  return (
    <>
      <div className="table-wrap">
        <table className="comparison">
          <caption className="sr-only">
            {t(
              "Candidate comparison. All totals are calculated from educational defaults.",
              "Aday karşılaştırması. Tüm tutarlar eğitim varsayımlarından hesaplanır.",
            )}
          </caption>
          <thead>
            <tr>
              <th>{t("Candidate", "Aday")}</th>
              <th>{t("Memory fit", "Bellek uygunluğu")}</th>
              <th>
                {horizon} {t("month cost", "ay maliyet")}
              </th>
              <th>{t("Eligibility", "Uygunluk")}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.candidate.id}
                data-testid={`candidate-${r.candidate.id}`}
                className={`${selected === r.candidate.id ? "selected" : ""} ${r.eligible ? "" : "ineligible"}`}
              >
                <th scope="row">
                  <button
                    className="candidate-select"
                    aria-pressed={selected === r.candidate.id}
                    onClick={() => select(r.candidate.id)}
                  >
                    <i style={{ background: r.candidate.color }} />
                    {name(r.candidate)}
                    <ArrowRight aria-hidden="true" />
                  </button>
                </th>
                <td>
                  <span className={`fit ${r.memoryFit.toLowerCase()}`}>
                    {txt(fitText[r.memoryFit])}
                  </span>
                </td>
                <td className="money">
                  <Money value={r.cost.total} e={e} />
                </td>
                <td>
                  <span
                    className={`status ${r.eligible ? "eligible" : "excluded"}`}
                  >
                    {r.eligible ? (
                      <CheckCircle2 aria-hidden="true" />
                    ) : (
                      <XCircle aria-hidden="true" />
                    )}
                    {r.eligible
                      ? t("Conditional", "Koşullu")
                      : t("Ineligible", "Uygun değil")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-candidates">
        {results.map((r) => (
          <article
            key={r.candidate.id}
            className={selected === r.candidate.id ? "selected" : ""}
          >
            <button onClick={() => select(r.candidate.id)}>
              {name(r.candidate)}
              <ArrowRight />
            </button>
            <p>{txt(fitText[r.memoryFit])}</p>
            <div>
              <Money value={r.cost.total} e={e} />
              <span className={r.eligible ? "eligible" : "excluded"}>
                {r.eligible
                  ? t("Conditional", "Koşullu")
                  : t("Ineligible", "Uygun değil")}
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
