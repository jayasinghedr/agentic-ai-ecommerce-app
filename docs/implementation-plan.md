# Agentic AI E-Commerce — Finalized Implementation Plan

## Confirmed Decisions

| # | Topic | Decision |
|---|-------|----------|
| 1 | ORM | **Prisma** — type-safe, schema-as-docs, SQLite support |
| 2 | State Management | **Zustand** — lightweight, minimal boilerplate |
| 3 | Guest Persistence | `users` table with `role = 'guest'` + `guest_ttl` timestamp |
| 4 | Product Images | External image URLs (no file upload) |
| 5 | Discounts | **Item-wise** — each offer is linked to a specific `product_id` |
| 6 | Discount Types | `percentage` or `fixed_amount` |
| 7 | Admin Metrics | Simple totals row: orders, products, active offers, revenue |
| 8 | Guest Email | Captured at checkout; no email verification |
| 9 | Demo Seed Data | Included — 1 admin, 1 customer, 8 products, 4 item offers |
| 10 | OpenAPI | `swagger-jsdoc` + Swagger UI served at `GET /api/docs` |
| 11 | Font | **Poppins** via Google Fonts |

---

## Project Structure

```
agentic-ai-ecommerce-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← Data model (8 tables)
│   │   └── seed.ts                ← Demo data
│   ├── src/
│   │   ├── config/index.ts        ← Env vars, JWT settings
│   │   ├── middleware/
│   │   │   ├── auth.ts            ← JWT verify + role guard
│   │   │   ├── errorHandler.ts    ← Global error handler
│   │   │   └── rateLimiter.ts     ← Auth rate limiting
│   │   ├── utils/
│   │   │   ├── jwt.ts             ← Token generation/verification
│   │   │   ├── password.ts        ← Bcrypt helpers
│   │   │   ├── prismaClient.ts    ← Shared Prisma instance
│   │   │   └── auditLog.ts        ← Audit log helper
│   │   ├── controllers/           ← Request handlers + business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── offers.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── checkout.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/                ← Express routers with Swagger JSDoc
│   │   │   ├── auth.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── offers.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── checkout.routes.ts
│   │   │   ├── orders.routes.ts
│   │   │   └── admin.routes.ts
│   │   └── app.ts                 ← Express app + Swagger UI
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts          ← Axios with JWT interceptor + refresh logic
│   │   ├── store/
│   │   │   ├── authStore.ts       ← Zustand: user, access token, guest mode
│   │   │   └── cartStore.ts       ← Zustand: items, count, totals
│   │   ├── types/index.ts         ← Shared TypeScript interfaces
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx     ← Shell: sidebar + main area
│   │   │   │   └── Sidebar.tsx    ← Role-aware nav (shopper vs admin palette)
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Input.tsx
│   │   │   └── ProtectedRoute.tsx ← Route guard by role
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── catalog/
│   │   │   │   ├── CatalogPage.tsx     ← Product grid, search, filter
│   │   │   │   └── ProductCard.tsx     ← Card with offer badge + discount price
│   │   │   ├── cart/
│   │   │   │   └── CartPage.tsx        ← Line items, discounts, totals
│   │   │   ├── checkout/
│   │   │   │   └── CheckoutPage.tsx    ← Shipping form + simulated payment
│   │   │   ├── orders/
│   │   │   │   ├── OrdersPage.tsx      ← Customer order list
│   │   │   │   └── OrderDetailPage.tsx ← Order detail + status badge
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx  ← Metrics row
│   │   │       ├── ProductsAdmin.tsx   ← CRUD table + form modal
│   │   │       ├── OffersAdmin.tsx     ← CRUD table + form modal
│   │   │       └── OrdersAdmin.tsx     ← Orders + status updater
│   │   ├── App.tsx                ← React Router v6 route config
│   │   └── main.tsx               ← Bootstrap + token refresh on load
│   ├── index.html                 ← Poppins font import
│   ├── tailwind.config.js         ← Brand palette + Poppins font
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── specification.md
│   ├── implementation-plan.md     ← This file
│   ├── domain.txt
│   └── task.txt
└── docker-compose.yml             ← Optional local deployment
```

---

## Data Model (SQLite via Prisma)

### `users`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | Auto-increment |
| name | String | |
| email | String | Unique |
| password_hash | String | Bcrypt |
| role | String | `admin` \| `customer` \| `guest` |
| status | String | `active` \| `inactive` |
| guest_ttl | DateTime? | Expiry for guest accounts |
| created_at | DateTime | |

