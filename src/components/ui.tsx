import { createContext, useContext, useId, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type {
  Candidate,
  Economics,
  Locale,
  MemoryFit,
  Text,
} from "../core/types";
export const Language = createContext<Locale>("en");
export function useT() {
  const locale = useContext(Language);
  return (en: string, tr: string) => (locale === "en" ? en : tr);
}
export function useText() {
  const locale = useContext(Language);
  return (text: Text) => text[locale === "en" ? 0 : 1];
}
export const fitText: Record<MemoryFit, Text> = {
  COMFORTABLE: ["Fits comfortably", "Rahatça sığıyor"],
  LIMITED: ["Limited headroom", "Sınırlı boşluk"],
  DOES_NOT_FIT: ["Does not fit", "Sığmıyor"],
  OFFLOAD: ["Requires sharding / offload", "Bölme / aktarım gerekli"],
  PROVIDER_MANAGED: [
    "Provider-managed · unverified",
    "Sağlayıcı yönetiminde · doğrulanmadı",
  ],
};
export function Money({ value, e }: { value: number; e: Economics }) {
  const locale = useContext(Language);
  return (
    <>
      {new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
        style: "currency",
        currency: e.currency,
        maximumFractionDigits: 0,
      }).format(value * (e.currency === "USD" ? 1 : e.fx))}
    </>
  );
}
export function Num({
  label,
  value,
  onChange,
  min = 0,
  max = 1e9,
  step = 1,
  suffix,
  optional = false,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  optional?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  useEffect(() => setDraft(value === null ? "" : String(value)), [value]);
  const invalid =
    draft !== "" &&
    (!Number.isFinite(Number(draft)) ||
      Number(draft) < min ||
      Number(draft) > max);
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {suffix && <small>{suffix}</small>}
      </span>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        placeholder={optional ? "—" : undefined}
        aria-invalid={invalid}
        onChange={(event) => {
          const s = event.target.value;
          setDraft(s);
          if (s === "" && optional) onChange(null);
          else if (
            s !== "" &&
            Number.isFinite(Number(s)) &&
            Number(s) >= min &&
            Number(s) <= max
          )
            onChange(Number(s));
        }}
        onBlur={() => {
          if (invalid || (draft === "" && !optional))
            setDraft(String(value ?? min));
        }}
      />
    </label>
  );
}
export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
}) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map(([v, name]) => (
          <option value={v} key={v}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const id = useId();
  return (
    <div className="slider">
      <label htmlFor={id}>
        {label}
        <output>
          {Math.round(value)}
          {unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="range-ends">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mode-section">
      <div className="section-heading">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}
export function External({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="external"
    >
      {children}
      <ArrowUpRight aria-hidden="true" />
      <span className="sr-only">
        {t(" (opens in a new tab)", " (yeni sekmede açılır)")}
      </span>
    </a>
  );
}

export function useCandidateName() {
  const locale = useContext(Language);
  const names: Record<string, string> = {
    nvidia: "Yerel NVIDIA",
    amd: "Yerel AMD",
    apple: "Yerel Apple",
    cloud: "Bulut GPU VM",
    managed: "Yönetilen çıkarım",
    api: "Token API",
  };
  return (c: Candidate) => (locale === "tr" ? (names[c.id] ?? c.name) : c.name);
}
