# Change Log & Traceability Matrix

## 1. Purpose
Provide a single artifact that records requirement/design/code/test linkages and captures any modifications made after the initial scope approval for the Agentic AI E-Commerce workshop.

## 2. Traceability Matrix
| Requirement ID | Design/Doc Reference | Implementation Artifact | QA Coverage |
|----------------|----------------------|-------------------------|-------------|
| REQ-001 Catalog Browsing | `03-system-architecture.md` §2.2 Catalog Module, `04-data-model-and-erd.md` (products/offers) | Frontend catalog pages, `/api/products`, `/api/offers` | TC-001 |
| REQ-002 Offer Management | `02-dar.md` (item-wise decision), `04-data-model-and-erd.md` §3.3 | Admin offers page, `/api/offers` CRUD | TC-002 |
| REQ-003 Cart Management | `03-system-architecture.md` (Cart module), `04-data-model-and-erd.md` §3.4-3.5 | Zustand cart store, `/api/cart` endpoints | TC-003, TC-004 |
| REQ-004 Checkout | `05-api-specification.md` (Checkout), `03-system-architecture.md` §3 | React checkout page, `/api/checkout/*` | TC-005 |
| REQ-005 Order Tracking | `03-system-architecture.md` (Orders module), `04-data-model-and-erd.md` §3.6-3.7 | Orders pages, `/api/orders`, `/api/admin/orders` | TC-006, TC-007 |
| REQ-006 Authentication & RBAC | `02-dar.md` (JWT), `03-system-architecture.md` §4 | Auth controllers, middleware, frontend auth store | TC-008, TC-009 |
| REQ-007 Documentation Bundle | `01-scope-and-requirements.md` §4, this folder | Docs under `docs/documentation/`, Swagger `/api/docs` | TC-010 |

## 3. Change Log
| Date | Description | Impacted Docs | Owner |
|------|-------------|--------------|-------|
| 2026-03-12 | Initial documentation set (Scope, DAR, Architecture, Data Model, API Spec, AI Rules, QA Strategy, Deployment Plan, Demo Script, Change Log) created under `docs/documentation/`. | All | Documentation Engineer |
| (Add entries as changes occur) | | | |

## 4. Open Risks / Decisions Pending
| ID | Description | Status | Owner |
|----|-------------|--------|-------|
| R-01 | Guest checkout email verification policy pending clarification. | Open | BA Lead |
| R-02 | Admin analytics beyond metrics row not confirmed. | Open | Dev Lead |
| R-03 | Long-term guest persistence strategy (TTL vs. cleanup job). | Open | Dev/QA |

## 5. Change Control Process
1. Record change request with timestamp and rationale.
2. Identify affected requirement IDs and update matrix.
3. Update impacted documentation/file sections; reference commits or PRs if available.
4. Obtain approval from relevant role (BA/Dev/QA) before closing entry.

## 6. Versioning
- This document uses semantic versioning for the documentation package; start at `v1.0.0` upon first publication.
- Increment minor version for additive changes, patch for fixes; record version in the change log entry description.
