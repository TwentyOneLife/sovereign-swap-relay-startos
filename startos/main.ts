import { sdk } from './sdk'
import { port } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting sovereign-swap-relay')

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

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: container,
    exec: {
      // The relay reads RELAY_BIND and its limits from the environment; it runs on safe defaults.
      command: ['sh', '-c', `RELAY_BIND=0.0.0.0:${port} sovereign-swap-relay`],
    },
    ready: {
      display: 'Relay',
      fn: async () =>
        sdk.healthCheck.checkPortListening(effects, port, {
          successMessage: 'The relay is accepting connections',
          errorMessage: 'The relay is not listening',
        }),
    },
    requires: [],
  })
})
