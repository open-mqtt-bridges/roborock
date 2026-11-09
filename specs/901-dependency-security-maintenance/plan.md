# Implementation plan

## Technical context

Base: `main` at `80c1622d6f6b51c757df3241fabb214505154b7d`. Checkout: `51-dependency-security-maintenance`. Package manager: `pnpm@11.28.9`. Follow `docs/development.md`, `.specify/memory/constitution.md`, organization `CONTRIBUTING.md` and effective lint/format/type configuration. User approved all eleven implementation issues after their links were shown.

## Design and constitution check

No public API/schema/data-model changes. Compatibility, ownership, credential protection, documentation and verification principles apply. Update coupled runtime/framework packages together, then independently review tooling/documentation and native groups. NestJS target: 12.4.0 (12.4.2 deferred under the user-approved 24-hour policy); website Nuxt: 4.6.4 and @nuxt/eslint: 1.17.0. Other stable targets come from authoritative registry/action metadata at execution time. Preserve aliases, patches and trust settings unless a verified compatible replacement is required. Do not force TypeScript 7 across incompatible peers.

## Delivery

T1 records baseline/targets; T2 verifies security settings and scanner configuration; T3 remediates audits; T4 applies compatible updates and validates each group; T5 runs integration checks, repeats audits and opens a consolidated PR. Tasks are tracked in `tasks.md` and the linked issue; implementation groups receive tested commits. Existing Dependabot PRs remain open and are linked as superseded where applicable. Release PRs remain untouched.

## Validation

Use documented local checks, clean immutable installs, relevant container/health checks and post-update audits. Rust requires format, Clippy, tests and release build plus RustSec. Website requires browser/mobile/keyboard verification. Existing failures and external limitations remain explicit. Details and actual results are recorded in `audit.md`.

## Container version metadata

Generate version.env from package.json while bundling. Copy only this metadata file beside the runtime bundle, and load it with the existing Node runtime using --env-file. Node preserves explicit environment overrides. Extend the existing CI container health smoke to compare the HTTP response version with package.json. Add and consume a patch changeset using the pinned CLI; ship the fix and generated patch version together after applicable checks. Verify the newly published immutable image digest and /health version with disabled synthetic instances.

## Roborock 3.40.3 release

Rebase the dependency outcome onto current main through a merge preserving original PR #44 ancestry and all later fixes. Update the manifest and exact override together, regenerate the owning lockfile with pinned pnpm, run lint/typecheck/tests/build/docs and a real loopback MQTT broker regression under Node 26. Generate a patch release with Changesets, validate the candidate container and current-head CI, then merge #44 and verify the published version/image. Retain the documented upstream engine-support gap and absence of live-device testing.
