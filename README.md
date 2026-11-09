# Roborock MQTT Bridge

[![CI](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/roborock/ci.yml?style=for-the-badge&label=CI)](https://github.com/open-mqtt-bridges/roborock/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/roborock/docs.yml?style=for-the-badge&label=Docs)](https://github.com/open-mqtt-bridges/roborock/actions/workflows/docs.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/open-mqtt-bridges/roborock/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/open-mqtt-bridges/roborock/actions/workflows/deploy.yml)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-tobiaswaelde-FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/tobiaswaelde)

NestJS bridge between Roborock vacuum accounts and MQTT. Full documentation: [open-mqtt-bridges.github.io/roborock](https://open-mqtt-bridges.github.io/roborock/).

## Quick start

```bash
cp config/config.example.yml config/config.yml
# edit config/config.yml
docker compose up -d
```

Minimal configuration:

```yaml
mqtt:
  host: mqtt.example.net
  clientId: roborock-mqtt-bridge
  username: mqtt-user
  password: change-me
instances:
  - id: home
    topic: home/roborock/home
    email: robot-account@example.com
    password: change-me
    region: auto
    updateInterval: 30000
```

`mqtt.clientId` may be empty; the bridge then generates a UUID for the running process.

Rendered map images are written atomically to `MAP_STORAGE_PATH/<device-id>/<map-id>.png` (default: `maps`), replacing a prior image for the same map. Docker Compose mounts `./maps` at `/app/maps` so other host applications can read them.

Example command:

```bash
mosquitto_pub -h mqtt.example.net -t 'home/roborock/home/devices/ROBOROCK-DUID/command/suction_power' -m turbo
```

## Documentation

- [Documentation home](https://open-mqtt-bridges.github.io/roborock/)
- [Configuration](https://open-mqtt-bridges.github.io/roborock/configuration)
- [Authentication](https://open-mqtt-bridges.github.io/roborock/authentication)
- [MQTT contract](https://open-mqtt-bridges.github.io/roborock/mqtt)
- [Enum values](https://open-mqtt-bridges.github.io/roborock/enum-values)
- [Docker deployment](https://open-mqtt-bridges.github.io/roborock/deployment)
- [WLED MQTT Bridge for local lighting](https://open-mqtt-bridges.github.io/wled/)

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. Node-based application runtimes require Node.js 26. Builds use TypeScript 7; ESLint and compiler-API consumers use the TypeScript 6 compatibility package. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

## Contributing

See the [development guide](docs/development.md) for the pinned toolchain, checks and Spec Kit usage, and the [organization contribution guide](https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md) for pull requests.
