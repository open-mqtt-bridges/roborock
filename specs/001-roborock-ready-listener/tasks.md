# Tasks: Correct Roborock Connection Indication

## Phase 1: Setup
- [x] T001 Initialize `.specify/` and `.agents/skills/` with Codex integration 1.3.2 and no Git extension; adopt the project constitution and persist approved specification/design in `specs/001-roborock-ready-listener/`. Validate feature resolution and artifact consistency; commit separately.

## Phase 2: User Stories 1 and 2
- [ ] T002 [US1/US2] Add regression-first `src/lib/roborock/connection.spec.ts` for normal and 2FA startup, internal retry readiness, lifecycle guards, retention and actual installed dependency contract. Update `src/lib/roborock/index.ts` and `homebridge-roborock-matter.d.ts`; document MQTT retention and the separate parser failure in `docs/mqtt.md` and `docs/troubleshooting.md`; add a patch changeset. Validate late subscription on an isolated broker, run all repository checks and existing Docker CI, then commit this working increment separately.

## Dependencies & Execution Order
T002 depends on T001. Tests precede the runtime fix inside T002. Both user stories share one small working implementation increment. Commit and checks are recorded in issue #41; completion boxes are updated only after task commits succeed.

## Implementation Strategy
Deliver the two approved increments in order. No parallel agent work, additional feature tasks, release or deployment is required. Failed checks are fixed within scope or recorded as concrete blockers.
