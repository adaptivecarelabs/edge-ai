# Product Requirement Document (PRD): AI-Enabled Clinical Decision Support for Nigerian PHC (CHW Android App, USSD/SMS, OCR, GraphRAG)

## 1. Product Overview & Goals

This PRD specifies an offline-first clinical decision support product for Nigeria’s Primary Health Care (PHC) network, centered on Community Health Workers (CHWs) and feature-phone users. The product enables immediate triage without internet, digitizes paper records via on-device OCR, maintains longitudinal patient histories, and grounds AI recommendations in NCDC/WHO/national guidelines through a GraphRAG knowledge layer. [ncdc.gov](https://ncdc.gov.ng/)

The primary goals are to improve triage quality and safety at the edge, reduce dependence on connectivity, and contribute de-identified aggregates to national surveillance (DHIS2) while complying with NDPR and clinical safety constraints. 

## 2. User Personas & Target Audience

| Persona | Target Needs | Primary Channels |
|---|---|---|
| Community Health Workers (CHWs) | Offline triage, OCR digitization, patient history, guideline-grounded recommendations | Android app (offline-first) |
| Patients (feature-phone) | Accessible triage without smartphone/internet | USSD (*599#), structured SMS |
| PHC Clinical Staff | Structured records, decision-support context, audit trails | Android app; web (when connected) |
| LGA Health Administrators | Aggregated triage/disease trends for operations | DHIS2 dashboards; analytics |
| National Health Administrators (NPHCDA/FMoH) | Surveillance, resource allocation, oversight | DHIS2 national instance |
| Clinical Reviewers | Auditability of guideline entities/relationships used in answers | Review portal; audit logs |
| ML/Infrastructure Engineers | Model compression, calibration, edge deployment, sync reliability | MLOps; edge servers; sync services |

Field validation includes 101 CHWs across six geopolitical zones and a 500-case African calibration set for model evaluation. [ncdc.gov](https://www.ncdc.gov.ng/diseases/guidelines)

## 3. User Stories & Acceptance Criteria (Format as a table or list with Given/When/Then)

| ID | User Story | Acceptance Criteria (Given/When/Then) |
|---|---|---|
| US-01 | As a CHW, I want to enter patient symptoms, vitals, and test results offline so that I can receive immediate triage guidance without internet access. | **Given** the device is offline, **When** the CHW completes the triage form and submits, **Then** the system returns a risk category (HIGH/MEDIUM/LOW) with referral guidance within 3–8s and saves the encounter locally. |
| US-02 | As a CHW, I want the system to distinguish high-, medium-, and low-risk cases so that I know whether to refer immediately, within 24h, or provide home care. | **Given** valid inputs, **When** triage runs, **Then** output matches the documented model: HIGH RISK: Refer NOW; MEDIUM RISK: Refer within 24h; LOW RISK: Home care + follow-up. |
| US-03 | As a CHW, I want to photograph a paper medical record so that patient information is captured without manual transcription. | **Given** camera permissions, **When** the CHW captures a document, **Then** the app auto-detects edges, corrects perspective, runs OCR in ~1–2s, and presents structured fields for review. |
| US-04 | As a CHW, I want to review and correct OCR output so that handwriting/OCR errors do not become authoritative patient data. | **Given** OCR results, **When** the CHW edits any field, **Then** the corrected values are saved as authoritative and the original image can be optionally deleted post-extraction. |
| US-05 | As a CHW, I want to view a searchable patient timeline so that previous diagnoses, vitals, medications, and referrals inform the current consultation. | **Given** a selected patient, **When** the CHW opens History, **Then** a chronological timeline loads with filters (diagnosis, medication, date) and shows prior encounters. |
| US-06 | As a feature-phone user, I want to use USSD numeric menus so that I can access structured clinical triage without a smartphone or internet. | **Given** dialing *599#, **When** the user navigates menus (1 Maternal, 2 Child, 3 Infectious), **Then** the system returns concise risk/referral instructions within <10s. |
| US-07 | As a feature-phone user, I want to send structured SMS symptoms so that I can perform asynchronous triage. | **Given** SMS syntax (e.g., PREG 34WKS FEVER 38.5 HEADACHE BLURRY), **When** the parser processes keywords, **Then** variables are mapped and triage returns risk/referral guidance. |
| US-08 | As a USSD user, I want my session to resume after a dropped connection so that I do not have to restart the clinical questionnaire. | **Given** a session drop within 120s TTL, **When** the user re-enters USSD, **Then** state is restored and the questionnaire resumes from the last step. |
| US-09 | As a CHW, I want recommendations grounded in NCDC/WHO guidance so that the AI does not rely solely on generic medical-model knowledge. | **Given** a triage request, **When** GraphRAG retrieves guideline nodes, **Then** the recommendation includes linked protocol/guideline IDs and versions. |
| US-10 | As a clinical reviewer, I want to inspect guideline entities and relationships used for an answer so that clinical reasoning can be audited. | **Given** an encounter ID, **When** the reviewer opens the audit view, **Then** the system displays retrieved entities (disease, drug, symptom, contraindication) and relationships (treated_with, contraindicated_in, etc.). |
| US-11 | As an LGA health administrator, I want aggregated triage and disease information so that I can monitor local health trends and operational needs. | **Given** synced data, **When** the dashboard loads, **Then** LGA-level aggregates (e.g., suspected malaria, referrals) are visible with date filters. |
| US-12 | As a national health administrator, I want DHIS2 integration so that outputs contribute to national surveillance and resource-allocation workflows. | **Given** connectivity, **When** aggregates are pushed, **Then** DHIS2 national instance receives mapped data elements and displays them in standard dashboards. |

## 4. Functional Capabilities & Feature Requirements

### 4.1 Android Offline Application (FR-01)
- Run on Android 10+; support ~2GB RAM / 16GB storage devices.  
- Package AI models locally; execute triage offline.  
- Maintain local patient records using PouchDB; bidirectional sync with CouchDB when online.  
- Provide patient search, longitudinal history, and explicit sync status indicators. 

### 4.2 Clinical Triage Engine (FR-02)
- Hybrid pipeline: Patient Input → Rule-Based Pre-Filter → Confidence/Complexity Assessment → Quantized Medical LLM → GraphRAG Retrieval → Safety/Output Validation → Triage Recommendation.  
- Rule engine handles deterministic protocols (vitals, RDT, red flags); LLM handles complex multi-symptom reasoning with GraphRAG context. 

### 4.3 OCR Pipeline (FR-03)
- Camera capture with OpenCV edge detection; auto-capture on document boundary detection.  
- Perspective correction; PP-OCRv5 detection/recognition; rule-based medical NER.  
- Structured review/edit UI; optional deletion of source image post-extraction.  
- Extracted entities (minimum): patient name, DOB, diagnoses, ICD-10 codes, medications, vitals, lab/RDT results, pregnancy info, clinical actions/referrals. 

### 4.4 Patient History (FR-04)
- Chronological timeline per patient with: timestamp, PHC/LGA, diagnoses, vitals, medications, tests, AI triage result, CHW corrections, referral/action, consent metadata.  
- Support filtering by diagnosis, medication, and date.

### 4.5 USSD (FR-05)
- Initial flow: *599# → 1 Maternal Care, 2 Child Health, 3 Infectious Disease.  
- Numeric menus; state persistence; 120s session TTL; resume after dropout.  
- Invoke shared triage backend; return concise risk/referral instructions. 

### 4.6 SMS (FR-06)
- Structured syntax parser (e.g., PREG 34WKS FEVER 38.5 HEADACHE BLURRY).  
- Map keywords to clinical variables; pass through shared triage engine.

### 4.7 Multilingual Input (FR-07)
- Support Nigerian-accented English; progressive Hausa, Yoruba, Igbo, Nigerian Pidgin via ASR.  
- ASR exposes confidence scores; fallback to text input below threshold. [ncdc.gov](https://www.ncdc.gov.ng/diseases/guidelines)

### 4.8 GraphRAG Knowledge Base (FR-08)
- Entities: Disease, Drug, Symptom, Contraindication, Treatment, Alternative Treatment, Patient Demographic, Co-infection.  
- Relationships: treated_with, contraindicated_in, alternative_treatment, co_infection_with.  
- Construction: entity extraction, Leiden community detection, hierarchical summaries, graph embeddings. 

### 4.9 Synchronization (FR-09)
- Android PouchDB ↔ LGA CouchDB ↔ National Cloud/DHIS2.  
- Queue unsynced records; automatic retry; deterministic, auditable conflict handling. 

### 4.10 Consent & Privacy (FR-10)
- Before OCR/scanning: obtain patient consent; record timestamp and CHW identity; attach consent to patient record.  
- Enforce data minimization, purpose limitation, six-year retention, encryption, and patient correction/deletion workflows. 

## 5. UI/UX & Interaction Requirements (List required screens, buttons, and system states)

### 5.1 Required Screens (Android)
- **Home/Dashboard**: Sync status badge; quick actions (New Triage, Scan Record, Patient Search).  
- **New Triage Form**: Sections for symptoms, vitals, RDT/results; submit button; loading state (3–8s); result screen with risk category and guideline citations.  
- **Scan Record (OCR)**: Camera viewfinder with edge-detection overlay; auto-capture indicator; preview with perspective correction; structured fields for review/edit; save/cancel; optional “Delete image after extract” toggle.  
- **Patient Profile & Timeline**: Search bar; timeline list with filters (diagnosis, medication, date); encounter detail view (diagnoses, vitals, meds, tests, AI result, corrections, referral, consent metadata).  
- **Sync Status & Settings**: Manual sync trigger; last sync timestamp; error state with retry; version info (model, guidelines).  
- **Consent Capture**: Checkbox + timestamp; CHW ID auto-filled; patient ID linkage; immutable audit entry.

### 5.2 USSD/SMS States
- **USSD Menu States**: Root menu → Category menu → Symptom/vitals prompts → Risk result screen.  
- **Session Persistence**: Store last menu step and inputs; resume on re-entry within 120s TTL.  
- **SMS Parser States**: Received SMS → keyword mapping → variable validation → triage execution → response SMS.

### 5.3 System States & Transitions
- **Offline Mode**: All core forms enabled; sync badge shows “Offline”; submissions save locally.  
- **Online Mode**: Sync badge shows “Synced” or “Syncing…”; background replication active.  
- **Loading States**: Triage inference (3–8s); OCR processing (~1–2s); USSD response (<10s).  
- **Error States**: OCR low confidence (flag fields for manual entry); sync failure (queue + retry); USSD dropout (resume); ASR low confidence (fallback to text).  
- **Safety Escalation**: Low-confidence or unsupported cases produce safe escalation/referral path; deterministic rules take precedence for supported protocols.

## 6. Technical Assumptions, Dependencies, & Risks

### Assumptions
- Entry-level Android devices can run PP-OCRv5 and quantized LLM inference within target latencies.  
- NCDC/WHO/national guidelines are available for curation into GraphRAG. [ncdc.gov](https://ncdc.gov.ng/)
- DHIS2 national instance is operational and can accept mapped aggregates.   
- Telecom partners support USSD (*599#) with <10s response and session persistence.  

### Dependencies
- **OCR/NER**: PP-OCRv5/LiteRT, OpenCV, medical lexicons, ICD-10 mappings.  
- **Triage Backend**: Rule engine, INT8 quantized medical LLM, GraphRAG retrieval API, safety validator.  
- **Sync**: PouchDB (Android), CouchDB (LGA edge), replication with conflict resolution.  
- **Edge Server**: Raspberry Pi 4 (4GB RAM, 32GB SD), Ubuntu 22.04 LTS, Docker, FastAPI, Redis, GraphRAG, edge inference.  
- **USSD/SMS**: RapidPro (USSD), SMS gateway, Redis session store, FastAPI integration.  
- **National Integration**: DHIS2 ingestion, PostgreSQL/Superset analytics, operational dashboards.  

### Risks
- OCR accuracy on poor-quality paper/handwriting may reduce data quality.  
- ASR performance across Nigerian languages may vary; misrecognition could impact triage.  
- Model compression may affect edge-case clinical accuracy if calibration is insufficient.  
- Sync conflicts across facilities may require complex resolution rules.  
- USSD session limits or gateway outages could disrupt feature-phone triage.  

## 7. Open Questions & Missing Edge Cases

- **Patient Identity Resolution**: What unique identifier(s) will be used across facilities (national ID, phone, biometric, facility ID) to avoid duplicates?  
- **Guideline Curation Ownership**: Which team owns ongoing ingestion/versioning of NCDC/WHO/national guidelines into GraphRAG?  
- **Clinician Validation Workflow**: What is the SLA and escalation path when a recommendation requires clinician approval before action?  
- **Data Retention Enforcement**: How are six-year retention and deletion workflows enforced technically across local, edge, and national stores?  
- **USSD Session Behavior**: Exact timeout behaviors, maximum menu depth, and fallback if USSD gateway is unavailable require confirmation with telecom partners.  
- **ASR Fallback UX**: When ASR confidence is below threshold, what is the exact text-input fallback flow on Android vs. feature-phone constraints?  
- **Conflict Resolution Rules**: What deterministic rules (timestamp, source priority, CHW override) govern record conflicts during sync?  

***

This PRD translates the script into explicit, build-ready product requirements with clear states, inputs/outputs, and dependencies. Where the script implies but does not fully specify behavior (e.g., identity resolution, USSD gateway constraints), items are flagged for stakeholder clarification prior to implementation. [ncdc.gov](https://ncdc.gov.ng/)
