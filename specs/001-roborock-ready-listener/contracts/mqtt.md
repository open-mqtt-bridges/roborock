# Connection Publication Contract

- Topic: `<topic>/bridge/connected` (unchanged).
- Bridge API values: Boolean false or true; MQTT wire payload: string `false` or `true` (unchanged).
- Retention: true for both values. A late subscriber receives the last publication.
- False: setup and graceful shutdown. True: readiness notification from the active initialized client before destruction.
- No promise of continuous cloud/device health or abrupt-termination detection is added.
- Commands and authentication command behavior remain unchanged; commands remain non-retained.
- Dependency boundary: register `setReadyListener(listener: () => unknown)` before `startService(): Promise<void>`; use the same listener for subsequent startup and internal retry success.
