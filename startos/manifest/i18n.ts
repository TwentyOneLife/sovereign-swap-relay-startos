export const short = {
  en_US: 'A hardened Nostr relay for BTC/xBTC swap messages',
}

export const long = {
  en_US:
    'sovereign-swap-relay carries the messages of peer-to-peer BTC and xBTC (Bitcoin Blake2b) swaps over Nostr. It holds no funds and no keys: it stores and forwards opaque, end-to-end-encrypted events and nothing else, and it is hardened to survive abuse, serving only the swap event kind, verifying every event, capping event size, rate-limiting each connection, and bounding its store with a time-to-live. Anyone can run one; clients list several, so no single relay is a chokepoint.',
}
