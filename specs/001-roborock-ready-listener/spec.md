# Feature Specification: Correct Roborock Connection Indication

**Feature Branch**: `codex/41-roborock-ready-listener`
**Created**: 2026-11-09
**Status**: Approved for implementation
**Input**: Implement the approved connection-indication fix, including Spec Kit setup. [Issue #41](https://github.com/tobiaswaelde/roborock-mqtt-bridge/issues/41).

## User Scenarios & Testing

### User Story 1 - See accurate readiness (Priority: P1)
As a dashboard user, I need the connection indicator to reflect successful bridge initialization, including authentication with a verification code and recovery after startup failure.

**Why this priority**: A permanently disconnected indicator incorrectly disables device actions even when the robot is communicating.
**Independent Test**: Initialize the bridge using a controlled client that announces readiness; verify the same connection indicator becomes true.

**Acceptance Scenarios**:
1. **Given** a newly started bridge, **When** initialization succeeds, **Then** it publishes connected status.
2. **Given** a working verification-code authentication adapter, **When** verification and startup succeed, **Then** it publishes connected status.
3. **Given** initial startup is incomplete, **When** an internal retry later succeeds, **Then** connected status updates without restarting the bridge.
4. **Given** the active client is not initialized, replaced or destroyed, **When** a readiness notification arrives, **Then** it cannot publish a new connected status.

### User Story 2 - Receive status when subscribing later (Priority: P2)
As a consumer that subscribes after startup, I need the most recently published connection state without waiting for another startup.

**Why this priority**: Consumers restart independently of the bridge.
**Independent Test**: Publish connection state and then subscribe using a second client; verify the subscriber receives that state.

**Acceptance Scenarios**:
1. **Given** successful initialization, **When** a new subscriber connects, **Then** it receives true.
2. **Given** graceful shutdown, **When** a new subscriber connects, **Then** it receives false.

### Edge Cases
- Repeated readiness announcements remain safe and can refresh existing metadata.
- Shutdown during startup cannot be followed by a stale connected publication.
- Missing initialization is never treated as successful readiness.
- Unclean process termination and continuous transport health detection retain existing behavior; this fix adds no heartbeat or crash-detection promise.

## Requirements

### Functional Requirements
- **FR-001**: Publish false at startup and graceful shutdown, and true only for the active initialized client while the bridge remains alive.
- **FR-002**: Observe readiness on initial startup, verification-code startup and subsequent internal recovery without relying on a removed startup callback.
- **FR-003**: Preserve the existing connection topic and Boolean payload while retaining its latest publication for late subscribers.
- **FR-004**: Preserve command behavior and non-retained command publications.
- **FR-005**: Check the installed dependency contract independently of handwritten types and protect these scenarios with regression tests.

## Success Criteria

### Measurable Outcomes
- **SC-001**: All initial, verification-code and deferred-recovery readiness scenarios publish true before their test completes.
- **SC-002**: Every uninitialized, replaced-client and destroyed-client scenario produces zero new true publications.
- **SC-003**: A late subscriber receives the latest true or false state within five seconds on the isolated local broker.

## Assumptions
The current dependency version remains unchanged. The existing health endpoint checks process liveness, not robot connectivity. The independent map-parser failure is documented separately. No frontend work, dependency upgrade, release or deployment is included.

Implementation clarification approved by the user: dependency 3.40.2 removed the existing verification-code methods too. Their migration remains separate; verification-code scenarios prove bridge listener reuse with controlled auth fixtures only.
