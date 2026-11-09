import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:2',
  releaseNotes: {
    en_US:
      'Adds a read-only "Relay status" action that shows the relay’s live aggregate stats (version, ' +
      'connections, events accepted/rejected by reason, uptime, retention) in the StartOS page, so you ' +
      'no longer need a Tor request to read them. Upgrades the health check from a port-listening probe ' +
      'to an application-level one: it fetches the relay’s NIP-11 document and requires a version, so a ' +
      'wedged relay that still holds the socket open now shows as failing. No protocol or config change. ' +
      'Restarting the relay clears its in-memory event store; connected clients re-announce on reconnect.',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
