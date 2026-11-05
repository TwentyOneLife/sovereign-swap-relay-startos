import { sdk } from './sdk'

// The event store is ephemeral by design (events carry a time-to-live), so there is nothing durable
// to protect; back up the volume's non-store contents only.
export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) =>
    sdk.Backups.ofVolumes('main').setOptions({ exclude: ['/events'] }),
)
