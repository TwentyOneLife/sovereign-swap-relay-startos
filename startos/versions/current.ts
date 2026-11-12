import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:5',
  releaseNotes: {
    en_US:
      'Daemon v0.6.20. CPU-DoS hardening on the accept path (hacklab red-team): a replayed event is now ' +
      'rejected as a duplicate before any signature verify, and a broadcast is decoded without re-running ' +
      'its post-quantum (ML-DSA) verify, since the outer event signature already authenticates the author ' +
      'the relay keys on. Together these take the expensive verify off the path a flood of signed events ' +
      'would hit, with no change to what the relay stores or serves; clients still verify end to end. ' +
      'Restarting the relay clears its in-memory event store; connected clients re-announce.',
  },
  migrations: { up: async ({ effects }) => {}, down: IMPOSSIBLE },
})
