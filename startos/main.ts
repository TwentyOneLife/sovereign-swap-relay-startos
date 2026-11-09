import { settingsJson, DEFAULTS } from './fileModels/settings.json'
import { sdk } from './sdk'
import { port, relayInfo } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting sovereign-swap-relay')

  // Reactive: main re-fires and the daemon restarts with new limits whenever the config changes.
  const settings = (await settingsJson.read().const(effects)) ?? DEFAULTS

  const container = sdk.SubContainer.of(
    effects,
    { imageId: 'relay' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mnt/relay',
      readonly: false,
    }),
    'relay',
  )

  const env = [
    `RELAY_BIND=0.0.0.0:${port}`,
    `RELAY_MAX_EVENT_BYTES=${settings.maxEventBytes}`,
    `RELAY_MAX_CONNECTIONS=${settings.maxConnections}`,
    `RELAY_MAX_EVENTS_PER_MIN=${settings.maxEventsPerMin}`,
    `RELAY_STORE_CAP=${settings.storeCap}`,
    `RELAY_RETENTION_SECS=${settings.retentionSecs}`,
  ].join(' ')

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: container,
    exec: {
      // The relay reads RELAY_* from its environment; see RelayConfig in sovereign-swap.
      command: ['sh', '-c', `${env} sovereign-swap-relay`],
    },
    ready: {
      display: 'Relay',
      // Application-level, not just "is the port bound". A wedged relay can keep the socket open
      // while no longer serving, so we fetch its NIP-11 document and require a version field: that
      // proves the HTTP handler is answering and the process is the relay, not a half-dead one.
      fn: async () => {
        try {
          const info = await relayInfo()
          if (typeof info.version === 'string' && info.version.length > 0) {
            return {
              result: 'success',
              message: `The relay is serving (v${info.version})`,
            }
          }
          return {
            result: 'failure',
            message:
              'The relay answered but without a version; it may be starting or wedged',
          }
        } catch (e) {
          return {
            result: 'failure',
            message: `The relay is not responding: ${e instanceof Error ? e.message : String(e)}`,
          }
        }
      },
    },
    requires: [],
  })
})
