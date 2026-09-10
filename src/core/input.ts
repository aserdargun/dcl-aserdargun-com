/** Match numeric controls without admitting fractional counts or non-finite values. */
export function validNumber(
  value: string,
  min: number,
  max: number,
  step: number,
) {
  if (value.trim() === "") return false;
  const n = Number(value);
  const steps = (n - min) / step;
  return (
    Number.isFinite(n) &&
    n >= min &&
    n <= max &&
    Math.abs(steps - Math.round(steps)) < 1e-6
  );
}
