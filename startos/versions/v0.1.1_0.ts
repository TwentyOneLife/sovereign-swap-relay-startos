import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// 0.1.1:0, frozen: the landing page + the Tor handshake fix. No stored-data change.
export const v_0_1_1_0 = VersionInfo.of({
  version: '0.1.1:0',
  releaseNotes: {
    en_US:
      'The relay serves a small information page to a browser (over Tor), and no longer drops a ' +
      'WebSocket handshake that arrives over Tor latency. (sovereign-swap v0.1.1.)',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