### `products`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| name | String | |
| description | String | |
| price | Float | Base price |
| stock | Int | |
| image_url | String | External URL |
| is_active | Boolean | |
| created_at / updated_at | DateTime | |

### `offers` (item-wise discounts)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| title | String | |
| description | String | |
| discount_type | String | `percentage` \| `fixed_amount` |
| discount_value | Float | e.g., 20 for 20% or $20 off |
| start_date / end_date | DateTime | Offer validity window |
| is_active | Boolean | |
| product_id | Int FK → products | Item-wise — always linked to a product |

### `carts`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| user_id | Int? FK → users | Nullable; supports guest |
| status | String | `active` \| `converted` |

### `cart_items`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| cart_id | Int FK → carts | |
| product_id | Int FK → products | |
| quantity | Int | |
| unit_price_snapshot | Float | Price at time of add |
| offer_applied | Boolean | |
| discount_snapshot | Float? | Discount amount per unit |

### `orders`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| user_id | Int? FK → users | Null for guest |
| guest_email | String? | Captured at guest checkout |
| total_amount | Float | |
| status | String | `Processing` \| `Shipped` \| `Delivered` |
| shipping_address_json | String | JSON string |
| payment_reference | String | Simulated reference |
| placed_at / updated_at | DateTime | |

### `order_items`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| order_id | Int FK → orders | |
| product_id | Int FK → products | |
| quantity | Int | |
| unit_price_snapshot | Float | |
| offer_snapshot_json | String? | JSON snapshot of applied offer |

### `audit_logs`
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| user_id | Int? FK → users | Admin who performed action |
| action | String | e.g., `CREATE_PRODUCT` |
| entity_type | String | e.g., `product` |
| entity_id | Int? | |
| metadata_json | String? | JSON diff/payload |
| created_at | DateTime | |

---

## API Surface

### Auth — `/api/auth`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Register new customer |
| POST | `/login` | Public | Login, returns access token + sets refresh cookie |
| POST | `/guest` | Public | Create guest session |
| POST | `/refresh` | Cookie | Get new access token using refresh cookie |
| POST | `/logout` | Auth | Clear refresh cookie |

### Products — `/api/products`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | List products (search, filter) |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Admin | Create product |
| PATCH | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft-delete product |

### Offers — `/api/offers`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | List active offers |
| GET | `/:id` | Public | Get single offer |
| POST | `/` | Admin | Create item-wise offer |
| PATCH | `/:id` | Admin | Update offer |
| DELETE | `/:id` | Admin | Delete offer |

### Cart — `/api/cart`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Auth | Get current cart with discounts applied |
| POST | `/items` | Auth | Add item |
| PATCH | `/items/:id` | Auth | Update quantity |
| DELETE | `/items/:id` | Auth | Remove item |

### Checkout — `/api/checkout`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/preview` | Auth | Calculate totals + validate |
| POST | `/confirm` | Auth | Create order, clear cart, simulate payment |

### Orders — `/api/orders`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Auth | Customer's order list |
| GET | `/:id` | Auth | Customer's order detail |

### Admin — `/api/admin`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/metrics` | Admin | Totals: orders, products, offers, revenue |
| GET | `/orders` | Admin | All orders |
| PATCH | `/orders/:id/status` | Admin | Update order status + notes |
| GET | `/users` | Admin | List all users |

---

## Security Notes
- Access tokens: stored in **Zustand memory** (lost on refresh, re-obtained via silent refresh)
- Refresh tokens: stored in **httpOnly cookie** (7-day expiry)
- On app load, frontend calls `/api/auth/refresh` to restore session
- All admin routes guarded by `requireRole('admin')` middleware
- Input validation via **Zod** on all POST/PATCH endpoints
- Passwords hashed with **bcrypt** (10 rounds)
- Rate limiting on auth endpoints (20 req / 15 min)

---

## Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Red | `#C62828` | Buttons, badges, highlights, offer tags |
| Black | `#111111` | Admin sidebar background, headings |
| Dark Gray | `#424242` | Secondary text, borders, admin text |
| Light Gray | `#F5F5F5` | Page backgrounds |
| White | `#FFFFFF` | Cards, modals, forms |

---

## Demo Seed Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@zone24x7.com` | `admin123` |
| Customer | `john@example.com` | `customer123` |

---

## Running Locally

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev        # runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # runs on http://localhost:5173

# OpenAPI docs
open http://localhost:5000/api/docs
```

---

## Docker Compose (Optional)
```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```
