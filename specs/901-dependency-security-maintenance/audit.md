# Maintenance evidence

Issue: https://github.com/open-mqtt-bridges/roborock/issues/51
Base: `80c1622d6f6b51c757df3241fabb214505154b7d` on `main`. Runtime used for local Node checks: Node 26.13.0; Cargo checks: Rust/Cargo 1.99.

## Baseline and selected targets

Original declared versions, aliases, engines and overrides are preserved in `baseline.json`. Registry metadata and release notes supplied target versions and peer/engine constraints.

| Dependency                                  | Before    | After                                |
| ------------------------------------------- | --------- | ------------------------------------ |
| `@nestjs/common` (package.json)             | `^12.3.2` | `^12.4.0`                            |
| `@nestjs/core` (package.json)               | `^12.3.2` | `^12.4.0`                            |
| `@nestjs/platform-express` (package.json)   | `^12.3.2` | `^12.4.0`                            |
| `homebridge-roborock-matter` (package.json) | `^3.40.2` | `^3.40.3`                            |
| `@nestjs/testing` (package.json)            | `^12.3.2` | `^12.4.0`                            |
| Typecheck compiler                          | `tsc`     | `tsc6` (existing TypeScript 6 alias) |

## Compatibility decisions

- NestJS common/core/platform-express/testing move together to 12.4.0. The existing TypeScript 6 compiler alias and supported parser/Jest peers are preserved. Vulnerable minimatch/glob tooling is resolved through scoped workspace overrides; lint/tests/build verify its API compatibility.

- `homebridge-roborock-matter` remains at 3.40.2 in both the manifest range and an exact override: 3.40.3 does not advertise Node 26 engine support. This pre-existing upstream engine mismatch remains explicit; no engine check was forced or Node runtime lowered. Disabled-instance smoke tests do not prove live Roborock device compatibility.

## Release-age policy and deferred updates

The user explicitly selected versions published at least 24 hours before update selection, following a fresh-container pnpm policy rejection. NestJS 12.4.2, dotenv 18.0.10, eventsource 5.1.5, eslint-plugin-import-x 4.18.1 and ws 8.22.2 are deferred where applicable. Further fresh Rollup/Vite/follow-redirects and Cargo fixedbitset/itoa/syn/uuid versions were checked and reverted to aged stable resolutions. No new minimumReleaseAgeExclude entries, peer/engine bypass, registry changes or build-script trust expansions are retained. Existing TypeScript aliases are preserved where tooling excludes TypeScript 7.

## Security coverage

GitHub API readback confirms Dependabot alerts, secret scanning and secret-scanning push protection enabled. Public repository dependency graphs support the enabled alerts. Available Dependabot security updates were enabled for dependency-bearing repositories. Secret-scanning open-alert lists were empty after activation. CodeQL configuration is added or retained for the repository's supported source language; successful PR/default-branch analysis must be verified separately. Dependabot entries match actual manifests, with coupled NestJS updates grouped and pnpm workspaces tracked at their lockfile root. Action major references were checked against official releases; release/deployment trigger behavior is preserved.

## Lockfile audits

- `corepack pnpm audit --json`: exit 1; {"info": 0, "low": 1, "moderate": 0, "high": 0, "critical": 0}.

### Residual findings

`deepmerge@4.3.1`: low severity [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), no patched release advertised. The audited paths are through Jest → jest-config, used for repository-controlled test configuration. This is development tooling, not the bridge MQTT payload handler. The advisory remains open; trusted test configuration is still required.

## Validation

- `corepack pnpm lint`: passed.
- `corepack pnpm typecheck`: passed.
- `corepack pnpm test`: passed.
- `corepack pnpm build`: passed.
- `corepack pnpm docs:build`: passed.
- Clean isolated immutable install (empty pnpm store where applicable), lockfile unchanged: passed.
- Container build with base-image pull: passed.
- Synthetic container smoke: HTTP health endpoint with synthetic local configuration and disabled device instances: passed.

## Delivery

PR: https://github.com/open-mqtt-bridges/roborock/pull/52; closes #51. Existing matching Dependabot PRs remain open and are linked as superseded. Required CI must pass on the PR current head before any separately authorized merge. No release, deployment or release-PR merge was performed.

## Hosted CI evidence

All reported checks on implementation head `1729d3dd2f928be6df82e89ad8ee0095d6edf81a` completed without failures at 2026-11-09T13:23:15.934296+00:00. Deployment jobs were intentionally skipped on the PR. CodeQL PR analysis completed for the supported source language. This final documentation-only task update follows that successful implementation verification; the current PR checks remain authoritative before merge.
