# schemas

JSON Schema (Draft 2020-12) definitions for the five Phase 1 data models (`docs/project_plan.md`).
Shared source of truth for `edge-server` (CouchDB document validation) and `android` (client-side
validation / type generation).

- `patient.schema.json` — identity/demographics. Primary key is a system-generated UUID; `match_key`
  + `duplicate_review` implement probable-duplicate detection with CHW confirm-or-merge (never silent
  auto-merge — see BRD open question on patient identity resolution).
- `consent.schema.json` — consent capture required before any document scan (`system_prompt.md`).
- `encounter.schema.json` — one CHW-patient encounter: observations, optional OCR extraction (with
  `reviewed_by_chw` gate), CHW corrections, and links to `patient` / `triage`.
- `triage.schema.json` — a triage recommendation, carrying `inference_pathway`, rule/LLM/GraphRAG
  provenance, and the Clinical Recommendation Format fields required by `system_prompt.md`.
- `sync-metadata.schema.json` — PouchDB↔CouchDB↔Cloud replication state: retry/backoff and
  deterministic conflict resolution (BRD FR-15).

All are versioned via a `schema_version` const field; bump it and add a migration note here when a
schema changes shape.

## Validate

```bash
pip install jsonschema
python3 -c "
import json
from jsonschema import Draft202012Validator
for f in ['patient','encounter','consent','triage','sync-metadata']:
    Draft202012Validator.check_schema(json.load(open(f'{f}.schema.json')))
print('all schemas valid')
"
```
