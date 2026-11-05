# sovereign-swap-relay-startos (packaging groundwork)

A StartOS `.s9pk` for [`sovereign-swap-relay`](https://github.com/TwentyOneLife/sovereign-swap), the
hardened Nostr relay that carries swap messages. **In progress**: see [`PLAN.md`](PLAN.md). P0 (the
reproducible build Dockerfile) is done; the `@start9labs/start-sdk` TypeScript (manifest, daemon,
interface, settings) and the `.s9pk` build and sideload are the next phases.

Templated from `shulcrum-startos` (StartOS 0.4, start-sdk 2.0.9).
