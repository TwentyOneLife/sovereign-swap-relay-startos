# Security

Report privately via GitHub private vulnerability reporting once this repository is published.

This package runs a relay that holds no funds and no keys: it stores and forwards opaque,
end-to-end-encrypted swap events and enforces DoS controls (one event kind, size cap, per-connection
rate limit, bounded store with a time-to-live, connection cap). The relay is untrusted by design; a
forged or dropped event cannot endanger a swap.
