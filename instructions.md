# Sovereign Swap Relay

This service is a hardened Nostr relay that carries the messages of peer-to-peer BTC and xBTC
(Bitcoin Blake2b) atomic swaps. **It holds no funds and no keys.** It stores and forwards opaque,
end-to-end-encrypted events and nothing else, so there is nothing on it to steal; its job is to stay
available under abuse.

## Using it

Open the service's **Relay WebSocket** interface to get its address. The default and recommended
address is the Tor onion (`ws://…onion`), reached by a swap client configured to use Tor. The LAN
address reaches it from inside your network. The relay speaks plain `ws` on purpose: swap messages
are already encrypted end to end by the client, and Tor encrypts the connection, so no TLS is added.

Point your swap client (or any Nostr client that speaks the swap event kind, 4859) at that address.
Run several relays and list them all in your client: no single relay is a chokepoint, and a relay
going offline cannot endanger a swap, which always settles to claim-or-refund.

## Limits

Under **Actions → Relay limits** you can tune the anti-abuse controls (maximum event size, maximum
connections, events per minute per connection, store capacity, and how long events are retained).
The defaults are safe; lower them if the relay is under load.

## What it cannot do

It cannot see who is trading, read a swap, hold a balance, or freeze anyone's coins. A relay operator
has no lever over user funds, by design.
