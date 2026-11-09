import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// The relay's DoS controls, persisted in the volume and passed to the daemon as its environment.
// Defaults match the binary's own (RelayConfig::default): one swap kind, 128 KiB events, 512
// connections, 240 events/min/connection, a 100k-event store, 7-day retention.
export const DEFAULTS = {
  maxEventBytes: 131072,
  maxConnections: 512,
  maxEventsPerMin: 240,
  storeCap: 100000,
  retentionSecs: 604800,
  // Price proxy (#106): off by default, so the relay stays minimal; the operator opts in.
  priceProxy: false,
}

export const shape = z
  .object({
    maxEventBytes: z.number().int().catch(DEFAULTS.maxEventBytes),
    maxConnections: z.number().int().catch(DEFAULTS.maxConnections),
    maxEventsPerMin: z.number().int().catch(DEFAULTS.maxEventsPerMin),
    storeCap: z.number().int().catch(DEFAULTS.storeCap),
    retentionSecs: z.number().int().catch(DEFAULTS.retentionSecs),
    priceProxy: z.boolean().catch(DEFAULTS.priceProxy),
  })
  .strip()

export const settingsJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/settings.json' },
  shape,
)
