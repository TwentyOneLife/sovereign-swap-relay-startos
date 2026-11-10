import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:4',
  releaseNotes: {
    en_US:
      'Hardens the relay against flooding (design 0007). Per-connection rate limits now cover ' +
      'subscriptions as well as publishes, with a cap on how many events one request can return and on ' +
      'how many subscriptions a connection may hold; a fresh connection starts with a small burst rather ' +
      'than a full minute of allowance. Idle connections that never subscribe are reclaimed, and a ' +
      'subscriber that stops reading is disconnected (so it reconnects) rather than pinning memory. The ' +
      'event store is now bounded by total bytes as well as event count, and is split so a flood of ' +
      'directed messages cannot evict open offers. Also fixes a case where one unresponsive subscriber ' +
      'could stall publishing for everyone. Ships sovereign-swap daemon v0.6.18. Restarting the relay ' +
      'clears its in-memory event store; connected clients re-announce.',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
