import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { localizedPortfolioHome } from "../src/ils/portfolio";
import { Language, External } from "../src/components/ui";
import { manifest } from "../src/ils/catalog";
import { DeploymentWorld } from "../src/visualization/DeploymentWorld";
import { defaultWorkload } from "../src/data/defaults";

it("uses actual locale paths and queries without rewriting references or handoffs", () => {
  for (const locale of ["en", "tr"] as const) {
    expect(localizedPortfolioHome("https://aserdargun.com/", locale)).toBe(
      `https://aserdargun.com/${locale === "tr" ? "tr/" : ""}`,
    );
    for (const code of ["lcl", "llm"])
      expect(
        localizedPortfolioHome(`https://${code}.aserdargun.com/`, locale),
      ).toBe(`https://${code}.aserdargun.com/${locale}`);
    for (const code of ["adp", "tfl", "gex", "arl"])
      expect(
        localizedPortfolioHome(`https://${code}.aserdargun.com/`, locale),
      ).toBe(`https://${code}.aserdargun.com/?lang=${locale}`);
    expect(localizedPortfolioHome("https://cld.aserdargun.com/", locale)).toBe(
      "https://cld.aserdargun.com/",
    );
    for (const href of [
      "https://tfl.aserdargun.com/?experiment=kv&ils=payload",
      "https://docs.vllm.ai/en/latest/getting_started/installation/",
    ])
      expect(localizedPortfolioHome(href, locale)).toBe(href);
    for (const link of manifest.related!.theory!)
      expect(link.localizedUrls![locale]).toBe(
        localizedPortfolioHome(link.url!, locale),
      );
  }
});

it("renders localized portfolio links and accurate floating-point precision labels", () => {
  expect(
    renderToStaticMarkup(
      <Language.Provider value="tr">
        <External href="https://lcl.aserdargun.com/">LCL</External>
      </Language.Provider>,
    ),
  ).toContain('href="https://lcl.aserdargun.com/tr"');
  for (const [bits, label] of [
    [4, "Q4"],
    [8, "Q8"],
    [16, "BF16/FP16"],
    [32, "FP32"],
  ] as const) {
    const html = renderToStaticMarkup(
      <DeploymentWorld
        results={[]}
        w={{ ...defaultWorkload, bits }}
        selected="apple"
        select={() => {}}
      />,
    );
    expect(html).toContain(label);
    expect(html).not.toMatch(/Q16|Q32/);
  }
});
