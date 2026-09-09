# DCL CORE verification — 2026-09-09

## Result

Working React/TypeScript client-side CORE. `npm run validate`: TypeScript passed; **33 unit tests passed**; production build passed. **59 browser assertions passed** through Codex IAB via CUA. Detailed checks and seven-scenario outcomes: [browser-checks.json](browser-checks.json).

Production artifact served on `http://127.0.0.1:4300`; development on 5300. No Azure deployment, GitHub remote publication or custom-domain binding was performed. The CI workflow is supplied but has not run remotely.

## Engine acceptance

Verified decimal parameter counts to binary GiB; Q4/Q8 conversion; peak context/concurrency; independent KV precision; metadata/workspace/headroom; discrete vs unified reserve; limited/comfortable/non-fit/offload categories; opaque API contract; local capex at zero usage; idle/normal/peak electricity; cloud billing policy; managed premium; asymmetric token pricing; monthly extras; 1-year/3-year horizon; actual curve intersections and non-intersections; zero user overrides; source freshness including future/invalid dates; runtime support; local-only; budget constraints; exact model; no eligible result; zero preference weights; score decomposition and ranking diversity.

Observed recommendations, all conditional and LOW evidence:

| Scenario           | Computed category |
| ------------------ | ----------------- |
| 70B team           | Local Apple       |
| Personal developer | Token API         |
| API-first startup  | Token API         |
| Always-on service  | Local Apple       |
| Privacy first      | Local Apple       |
| 30-person company  | Cloud GPU VM      |
| Bursty batch       | Token API         |

These are regression outcomes for the synthetic dataset, not vendor endorsements.

## Browser acceptance

Browser/IAB used first and throughout. No external Playwright browser or Chromium fallback was needed. Verified initial two-candidate vertical slice before expanding to all six. Desktop checks: 1536×1024 native reference dimensions plus default 1280×720; tablet 768×1024; mobile 390×844 and 320×740. All six Turkish modes were checked at 320px without horizontal page overflow. Tablet uses a stacked workload/comparison layout, with no clipped topology.

Workflows exercised: flagship; 16K→32K peak memory; usage with genuine keyboard events; local-only exclusions; scenario switching; 1-year/3-year toggles; local/API/cloud recommendations; cost pair selection; real and absent break-even; zero-price override and reset; manual TRY conversion; unified memory explanation; scale stress; zero and balanced weights; quiz feedback and next chapter; a lesson changing real workload state; mobile continue/collapse; mobile candidate details; bilingual headings and names; production cost/memory panels; safe external link attributes; report export; clean production console.

The browser adapter's synthetic range `fill()` changed DOM value without firing React's native input path. It was replaced by real Home/End/ArrowRight keyboard input. Final checks confirm both the value in React state and the resulting memory/cost behavior. This was a test-driver limitation, not shipped app behavior.

IAB's download event waiter timed out, but the report was successfully downloaded. The resulting `dcl-decision-report.json` was independently parsed from disk: schema `dcl-decision-report/v1`, six candidates, 70B profile, exact peak memory 167.6447919845581 GiB, and 35,727 bytes. No contents were transmitted externally.

The final production tab had zero console errors. A transient development HMR error during a localization edit was corrected before production validation. Link destinations LCL, CLD, TFL, LLM, GEX and ARL all returned HTTP 200 over HTTPS. Source links are conceptual references, not evidence for synthetic prices.

## Visual fidelity ledger

Accepted working direction: [design-reference.png](design-reference.png), 1536×1024. Current rendering: [qa-desktop.png](qa-desktop.png), same native viewport. Both were opened with `view_image` in the final QA pass, along with desktop/mobile cost screenshots. No claim is made that the generated mockup's numerical content was authoritative.

| Comparison point             | Inspection and disposition                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity and above-fold copy | DCL identity, exact English tagline, subtitle, six-mode navigation and scenario/workload structure retained. Added required maximum context, evidence label, scenario description, reset/export and progressive controls are intentional functional additions. No invented hero eyebrow or marketing metric.                                  |
| Layout and density           | Left 290px workload rail and right workbench retained. Initial oversized topology pushed candidate rows too low; topology and row spacing were reduced so all six rows are visible at reference size. Recommendation strip follows the table and continues near the lower viewport edge because required controls/copy take additional space. |
| Typography                   | Locally bundled Geist and IBM Plex Mono; distinct heading, control, numeric and evidence scales. Mobile wrapping inspected. More compact than mockup in detailed table/evidence rows to accommodate real state explanations.                                                                                                                  |
| Palette and surfaces         | #101719 canvas, #151e22 surfaces, #344247 rules, mint and amber accents retained. No warm background shift, raster overlay, decorative gradients or vendor branding.                                                                                                                                                                          |
| Architecture and assets      | Isometric, interactive code-native SVG replaces concept artwork, as required for actual data-driven interaction. Transparent labels show real eligibility. No generated 'high performance' claim; no opaque API marked as physically fitting/offloading. It is a schematic, not WebGL hardware simulation.                                    |
| Status and numeric integrity | Every displayed memory/cost/status comes from the engine. Candidate rows rank by result, so ordering differs from the image. Selected Apple is amber for limited headroom. Ineligible routes use dashed lines, text and icons rather than color alone.                                                                                        |
| Responsive behavior          | Mobile uses workload → continue → candidate articles with detailed inspection; no squeezed desktop table. Turkish candidate names and the mobile topology text are translated. Tablet stacks panels to avoid clipping.                                                                                                                        |
| Accessibility and motion     | Native labeled fields, keyboard-operable diagram and sliders, visible focus, semantic table, chart description plus expandable per-month values, status text, and reduced-motion styling. No decorative animations.                                                                                                                           |

Faithfully verified against the reference's visual direction with the documented correctness and functional deviations above. No known blocking visual or interaction mismatch remains. This is not a pixel-identical reproduction of erroneous generated values.

## Focused senior review

One review focused on technical/economic misrepresentation, assumptions, ranking bias and usability. High-impact fixes made: keep API physical memory unknown; do not pool host RAM into discrete VRAM; fail invalid input+output context and peak/average combinations; keep zero-weight ties explicit; distinguish exact model from an API alternative; apply privacy choices to visible weights; disclose 1:1 FX placeholder and omitted costs; preserve provisioned idle cloud costs; expose unknown runtime/performance; keep growing-demand capacity analysis separate from constant-demand TCO; improve mobile continuation and tablet layout.

## Screenshots

- [Desktop comparison](qa-desktop.png)
- [Desktop cost / break-even](qa-cost.png)
- [Turkish mobile comparison](qa-mobile-tr.png)
- [Turkish mobile cost](qa-mobile-cost-tr.png)

The report and screenshots are intentional delivery evidence. Temporary install/build logs remain outside the repository.
