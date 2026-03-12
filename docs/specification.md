# Agentic AI E-Commerce Application Specification

## 1. Executive Summary
- **Client**: Zone24x7
- **Domain**: E-commerce web platform focused on catalog browsing, offers, carts, checkout, and order tracking.
- **Timeline**: 90-minute Vibe Coding session with parallel BA/Dev/QA collaboration, leveraging Agentic AI.
- **Objective**: Deliver a workable prototype plus documentation artifacts (requirements, design, DB schema, API spec, testing assets, deployment plan, demo script).

## 2. Scope, Goals, and Non-Goals
### In Scope
1. Product catalog browsing for shoppers (guest + registered) with admin-managed CRUD operations.
2. Offers & promotions listing maintained via admin portal.
3. Shopping cart with per-user (or guest session) persistence and checkout confirmation (simulated payment).
4. Order placement and status tracking (Processing → Shipped → Delivered) for customers.
5. Authentication with login/logout, optional guest browsing that can escalate into user accounts.
6. Role-based access control with dedicated admin portal (side navigation entry) for catalog/offer/order management.
7. Documentation artifacts: Scope, DAR, design, DB schema, OpenAPI spec, deployment plan, QA assets.

### Explicitly Out of Scope (Future Roadmap)
- AI-driven recommendations, loyalty programs, real-time supplier sync, third-party logistics/marketing integrations, subscription tiers, actual payment gateway integration.

## 3. Stakeholders & Roles
| Role | Description | Capabilities |
| --- | --- | --- |
| **Guest Shopper** | Unauthenticated visitor | Browse catalog/offers, build cart, checkout as guest (capture contact/shipping), convert to registered account. |
| **Registered Customer** | Authenticated user | All guest capabilities + saved carts, order history, profile management. |
| **Admin** | Internal staff | Manage products, offers, inventory, monitor orders, update order statuses, view audit logs. |
| **System** | Backend services | Persist data, enforce security, trigger status transitions, expose APIs. |

## 4. Functional Requirements
1. **Authentication & Session Management**
   - React frontend + Express backend with JWT auth (access + refresh tokens). Bcrypt-hashed passwords.
   - Guest mode supported through signed httpOnly cookie linked to a transient guest record; carts persist until checkout or conversion.
   - Role claim determines UI navigation and API access.
2. **Admin Portal**
   - Protected route section reachable only by `admin` role; includes catalog CRUD, offer management, order status updates.
   - Side navigation differentiates admin vs. shopper sections; admin palette adheres to red/black/gray/white brand set.
3. **Catalog & Offers**
   - List/search/filter products (name, price, stock, imagery/description fields).
   - Associate promotional tags/discounts and highlight them in shopper UI.
4. **Cart & Checkout**
   - Add/remove/update quantity; persistent per user/guest via DB.
   - Display subtotal, applied offers, estimated total.
   - Checkout flow collects shipping info, simulates payment confirmation, creates order.
5. **Order Tracking**
   - Customers view past orders and current status.
   - Admin updates statuses (Processing, Shipped, Delivered) with optional notes.
6. **User Management (Optional Enhancement)**
   - Admin can invite/create users, reset credentials; basic profile editing for customers.
7. **Documentation Deliverables**
   - Scope & Requirements doc, DAR, Architecture/design, ERD, OpenAPI spec, QA plan/test cases, deployment plan (Docker Compose optional), demo script.

## 5. System Architecture Overview
- **Frontend**: React SPA, React Router for navigation, Context/Redux (or Zustand) for auth/cart state. Styling guided by red/black/gray/white palette, ensuring accessible contrast.
- **Backend**: Node.js + Express.js providing REST APIs, authentication middleware, SQLite persistence via an ORM (e.g., Prisma/Sequelize/Knex) or direct queries.
- **Database**: SQLite local DB for workshop; tables described in Section 7.
- **API Contract**: RESTful JSON APIs documented via OpenAPI 3.0 for LLM handoff and Postman import.
- **Deployment**: Local run scripts + optional Docker Compose (Node service + SQLite volume + frontend build served via Vite dev server or static host).

## 6. Application Modules
1. **Frontend Shell**: Side navigation, layout switching based on role, login/guest entry points.
2. **Catalog Module**: Product grids/cards, details drawer, offer badges.
3. **Cart Module**: Persistent cart view, mini-cart indicator, checkout wizard.
4. **Orders Module**: Customer order list + details; admin order board with status controls.
5. **Admin Console**: CRUD screens for products/offers (forms with validation), stock adjustments, audit table.
6. **Auth Module**: Login/register/guest convert flows, token refresh handling, secure storage.

