# Troubleshooting

- Verify the container health endpoint: `curl http://localhost:${PORT:-3000}/health`.
- Subscribe to the configured topic tree: `mosquitto_sub -t '<topic>/#' -v`.
- Confirm broker credentials and network reachability from inside the container.
- Region discovery tries every configured Roborock cloud host and automatically retries after temporary DNS or network failures.
- Commands are intentionally non-retained and are cleared after handling. Re-publish a valid payload if needed.
- Never paste tokens, cloud sessions, or passwords into issues or logs.

## Connection indicator

`<topic>/bridge/connected` contains the retained last initialization state. A healthy `/health` response means
the process is running; it does not prove Roborock authentication or device connectivity.

The bridge registers `setReadyListener()` before parameterless `startService()`. A callback passed to
`startService()` is ignored by `homebridge-roborock-matter` 3.40.2 and can leave the connection indicator false
even while device data arrives. A successful internal retry also notifies the registered listener.

## Separate known dependency mismatches

- The map error `u.parsedata is not a function` indicates a separate map-parser API mismatch. The connection
  indicator fix does not change map parsing.
- Dependency 3.40.2 also removed the legacy `sendTwoFactorEmail()` and `verifyTwoFactorCode()` methods used by
  this bridge's verification-code flow. Fresh authentication requiring these methods needs a separate auth-API
  migration. Connection regression tests with verification-code fixtures cover listener reuse only; they do
  not validate real cloud verification. Existing valid saved sessions can initialize without those methods.
