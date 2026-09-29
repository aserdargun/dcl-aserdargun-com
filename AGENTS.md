# DCL working contract

- Build the bilingual deployment-choice laboratory for AI workloads: a browser-local decision surface shared by LCL and CLD in the learning system. It is the working CORE implementation, not a deployment tool and not a client for any cloud account.
- Keep decision truth in `src/core` and the option catalogue in `src/data`; `src/ils`, `src/lessons` and `src/visualization` present it. Every option carries the constraints that make it eligible or ineligible.
- The recommendation follows from the stated constraints and nothing else. When the inputs cannot decide between options, the lab must say so rather than ranking on a hidden preference, and no option may be recommended that the run declared ineligible.
- Keep Turkish and English controls, option text and explanations equivalent. Label the assumptions behind each option; do not present a modelled cost or latency as a quote from a real provider.
- Verify `npm run validate` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.
