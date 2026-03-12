# Data Model & ERD

## 1. Purpose
Capture the canonical data structures that power the Agentic AI E-Commerce platform, mirroring the Prisma schema so all downstream docs and code stay consistent.

## 2. Overview
- **Database**: SQLite (file-based) for workshop speed.
- **ORM**: Prisma provides schema-as-documentation, migrations, and type-safe client.
- **Entities**: Users, products, offers, carts, cart items, orders, order items, audit logs.

## 3. Entity Descriptions
### 3.1 Users (`users`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | Auto-increment |
| name | String | Optional for guests |
| email | String | Unique except guest placeholders |
| password_hash | String | Bcrypt (10 rounds) |
| role | Enum (`admin`,`customer`,`guest`) | Drives RBAC |
| status | Enum (`active`,`inactive`) | Used for admin suspension |
| guest_ttl | DateTime? | Marks guest expiry (null for registered) |
| created_at | DateTime | default now() |

### 3.2 Products (`products`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| name | String |
| description | String |
| price | Float |
| stock | Int |
| image_url | String | External hosted image |
| is_active | Boolean | Soft delete flag |
| created_at / updated_at | DateTime |

### 3.3 Offers (`offers`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| title | String |
| description | String |
| discount_type | Enum (`percentage`,`fixed_amount`) |
| discount_value | Float |
| start_date / end_date | DateTime |
| is_active | Boolean |
| product_id | Int FK → products | Item-wise discounts only |

### 3.4 Carts (`carts`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| user_id | Int? FK → users | Nullable for guests |
| status | Enum (`active`,`converted`) |
| created_at | DateTime |

### 3.5 Cart Items (`cart_items`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| cart_id | Int FK → carts |
| product_id | Int FK → products |
| quantity | Int |
| unit_price_snapshot | Float | Captures price at add time |
| offer_applied | Boolean |
| discount_snapshot | Float? | Per-unit discount captured |

### 3.6 Orders (`orders`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| user_id | Int? FK → users | Null for guest checkout |
| guest_email | String? | Stored when `user_id` null |
| total_amount | Float |
| status | Enum (`Processing`,`Shipped`,`Delivered`) |
| shipping_address_json | String | Serialized JSON |
| payment_reference | String | Simulated token |
| placed_at / updated_at | DateTime |

### 3.7 Order Items (`order_items`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| order_id | Int FK → orders |
| product_id | Int FK → products |
| quantity | Int |
| unit_price_snapshot | Float |
| offer_snapshot_json | String? | JSON blob describing discount |

### 3.8 Audit Logs (`audit_logs`)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK |
| user_id | Int? FK → users | Admin performing action |
| action | String | e.g., `CREATE_PRODUCT` |
| entity_type | String |
| entity_id | Int? |
| metadata_json | String? | Before/after diff |
| created_at | DateTime |

## 4. Relationships Summary
- One `user` has many `carts`, `orders`, and `audit_logs`.
- One `cart` has many `cart_items`; each cart item references one `product`.
- One `order` has many `order_items`; each order item references one `product`.
- One `product` has many `offers`, `cart_items`, and `order_items`.

## 5. ER Diagram (Textual)
```
users (1) ──< carts (1) ──< cart_items >── (n) products
     \                               \
      \                               >── offers (n)
       \──< orders (1) ──< order_items >
        \
         \──< audit_logs
```

## 6. Data Lifecycle Notes
1. **Guests**: Created via `/api/auth/guest` with `role='guest'` and `guest_ttl`; upgraded to customer on registration.
2. **Cart Conversion**: Upon checkout confirmation, cart status flips to `converted`, order records created, cart items archived for reporting.
3. **Offers**: `is_active` flag and date window determine applicability; snapshots stored in cart/order items to preserve history.
4. **Audit Logs**: Captured for admin CRUD to support QA traceability.

## 7. Seed Data Overview
- 1 admin (`admin@zone24x7.com`, `admin123`).
- 1 customer (`john@example.com`, `customer123`).
- 8 demo products with image URLs.
- 4 item-level offers referencing select products.

## 8. Alignment & Traceability
- Matches Implementation Plan schema (§ Data Model) and Specification §7.
- Supports requirements REQ-001 through REQ-006; audit logs aid QA coverage.
