import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.1:0',
  releaseNotes: {
    en_US:
      'The relay now serves a small information page when opened in a browser, ' +
      'instead of a blank screen. A Nostr client connecting over WebSocket is ' +
      'unaffected. The page states that the relay holds no funds or keys and ' +
      'carries no new configuration. (sovereign-swap v0.1.1.)',
  },
  migrations: {
    // Nothing to migrate: the landing page adds no stored data, and the relay
    // limits in settings.json are unchanged.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
