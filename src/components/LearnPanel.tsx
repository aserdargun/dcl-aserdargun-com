import { lessons } from "../lessons/lessons";
import { Section, useT, useText, External } from "./ui";
export function LearnPanel({
  experiment,
  index,
  setIndex,
  answers,
  setAnswers,
}: {
  index: number;
  setIndex: (index: number) => void;
  answers: Record<number, number>;
  setAnswers: (answers: Record<number, number>) => void;
  experiment: (action: "context" | "usage" | "privacy") => void;
}) {
  const t = useT(),
    txt = useText();
  const lesson = lessons[index],
    answer = answers[index];
  return (
    <Section
      title={t("Deployment 101", "Dağıtım 101")}
      description={t(
        "Ten short chapters. Predict, change an assumption, then inspect the result.",
        "On kısa bölüm. Tahmin edin, varsayımı değiştirin, sonucu inceleyin.",
      )}
    >
      <div className="lesson-layout">
        <nav aria-label={t("Lesson chapters", "Ders bölümleri")}>
          {lessons.map((l, i) => (
            <button
              key={i}
              aria-current={i === index ? "step" : undefined}
              onClick={() => setIndex(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {txt(l.title)}
              <b>{answers[i] === l.answer ? "✓" : ""}</b>
            </button>
          ))}
        </nav>
        <article>
          <span className="source-line">
            {index + 1} / 10 ·{" "}
            {
              Object.entries(answers).filter(
                ([key, value]) => lessons[Number(key)].answer === value,
              ).length
            }{" "}
            {t("checkpoints passed", "kontrol geçildi")}
          </span>
          <h2>{txt(lesson.title)}</h2>
          <p className="lesson-body">{txt(lesson.body)}</p>
          <fieldset className="quiz">
            <legend>{txt(lesson.question)}</legend>
            {lesson.options.map((option, i) => (
              <button
                key={i}
                aria-pressed={answer === i}
                onClick={() => setAnswers({ ...answers, [index]: i })}
              >
                {txt(option)}
              </button>
            ))}
          </fieldset>
          {answer !== undefined && (
            <div className="insight" role="status">
              <strong>
                {answer === lesson.answer
                  ? t(
                      "That follows from the model.",
                      "Modelden çıkan sonuç bu.",
                    )
                  : t(
                      "Reconsider this assumption.",
                      "Bu varsayımı yeniden düşünün.",
                    )}
              </strong>
              <p>{txt(lesson.feedback)}</p>
            </div>
          )}
          {lesson.experiment && (
            <button
              className="primary"
              onClick={() => experiment(lesson.experiment!)}
            >
              {t(
                "Run this experiment in the workbench",
                "Bu deneyi çalışma alanında çalıştır",
              )}{" "}
              →
            </button>
          )}
          <div className="lesson-nav">
            <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
              {t("Previous", "Önceki")}
            </button>
            <button disabled={index === 9} onClick={() => setIndex(index + 1)}>
              {t("Next chapter", "Sonraki bölüm")} →
            </button>
          </div>
        </article>
      </div>
      <div className="ecosystem">
        <h3>{t("Continue the learning path", "Öğrenme yoluna devam edin")}</h3>
        <p>
          {t(
            "LCL + CLD → DCL → TFL → GEX. Hardware knowledge and cloud economics become a deployment choice, then a serving question. Agent workloads from ARL can use the same decision inputs. These are independent learning applications; no shared telemetry or automatic parameter handoff is implied.",
            "LCL + CLD → DCL → TFL → GEX. Donanım bilgisi ve bulut ekonomisi önce dağıtım seçimine, sonra servis sorusuna dönüşür. ARL ajan iş yükleri aynı karar girdilerini kullanabilir. Bunlar bağımsız öğrenme uygulamalarıdır; ortak telemetri veya otomatik parametre aktarımı varsayılmaz.",
          )}
        </p>
        <div className="links-row">
          <External href="https://lcl.aserdargun.com/">
            LCL · {t("Local hardware", "Yerel donanım")}
          </External>
          <External href="https://cld.aserdargun.com/">
            CLD · {t("Cloud economics", "Bulut ekonomisi")}
          </External>
          <External href="https://tfl.aserdargun.com/">
            TFL · {t("Serving behavior", "Servis davranışı")}
          </External>
          <External href="https://gex.aserdargun.com/">
            GEX · {t("GPU execution", "GPU yürütme")}
          </External>
          <External href="https://llm.aserdargun.com/">
            LLM · {t("Runtime atlas", "Çalışma zamanı atlası")}
          </External>
          <External href="https://arl.aserdargun.com/">
            ARL · {t("Agent workloads", "Ajan iş yükleri")}
          </External>
        </div>
      </div>
    </Section>
  );
}
