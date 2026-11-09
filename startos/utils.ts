/** The relay's WebSocket port inside the container; bound on the LAN host and a Tor onion. */
export const port = 7777
export const hostId = 'main'

/** The subset of the relay's NIP-11 document we read for health + the status action. The relay
 *  serves this as `application/nostr+json` on a plain GET to its own port; the fields are aggregate
 *  only (never pubkeys or IPs). Everything is optional so a shape change on the relay side degrades
 *  to a missing field rather than a throw. */
export type RelayInfo = {
  version?: string
  swap_relay?: {
    connections_now?: number
    connections_total?: number
    events_accepted?: number
    events_duplicate?: number
    events_rejected?: Record<string, number>
    max_connections?: number
    retention_secs?: number
    uptime_secs?: number
  }
}

/** Rejects after `ms`, so a hung fetch cannot wedge a health check or action. Mirrors the SDK's own
 *  `checkWebUrl` pattern (Promise.race against a timeout) rather than relying on AbortController,
 *  which the runtime's `fetch` polyfill does not guarantee. */
const timeoutPromise = (ms: number): Promise<never> =>
  new Promise((_resolve, reject) =>
    setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
  )

/** Fetches the relay's NIP-11 document from its own loopback port and parses it. The action runtime
 *  and the health check share the relay subcontainer's network namespace (the SDK's
 *  `checkPortListening` reads `/proc/net/tcp` there and passes), so `127.0.0.1` reaches the live
 *  process and its in-memory counters without any extra network wiring. Throws on a transport error,
 *  a non-2xx response, a timeout, or unparseable JSON. */
export async function relayInfo(timeout = 4000): Promise<RelayInfo> {
  const res = (await Promise.race([
    fetch(`http://127.0.0.1:${port}/`, {
      headers: { Accept: 'application/nostr+json' },
    }),
    timeoutPromise(timeout),
  ])) as Response
  if (!res.ok) {
    throw new Error(`relay returned HTTP ${res.status}`)
  }
  return (await res.json()) as RelayInfo
}
