import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:0',
  releaseNotes: {
    en_US:
      'Fixes the landing page being cut off when opened over Tor: the relay now closes the ' +
      'connection cleanly so the whole page arrives. WebSocket clients are unaffected. ' +
      '(sovereign-swap v0.1.2.)',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
