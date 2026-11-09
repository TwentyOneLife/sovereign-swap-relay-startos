import { settingsJson, DEFAULTS } from '../fileModels/settings.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  maxEventBytes: Value.number({
    name: 'Max event size (bytes)',
    description:
      'Reject any event larger than this. A swap message is a few KiB.',
    required: true,
    default: DEFAULTS.maxEventBytes,
    min: 1024,
    integer: true,
    units: 'bytes',
  }),
  maxConnections: Value.number({
    name: 'Max connections',
    description: 'Drop new connections once this many are open.',
    required: true,
    default: DEFAULTS.maxConnections,
    min: 1,
    integer: true,
  }),
  maxEventsPerMin: Value.number({
    name: 'Events per minute per connection',
    description: 'Throttle a connection that publishes faster than this.',
    required: true,
    default: DEFAULTS.maxEventsPerMin,
    min: 1,
    integer: true,
  }),
  storeCap: Value.number({
    name: 'Store capacity (events)',
    description:
      'Keep at most this many events; the oldest are dropped past it.',
    required: true,
    default: DEFAULTS.storeCap,
    min: 1,
    integer: true,
  }),
  retentionSecs: Value.number({
    name: 'Retention (seconds)',
    description: 'Do not store or serve events older than this.',
    required: true,
    default: DEFAULTS.retentionSecs,
    min: 60,
    integer: true,
    units: 'seconds',
  }),
  priceProxy: Value.toggle({
    name: 'Price proxy',
    description:
      'Fetch the BTCB2/BTC reference price from nonkyc over the clear internet and serve it to ' +
      'connected clients in the relay info document, so they read it over Tor instead of each fetching ' +
      'the exchange directly (nonkyc blocks many Tor exits). Off by default. When on, this relay’s ' +
      'own IP reaches nonkyc (never a client’s); no client IP or request is logged. The value is ' +
      'advisory only and withheld once stale.',
    default: DEFAULTS.priceProxy,
  }),
})

export const config = sdk.Action.withInput(
  'config',
  async ({ effects }) => ({
    name: 'Relay limits',
    description: 'The relay’s anti-abuse controls. Lower them under load.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => settingsJson.read().once(),
  async ({ effects, input }) => {
    await settingsJson.merge(effects, input)
  },
)
