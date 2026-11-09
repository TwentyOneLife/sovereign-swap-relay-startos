import { sdk } from '../sdk'
import { relayInfo, RelayInfo } from '../utils'

// Local mirrors of the SDK's ActionResult member/value shapes. Structural, so they stay assignable
// to the SDK types; written out here only so we can annotate return types and keep the arrays
// mutable (an `as const` would make them readonly, which the SDK's mutable member array rejects).
type Member =
  | {
      name: string
      description: string | null
      type: 'single'
      value: string
      copyable: boolean
      qr: boolean
      masked: boolean
    }
  | { name: string; description: string | null; type: 'group'; value: Member[] }

type ResultValue =
  | {
      type: 'single'
      value: string
      copyable: boolean
      qr: boolean
      masked: boolean
    }
  | { type: 'group'; value: Member[] }

/** A plain single-value member (no copy icon, no QR, not masked), the common case here. */
const field = (
  name: string,
  value: string,
  description: string | null = null,
): Member => ({
  name,
  description,
  type: 'single',
  value,
  copyable: false,
  qr: false,
  masked: false,
})

/** Humanize a seconds count into d/h/m/s, e.g. 1950 -> "32m 30s", 90061 -> "1d 1h 1m". */
function humanizeSecs(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return String(secs)
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  const parts = [
    d ? `${d}d` : '',
    h ? `${h}h` : '',
    m ? `${m}m` : '',
    !d && !h ? `${s}s` : '',
  ].filter(Boolean)
  return parts.join(' ') || '0s'
}

/** Builds the structured result from a parsed NIP-11 document. */
function statusResult(info: RelayInfo): ResultValue {
  const s = info.swap_relay ?? {}
  const r = s.events_rejected ?? {}
  const num = (n: number | undefined) =>
    typeof n === 'number' ? String(n) : 'n/a'

  const rejected = Object.entries(r)
  const rejectedGroup: Member = {
    name: 'Events rejected (by reason)',
    description:
      'Every reason should stay at zero in normal operation; a non-zero count points at a client bug or abuse.',
    type: 'group',
    value:
      rejected.length > 0
        ? rejected.map(([reason, count]) => field(reason, String(count)))
        : [field('(none reported)', '0')],
  }

  const rawJson: Member = {
    name: 'Raw NIP-11 document',
    description:
      'The full aggregate stats as served over Tor. Aggregate only: never pubkeys or IPs.',
    type: 'single',
    value: JSON.stringify(info, null, 2),
    copyable: true,
    qr: false,
    masked: false,
  }

  return {
    type: 'group',
    value: [
      field(
        'Version',
        info.version ?? 'unknown',
        'The sovereign-swap build the relay is running.',
      ),
      field(
        'Connections now',
        num(s.connections_now),
        'Live WebSocket connections. Each plain status/NIP-11 fetch also counts briefly.',
      ),
      field(
        'Connections total',
        num(s.connections_total),
        'Cumulative since the relay last started. Health probes and status fetches inflate this; a per-type breakdown is a later improvement.',
      ),
      field(
        'Max connections',
        num(s.max_connections),
        'The configured connection cap.',
      ),
      field(
        'Events accepted',
        num(s.events_accepted),
        'Valid swap messages (kind 4859) stored.',
      ),
      field(
        'Events duplicate',
        num(s.events_duplicate),
        'Re-sent events already held; dropped harmlessly.',
      ),
      rejectedGroup,
      field(
        'Uptime',
        s.uptime_secs !== undefined ? humanizeSecs(s.uptime_secs) : 'n/a',
      ),
      field(
        'Retention',
        s.retention_secs !== undefined ? humanizeSecs(s.retention_secs) : 'n/a',
        'How long an event is stored and served before it ages out.',
      ),
      rawJson,
    ],
  }
}

/** Read-only "Relay status" action (#7). Fetches the relay's own NIP-11 aggregate stats and renders
 *  them in the StartOS page, so an operator sees connections/events/uptime without a Tor curl. The
 *  relay must be running (the stats live in the process); on a fetch failure we return a plain
 *  "not responding" result rather than throwing, so the action never shows a raw stack trace. */
export const relayStatus = sdk.Action.withoutInput(
  'relay-status',
  async () => ({
    name: 'Relay status',
    description:
      'Show the relay’s live aggregate stats: version, connections, events accepted/rejected, and uptime.',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async () => {
    try {
      const info = await relayInfo()
      return {
        version: '1',
        title: 'Relay status',
        message:
          'Live aggregate stats from the relay. Aggregate only, never pubkeys or IPs.',
        result: statusResult(info),
      }
    } catch (e) {
      return {
        version: '1',
        title: 'Relay status',
        message: `The relay did not respond: ${
          e instanceof Error ? e.message : String(e)
        }. If it was just started, give it a moment and try again.`,
        result: null,
      }
    }
  },
)
