# sovereign-swap-relay-startos , packaging plan

A StartOS `.s9pk` for `sovereign-swap-relay`, the hardened Nostr relay that carries swap messages
(TwentyOneLife/sovereign-swap). Built on the StartOS 0.4 `@start9labs/start-sdk`, templated from
`shulcrum-startos`.

## What the package is

A single long-running daemon with no user keys and no funds: it stores and forwards opaque,
end-to-end-encrypted swap events and enforces its DoS controls. This makes it the simplest kind of
StartOS service: one image, one volume (the event store), one WebSocket interface, a settings form
for the limits, a port-listening health check. No chain dependency, unlike the node/Shulcrum
packages.

## Phases

- [x] **P0 Dockerfile.** Builds the relay from `sovereign-swap`, two-stage, base images pinned by
      digest; verified the image builds. Now pins the release tag `v0.1.0` (cut that release first).
- [x] **P1 manifest.** id `sovereign-swap-relay`, AGPL, one volume `main`, the image, no
      dependencies. Typechecks against start-sdk 2.0.9.
- [x] **P2 main + interface.** The daemon runs with `RELAY_BIND` set; a port-listening health
      check; one `api` interface on the WS port, bound on the LAN host and a Tor onion, plain `ws`
      (content is end-to-end encrypted, Tor encrypts the hop). Typechecks and ncc-bundles.
- [ ] **P3 config.** A settings form for the controls (max event bytes, max connections, events per
      minute, store cap, retention), written out as the daemon's environment. Deferred: the relay
      runs on safe defaults meanwhile; the form is the start-sdk's most intricate surface and is the
      next step, written against the SDK rather than guessed.
- [x] **P4 backups.** The event store is ephemeral (events carry a TTL), so the store subdir is
      excluded; the volume's other contents are backed up. Typechecks.
- [ ] **P5 CI + release.** CI builds the `.s9pk` on PR (as `shulcrum-startos` does); a tagged release
      builds, signs (`SHA256SUMS` + GPG), and verifies against the published key in an empty keyring.
- [ ] **P6 sideload test.** Sideload onto the btc-blake StartOS sandbox (VM 103), install, open the
      WS interface over Tor, run a swap through it, and run the homelab module-13 attacks against it.

## Prerequisites and honesty notes

- The TypeScript (P1 to P4) is written and typechecked against `@start9labs/start-sdk` with the
  toolchain (`npm ci && npm run check`); it is not committed until it typechecks, to keep the repo
  slop-free.
- The Dockerfile pins `sovereign-swap` by commit today. Before a real release, `sovereign-swap`
  should cut a signed tag and the pin should move to it, so the package references a release, not a
  commit.
- Building the `.s9pk` and sideloading it need the start-sdk toolchain and a StartOS sandbox; that is
  the lab step (P6), not CI.