## 7. Data Model (SQLite)
- `users` (id, name, email, password_hash, role enum `['admin','customer','guest']`, status, created_at).
- `guest_sessions` (id, session_token, expires_at) *optional; may be merged into users if transient rows acceptable*.
- `products` (id, name, description, price, stock, image_url, is_active, created_at, updated_at).
- `offers` (id, title, description, discount_type, discount_value, start_date, end_date, is_active, product_id nullable for global offers).
- `carts` (id, user_id nullable, guest_session_id nullable, status `['active','converted']`).
- `cart_items` (id, cart_id, product_id, quantity, unit_price_snapshot, offer_applied boolean, created_at).
- `orders` (id, user_id nullable, guest_email, total_amount, status enum, placed_at, updated_at, shipping_address_json).
- `order_items` (id, order_id, product_id, quantity, unit_price_snapshot, offer_snapshot_json).
- `audit_logs` (id, user_id, action, entity_type, entity_id, metadata_json, created_at) for admin actions.

## 8. API Surface (High-Level)
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/guest`, `/api/auth/refresh`, `/api/auth/logout`.
- **Catalog**: `/api/products` (GET public, POST/PATCH/DELETE admin), `/api/offers` similar structure.
- **Cart**: `/api/cart` (GET current), `/api/cart/items` (POST add, PATCH quantity, DELETE item).
- **Checkout**: `/api/checkout/preview`, `/api/checkout/confirm` (creates order, simulates payment).
- **Orders**: `/api/orders` (customer list), `/api/orders/:id` (customer view), `/api/admin/orders` (admin list/update).
- **Admin Utilities**: `/api/admin/users`, `/api/admin/metrics` (optional) guarded by role middleware.
- All endpoints documented in OpenAPI 3.0 with schemas for request/response, auth requirements, and example payloads for LLM ingestion.

## 9. Security & Compliance
- JWT access tokens stored in memory; refresh tokens in httpOnly cookie to reduce XSS risk.
- Rate-limiting middleware on auth endpoints.
- Input validation via zod/joi/yup on backend plus defensive checks on frontend forms.
- CORS configured for local dev origins.
- Audit logging for admin actions; changes capture who/what/when to aid QA review.

## 10. UX & Visual Guidelines
- Primary palette: **Red (#C62828)**, **Black (#111111)**, **Dark Gray (#424242)**, **Light Gray (#F5F5F5)**, **White (#FFFFFF)**.
- Typography: Select a purposeful font (e.g., Poppins or Source Sans 3) to avoid generic system look.
- Layout: Side navigation with collapsible sections, responsive grid for catalog, admin tables with filters.
- Accessibility: Target WCAG AA contrast, focus states, ARIA labels for navigation and forms.

## 11. Non-Functional Requirements
- **Performance**: Sub-second API responses for core flows given small dataset.
- **Scalability (future)**: Architecture should be extensible to other databases and service integrations.
- **Reliability**: Basic error handling surfaced to UI; retries for transient DB errors.
- **Observability**: Console/server logs capturing major events (auth failures, order placement, admin edits).

## 12. Testing Strategy
- **Unit Tests**: Backend services/utilities (auth helpers, cart calculations). Frontend component/unit tests for critical forms.
- **Integration Tests**: API tests covering auth, cart, checkout (can be Postman/newman or Jest supertest).
- **Manual QA**: Test design + cases verifying guest vs. registered flows, admin restrictions, order status updates.
- **Demo Readiness**: Script highlighting login, catalog browse, cart persistence, simulated checkout, admin status update.

## 13. Deployment & Local Dev
- Provide npm scripts for backend (`dev`, `test`, `migrate`) and frontend (`dev`, `build`).
- Optional Docker Compose: services for `frontend`, `backend`, `sqlite` (volume). Document env variables (PORT, JWT_SECRET, DB_PATH).
- Include setup steps in docs for LLM to automate environment provisioning.

## 14. Constraints & Assumptions
1. Session limited to 90 minutes—prioritize core flows before stretch features.
2. SQLite suffices for demo; future migrations to cloud DB expected but not implemented now.
3. Payment is simulated; store a `payment_reference` string generated server-side.
4. Guest flow must be seamless; no forced registration until user chooses.
5. All documentation and specs reside in `agentic-ai-ecommerce-app/docs` for easy AI ingestion.
6. LLM consumers require explicit context, so include clarifications, constraints, and palette info directly in prompts.

## 15. Clarifications Captured
1. Frontend stack: **React**.
2. Admin role required with portal for catalog management.
3. Offers maintained manually through admin UI.
4. Carts stored per user (or guest session) in DB.
5. Checkout simulates payment; no gateway integration.
6. Order statuses limited to Processing/Shipped/Delivered.
7. Color palette limited to Red/Black/Grey/White.
8. Guest mode + user mode both supported; guests can convert.
9. API must include **OpenAPI** documentation.
10. Focus on core functionality for demo (MVP-first mindset).

## 16. Open Items / Risks
- Confirm whether guest checkout requires email verification before order submission.
- Determine if admin needs analytics dashboard or basic totals only.
- Clarify persistence approach for guest records (ephemeral table vs. `users` with flag) before implementation.

---
This specification is structured for LLM consumption: each section provides the contextual grounding, constraints, and precise requirements needed to prompt downstream models for code, documentation, or testing assets.
