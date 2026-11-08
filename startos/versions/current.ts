import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:1',
  releaseNotes: {
    en_US:
      'Updates the relay to sovereign-swap v0.6.1, a large jump from v0.1.2. Adds a NIP-11 relay ' +
      'information document and aggregate stats (connections, events accepted/rejected by reason, ' +
      'uptime - aggregate only, never pubkeys or IPs), served to a request that asks for ' +
      'application/nostr+json. Carries the accumulated connection hardening (ping/reconnect, ' +
      'hostile-input handling) since v0.1.2. Restarting the relay clears its in-memory event store; ' +
      'connected clients re-announce their own offers on reconnect.',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
