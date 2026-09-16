# Edge-AI: Clinical Decision Support for Nigerian PHC

Offline-first clinical decision support platform for Community Health Workers (CHWs) in Nigerian Primary Health Care (PHC) facilities. See [`docs/`](docs/) for the full architecture, requirements, and build plan.

## Repo Layout

```
android/        React Native CHW app (offline-first, PouchDB, OCR, ASR, on-device inference)
edge-server/    FastAPI service for the LGA Raspberry Pi edge (CouchDB, Redis, GraphRAG, edge LLM)
cloud/          National cloud layer (DHIS2 integration, analytics, model registry)
infra/          Local dev environment, CouchDB/Redis config, Raspberry Pi provisioning
docs/           Architecture, BRD/PRD, system prompt, skills spec, project plan, progress tracker
```

## Docs

- [`docs/architecture.md`](docs/architecture.md) — four-layer system architecture
- [`docs/business_requirement_document.md`](docs/business_requirement_document.md) — BRD
- [`docs/product_requirement_document.md`](docs/product_requirement_document.md) — full PRD (user stories, UI/UX)
- [`docs/product_requirement.md`](docs/product_requirement.md) — condensed product spec
- [`docs/system_prompt.md`](docs/system_prompt.md) — clinical AI system persona/safety rules
- [`docs/skills.md`](docs/skills.md) — core capability/action schemas
- [`docs/project_plan.md`](docs/project_plan.md) — build phases, tasks, deliverables, DoD
- [`docs/progress.md`](docs/progress.md) — live roadmap/checklist state

## Quick Start (edge-server dev environment)

```bash
docker compose up
curl http://localhost:8001/health
```

Host port 8001 (not 8000) is used for `edge-server` to avoid clashing with other local services.

This brings up the FastAPI edge service, CouchDB, and Redis as defined in `docker-compose.yml`.

## Status

Phase 1 (Foundation) — repo scaffolding in progress. See [`docs/progress.md`](docs/progress.md) for current state.
