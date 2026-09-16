# Product Specifications

## Product

Small AI Healthcare Platform for Nigerian PHCs

## Primary Users

- Community Health Workers
- PHC clinical staff
- Patients
- LGA health administrators
- National health administrators

## Primary Channels

1. Android Standard Edge
2. USSD Extreme Edge
3. SMS Extreme Edge
4. LGA Edge Server
5. National Cloud/DHIS2

## Core Features

### 1. Offline CHW Triage

Input:

- symptoms;
- age;
- pregnancy status;
- gestational age;
- temperature;
- blood pressure;
- respiratory observations;
- RDT results;
- medications;
- relevant history.

Output:

- HIGH RISK;
- MEDIUM RISK;
- LOW RISK;
- INSUFFICIENT DATA;
- ESCALATE.

### 2. Paper Record Digitization

Workflow:

Patient → Consent → Camera → Auto Edge Detection → Capture →
Perspective Correction → PP-OCRv5 → Medical NER →
CHW Review/Edit → Save → Patient History

### 3. Patient History

Search and filter by:

- diagnosis;
- medication;
- date;
- PHC;
- patient.

Display:

- encounters;
- diagnoses;
- vitals;
- medications;
- tests;
- referrals;
- CHW corrections;
- timestamps.

### 4. USSD

Initial shortcode:

*599#

Primary menus:

1. Maternal Care
2. Child Health
3. Infectious Disease

USSD requirements:

- numeric interaction;
- 120-second session TTL;
- Redis session persistence;
- resume after dropout;
- concise clinical responses.

### 5. SMS

Example:

PREG 34WKS FEVER 38.5 HEADACHE BLURRY

Parser:

SMS → Keyword Parser → Structured Clinical Input →
Triage Engine → SMS Response

### 6. Voice

ASR support:

- Nigerian English;
- Hausa;
- Yoruba;
- Igbo;
- Nigerian Pidgin.

Low-confidence speech must trigger confirmation or text fallback.

### 7. GraphRAG

Knowledge entities:

- disease;
- drug;
- symptom;
- contraindication;
- treatment;
- alternative;
- demographic;
- co-infection.

Relations:

- treated_with;
- contraindicated_in;
- alternative_treatment;
- co_infection_with.

Sources:

- NCDC;
- WHO Nigeria;
- national clinical protocols;
- approved African medical datasets.

### 8. Synchronization

PouchDB ↔ CouchDB

Requirements:

- offline queue;
- automatic retry;
- bidirectional replication;
- conflict detection;
- deterministic conflict handling;
- synchronization audit trail.

### 9. National Analytics

DHIS2 integration shall support aggregated:

- triage volume;
- disease signals;
- maternal-risk signals;
- referral activity;
- LGA trends.

No national analytics workflow may expose unnecessary patient-level information.

## MVP Scope

The first production-oriented MVP includes:

- Android offline application;
- PouchDB;
- OCR;
- medical NER;
- patient history;
- consent;
- hybrid triage;
- GraphRAG;
- LGA Raspberry Pi edge server;
- CouchDB;
- FastAPI;
- Redis;
- USSD;
- SMS;
- core English-language workflow;
- security controls;
- validation suite.

## Phase-2 Scope

- Expanded Hausa/Yoruba/Igbo voice support;
- broader multilingual NLP;
- national DHIS2 integration;
- national analytics;
- automated model distribution;
- wider disease coverage;
- additional computer-vision models.

## Out of Scope for Initial Release

- Autonomous diagnosis without CHW/clinical oversight.
- Autonomous prescribing without approved protocol logic.
- Fully cloud-dependent inference.
- High-acuity emergency-room decision automation.
- Unvalidated medical imaging diagnosis.
- Marketing use of patient data.
- Research use of identifiable patient data without appropriate authorization.
- Replacement of national clinical protocols.
