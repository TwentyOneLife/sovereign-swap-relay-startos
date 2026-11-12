# Builds sovereign-swap-relay from source, pinned by commit, so nothing is downloaded at install
# time that would need verifying, and the whole chain from source to running relay stays auditable.
# rust:1-slim-bookworm pinned by digest (reproducibility; Dependabot follows the tag beside it).
FROM rust@sha256:ed2c95ca377d6571b124b05e75e01207973ded639dce7d5542eb7bcd797e32aa AS builder

ARG SWAP_REPO=https://github.com/TwentyOneLife/sovereign-swap.git
# Pinned to a commit, never a branch: a moving ref would make the image unreproducible.
ARG SWAP_REF=v0.6.20

RUN apt-get -qq update \
 && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y --no-install-recommends \
      ca-certificates git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone "$SWAP_REPO" src && cd src && git checkout "$SWAP_REF"
RUN cd src && cargo build --locked --release --bin sovereign-swap-relay

FROM debian:bookworm-slim@sha256:734a72b3d6142a71993b4bc580ca01d8ca687f77a2c422d96a961d3376b179bc AS final
RUN apt-get -qq update \
 && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/src/target/release/sovereign-swap-relay /usr/local/bin/sovereign-swap-relay
WORKDIR /mnt/relay
STOPSIGNAL SIGTERM
