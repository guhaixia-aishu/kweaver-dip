#!/bin/sh

set -eu

(openclaw gateway --bind lan || echo "[docker-entrypoint] failed to launch OpenClaw Gateway, continuing with Studio startup" >&2) &

exec node dist/server.js
