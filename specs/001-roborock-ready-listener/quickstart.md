# Validation Guide

Use the package manager and runtime specified in package.json, then run:

```sh
pnpm install --frozen-lockfile
pnpm test --runTestsByPath src/lib/roborock/connection.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm docs:build
```

The connection suite verifies the actual installed dependency's ready-listener API, parameterless startup, 2FA and delayed recovery, lifecycle guards and retained publications. To validate broker behavior, start a disposable Mosquitto broker listening only on loopback, then run:

```sh
printf 'listener 1883 0.0.0.0\nallow_anonymous true\npersistence false\n' > /tmp/roborock-ready-mosquitto.conf
docker run -d --name roborock-ready-test-broker -p 127.0.0.1:18884:1883 -v /tmp/roborock-ready-mosquitto.conf:/mosquitto/config/mosquitto.conf:ro eclipse-mosquitto:2
```

```sh
MQTT_TEST_URL=mqtt://127.0.0.1:18884 pnpm test --runTestsByPath src/lib/roborock/connection-broker.spec.ts
```

The test uses random topic names, verifies late subscribers receive retained true and false, and clears its retained state afterward. Stop the disposable broker after testing with `docker rm -f roborock-ready-test-broker`. Without MQTT_TEST_URL this integration test is explicitly skipped. Verification-code tests use explicit legacy auth fixtures; real cloud 2FA requires the separate migration documented in troubleshooting. Keep production credentials and robot commands out of this verification.

The existing CI additionally builds a container and smoke-tests /health. That endpoint proves process liveness only. Production rollout is separate: after an approved deployment, compare the connection topic, middleware cache and dashboard indication without issuing robot commands.
