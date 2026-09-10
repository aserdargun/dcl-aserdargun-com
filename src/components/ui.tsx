import { createContext, useContext, useId, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { validNumber } from "../core/input";
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
  OFFLOAD: ["Requires host offload", "Ana belleğe aktarım gerekli"],
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
  const t = useT();
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [badInput, setBadInput] = useState(false);
  useEffect(() => {
    setDraft(value === null ? "" : String(value));
    setBadInput(false);
  }, [value]);
  const invalid =
    badInput ||
    (!(optional && draft === "") && !validNumber(draft, min, max, step));
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {suffix && <small>{suffix}</small>}
      </span>
      <input
        id={id}
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={draft}
        placeholder={optional ? "—" : undefined}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => {
          const s = event.target.value;
          setDraft(s);
          setBadInput(event.target.validity.badInput);
          if (event.target.validity.badInput) return;
          if (s === "" && optional) onChange(null);
          else if (validNumber(s, min, max, step)) onChange(Number(s));
        }}
        onBlur={() => {
          if (invalid || (draft === "" && !optional))
            setDraft(value === null ? "" : String(value));
          setBadInput(false);
        }}
      />
      {invalid && (
        <small id={`${id}-error`} className="field-error" role="status">
          {t(
            `Enter ${min}–${max} in steps of ${step}. The previous valid value is still used.`,
            `${min}–${max} arasında, ${step} adımlı bir değer girin. Önceki geçerli değer kullanılmaya devam ediyor.`,
          )}
        </small>
      )}
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
        aria-label={label}
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
