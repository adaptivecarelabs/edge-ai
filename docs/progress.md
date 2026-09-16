
## `progress.md`

```markdown
# Project State & Roadmap

## Current State

Overall implementation status: 0%

Architecture baseline: Defined
Product baseline: Defined
Clinical governance: Pending human review
Production deployment: Not started

---

## Phase 1: Foundation — 67% Completed (10/15)

### Infrastructure
- [x] Repository structure established
- [x] Docker development environment created
- [x] FastAPI service scaffolded
- [x] CouchDB configured
- [x] Redis configured
- [~] Raspberry Pi edge-server image — simulated via Docker (`infra/raspberry-pi/docker-compose.rpi-sim.yml` + `smoke-test.sh`), arm64 emulation/resource limits/restart policy/smoke test all verified end-to-end; provisioning script written (`infra/raspberry-pi/provision.sh`), syntax-checked but not yet run — real Pi 4 hardware boot/provisioning still pending (see `infra/raspberry-pi/README.md`)

### Data
- [x] Patient schema finalized
- [x] Encounter schema finalized
- [x] Consent schema finalized
- [x] Triage schema finalized
- [x] Synchronization metadata schema finalized

### Governance
- [ ] Clinical reviewers assigned
- [ ] Security reviewer assigned
- [ ] Data governance policy approved
- [ ] Guideline source inventory finalized

---

## Phase 2: Core Features — 0% Completed

### Android
- [ ] Offline patient management
- [ ] PouchDB integration
- [ ] Consent workflow
- [ ] Camera workflow
- [ ] OpenCV document detection
- [ ] Perspective correction
- [ ] PP-OCRv5 integration
- [ ] Medical NER
- [ ] CHW review/edit screen
- [ ] Patient history timeline
- [ ] Offline triage engine
- [ ] INT8 model integration
- [ ] QNN/NnAPI delegation
- [ ] ASR integration

### Clinical AI
- [~] Rule engine — scaffolded in TypeScript (`clinical-ai/`), 34 passing tests; embeds directly into the future React Native app per `docs/architecture.md`
- [~] Red-flag rules — draft set implemented (`clinical-ai/src/rules/redFlag.ts`), unreviewed
- [~] RDT rules — draft set implemented (`clinical-ai/src/rules/rdt.ts`), unreviewed
- [~] Vital-sign rules — draft set implemented (`clinical-ai/src/rules/vitals.ts`), adult thresholds only, unreviewed
- [~] Pregnancy rules — draft set implemented (`clinical-ai/src/rules/pregnancy.ts`), unreviewed

  All five items above are blocked from [x] by the same governance gap as Phase 1: DoD requires clinical-reviewer sign-off and a real guideline citation per rule, and no reviewer is named yet (see Phase 1 Governance, and `clinical-ai/README.md`).
- [ ] Quantized medical LLM
- [ ] GraphRAG pipeline
- [ ] NCDC knowledge graph
- [ ] WHO guideline ingestion
- [ ] Guideline versioning
- [~] Safety validator — scaffolded (`clinical-ai/src/safety/`), 8 structural checks (red-flag downgrade/suppression, missing escalation instruction, missing confidence statement, ungrounded LLM output, empty/unreviewed citations, unjustified CHW override) with a red-team test suite; covers only mechanically-detectable violations, not free-text content policing — see `clinical-ai/README.md`

### Extreme Edge
- [ ] RapidPro integration
- [ ] USSD *599# flow
- [ ] Redis session persistence
- [ ] USSD resume logic
- [ ] SMS gateway
- [ ] Structured SMS parser
- [ ] Multilingual keyword mapping

---

## Phase 3: Validation — 0% Completed

- [ ] 50+ unit/integration clinical tests
- [ ] Offline-mode test suite
- [ ] Five-device Android benchmark
- [ ] 500-case model calibration
- [ ] Validate INT8 accuracy degradation <3%
- [ ] ASR benchmark on Nigerian speech
- [ ] OCR printed-text benchmark
- [ ] OCR handwriting benchmark
- [ ] Thermal-throttling tests
- [ ] Battery tests
- [ ] Security audit
- [ ] Encryption audit
- [ ] RBAC audit
- [ ] Clinical safety review
- [ ] NHREC/required ethical approvals

---

## Phase 4: Pilot Deployment — 0% Completed

Target:

- [ ] 3 LGAs
- [ ] 1 urban LGA
- [ ] 2 rural LGAs
- [ ] ~100 CHWs per LGA

Pilot activities:

- [ ] Device provisioning
- [ ] Edge-server installation
- [ ] CHW training
- [ ] Baseline workflow measurement
- [ ] Production monitoring
- [ ] Accuracy monitoring
- [ ] Usability collection
- [ ] Language/ASR feedback
- [ ] USSD completion analysis
- [ ] SMS fallback analysis
- [ ] Defect remediation
- [ ] Pilot acceptance review

---

## Phase 5: National Integration — 0% Completed

- [ ] DHIS2 integration
- [ ] National analytics
- [ ] Model registry
- [ ] OTA/model distribution mechanism
- [ ] Automated edge deployment
- [ ] Backup/disaster recovery
- [ ] National dashboard
- [ ] LGA operational dashboards
- [ ] Security monitoring

---

## Phase 6: Scale — 0% Completed

Target architecture:

- [ ] 774 LGA edge deployments
- [ ] 50,000+ CHWs
- [ ] Expanded multilingual ASR
- [ ] Expanded disease coverage
- [ ] National model-update workflow
- [ ] Continuous clinical validation
- [ ] Continuous security monitoring
- [ ] National operational support model

---

## Release Gates

### Gate 1 — Technical
- [ ] Offline workflows work without network
- [ ] Synchronization is reliable
- [ ] Device memory/thermal limits are acceptable

### Gate 2 — Clinical
- [ ] Clinical reviewers approve deterministic rules
- [ ] Model evaluation meets agreed safety thresholds
- [ ] Unsupported cases escalate safely

### Gate 3 — Security
- [ ] Encryption verified
- [ ] RBAC verified
- [ ] Audit logging verified
- [ ] Data-minimization controls verified

### Gate 4 — Field
- [ ] CHWs successfully complete core workflows
- [ ] USSD/SMS flows work under 2G constraints
- [ ] Pilot feedback incorporated

### Gate 5 — Production
- [ ] Monitoring operational
- [ ] Backup/recovery tested
- [ ] Model rollback tested
- [ ] Clinical governance sign-off completed
