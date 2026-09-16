# Technical Architecture

## Architectural Pattern

Offline-first distributed healthcare platform with four execution layers:

1. Standard Edge — Android
2. Extreme Edge — USSD/SMS
3. LGA Edge — Raspberry Pi
4. National Cloud — DHIS2/analytics/model management

## High-Level Architecture

```text
                    ┌──────────────────────────┐
                    │     National Cloud       │
                    │                          │
                    │ DHIS2                    │
                    │ PostgreSQL               │
                    │ Superset                 │
                    │ Model Registry           │
                    │ S3 / Backup              │
                    └────────────┬─────────────┘
                                 │
                           intermittent
                              sync/API
                                 │
                    ┌────────────▼─────────────┐
                    │       LGA Edge            │
                    │ Raspberry Pi 4 / 4GB      │
                    │                           │
                    │ FastAPI                   │
                    │ CouchDB                   │
                    │ Redis                     │
                    │ GraphRAG                  │
                    │ Edge LLM                  │
                    └──────┬───────────┬────────┘
                           │           │
                    sync/API│           │gateway/API
                           │           │
             ┌─────────────▼───┐   ┌──▼──────────────┐
             │ Android Edge    │   │ USSD / SMS      │
             │                 │   │                 │
             │ React Native    │   │ RapidPro        │
             │ PouchDB         │   │ Termii/Africa's │
             │ OCR             │   │ Talking         │
             │ NER             │   │ Redis           │
             │ INT8 inference  │   │ parser          │
             │ ASR             │   └─────────────────┘
             └─────────────────┘
