import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:3',
  releaseNotes: {
    en_US:
      'Adds an optional "Price proxy" (off by default): the relay fetches the BTCB2/BTC reference price ' +
      'from nonkyc over the clear internet and serves it to connected clients in its info document, so ' +
      'they read it over Tor instead of each fetching the exchange directly (nonkyc blocks many Tor ' +
      'exits). When on, only this relay’s own IP reaches nonkyc, never a client’s, and no client IP or ' +
      'request is logged; the value is advisory and withheld once stale. Ships sovereign-swap daemon ' +
      'v0.6.3. Restarting the relay clears its in-memory event store; connected clients re-announce.',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
