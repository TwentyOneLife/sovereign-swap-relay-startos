# Security testing of the sovereign-swap relay

What we tested, with what, and what came out. This covers the relay as a service: its availability
under abuse, its behaviour as an untrusted man-in-the-middle, and what a passive observer can learn.
The relay holds no funds and no keys, so there is nothing to steal; the questions are whether it can
be taken down, whether it can tamper with a swap, and whether it leaks.

Date: 2026-11-05. Relay code: `TwentyOneLife/sovereign-swap`. Attack tooling: module 13 of
`TwentyOneLife/sovereign-homelab` (`attacks/swap-relay/`, `builder/70-74`).

## Method and environment

All work ran in an **isolated lab network** with no route to production or the internet-facing
deployment; attacks never touched the live service. The attacker is a Kali VM driven headless; the
relay and the swap run as containers on the lab's bridge.

| Tool | Role |
|---|---|
| Kali Linux VM | attacker host (`websocket-client`, `PySocks`, Tor) |
| Docker (macvlan on the lab bridge) | relay, hostile relay, observer, and the swap runner as containers |
| `sovereign-swap` relay binary | the target (built from source, hardened defaults) |
| `sovereign-swap` `lab_e2e` test | drives a full BTC/xBTC swap over a chosen relay |
| Bitcoin Core v31.1.0, Bitcoin Knots BLAKE2b v29.4.3 | regtest settlement nodes, verified by SHA256 + GPG before use |
| `attacks/swap-relay/*.py`, `builder/7x-*.sh` | the attack scripts and their runners (checked in, as the test record) |

The relay was exercised in two configurations, to measure each control: **hardened** (the shipped
defaults, which are what the package ships) and **open** (limits relaxed to near-nothing), so the
difference is the control doing its job.

## What we tested, and the outcome

### 1. Denial of service (availability)

| Attack | hardened | open | control exercised |
|---|---|---|---|
| event flood (1000 on one connection) | `rate_limited=760` | `rate_limited=0` | per-connection rate limit |
| oversized + malformed frame | survives, answers a later REQ | survives, answers a later REQ | frame-size cap + parse robustness |
| wrong event kind | `blocked: kind not allowed` | `blocked: kind not allowed` | kind allowlist (unconditional) |
| connection flood (600 concurrent) | plateaus at **512** | all **600** accepted | connection cap |

The rate limit and the connection cap measurably blunt their attacks. The kind allowlist and the
size/parse checks are **unconditional** - they do not relax in open mode, which is the stronger
property (not a knob an operator can turn off).

### 2. The relay carries a real swap

A full BTC/xBTC atomic swap, two engines discovering each other over the relay by WebSocket and
settling on regtest Core + Knots BLAKE2b: **it settles** (`lab_e2e`, ~8 rounds). This proves the
relay carries a real swap, not just unit-test traffic.

### 3. A real swap *under* attack

The same swap, run while one attacker floods the hardened relay (the attacker sees
`rate_limited=1760` per burst): **the swap still settles**, unchanged. A legitimate swap uses its own
low-rate connections, so the per-connection limit throttles the attacker without touching it. This is
the design's thesis made visible: abuse is expensive and ineffective, and no coin is ever at risk.

### 4. Man-in-the-middle / hostile relay

A hostile relay in the path forwards genuine events **and injects a forged copy of each** (tampered
content). Running a swap through it: **3 forgeries injected, all dropped, swap settled**. The receiver
recomputes each event's id and checks its signature before anything else, so a forged event never
reaches the swap logic. A MITM cannot impersonate a party, alter an offer, or redirect funds. (A relay
that instead *drops* messages cannot cause loss either; the swap stalls and both sides refund after
their timelocks - the safe outcome.)

### 5. Privacy (what a passive observer learns)

The strongest eavesdropper is the relay itself, or anyone subscribed to it. Captured as a passive
observer during a live swap:

- **Directed swap messages** (bid, accept, locks) are **opaque** - ciphertext only, no amount,
  address, or identity.
- **Broadcast offers** are **public by design** (an order book): they expose the order terms and the
  maker's pseudonymous key, but **no taker identity and no real-world identity**.
- The relay sees only **throwaway routing keys**; real identities are sealed inside the directed
  ciphertext and never appear on the wire.

### 6. Reachability over Tor

The relay is Tor-first, so it must answer a WebSocket handshake that arrives over a Tor circuit's
latency. See Finding 1 - this is where testing found the most important bug.

## Findings and improvements

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | **High** | **Tor handshake dropped.** The relay set its 50ms read-loop timeout *before* the WebSocket handshake, so any handshake slower than 50ms - i.e. every Tor circuit - was dropped. The relay is Tor-first by design yet was unreachable over Tor; the LAN tests hid it. Confirmed deterministically: a handshake delayed 100ms+ got an empty reply and closed. | **Fixed** in `sovereign-swap` (handshake gets a generous timeout, tightened to 50ms only after `accept`; regression test added). Ships in the next relay release; until then the live onion is unreachable over Tor. |
| 2 | Tooling | **Attacks did not reach their control.** The DoS scripts sent events with a bogus pubkey, which the relay rejects at *parse* (it validates the pubkey is a real curve point) before the rate/kind checks - so they tested parse rejection, not the control, and looked identical in both modes. | **Fixed**: the scripts now use a valid x-only key, so the limiter and allowlist are actually exercised (the numbers above). |
| 3 | By design | **Order terms are public.** A broadcast offer exposes amounts/chains and the maker's pseudonymous key to anyone subscribed. This is inherent to a public order book and reveals no taker or real-world identity. | Documented. Optional future work: encrypted discovery or commit-reveal for order privacy, at the cost of discovery complexity. |
| 4 | Coverage | **Size cap not directly tested; refund-over-relay demo missing.** The oversized attack is rejected at parse, so it never exercised the size cap. Refund paths, by contrast, are already well covered (`tests/swap.rs` maker/taker refund cases, refund on real regtest nodes in `tests/regtest.rs`, and property tests). | **Size cap: fixed** - a unit test now sends a valid oversized event and asserts "event too large". Refund: already covered; only a lab DROP->refund *demonstration* remains (the hostile relay supports `DROP=`, but a refund-aware lab driver is future work). |

## Reproduce

From a `sovereign-swap` checkout beside `sovereign-homelab`, with the lab up:

```sh
MODE=hardened bash builder/70-swap-relay.sh     # the target
bash builder/72-swap-e2e.sh                     # a real swap settles over the relay
bash builder/73-mitm-swap.sh                    # a swap survives a forging MITM relay
bash builder/74-privacy.sh                      # a passive observer learns nothing it should not
# DoS matrix: run attacks/swap-relay/*.py from the attacker with the relay in MODE=open then hardened
```

The attack scripts and runners are checked into `sovereign-homelab` as the test record.
