# System Architecture

## 1. Overview
The Agentic AI E-Commerce platform is a two-tier web application optimized for rapid prototyping during the Vibe Coding session. The architecture emphasizes clear separation between a React SPA frontend and an Express/Prisma backend, with SQLite as the persistence layer and OpenAPI as the shared contract.

## 2. Architectural Views
### 2.1 Context View
- **Actors**: Guest shopper, registered customer, admin user, QA reviewer.
- **Systems**: Frontend SPA (Vite + React + Zustand), Backend API (Node.js + Express + Prisma), SQLite database, Swagger/OpenAPI documentation endpoint.
- **External Integrations**: None; payment and notifications are simulated.

### 2.2 Logical Component View
| Component | Responsibilities | Key Dependencies |
|-----------|------------------|------------------|
| **Frontend Shell** | Routing, layout (sidebar + content), auth guards, responsive UI. | React Router v6, Zustand stores. |
| **Catalog Module** | Product grid, filtering, offer badges, product detail modal. | `/api/products`, `/api/offers`. |
| **Cart & Checkout Module** | Cart management, price calculation, checkout wizard. | `/api/cart`, `/api/checkout`. |
| **Orders Module** | Customer order history, admin order board, status updates. | `/api/orders`, `/api/admin/orders`. |
| **Admin Console** | CRUD for products/offers, dashboard metrics, audit insights. | `/api/products`, `/api/offers`, `/api/admin/metrics`. |
| **Auth Service** | Login/register/guest, token refresh, logout. | `/api/auth/*`, JWT helpers. |
| **Backend Controllers** | Encapsulate business logic per domain (auth, catalog, offers, cart, checkout, orders, admin). | Prisma client, Zod validators. |
| **Middleware Layer** | Auth guard, role enforcement, rate limiter, error handler. | Express middleware chain. |
| **Persistence Layer** | Prisma schema mapping to SQLite tables with migrations + seed data. | Prisma ORM, SQLite driver. |

### 2.3 Deployment View
```
┌──────────────────────────────────────────────────┐
│ Local Machine                                    │
│                                                  │
│  ┌─────────────┐        HTTP (REST + JWT)        │
│  │ React SPA   │  <───────────────────────────┐  │
│  │ (Vite dev)  │                              │  │
│  └─────────────┘                              │  │
│            ▲                                  ▼  │
│            │ WebSocket not used                │  │
│  ┌─────────────┐        Prisma ORM             │  │
│  │ Express API │  ──────────────────────────> │  │
│  │ (Node dev)  │                              │  │
│  └─────────────┘                              │  │
│            │                                  │  │
│            ▼                                  ▼  │
│        SQLite DB (file)                   Swagger UI│
└──────────────────────────────────────────────────┘
```
Docker Compose (optional) runs `frontend`, `backend`, and `sqlite` services on the same host network for simplified demo deploys.

## 3. Data Flow
1. **Authentication**: Frontend posts credentials/guest info to `/api/auth/*`. Backend validates via Prisma, issues JWT access token (stored in Zustand) and refresh cookie.
2. **Catalog Read**: SPA requests `/api/products` and `/api/offers` (public endpoints). Responses include offer metadata for badges.
3. **Cart Operations**: Authenticated (or guest) users hit `/api/cart` endpoints. Backend calculates totals, applies item-wise discounts, and persists cart items.
4. **Checkout**: Frontend calls `/api/checkout/preview` to validate totals, then `/api/checkout/confirm` to create orders, clear carts, and simulate payment reference generation.
5. **Order Management**: Customers call `/api/orders`; admins use `/api/admin/orders` and `/api/admin/metrics` with role guard.
6. **Documentation Access**: QA/Devs open `/api/docs` (Swagger UI) to reference OpenAPI spec.

## 4. Security Architecture
- JWT access tokens carried in Authorization headers; refresh tokens stored in httpOnly cookies.
- `auth` middleware validates tokens; `requireRole('admin')` ensures admin-only routes.
- Rate limiter caps auth attempts at 20 requests per 15 minutes per IP.
- Zod schemas validate incoming payloads to prevent malformed data.
- Prisma ensures parameterized queries; no raw SQL executed.

## 5. Operational Considerations
- **Logging**: Backend logs key events (auth failures, order placements, admin actions) and writes audit entries via `auditLog` utility.
- **Seed Data**: `prisma/seed.ts` injects baseline users, products, and offers to accelerate demos.
- **Error Handling**: Central Express error handler normalizes error responses for frontend consumption.
- **Performance**: SQLite is sufficient for workshop data volume; Prisma ensures efficient indexed queries.

## 6. Traceability
- REQ-001/REQ-002/REQ-003/REQ-004 map to Catalog, Offers, Cart/Checkout components.
- REQ-005 aligns with Orders Module + Admin Console.
- REQ-006 traces to Auth Service + middleware.
- REQ-007 (documentation) satisfied by this architecture doc plus other files in `docs/documentation/`.
