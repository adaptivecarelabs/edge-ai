#!/usr/bin/env bash
# Creates the CouchDB databases required by Phase 1 (docs/project_plan.md).
# Usage: COUCHDB_USER=admin COUCHDB_PASSWORD=changeme ./provision.sh [http://localhost:5984]
set -euo pipefail

COUCHDB_URL="${1:-http://localhost:5984}"
AUTH="${COUCHDB_USER:-admin}:${COUCHDB_PASSWORD:-changeme}"

for db in patients encounters consent triage sync-meta; do
  echo "Creating database: ${db}"
  curl -sf -X PUT "${COUCHDB_URL}/${db}" -u "${AUTH}" || echo "  (already exists or failed)"
done
