# Business Requirement Document (BRD): AI-Enabled Clinical Decision Support for Nigerian Primary Health Care (PHC)

## 1. Executive Summary & Objectives

This BRD defines requirements for an AI-enabled clinical decision support (CDS) system designed for Nigeria’s Primary Health Care (PHC) network, with a focus on Community Health Workers (CHWs) and underserved facilities. The system will provide offline-capable triage and clinical guidance for common conditions (malaria, pneumonia, sepsis, pregnancy complications, child-health presentations), digitize paper-based patient records, and ground AI recommendations in authoritative Nigerian and global clinical guidance. [ncdc.gov](https://ncdc.gov.ng/)

The solution must operate reliably on Android (offline-first) and via USSD/SMS for feature-phone users, synchronize intermittently without blocking care, and integrate with national surveillance infrastructure (DHIS2) to support LGA and federal oversight.  The architecture is intended for pilot across three Local Government Areas (LGAs) with a path to scale toward a 774-LGA national model. [resolvetosavelives](https://resolvetosavelives.org/wp-content/uploads/2026/03/A-System-in-Transition_Nigeria-Country-Report_FINAL.pdf)

## 2. User Personas & Roles

| Persona | Primary Needs | Interaction Mode |
|---|---|---|
| Community Health Workers (CHWs) | Offline triage, patient-record digitization, clinical guidance, history lookup | Android app (offline), USSD/SMS fallback |
| PHC Clinical Staff | Structured patient information and decision-support context | Android app; web portal (when connected) |
| Patients | Accessible triage through Android, USSD, and SMS | USSD/SMS; assisted via CHW on Android |
| LGA Health Authorities | Aggregated operational and disease-surveillance information | DHIS2 dashboards; analytics layer |
| NPHCDA / FMoH | National surveillance, resource allocation, deployment oversight | DHIS2 national instance; analytics/surveillance layer |
| Clinical Reviewers | Validation of protocols, model outputs, synthetic test cases | Review portal; audit logs; guideline linkage |
| ML Engineers | Model training, QLoRA, calibration, quantization, evaluation | MLOps tooling; calibration datasets; evaluation pipelines |
| Security/Compliance Teams | NDPR controls, encryption, RBAC, retention, auditability | Admin console; audit trails; policy enforcement |
| Field Researchers | CHW usability, language and ASR validation | Field study tools; ASR test sets; usability metrics |
| Infrastructure Engineers | Edge-server deployment, synchronization, model updates | Device management; sync services; update orchestration |

The source explicitly notes field research involving 101 CHWs across six geopolitical zones and validation using a representative 500-case African calibration set. [iyawo](https://www.iyawo.org/)

## 3. Functional Requirements (Use a table format: Req ID, Description, System Action)

| Req ID | Description | System Action |
|---|---|---|
| FR-01 | The system SHALL provide offline triage for common conditions (malaria, pneumonia, sepsis, pregnancy complications, child-health presentations). | Execute rule-based and LLM-assisted triage workflows on-device without internet; cache protocols locally. |
| FR-02 | The system SHALL position AI as decision support and triage assistance, not autonomous diagnosis. | Present recommendations with protocol/guideline context and require human validation for clinical actions. |
| FR-03 | The system SHALL support Android core workflows offline and trigger synchronization when connectivity is intermittent. | Detect connectivity state; queue transactions; auto-retry sync upon reconnection without blocking care. |
| FR-04 | The system SHALL provide USSD/SMS access for feature-phone users. | Render numeric USSD menus and structured SMS syntax; maintain session state across network dropouts. |
| FR-05 | The system SHALL digitize fragmented paper-based patient information using on-device OCR and medical NER. | Capture images; run OCR; extract entities (diseases, drugs, symptoms, treatments); create structured patient records. |
| FR-06 | The system SHALL preserve longitudinal patient history across consultations and facilities where synchronization is available. | Merge patient records via unique identifiers; maintain timeline of encounters; resolve conflicts during sync. |
| FR-07 | The system SHALL ground AI recommendations in authoritative clinical guidance (NCDC, WHO Nigeria, national/African guidelines). | Build and query a GraphRAG knowledge layer; link each recommendation to source protocol/guideline IDs. |
| FR-08 | The system SHALL represent diseases, drugs, symptoms, contraindications, treatments, and co-infections as linked entities. | Maintain a clinical knowledge graph; support multi-hop reasoning (e.g., symptom → condition → contraindicated drug). |
| FR-09 | The system SHALL support Nigerian-accented English and progressively Hausa, Yoruba, Igbo, and Nigerian Pidgin via ASR. | Provide ASR models tuned to Nigerian accents/languages; fallback to numeric USSD/SMS where ASR is unavailable. |
| FR-10 | The system SHALL integrate with DHIS2 for national analytics/surveillance. | Map aggregated indicators to DHIS2 data elements; push periodic aggregates; support pull for dashboards. |
| FR-11 | The system SHALL support pilot deployment across three LGAs with architecture scalable to 774 LGAs. | Provide multi-tenant configuration; LGA-level rollout controls; monitoring per LGA. |
| FR-12 | The system SHALL enforce NDPR-compliant data protection, encryption, RBAC, retention, and auditability. | Encrypt data at rest/in transit; enforce role-based access; maintain tamper-evident audit logs; apply retention policies. |
| FR-13 | The system SHALL allow clinician validation of clinical vignettes and model outputs. | Provide review workflows; flag recommendations for validation; capture approvals/rejections. |
| FR-14 | The system SHALL support ML engineering workflows (QLoRA, calibration, quantization, evaluation). | Provide pipelines for model compression; run evaluations on the 500-case calibration set; track accuracy degradation. |
| FR-15 | The system SHALL automatically retry unsynchronized records when connectivity returns. | Queue failed syncs; implement exponential backoff; ensure idempotent retries. |

## 4. User Flow & Logic Breakdown (Step-by-step sequential flow)

### 4.1 Android Offline Triage Workflow (CHW)

1. CHW opens the Android app (offline mode enabled by default).  
2. CHW selects “New Triage” and chooses patient lookup or new patient creation.  
3. If new patient: CHW captures paper card/record via camera; system runs OCR and medical NER; CHW confirms extracted entities.  
4. CHW enters vitals and rapid diagnostic test (RDT) results via structured forms.  
5. System applies rule-based engines for well-defined protocols (vital-sign thresholds, RDT interpretation) and invokes LLM-assisted triage for ambiguous presentations. [arxiv](https://arxiv.org/pdf/2608.02310.pdf)
6. System presents triage recommendations with linked protocol/guideline citations (NCDC/WHO/national). [ncdc.gov](https://ncdc.gov.ng/)
7. CHW reviews recommendations; if required, escalates to PHC clinical staff or marks for clinician validation.  
8. System logs the encounter, recommendation, and guideline references to local storage and audit trail.  
9. When connectivity is detected, system synchronizes encounter data to central server and DHIS2 aggregates as applicable. [resolvetosavelives](https://resolvetosavelives.org/wp-content/uploads/2026/03/A-System-in-Transition_Nigeria-Country-Report_FINAL.pdf)

**Error/Conditional Paths**  
- If OCR confidence is low (e.g., handwriting), system flags fields for manual entry and records confidence scores.  
- If sync fails, system queues the record and retries automatically; CHW can continue care without interruption.  

### 4.2 USSD/SMS Triage Workflow (Feature-Phone)

1. User dials USSD code or sends structured SMS keyword to initiate triage.  
2. System presents numeric menu (e.g., 1=Child fever, 2=Pregnancy concern, 3=Breathing difficulty).  
3. User selects options; system collects minimal structured inputs (age group, key symptoms, pregnancy status).  
4. System applies rule-based triage and returns concise guidance via USSD/SMS with safety flags (e.g., “Refer to PHC immediately”).  
5. Session state is persisted to survive 2G/network dropout; user can resume via same USSD session or SMS thread.  

**Pending Clarification**  
- The script does not specify maximum USSD session length or fallback if USSD gateway is unavailable; this requires clarification with telecom partners.  

### 4.3 Patient Record Digitization & Longitudinal History

1. CHW captures paper documents (cards, prescriptions) via Android camera.  
2. System performs on-device OCR; medical NER extracts entities (drugs, doses, diagnoses, dates).  
3. System creates/updates structured patient record; links to unique patient ID.  
4. On sync, system merges records across facilities; resolves conflicts using timestamp and source priority rules.  
5. Longitudinal timeline is displayed to CHW/PHC staff for context in future encounters.  

**Pending Clarification**  
- Patient identity resolution strategy across facilities (e.g., national ID, phone number, biometric) is not specified and must be defined to avoid duplicate records.  

### 4.4 Guideline-Grounded Recommendation Generation (GraphRAG)

1. System queries GraphRAG layer with patient entities (symptoms, vitals, RDT results).  
2. Graph traversal identifies relevant diseases, contraindications, co-infections, and treatments linked in the knowledge graph.  
3. LLM generates triage narrative constrained by retrieved protocol nodes; each recommendation includes guideline IDs.  
4. Recommendations are logged with retrieval traces for auditability and clinical safety. [arxiv](https://arxiv.org/pdf/2608.02310.pdf)

### 4.5 National Analytics/Surveillance Integration (DHIS2)

1. System aggregates de-identified indicators (e.g., suspected malaria cases, referrals, RDT positivity) per LGA.  
2. On connectivity, system pushes aggregates to DHIS2 national instance. [resolvetosavelives](https://resolvetosavelives.org/wp-content/uploads/2026/03/A-System-in-Transition_Nigeria-Country-Report_FINAL.pdf)
3. LGA/FMoH dashboards consume DHIS2 data for surveillance and resource allocation. [afenet-journal](https://afenet-journal.org/10-37432-jieph-d-26-00214/)

## 5. Non-Functional Requirements & Constraints

| Category | Requirement |
|---|---|
| Availability | ≥99% of core Android workflows must be executable without internet. |
| OCR Accuracy | Target ~94–96% printed-text accuracy on entry-level Android; handwriting treated as lower-confidence. |
| OCR Latency | ≤2 seconds for standard 12MP captures on supported entry-level devices. |
| Model Compression | Clinical-task accuracy degradation <3% after INT8 quantization on the 500-case calibration set. |
| USSD Response | <10 seconds gateway-to-AI-to-user response time. |
| USSD Resilience | Session state must survive 2G/network dropout via persisted state. |
| Sync Reliability | Unsynchronized records must automatically retry when connectivity returns. |
| Clinical Safety | 100% of production clinical recommendations must identify applicable protocol/guideline context where available. |
| Security & Compliance | NDPR compliance; encryption at rest/in transit; RBAC; retention policies; tamper-evident audit logs. |
| Localization | Support Nigerian-accented English ASR; progressive support for Hausa, Yoruba, Igbo, Nigerian Pidgin; numeric USSD menus and structured SMS syntax. |
| Scalability | Pilot across three LGAs; architecture must support expansion to 774 LGAs. |
| Human-in-the-Loop | Clinician validation of clinical vignettes and outputs is mandatory; compliance/security review required. |

## 6. Assumptions, Risks, and Open Questions

### Assumptions
- CHWs have access to entry-level Android devices capable of on-device OCR and ASR.  
- National DHIS2 instance is available and can accept aggregated indicators from this system. [resolvetosavelives](https://resolvetosavelives.org/wp-content/uploads/2026/03/A-System-in-Transition_Nigeria-Country-Report_FINAL.pdf)
- NCDC/WHO/national guidelines are available in machine-readable form or can be curated into the GraphRAG layer. [ncdc.gov](https://ncdc.gov.ng/)
- Telecom partners can support USSD/SMS integration with <10s response targets.  

### Risks
- OCR accuracy on poor-quality paper or handwriting may reduce digitization reliability.  
- ASR performance across Nigerian languages may vary; misrecognition could impact triage quality.  
- Intermittent connectivity may delay surveillance reporting despite offline care continuity.  
- Patient identity resolution across facilities may lead to duplicate or fragmented records without a clear strategy.  
- Model compression may inadvertently affect edge-case clinical accuracy if calibration is insufficient.  

### Open Questions (Pending Clarification)
- **Patient Identity:** What unique identifier(s) will be used to resolve patients across facilities (national ID, phone, biometric, facility ID)?  
- **USSD Session Limits:** What are the maximum session length and timeout behaviors with the chosen USSD gateway?  
- **Guideline Curation:** Which specific NCDC/WHO/national documents will be ingested first, and who owns ongoing curation?  
- **Clinician Validation Workflow:** What is the SLA and escalation path when a recommendation requires clinician approval?  
- **Data Retention:** What are the exact NDPR-aligned retention periods for patient records and audit logs in this context?  

***

This BRD translates the provided script into actionable requirements while preserving the stated objectives, constraints, and success metrics. Where the script implies but does not fully specify logic (e.g., identity resolution, USSD session behavior), items are flagged for stakeholder clarification prior to build. [ncdc.gov](https://ncdc.gov.ng/)
