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

The connection suite verifies the actual installed dependency's ready-listener API, parameterless startup, 2FA and delayed recovery, lifecycle guards and retained publications. To validate broker behavior, run the isolated Mosquitto integration test described in the implementation evidence using Docker; it must receive retained true and false with a late second subscriber. Keep production credentials and robot commands out of this verification.

The existing CI additionally builds a container and smoke-tests /health. That endpoint proves process liveness only. Production rollout is separate: after an approved deployment, compare the connection topic, middleware cache and dashboard indication without issuing robot commands.
