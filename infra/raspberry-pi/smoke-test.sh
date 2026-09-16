#!/usr/bin/env bash
# Smoke test for the Docker-simulated RPi edge-server stack (docs/project_plan.md
# Phase 1 task "RPi edge-server image"). Run after:
#   docker compose -f docker-compose.yml -f infra/raspberry-pi/docker-compose.rpi-sim.yml up -d --build
set -euo pipefail

EDGE_URL="${EDGE_URL:-http://localhost:8001}"
COUCHDB_URL="${COUCHDB_URL:-http://localhost:5984}"
COUCHDB_USER="${COUCHDB_USER:-admin}"
COUCHDB_PASSWORD="${COUCHDB_PASSWORD:-changeme}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

wait_for() {
  local url="$1" tries=30
  until curl -sf "$url" >/dev/null 2>&1; do
    tries=$((tries - 1))
    if [ "$tries" -le 0 ]; then
      echo "FAIL: ${url} never became ready"
      exit 1
    fi
    sleep 2
  done
}

echo "==> Waiting for edge-server"
wait_for "${EDGE_URL}/health"

echo "==> Checking /health and /version"
curl -sf "${EDGE_URL}/health" | grep -q '"status":"ok"' || { echo "FAIL: /health"; exit 1; }
curl -sf "${EDGE_URL}/version" >/dev/null || { echo "FAIL: /version"; exit 1; }

echo "==> Waiting for CouchDB"
wait_for "${COUCHDB_URL}/_up"

echo "==> Provisioning CouchDB databases"
COUCHDB_USER="$COUCHDB_USER" COUCHDB_PASSWORD="$COUCHDB_PASSWORD" \
  "${SCRIPT_DIR}/../couchdb/provision.sh" "$COUCHDB_URL"

echo "==> Verifying databases exist"
for db in patients encounters consent triage sync-meta; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -u "${COUCHDB_USER}:${COUCHDB_PASSWORD}" "${COUCHDB_URL}/${db}")
  if [ "$code" != "200" ]; then
    echo "FAIL: database ${db} missing (HTTP ${code})"
    exit 1
  fi
done

echo "==> Checking Redis"
if command -v redis-cli >/dev/null 2>&1; then
  redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping | grep -q PONG || { echo "FAIL: redis ping"; exit 1; }
else
  docker compose exec -T redis redis-cli ping | grep -q PONG || { echo "FAIL: redis ping"; exit 1; }
fi

echo "==> All smoke tests passed"
