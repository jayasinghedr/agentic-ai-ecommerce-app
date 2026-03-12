# Agentic AI E-Commerce Test Suite Plan

This plan enumerates the layered QA strategy, detailed happy- and negative-path test cases (including reversible flows), data inputs, verification steps, tooling, and final reporting template for the Agentic AI E-Commerce application.

## 1. Scope & Objectives
- Cover shopper, guest, and admin journeys defined in the specification: catalog/offer browsing, cart + checkout, order tracking, and admin CRUD with role-based access (@docs/specification.md#31-112).
- Align with the confirmed implementation stack (React + Zustand frontend, Express + Prisma backend, SQLite DB, Swagger OpenAPI) to ensure tests reflect actual architecture (@docs/implementation-plan.md#23-325).
- Validate both positive journeys (core business flows) and resilience scenarios (auth failures, validation errors, role/ACL breaches, inactive entities) without inventing features.

## 2. Test Architecture & Methods
### 2.1 Layers & Frameworks
| Layer | Focus | Framework / Tooling |
| --- | --- | --- |
| Backend unit | Helpers (JWT, password hashing) | Jest (@backend/jest.config.js) + ts-jest |
| Backend integration | REST endpoints via Express + Prisma | Jest + Supertest hitting `/api/*` (@backend/src/app.ts#21-83) |
| Frontend component | React components, Zustand stores, hooks | Vitest + React Testing Library + MSW for API stubs (@frontend/src/App.tsx#1-53) |
| End-to-end (E2E) | Full flows across FE/BE, JWT/refresh cookies, SQLite seed | Playwright (preferred) or Cypress; reuse seed data (@docs/implementation-plan.md#300-324) |
| Contract & schema | OpenAPI alignment | Swagger-generated schemas via `swagger-jsdoc` (@backend/src/app.ts#31-56) validated with `openapi-schema-validator` |

### 2.2 Environment & Data
- **Local DEV**: `npm run dev` targets `http://localhost:5000` (backend) + `5173` (frontend); CORS already wired for integration tests (@docs/implementation-plan.md#300-324).
- **Database**: SQLite via Prisma; run `npx prisma migrate dev --name init` then `npm run seed` to populate admin/customer demo users, products, offers (@docs/implementation-plan.md#290-312).
- **Auth Fixtures**: Use seeded accounts (admin/customer) plus `/api/auth/guest` for ephemeral guest tokens (@docs/implementation-plan.md#290-295; @backend/src/controllers/auth.controller.ts#30-190).
- **State Reset**: Each integration/E2E suite truncates tables via Prisma before run or uses transactions for isolation.

### 2.3 Test Data Handling
- Store reusable payloads (products, offers, cart items) under `test-pravindu/fixtures/` (future work) referencing actual schema fields (@docs/implementation-plan.md#118-206).
- Capture JWT + refresh cookie flows via Supertest/Playwright context storage to simulate role-specific navigation.

## 3. Test Case Inventory
Each case lists the input/flow, validation, and layer/framework where it executes.

### 3.1 Happy-Path Scenarios (10)
| ID | Scenario | Input & Flow | Expected Output / Verification | Method / Framework |
| --- | --- | --- | --- | --- |
| HP-01 | Customer registration | POST `/api/auth/register` with valid name/email/password (@backend/src/controllers/auth.controller.ts#30-67) | 201 response, JWT issued, refresh cookie set, user role `customer` | Jest + Supertest |
| HP-02 | Customer login + refresh | POST `/api/auth/login`, then `/api/auth/refresh` using cookie | 200 response, new access token, status `active` enforced | Jest + Supertest |
| HP-03 | Guest browsing & catalog search | Visit `/catalog`, trigger search query | Product grid lists active items w/ offers badge when applicable (@docs/specification.md#39-44) | Playwright |
| HP-04 | Cart persistence | Auth customer adds product via `/api/cart/items`, reloads `/cart` | DB stores cart items, subtotal matches API response (@docs/specification.md#41-44) | Playwright + backend verification |
| HP-05 | Checkout confirmation | `/checkout` form with shipping info → POST `/api/checkout/confirm` | Order created w/ `Processing` status, cart cleared (@docs/specification.md#45-47; @backend/src/controllers/orders?) | Playwright |
| HP-06 | Order history view | Auth customer visits `/orders` list & detail page | Orders API returns seeded + new order; UI shows status badges | Playwright + RTL snapshot |
| HP-07 | Admin product CRUD | Admin logs in, POST `/api/products`, then PATCH price | Responses 201 + 200, audit log entries recorded, product visible in admin list (@backend/src/controllers/products.controller.ts#91-168) | Jest + Supertest |
| HP-08 | Admin offer lifecycle | Admin creates offer linked to product via `/api/offers`, verifies shopper catalog highlight | Offer appears in admin listing and shopper UI badge applies discount | Supertest + Playwright |
| HP-09 | Admin order status update | PATCH `/api/admin/orders/:id/status` from Processing→Shipped | Order status updates, customer view reflects change (@docs/specification.md#45-48) | Supertest + Playwright |
| HP-10 | Admin metrics dashboard | GET `/api/admin/metrics`; UI renders totals row | Counts align with current DB snapshot (orders/products/offers/revenue) (@docs/implementation-plan.md#21-107) | Jest + Supertest + RTL |

### 3.2 Negative-Path Scenarios (10)
| ID | Scenario | Input & Flow | Expected Output / Verification | Method / Framework |
| --- | --- | --- | --- | --- |
| NP-01 | Registration validation | POST `/api/auth/register` with invalid email/short password | 400 error with Zod validation details (@backend/src/controllers/auth.controller.ts#19-41) | Jest + Supertest |
| NP-02 | Login inactive user | Attempt login with user `status !== active` | 401 `Invalid credentials` (@backend/src/controllers/auth.controller.ts#83-107) | Jest + Supertest |
| NP-03 | Expired/invalid refresh token | Call `/api/auth/refresh` without cookie or with tampered token | 401 error `Refresh token not found/Invalid` (@backend/src/controllers/auth.controller.ts#144-183) | Jest + Supertest |
| NP-04 | Unauthorized cart access | Guest (no JWT) calls `/api/cart` | 401 from auth middleware; ensure rate limiter not triggered | Jest + Supertest |
| NP-05 | Role enforcement on admin routes | Customer attempts `/api/admin/orders` | 403 Forbidden from role guard (@docs/specification.md#35-38) | Jest + Supertest |
| NP-06 | Product validation failure | Admin POST `/api/products` missing price / invalid URL | 400 validation error from Zod schema (@backend/src/controllers/products.controller.ts#6-16) | Jest + Supertest |
| NP-07 | Offer outside validity window | Create offer with `start_date > end_date`; attempt to fetch | Offer creation rejected or absent from shopper view since filter excludes invalid window (@backend/src/controllers/products.controller.ts#41-55) | Supertest + Playwright |
| NP-08 | Checkout w/ inactive cart item | Deactivate product then attempt checkout; ensure flow blocked | API rejects with error, instructing user to remove inactive item | Playwright + Supertest |
| NP-09 | Rate limiting & brute force | Exceed `/api/auth/login` requests beyond threshold | 429 response per middleware (rate limiter) | Jest + Supertest |
| NP-10 | Reversible flow fail-safe | Admin deactivates product via DELETE (isActive=false) then attempts shopper view; should be hidden. Reactivate by PATCH `isActive=true`, ensure product returns; log attempts where reactivation is missing to ensure detection | Playwright + Supertest verifying both states; audit log consulted | Playwright + Supertest |

## 4. Reversible Flow Coverage
- **Product activation toggles**: Use `adminListProducts` + `updateProduct` to switch `isActive` flag; confirm deactivated items disappear from public catalog and reappear when reactivated (@backend/src/controllers/products.controller.ts#113-168).
- **Guest-to-customer conversion**: Future test (beyond initial 10) ensures guest-created cart survives registration by verifying cart reassignment via `/api/auth/register` while guest token active (@docs/specification.md#33-44).

## 5. Test Execution Flow
1. **Setup**: Install dependencies, run migrations & seed data, start backend/frontend dev servers where applicable (@docs/implementation-plan.md#300-324).
2. **Backend Suites**: Run `npm run test` inside `backend/` for Jest + Supertest; capture coverage thresholds (e.g., 80% statements) and fail CI if unmet.
3. **Frontend Suites**: `npm run test` in `frontend/` for Vitest; use MSW to stub backend responses; snapshot critical components.
4. **E2E Suites**: `npx playwright test` (or `npx cypress run`) referencing `.env` URLs; store screenshots/videos for failure cases.
5. **Contract Tests**: Validate `swaggerSpec` JSON vs responses to ensure schema drift detection.

## 6. Final QA Report Template
```
# QA Execution Report – <Date>

## Summary
- Scope of build tested, environment, commit hash.

## Test Matrix
| Suite | Cases Run | Pass | Fail | Blocked | Notes |

## Defect Log
| ID | Severity | Area | Steps to Reproduce | Expected vs Actual | Evidence |

## Reversible Flow Checklist
- Product deactivate/reactivate verified? (Y/N)
- Offer activation window enforced? (Y/N)

## Evidence Links
- Jest/Vitest coverage reports
- Playwright videos & screenshots
- Logs (backend, audit)
```

Artifacts (test logs, coverage, screenshots) live under `test-pravindu/artifacts/<date>/` for traceability.
