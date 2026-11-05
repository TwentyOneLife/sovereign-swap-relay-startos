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

- [x] **P0 Dockerfile.** Build the relay binary from a pinned `sovereign-swap` commit, two-stage,
      base images pinned by digest. Verified: the image builds and produces the binary. (The binary
      itself is exercised and proven to listen by `sovereign-swap`'s `tests/relay_server.rs`; the
      in-container runtime is confirmed at the sideload step P6.)
- [ ] **P1 manifest.** id `sovereign-swap-relay`, GPL/AGPL per the source, one volume `main`, the
      image, no dependencies. (start-sdk `setupManifest`.)
- [ ] **P2 main + interface.** Run the daemon with the config as env (`RELAY_BIND` and the limits);
      a port-listening health check; one `api` interface on the WS port, bound on the LAN host and a
      Tor onion (Tor-first). No TLS: content is end-to-end encrypted and Tor encrypts the hop.
- [ ] **P3 config.** A settings form for the controls (max event bytes, max connections, events per
      minute, store cap, retention), written out as the daemon's environment; safe defaults.
- [ ] **P4 backups.** Back up the event store volume (optional: the store is ephemeral by design,
      so this may be a no-op).
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
