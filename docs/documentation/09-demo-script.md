# Client Demo Script

## 1. Goal
Deliver a 5-minute walkthrough proving that the Agentic AI E-Commerce prototype meets core shopper/admin flows and that documentation + AI-assisted process are production-ready.

## 2. Setup
- Backend running on `http://localhost:5000` with seeded data.
- Frontend running on `http://localhost:5173`.
- Browser tabs prepared: Catalog view (logged out), Admin dashboard (logged in as admin), Swagger UI.

## 3. Narrative Flow
| Time | Segment | Talking Points | Actions |
|------|---------|----------------|---------|
| 0:00 - 0:45 | Introduction | Introduce team roles, objective of Vibe Coding session, highlight Agentic AI collaboration. | Display documentation folder structure briefly. |
| 0:45 - 2:00 | Shopper Journey | Emphasize intuitive catalog, offers, cart, and guest/registered flows. | As guest, browse catalog, show offer badge, add product to cart, proceed to checkout, convert to registered account during flow. |
| 2:00 - 3:15 | Order Tracking | Stress persistence and transparency for customers. | Log in as seeded customer (`john@example.com`), show cart persistence, run checkout preview + confirm, view new order in Orders page. |
| 3:15 - 4:15 | Admin Control | Highlight governance, RBAC, audit logging. | Log in as admin, open dashboard metrics, edit product stock, update order status to "Shipped"; mention audit trail. |
| 4:15 - 4:45 | API & QA Confidence | Demonstrate documentation + testing readiness. | Show Swagger `/api/docs`, mention QA test suite mapping (TC-001..010). |
| 4:45 - 5:00 | Close | Summarize deliverables, next steps, invite questions. | Show change log snapshot and note future roadmap. |

## 4. Key Messages
1. **Parallel AI collaboration** kept BA/Dev/QA aligned via shared documentation.
2. **Core shopper/admin flows** (catalog, cart, checkout, order management) are fully functional.
3. **Security & governance** enforced through JWT, role-based navigation, and audit logs.
4. **Documentation artifacts** enable rapid onboarding and future handoffs.

## 5. Demo Tips
- Keep seeded credentials handy (admin/customer) to avoid delays.
- Pre-load catalog data to reduce wait time; mention SQLite + Prisma seed.
- If an error occurs, reference change log to show transparency and mitigation plan.
- Emphasize color palette and accessible UI cues when showcasing frontend.

## 6. Contingency Plan
| Risk | Mitigation |
|------|------------|
| Backend restart needed | Have terminal ready with `npm run dev`; mention AI tools can regenerate configs if needed. |
| Token expiry mid-demo | Trigger `/api/auth/refresh` via browser network tab or rerun login quickly. |
| Data inconsistency | Re-run `npm run seed` prior to demo; keep instructions in deployment plan. |

## 7. Traceability
- Satisfies Task Guide "Client Demo" deliverable and REQ-007 documentation requirement.
- Aligns storyline with requirements REQ-001..REQ-006 to ensure business coverage.
