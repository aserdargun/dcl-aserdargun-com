# DCL calculation and evidence contract

DCL answers **where**, LCL explains local capabilities, CLD explains cloud economics, TFL explores serving behavior, and GEX explores GPU execution. ARL agent workloads may supply the same conceptual workload inputs. Links are learning relationships; no shared telemetry or automatic parameter handoff exists.

## Data and evidence

All six shipped candidates are **synthetic educational configurations**, not real products. Every purchase price, hourly rate, token price, power level, memory capacity/reserve, context/concurrency ceiling, redundancy assumption and soft rating is a teaching assumption. No live or verified vendor price is claimed. `source`, `status`, `verifiedAt` and `assumptions` are carried in each profile. User price overrides are distinct from base data and do not upgrade evidence quality.

`CandidateDataProvider` is the future ingestion boundary: getCandidates / getPricing / getFreshness. A normalized `DeploymentCandidateManifest` could be published by LCL and CLD with version, stable ID, source ownership, original units/currency, validity dates, measurement environment and claim-level evidence. A future adapter must reject missing units, mismatched model IDs, expired prices and unsafe source ownership. No scraping or remote ingestion in CORE.

Verified data age: 0–30 days CURRENT; >30–90 AGING; >90 STALE. Invalid, absent, future timestamps, educational assumptions and manual overrides are UNKNOWN. Time is injected for deterministic tests. Freshness is separate from accuracy. Current data do not imply measured performance.

## Memory

- Weight GiB = parameter count in billions × 10^9 × effective weight bits / 8 / 2^30. Binary GiB, decimal billion parameters.
- Optional weight override replaces raw weight estimate, including a legitimate zero. Additional overhead remains separately configured.
- KV GiB = 2 (K and V) × layers × KV heads × head dimension × bytes per cache element × resident context × simultaneous sequences / 2^30.
- Typical estimate uses typical context and concurrency; eligibility uses **maximum context and peak concurrency**.
- Runtime = base workspace + per-sequence workspace × peak concurrency.
- Required = (weights + metadata + KV + runtime) × (1 + safety reserve).
- Default dense GQA architecture: 70B profile has 80 layers, 8 KV heads, head dimension 128, 2-byte KV elements. The 8/32/405B presets use 32/64/126 illustrative layers. These are educational architecture profiles, not inferred product specifications.
- Defaults: 8% metadata, 4 GiB base workspace, 0.025 GiB workspace per sequence, 20% safety reserve. At 70B/Q4, 16K and 20 peak sequences: raw weights ≈32.596 GiB, KV=100 GiB, total ≈167.645 GiB.
- Usable capacity = physical pool − explicit system reserve. Apple 192−24=168 GiB. Discrete CPU RAM does not get silently added to VRAM.
- Requirement > usable capacity: OFFLOAD if a separate configured pool could accommodate the deficit, otherwise DOES_NOT_FIT. Both fail the default must-fit constraint. Disabling must-fit can only admit OFFLOAD when the configured separate pool covers the deficit; DOES_NOT_FIT remains ineligible. This is not validation of offload support or speed.
- ≤85% of usable capacity is COMFORTABLE; >85% through 100% is LIMITED. Required memory already includes the explicit safety factor.
- Token API uses a deliberate fifth state, PROVIDER_MANAGED. A fictitious physical memory number or FITS label would be misleading. Service model/context/concurrency assumptions are checked separately and eligibility is conditional. Exact-model requirement excludes this API alternative.
- Full-attention dense illustration only. No sliding windows, prefix sharing, cache eviction, runtime-specific alignment, sharding duplication or speed estimates. Weight quantization does not set KV precision.

