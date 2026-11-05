import { sdk } from './sdk'
import { hostId, port } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multihost = sdk.MultiHost.of(effects, hostId)
  // Plain ws:// : the content is end-to-end encrypted by the swap envelope, and Tor encrypts the
  // hop, so no TLS is added. The LAN binding is what reaches the relay off the box; the Tor onion
  // is the default address.
  const origin = await multihost.bindPort(port, {
    protocol: null,
    preferredExternalPort: port,
    addSsl: null,
    secure: null,
  })
  const iface = sdk.createInterface(effects, {
    name: 'Relay WebSocket',
    id: 'main',
    description:
      'The Nostr relay WebSocket endpoint (ws), reached over Tor by default.',
    type: 'api',
    masked: false,
    schemeOverride: { ssl: 'wss', noSsl: 'ws' },
    username: null,
    path: '',
    query: {},
  })
  const receipt = await origin.export([iface])
  return [receipt]
})
