# edge-server

FastAPI service that runs on the LGA Raspberry Pi edge node. Talks to CouchDB (patient/encounter/consent/triage/sync-meta stores) and Redis (USSD session persistence), and will host the GraphRAG retrieval API and edge LLM inference endpoints.

## Local dev

From the repo root:

```bash
docker compose up
curl http://localhost:8001/health
```

## Run tests

```bash
cd edge-server
pip install -r requirements.txt
pytest
```
