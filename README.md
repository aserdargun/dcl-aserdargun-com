# DCL — Deployment Choice Laboratory

**Choose where the workload should run.**

[DCL](https://dcl.aserdargun.com/) · [Azure application](https://happy-rock-053a30403.6.azurestaticapps.net/) · [Public GitHub repository](https://github.com/aserdargun/dcl-aserdargun-com)

A bilingual EN/TR, browser-local decision laboratory for AI workloads. DCL is the shared deployment laboratory of LCL and CLD within the [AI Learning System](https://aserdargun.com/). Canonical address: `https://dcl.aserdargun.com/`. This repository contains the working CORE implementation. Production publishes from `main` through GitHub Actions to Azure Static Web Apps (Free, West Europe). Domain availability and source release verification are separate checks.

## Run

Node 22.12 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5300. Build with `npm run build`; serve production output with `npm run preview` on port 4300. `npm run validate` runs TypeScript, deterministic tests and the production build. Core calculations need no backend, account, API key or external network. Fonts are bundled locally. Language choice persists locally; workload state resets on reload. Lesson checkpoints and cost comparison choices survive mode changes within the session; the laboratory reset clears them. Export a JSON decision report to preserve exact inputs, assumptions and calculations.

## What works

- Six candidate categories: local NVIDIA, AMD and Apple, cloud GPU VM, dedicated managed inference and token API.
- Model/quantization/context/concurrency controls, peak memory, whole-system electricity, TCO, genuine break-even and USD/EUR/TRY manual display conversion.
- Hard eligibility rules separate from inspectable preference contributions; conditional recommendations and explicit unknown performance.
- Seven scenarios, six workbench modes, keyboard-accessible architecture diagram, mobile candidate layout and ten guided checkpoint lessons.
- Candidate price overrides, provenance/freshness metadata, structured reasons, fixed-capacity growth stress and reproducible report export.
- Locale-aware LCL, TFL, GEX, LLM, ARL and ADP learning links; CLD currently provides Turkish content. LCL and LLM use locale paths, while the supported labs use a language query.
- Explicit ADP training-to-inference projection and bounded 7B/14B workload handoff to TFL; hardware, prices and training memory are not transferred.

All shipped prices, power, hardware configurations and capacity ceilings are **educational defaults**. No live prices, vendor rankings, exact-runtime support, SLA guarantees or measured performance. Token API is an unverified model-class alternative, not a claim that identical weights are available. See [model contract](docs/model-contract.md).

## Structure

- `src/core`: typed workload, memory, economics, constraints, scoring, scenarios and freshness.
- `src/data`: independently replaceable synthetic profiles, defaults and provider interface.
- `src/components`: focused workbench panels and bilingual controls.
- `src/visualization`: responsive, interactive isometric SVG architecture. Code-native geometry has no WebGL requirement.
- `src/lessons`: ten bilingual lessons and explanation checkpoints.
- `tests`: deterministic domain tests. The initial browser verification record is in `docs/qa.md`.

The PR/manual CI workflow validates and uploads `dist`. The authoritative production workflow `deploy-swa-dcl-aserdargun-com.yml` validates and deploys prebuilt `dist` on `main`. `release.json` records the deployed commit and checksums for release correlation. Azure-compatible security headers and SPA fallback are in `public/staticwebapp.config.json`. Hybrid deployment, actual provider adapters, measured benchmarks, multi-node serving and upgrade economics are explicitly outside CORE.

## ILS integration

The canonical, content-addressed `@aserdargun/lab-core` and `lab-ui` archives in `vendor/` are independently installable. `lab.manifest.json` describes the seven authored scenarios; `src/ils/catalog.ts` adapts the existing ten-chapter guide. The shared shell exposes assumptions, evidence and semantic related learning without changing decision formulas. Query `scenario` and `lesson=deployment-101` accept authored routes only. lab-core 0.2.0 accepts validated semantic contexts with wire version 0.1; unsupported `ils` payloads are ignored. ADP inputs require an explicit action before creating an inference profile; training memory remains informational. Supported 7B/14B profiles can continue to TFL using the Deploy → Serve link. No exact cross-lab state transfer is claimed. A full reset clears incoming context and authored route parameters. See [handoff contract](docs/CROSS-LAB-HANDOFF.md). Evidence distinguishes estimated defaults, user inputs and calculated outputs. Current editable inputs remain the source of calculation truth.
