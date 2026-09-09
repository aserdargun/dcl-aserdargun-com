# DCL production deployment

- Public repository: https://github.com/aserdargun/dcl-aserdargun-com
- Production: https://happy-rock-053a30403.6.azurestaticapps.net/
- Branch: `main`
- Azure subscription: `aserdargun subscription 3`
- Region / tier: West Europe / Free
- Resource group: `rg-dcl-aserdargun-com`
- Static Web App: `swa-dcl-aserdargun-com`
- Authoritative workflow: `.github/workflows/deploy-swa-dcl-aserdargun-com.yml`
- Actions secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_DCL_ASERDARGUN_COM`

Production validates locked dependencies, TypeScript, domain tests, Vite build and artifact hashes before uploading prebuilt `dist`. Official actions are pinned to verified immutable commits. Production jobs serialize and never cancel an in-flight upload. The separate CI workflow runs for pull requests or explicit dispatch; it does not deploy.

`/release.json` exposes the intended Git commit, build timestamp and SHA-256 hashes for the HTML, JavaScript, CSS, favicon and Azure configuration. Verify that its commit equals the successful deployment run's SHA and the remote `main` commit. The generated host, Azure Ready state and source branch, representative assets, security headers, and desktop/mobile interactions must all agree before declaring a release complete.

The resource was provisioned without Azure source integration to avoid a competing generated workflow. No custom domain or DNS change is included in this release. `dcl.aserdargun.com` remains the intended future custom domain.

Historical local CORE QA lives in `qa.md`; it records the pre-publication stage and should not be mistaken for current deployment status. All application prices/capacities remain educational assumptions after publication.
