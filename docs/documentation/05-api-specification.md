# API Specification Overview

## 1. Purpose
Summarize the REST API surface for the Agentic AI E-Commerce backend so developers, QA, and AI agents can reason about request/response contracts without reopening Swagger UI.

## 2. Standards
- **Protocol**: HTTPS/HTTP JSON APIs.
- **Auth**: Bearer JWT in `Authorization` header; refresh token in httpOnly cookie.
- **Documentation Source**: Auto-generated OpenAPI 3.0 via `swagger-jsdoc` accessible at `GET /api/docs`.
- **Error Format**: `{ "message": string, "details?": object }` with standard HTTP status codes.
- **Validation**: Request payloads validated via Zod; validation errors return 400 with detail array.

## 3. Endpoint Matrix
| Domain | Method | Path | Access | Description |
|--------|--------|------|--------|-------------|
| Auth | POST | `/api/auth/register` | Public | Register customer; returns tokens + profile. |
| Auth | POST | `/api/auth/login` | Public | Authenticate user; issues access token + refresh cookie. |
| Auth | POST | `/api/auth/guest` | Public | Create guest user/session with TTL. |
| Auth | POST | `/api/auth/refresh` | Refresh cookie | Rotate access token. |
| Auth | POST | `/api/auth/logout` | Auth | Revoke refresh cookie. |
| Products | GET | `/api/products` | Public | List/search products; query params for search, price, stock. |
| Products | GET | `/api/products/:id` | Public | Fetch single product with offer summary. |
| Products | POST | `/api/products` | Admin | Create product (name, description, price, stock, image_url). |
| Products | PATCH | `/api/products/:id` | Admin | Update mutable fields; partial updates allowed. |
| Products | DELETE | `/api/products/:id` | Admin | Soft delete (sets `is_active=false`). |
| Offers | GET | `/api/offers` | Public | List active offers. |
| Offers | GET | `/api/offers/:id` | Public | Offer detail with linked product. |
| Offers | POST | `/api/offers` | Admin | Create item-wise discount. |
| Offers | PATCH | `/api/offers/:id` | Admin | Update metadata or dates. |
| Offers | DELETE | `/api/offers/:id` | Admin | Remove offer. |
| Cart | GET | `/api/cart` | Auth | Retrieve current cart with totals/discounts. |
| Cart | POST | `/api/cart/items` | Auth | Add product to cart (quantity, product_id). |
| Cart | PATCH | `/api/cart/items/:itemId` | Auth | Change quantity or toggle selection. |
| Cart | DELETE | `/api/cart/items/:itemId` | Auth | Remove line item. |
| Checkout | POST | `/api/checkout/preview` | Auth | Server-side price validation and shipping cost calc. |
| Checkout | POST | `/api/checkout/confirm` | Auth | Create order, clear cart, return payment reference. |
| Orders | GET | `/api/orders` | Auth | Customer orders with pagination. |
| Orders | GET | `/api/orders/:id` | Auth | Customer detail view (must own order). |
| Admin | GET | `/api/admin/metrics` | Admin | Totals: orders, revenue, products, active offers. |
| Admin | GET | `/api/admin/orders` | Admin | All orders with filters. |
| Admin | PATCH | `/api/admin/orders/:id/status` | Admin | Update status + optional note. |
| Admin | GET | `/api/admin/users` | Admin | List users for management. |

## 4. Representative Schemas
### 4.1 Product
```json
{
  "id": 12,
  "name": "Aurora Desk Lamp",
  "description": "LED lamp with adjustable arm",
  "price": 79.99,
  "stock": 42,
  "imageUrl": "https://cdn.zone24x7.com/images/lamp.jpg",
  "isActive": true,
  "offer": {
    "id": 3,
    "discountType": "percentage",
    "discountValue": 15
  }
}
```

### 4.2 Cart Response
```json
{
  "id": 5,
  "items": [
    {
      "id": 18,
      "productId": 12,
      "name": "Aurora Desk Lamp",
      "quantity": 2,
      "unitPrice": 79.99,
      "discountPerUnit": 12.0,
      "lineTotal": 135.98
    }
  ],
  "subtotal": 159.98,
  "discountTotal": 24.0,
  "grandTotal": 135.98
}
```

### 4.3 Order Detail
```json
{
  "id": 27,
  "status": "Processing",
  "totalAmount": 189.50,
  "placedAt": "2026-03-12T09:12:00Z",
  "items": [
    {
      "productId": 7,
      "name": "Pulse Wireless Earbuds",
      "quantity": 1,
      "unitPrice": 129.5,
      "offerSnapshot": {
        "discountType": "fixed_amount",
        "discountValue": 20
      }
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "line1": "123 Park Ave",
    "city": "Colombo",
    "postalCode": "00200",
    "country": "LK"
  }
}
```

## 5. Security & Rate Limiting
- All admin endpoints require `role=admin`; enforced via middleware.
- Rate limit: 20 requests per 15 minutes on `/api/auth/*`.
- CORS configured for local dev origins (http://localhost:5173).

## 6. Versioning
- Single API version (`v1`) implied; breaking changes require path prefix update and doc refresh.

## 7. Testing & Tooling
- Postman collection derived from OpenAPI for manual/automated testing.
- QA to validate endpoints listed above according to `07-qa-strategy-and-test-cases.md`.

## 8. Traceability
- REQ-001 through REQ-006 map directly to endpoints; status updates and JWT flows traced in DAR and QA docs.
