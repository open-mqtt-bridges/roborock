<!-- Sync impact: Initial constitution 1.0.0. Existing core templates remain compatible; no extensions or hooks installed. -->
# Roborock MQTT Bridge Constitution

## Core Principles

### I. Preserve the MQTT contract
Preserve documented topic names and payload shapes unless a separately approved breaking change requires otherwise. Commands remain non-retained. Explicitly document changes to state retention.

### II. Verify dependency boundaries
Keep handwritten dependency declarations aligned with the installed runtime. Reproduce reported regressions through the bridge code and add meaningful tests at that boundary before fixing behavior.

### III. Keep changes scoped
Use the existing bridge architecture, package manager, ESLint/Prettier configuration and Jest suite. Avoid unrelated dependency upgrades, frontend changes and broad cleanup.

### IV. Protect credentials and lifecycle ownership
Keep passwords, tokens and sessions out of versioned artifacts and logs. Preserve existing session storage. Ignore callbacks from replaced clients or after destruction; clean up owned timers and subscriptions.

### V. Validate before delivery
Run the relevant regression tests and the repository lint, typecheck, test, build and documentation checks. Report failures and external blockers accurately. Use patch changesets for compatible runtime bug fixes.

## Development Constraints
Runtime and package-manager versions are defined by package.json and the lockfile. Existing source configuration is authoritative for formatting, imports and types. Public declarations and changed behavior require accurate documentation.

## Delivery Workflow
Use one issue, task branch and PR per fix. Keep specification and implementation tasks separately reviewable with per-task commits. Preserve unrelated worktrees and changes. Release, merge and production deployment require their own authorization; Spec Kit does not perform them automatically.

## Governance
Review changes against these principles. Amend this constitution explicitly, versioning incompatible principle changes as major, additional principles as minor and clarifications as patch. Templates and generated skills are read at execution time; preserve bundled templates rather than copying feature policy into them.

**Version**: 1.0.0 | **Ratified**: 2026-11-09 | **Last Amended**: 2026-11-09
