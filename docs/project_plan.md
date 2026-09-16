# Project Plan: Build Phases, Tasks & Deliverables

This plan breaks the project (see `architecture.md`, `business_requirement_document.md`, `product_requirement.md`, `progress.md`) into build phases. Each task lists a deliverable and a definition of done (DoD). Phase gates map onto the "Release Gates" in `progress.md`.

**Completion rule:** a *task* is done when its deliverable exists, its DoD passes, and (where noted) the responsible role from the BRD persona table has signed off. A *phase* is done when every task in it is done **and** its gate criteria pass.

---

## Phase 1 — Foundation

| Task | Deliverable | Definition of Done |
|---|---|---|
| Repo & directory structure | Git repo with `android/`, `edge-server/`, `cloud/`, `docs/`, `infra/`, CI stub | Repo builds/lints in CI |
| Docker dev environment | `docker-compose.yml` (FastAPI + CouchDB + Redis) | `docker compose up` succeeds; health endpoints return 200 |
| FastAPI scaffold | App skeleton with `/health`, `/version`, route structure for triage/sync/OCR | Empty test suite runs green in CI |
| CouchDB config | Databases for patients, encounters, consent, sync-meta + RBAC roles | Provisioning script creates DBs, scoped creds work |
| Redis config | Session store, 120s TTL policy | set/get/expire verified by script |
| RPi edge-server image | Provisioning script/image with all services preinstalled | Boots on target RPi 4/4GB, services auto-start, smoke test passes |
| Patient schema | Versioned JSON schema file | Validated against sample records; reviewed by clinical/data governance |
| Encounter schema | Versioned JSON schema file | Validated against sample records; reviewed by clinical/data governance |
| Consent schema | Versioned JSON schema file | Validated against sample records; reviewed by clinical/data governance |
| Triage schema | Versioned JSON schema file | Validated against sample records; reviewed by clinical/data governance |
| Synchronization metadata schema | Versioned JSON schema file | Validated against sample records; reviewed by clinical/data governance |
| Assign clinical + security reviewers | `governance.md` with named roles | Roles confirmed, contactable, added to review workflow |
| Data governance policy | Policy doc (NDPR mapping, retention, access matrix) | Signed off by security/compliance stakeholder |
| Guideline source inventory | List of NCDC/WHO/national docs to ingest first + owners | Reviewed and approved by clinical reviewer |

**Phase 1 Gate:** all infra runs locally and on the RPi image; all 5 schemas finalized; governance roles, policy, and guideline inventory signed off. This unblocks all downstream clinical work.

---

## Phase 2 — Core Features

### Android

| Task | Deliverable | DoD |
|---|---|---|
| Offline patient mgmt + PouchDB | Local-first CRUD | Full functionality in airplane mode; syncs on reconnect (FR-03) |
| Consent workflow | Consent capture screen | Blocks document scan until patient ID, CHW ID, timestamp recorded |
| Camera + OpenCV edge detection + perspective correction | Capture pipeline | ≥95% successful auto-crop on test document set |
| PP-OCRv5 integration | On-device OCR | ~94–96% printed-text accuracy, ≤2s latency on reference device |
| Medical NER | Entity extraction (disease/drug/symptom/dose) | Validated against labeled sample set; feeds CHW review step |
| CHW review/edit screen | Accept/edit/reject UI | Edits stored distinctly from raw OCR (provenance preserved) |
| Patient history timeline | Searchable/filterable history (FR-06) | Shows encounters, diagnoses, vitals, meds, tests, referrals, corrections, timestamps |
| Offline rule-based triage engine | Deterministic engine (red-flag/RDT/vitals/pregnancy) | 100% of defined red-flag scenarios trigger escalation offline |
| INT8 model + QNN/NNAPI delegation | On-device quantized LLM | Meets latency/memory target on entry-level reference device |
| ASR integration | Nigerian-English ASR (MVP) | Low-confidence transcripts trigger confirm/fallback |

### Clinical AI

| Task | Deliverable | DoD |
|---|---|---|
| Rule engine + red-flag/RDT/vital/pregnancy rules | Rule library with test cases | Each rule traced to a guideline citation, reviewed by clinical reviewer |
| Quantized medical LLM | Model artifact + eval report | Artifact ready for calibration (full validation in Phase 3) |
| GraphRAG pipeline + NCDC/WHO ingestion + versioning | Queryable knowledge graph | Sample queries return correctly linked guideline IDs; graph is versioned |
| Safety validator | Output-validation layer | Blocks/flags known-bad outputs in a red-team test suite (no fabricated drugs/dosages, no downgraded red flags) |

### Extreme Edge