References for concepts only: [Hugging Face cache strategies](https://huggingface.co/docs/transformers/kv_cache), [MLX unified-memory framework](https://github.com/ml-explore/mlx), [vLLM installation requirements](https://docs.vllm.ai/en/latest/getting_started/installation/). These do not substantiate DCL's synthetic prices, hardware profiles or runtime compatibility.

## Demand and economics

Requests per day means **at 100% utilization**. Effective monthly requests = requests/day × active days/month × utilization. Monthly input/output = requests × the respective per-request token count. Typical context may include conversation history distinct from billed new input; the model does not assume every resident KV token is a newly billed input token. Input + output beyond maximum context makes all candidates ineligible until corrected.

Monthly active window = hours/day × days/month. Load hours = window × utilization. Concurrency remains a separately specified resident demand assumption; no unmeasured throughput is used to claim token demand can actually be served.

Local load power = 90% normal + 10% peak; all figures are whole-system assumptions. Electricity = (load power × load hours + idle watts × idle hours) / 1000 × USD/kWh. Idle hours = enabled window minus load; enabling always-on changes that window to 730 h. A 24/7 or HA availability requirement also enforces this 730 h powered-on window, independently of demand hours. Off-hours are otherwise powered off. Capex persists regardless of usage.

Cloud/managed business-hours and continuous schedules bill the full configured active window, even if utilization is zero. Bursty/batch profiles assume scheduled shutdown outside load hours. Always-warm, 24/7 availability and HA availability override this with 730 h. Availability is separate from demand: a service can stay on while requests arrive only during business hours. This is an idealized policy, not a provider feature guarantee. Managed endpoint base hourly price × (1 + explicit 30% premium); VM has zero premium. Storage and egress are configured fixed monthly amounts and default to zero. Token APIs have no idle token fee in this profile.

Local TCO = purchase + months × (electricity + optional maintenance). Cloud = months × (hourly provision + storage + egress). API = months × ((input tokens × input rate + output tokens × output rate)/1,000,000). USD base. EUR/TRY only use a visibly manual USD conversion; initial 1:1 is a placeholder, not an FX quote. Price inputs remain USD.

TCO is cash outlay, not accounting depreciation or equivalent capability. Excludes tax, financing, labor, upgrades, residual value, startup latency and provider minimum bills. Excluding resale is neither a zero-resale assertion nor a guaranteed resale assumption. A zero maintenance reserve is a visible omission, not free operations.

Break-even solves a.capex + a.monthly × t = b.capex + b.monthly × t. Return only a positive, unique crossing within selected horizon. Parallel/coincident lines, negative crossings and crossings outside horizon return no break-even. Costs for ineligible candidates remain inspectable, with a warning that a crossing cannot override constraints.

## Decisions and scale

Hard checks: valid context/peak relationship, must-fit, local-only privacy, capex, provisioned hourly ceiling including managed premium, minimum usable memory, required runtime, exact model availability, context/concurrency contract, redundant architecture for HA. A required runtime passes only SUPPORTED; UNKNOWN and PARTIAL fail closed. No exact runtime is asserted supported by current synthetic profiles. A provisioned hourly ceiling cannot be proven for a token service, so it fails that constraint.

Eligible candidates are ranked by four visible factors: relative horizon cost, data control, operating simplicity, scaling flexibility. Cost is linear min-max over eligible candidates; ties get 100. The other ratings are synthetic profile values, visible in Decide. User weights normalize by their positive sum. All-zero weights yield no unique recommendation even when only one candidate remains eligible. Ties are explicitly disclosed, never hidden as a unique winner. Scores express preference, **not probability/confidence**. All current evidence is LOW. Unknown performance is kept out of the score; it does not automatically exclude a candidate.

Privacy choices low/medium/high seed the visible control weight to 10/20/30; local-only seeds 30 and adds hard exclusions. The user can further adjust weights. Growth selects a clearly labeled capacity stress pattern (static 1/1/1, moderate 1/1.5/2, rapid 1/2.5/5). This is not a forecast. It holds hardware allocation fixed, recalculates memory, concurrency, context and API model-class pressure, and does not silently add replicas or include growing demand in the constant-demand TCO. Multi-year upgrade economics and hybrid routing are deferred.
