import type { Locale } from "../core/types";

/** Authored portfolio home routes; leave reference URLs and deep links untouched. */
export function localizedPortfolioHome(href: string, locale: Locale): string {
  const homes: Record<string, string> = {
    "https://aserdargun.com/": `https://aserdargun.com/${locale === "tr" ? "tr/" : ""}`,
    "https://lcl.aserdargun.com/": `https://lcl.aserdargun.com/${locale}`,
    "https://llm.aserdargun.com/": `https://llm.aserdargun.com/${locale}`,
    // CLD currently offers Turkish content only.
    "https://cld.aserdargun.com/": "https://cld.aserdargun.com/",
    ...Object.fromEntries(
      ["tfl", "gex", "arl", "adp"].map((code) => [
        `https://${code}.aserdargun.com/`,
        `https://${code}.aserdargun.com/?lang=${locale}`,
      ]),
    ),
  };
  return homes[href] ?? href;
}