| Task | Deliverable | DoD |
|---|---|---|
| RapidPro + USSD `*599#` flow | Working menu (Maternal/Child/Infectious Disease) | <10s gateway-to-response |
| Redis session persistence + resume | Session survives dropout | Verified resume after simulated 2G disconnect within 120s TTL |
| SMS gateway + structured parser | Keyword parser → triage → SMS reply | Handles defined syntax + malformed input gracefully |
| Multilingual keyword mapping | Keyword dictionaries per language | Reviewed by field/language validators |

**Phase 2 Gate = Release Gate 1 (Technical):** offline workflows work without network; synchronization is reliable; device memory/thermal limits acceptable. FR-01–FR-09 and FR-15 functionally implemented (not yet validated at scale).

---

## Phase 3 — Validation

| Task | Deliverable | DoD |
|---|---|---|
| 50+ unit/integration clinical tests | Test suite + report | ≥50 tests passing, covering rule engine + safety validator |
| Offline-mode test suite | Automated no-connectivity tests | 100% of core workflows pass with network disabled |
| Five-device Android benchmark | Benchmark report | Latency/memory/battery within NFR targets on all 5 devices |
| 500-case calibration | Calibration report | INT8 accuracy degradation <3% confirmed |
| ASR benchmark | WER report per language | Meets agreed threshold; reviewed by field researchers |
| OCR printed/handwriting benchmarks | Accuracy report | Printed ≥94–96%; handwriting explicitly flagged low-confidence |
| Thermal/battery stress tests | Device report | No workflow-blocking throttling under test protocol |
| Security, encryption, RBAC audits | Audit reports | No open critical/high findings; signed off by security reviewer |
| Clinical safety review | Sign-off doc | Clinical reviewers approve deterministic rules + LLM safety behavior |
| NHREC/ethical approvals | Approval documentation | Formal ethics approval obtained before pilot |

**Phase 3 Gate = Release Gates 2 (Clinical) + 3 (Security):** clinical reviewers approve deterministic rules; model evaluation meets safety thresholds; unsupported cases escalate safely; encryption/RBAC/audit logging/data-minimization all verified.

---

## Phase 4 — Pilot Deployment (3 LGAs: 1 urban, 2 rural, ~100 CHWs each)

| Task | Deliverable | DoD |
|---|---|---|
| Device provisioning + edge-server install | Provisioned fleet, edge servers live per LGA | All devices enrolled, servers online |
| CHW training | Training materials + completion records | 100% pilot CHWs trained and pass competency check |
| Baseline workflow measurement | Baseline metrics doc | Captured before go-live |
| Production + accuracy monitoring | Live dashboards | Operational from day 1 |
| Usability / language / USSD-SMS feedback | Field study reports | Feedback synthesized into findings doc (cf. BRD's 101-CHW study) |
| Defect remediation | Fixed defect log | All critical/high defects resolved or explicitly accepted |
| Pilot acceptance review | Sign-off report | Stakeholders formally accept pilot results |

**Phase 4 Gate = Release Gate 4 (Field):** CHWs successfully complete core workflows; USSD/SMS flows work under 2G constraints; pilot feedback incorporated.

---

## Phase 5 — National Integration

| Task | Deliverable | DoD |
|---|---|---|
| DHIS2 integration | Aggregate indicators pushed/pulled | Matches FR-10; verified no patient-level data leakage |
| National analytics, model registry, OTA distribution, automated edge deployment | Deployed services | Each passes functional test (e.g., registry can push/rollback a versioned model) |
| Backup/disaster recovery | Runbook + tested restore | Successful restore-from-backup drill |
| National + LGA dashboards, security monitoring | Live dashboards | NPHCDA/FMoH and LGA authorities can access and interpret data |

**Phase 5 Gate = Release Gate 5 (Production):** monitoring operational; backup/recovery tested; model rollback tested; clinical governance sign-off completed.

---

## Phase 6 — Scale (774 LGAs, 50,000+ CHWs)

| Task | Deliverable | DoD |
|---|---|---|
| Phased rollout plan | Wave-by-wave LGA rollout + capacity plan | Approved by governance |
| Expanded multilingual ASR + disease coverage | Updated models | Meets same benchmark thresholds as MVP languages |
| National model-update workflow | OTA pipeline at scale | Verified across a sample of edge nodes per wave |
| Continuous clinical/security validation | Ongoing review cadence documented | Review cycle active with named owners |
| National operational support model | Staffed support org | Support model live before each new wave goes live |

**Phase 6 Gate:** each new rollout wave independently satisfies Gates 1–5 before going live — scale is repeated pilot validation, not a one-time gate.
