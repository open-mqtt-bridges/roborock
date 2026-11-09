# Research: Ready-listener API regression

## Dependency boundary
- Decision: Register setReadyListener() and use parameterless startService().
- Rationale: Production revision d961402 locks homebridge-roborock-matter 3.40.2. Its startService() no longer invokes an argument; notifyReady() invokes the registered listener after successful initialization and internal retries. The bridge's handwritten declaration incorrectly retains the older callback signature.
- Evidence: [dependency source](https://github.com/mathiashornbek/homebridge-roborock-matter/blob/v3.40.2/roborockLib/roborockAPI.js). Read-only production probe found cached connected=false and available device state. A controlled real-bridge reproduction fails with the 3.40.2 notification contract.
- Alternatives rejected: dependency downgrade hides the API mismatch; only checking readiness after await misses later internal recovery; reacting to arbitrary device data can produce false readiness.

## MQTT retention
- Decision: Retain only the existing connection-state publication added by this fix.
- Rationale: Startup-only non-retained state is absent for late subscribers. The existing publish API already supports per-publication retention.
- Alternative rejected: retaining all bridge messages would incorrectly persist commands.

## Independent known failure
The production map path reports `u.parsedata is not a function`. This is a separate parser API mismatch, excluded from issue #41. Container health currently measures process liveness and does not diagnose either failure.

## Tooling
Spec Kit 1.3.2 is installed locally; this repository initially had no integration. Use bundled templates and Codex skills. No extensions, hooks or Git automation are configured. All material decisions are resolved by the approved plan.
