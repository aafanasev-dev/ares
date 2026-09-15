#!/usr/bin/env bash
# Start the Mars sea level globe on a local web server and print the link to open.
#
# Usage: ./run.sh [port]        (or PORT=9000 ./run.sh; HOST=0.0.0.0 to listen on all interfaces)
set -euo pipefail

cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"

if [[ ${1:-} == -h || ${1:-} == --help ]]; then
  sed -n '2,4s/^# \{0,1\}//p' "$0"
  exit 0
fi

PORT=${1:-${PORT:-8000}}
HOST=${HOST:-127.0.0.1}

if [[ ! $PORT =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  echo "error: invalid port '$PORT'" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 is required but was not found in PATH" >&2
  exit 1
fi

if [[ ! -f data/elevation.bin || ! -f data/elevation.json ]]; then
  echo "Elevation data not found, preparing it (one-time ~33 MB download)..."
  python3 tools/prepare_data.py
fi

case $HOST in
  0.0.0.0 | ::) probe_host=127.0.0.1 ;;
  *) probe_host=$HOST ;;
esac

port_in_use() {
  (exec 3<>"/dev/tcp/$probe_host/$1") 2>/dev/null
}

requested_port=$PORT
for (( i = 0; i < 20 && PORT < 65535; i++ )); do
  port_in_use "$PORT" || break
  PORT=$((PORT + 1))
done
if port_in_use "$PORT"; then
  echo "error: ports $requested_port-$PORT are all in use" >&2
  exit 1
fi
if [[ $PORT != "$requested_port" ]]; then
  echo "Port $requested_port is in use, using $PORT instead."
fi

server_pid=
cleanup() {
  if [[ -n $server_pid ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT
trap 'echo; echo "Stopped."; exit 130' INT TERM

python3 -m http.server "$PORT" --bind "$HOST" &
server_pid=$!

for (( i = 0; i < 50; i++ )); do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "error: web server failed to start on $HOST:$PORT" >&2
    exit 1
  fi
  port_in_use "$PORT" && break
  sleep 0.1
done
if ! port_in_use "$PORT"; then
  echo "error: web server did not respond on $HOST:$PORT within 5 s" >&2
  exit 1
fi

case $HOST in
  127.0.0.1 | localhost | 0.0.0.0 | ::) link_host=localhost ;;
  *) link_host=$HOST ;;
esac

echo
echo "Mars sea level is running:"
echo "  http://$link_host:$PORT/"
echo
echo "Press Ctrl+C to stop."

wait "$server_pid"
