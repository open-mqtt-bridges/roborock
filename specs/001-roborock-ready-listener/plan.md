# Implementation Plan: Correct Roborock Connection Indication

**Branch**: `codex/41-roborock-ready-listener` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

## Summary
Register the dependency's readiness listener before starting its client. Use parameterless startup in both normal and 2FA paths. Guard readiness using client identity, destruction and isInited(). Publish the existing connection state retained. Keep Spec Kit setup and the runtime fix in separate task commits.

## Technical Context
- TypeScript 6, Node 26, pnpm 11; exact versions remain owned by package.json and pnpm-lock.yaml.
- NestJS bridge, homebridge-roborock-matter 3.40.2, MQTT.js; Jest and isolated Mosquitto broker verification.
- Existing on-disk authentication sessions remain unchanged; no new data storage or schema.
- Existing single-service architecture; no polling, adapter framework or dependency version changes are needed.

## Constitution Check
Pass: preserves topic/payload compatibility; explicitly documents retained status; keeps commands non-retained; verifies actual dependency API; scopes tests and documentation to connection indication; protects lifecycle and credentials. Rechecked after design: no violations.

## Project Structure
### Documentation (this feature)
This directory contains spec.md, plan.md, tasks.md, research.md, data-model.md, quickstart.md, contracts/mqtt.md and checklists/requirements.md.
### Source Code (repository root)
Update src/lib/roborock/index.ts, its handwritten homebridge-roborock-matter.d.ts and the neighboring regression tests. Update docs/mqtt.md and docs/troubleshooting.md; add a patch changeset. Use existing MQTT publishing infrastructure.

## Implementation and Verification
T001 initializes Spec Kit using its installed 1.3.2 Codex skill integration without a Git extension, then persists this approved design and validates feature resolution.

T002 first adds failing tests through the real bridge class using the current dependency contract. Register setReadyListener before starting, call startService() without arguments in both paths, add isInited() to handleConnected guards, and publish connection state with retain:true. Cover delayed recovery, 2FA, repeated readiness and stale/destroyed/uninitialized clients. Test actual installed prototype methods rather than trusting declarations. Verify late true/false reception using an isolated broker. Update documentation and add patch release metadata. Run pnpm lint, typecheck, test, build and docs:build, then inspect existing CI including its Docker build and process-health smoke test.

No changes to health/readiness semantics beyond these notifications; no new Last Will, heartbeat, runtime outage detector, or map parsing fix.

## Approved Implementation Clarification
The installed dependency also removed the legacy 2FA methods. The user explicitly kept that migration outside this fix. Verification-code tests use explicit fixtures to prove listener reuse in existing bridge flow; they do not establish real cloud 2FA compatibility. This limitation is documented in troubleshooting and research.
