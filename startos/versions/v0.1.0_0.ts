import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// 0.1.0:0, the first packaging. Frozen here so its release note stays with it
// and an install at this version has a node to upgrade from.
export const v_0_1_0_0 = VersionInfo.of({
  version: '0.1.0:0',
  releaseNotes: {
    en_US: 'First packaging of the sovereign-swap relay for StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
