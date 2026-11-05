import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'sovereign-swap-relay',
  title: 'Sovereign Swap Relay',
  license: 'AGPL-3.0-or-later',
  packageRepo: 'https://github.com/TwentyOneLife/sovereign-swap-relay-startos',
  upstreamRepo: 'https://github.com/TwentyOneLife/sovereign-swap',
  marketingUrl: 'https://twentyone.life',
  donationUrl: 'https://twentyone.life',
  description: { short, long },
  volumes: ['main'],
  images: {
    relay: {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // No chain dependency: the relay forwards opaque bytes and never reads a chain.
  dependencies: {},
})
