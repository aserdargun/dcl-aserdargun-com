import type { Evaluation, Workload } from "../core/types";
import { useCandidateName, useT } from "../components/ui";
const positions: Record<string, [number, number]> = {
  nvidia: [225, 55],
  amd: [190, 135],
  apple: [245, 215],
  cloud: [705, 55],
  managed: [750, 135],
  api: [700, 215],
};
function Block({
  x,
  y,
  color,
  kind,
}: {
  x: number;
  y: number;
  color: string;
  kind: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <path d="M-50 0 0-25 50 0 0 25Z" fill="#1e3035" stroke={color} />
      <path
        d="M-50 0v10L0 35V25Zm50 25v10l50-25V0"
        fill="#18292e"
        stroke={color}
        strokeWidth="1.5"
      />
      {kind === "api" ? (
        <>
          <path
            d="m-18-12 8-8m-8 8 8 8m28-8-8-8m8 8-8 8M4-24-4 0"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </>
      ) : kind === "apple" ? (
        <>
          <path d="m-22-35 30 15v28L-22-7Z" fill="#22333b" stroke="#9aafb6" />
          <path d="m-22-7-12 8L-3 17 9 8" fill="#24383c" stroke="#9aafb6" />
        </>
      ) : (
        <>
          <path d="m-16-40 18-9 18 9-18 9Z" fill="#3c4b51" stroke="#82979f" />
          <path d="m-16-40 18 9v35l-18-9Z" fill="#26373e" stroke="#82979f" />
          <path d="m2-31 18-9v35L2 4Z" fill="#1c2c33" stroke="#82979f" />
          <path d="m-11-25 8 4m-8 5 8 4m-8 5 8 4" stroke={color} />
        </>
      )}
    </g>
  );
}
export function DeploymentWorld({
  results,
  w,
  selected,
  select,
}: {
  results: Evaluation[];
  w: Workload;
  selected: string;
  select: (id: string) => void;
}) {
  const name = useCandidateName();
  const t = useT();
  return (
    <div className="world">
      <svg
        viewBox="0 0 960 270"
        aria-label={t(
          "Deployment topology. Select a route to inspect memory, costs and constraints.",
          "Dağıtım topolojisi. Bellek, maliyet ve kısıtları incelemek için bir yol seçin.",
        )}
        role="group"
      >
        <defs>
          <pattern
            id="grid"
            width="56"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 14 28 0 56 14 28 28Z"
              fill="none"
              stroke="#213136"
              strokeWidth=".5"
            />
          </pattern>
        </defs>
        <rect width="960" height="270" fill="url(#grid)" />
        {results.map((r) => {
          const [x, y] = positions[r.candidate.id];
          return (
            <path
              key={r.candidate.id}
              d={`M480 135 L${x} ${y + 15}`}
              fill="none"
              stroke={r.eligible ? "#537b70" : "#465054"}
              strokeDasharray={r.eligible ? "" : "5 6"}
              strokeWidth={selected === r.candidate.id ? 2 : 1}
            />
          );
        })}
        <g transform="translate(480 135)">
          <path d="M-100 0 0-50 100 0 0 50Z" fill="#20373b" stroke="#79deba" />
          <path
            d="M-100 0v17L0 67V50Zm100 50v17l100-50V0"
            fill="#18292e"
            stroke="#497d6e"
          />
          <text y="-10" textAnchor="middle" className="world-title">
            {t("WORKLOAD", "İŞ YÜKÜ")}
          </text>
          <text y="10" textAnchor="middle">
            {w.parametersB}B · Q{w.bits} · {w.maxContext / 1024}K
          </text>
          <text y="29" textAnchor="middle">
            {w.concurrency} → {w.peakConcurrency} {t("users", "kullanıcı")}
          </text>
        </g>
        {results.map((r) => {
          const [x, y] = positions[r.candidate.id];
          const color = !r.eligible
            ? "#77828a"
            : r.memoryFit === "LIMITED"
              ? "#dfb45e"
              : "#79deba";
          const left = x < 480;
          return (
            <g
              key={r.candidate.id}
              tabIndex={0}
              role="button"
              aria-label={`${name(r.candidate)}: ${r.eligible ? t("conditionally eligible", "koşullu uygun") : t("ineligible", "uygun değil")}`}
              aria-pressed={selected === r.candidate.id}
              onClick={() => select(r.candidate.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(r.candidate.id);
                }
              }}
              className="world-node"
            >
              <rect
                x={left ? 38 : x - 58}
                y={y - 55}
                width="275"
                height="78"
                rx="5"
                fill="transparent"
                stroke={selected === r.candidate.id ? color : "transparent"}
              />
              <Block x={x} y={y} color={color} kind={r.candidate.id} />
              <text
                x={left ? x - 66 : x + 66}
                y={y - 9}
                textAnchor={left ? "end" : "start"}
                className="node-name"
              >
                {name(r.candidate)}
              </text>
              <text
                x={left ? x - 66 : x + 66}
                y={y + 12}
                textAnchor={left ? "end" : "start"}
                fill={color}
              >
                {r.eligible
                  ? r.memoryFit === "LIMITED"
                    ? t("Memory pressure", "Bellek baskısı")
                    : t("Conditional path", "Koşullu seçenek")
                  : t("Ineligible", "Uygun değil")}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mobile-topology">
        {t("LOCAL ↔ WORKLOAD ↔ CLOUD / API", "YEREL ↔ İŞ YÜKÜ ↔ BULUT / API")}
      </div>
      <div className="world-caption">
        <span>
          {t(
            "Conceptual architecture · fixed configuration per candidate",
            "Kavramsal mimari · aday başına sabit yapılandırma",
          )}
        </span>
        <span>
          {t("Select a path to inspect →", "İncelemek için bir yol seçin →")}
        </span>
      </div>
    </div>
  );
}
