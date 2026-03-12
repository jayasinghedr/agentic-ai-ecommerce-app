# Agentic AI E-Commerce Application — Design Document

## Document Information
| Field | Value |
|-------|-------|
| **Project** | NexaGear E-Commerce Platform |
| **Client** | Zone24x7 |
| **Version** | 1.0.0 |
| **Last Updated** | March 2026 |
| **Status** | Implementation Complete |

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Data Model Design](#4-data-model-design)
5. [API Design](#5-api-design)
6. [Frontend Design](#6-frontend-design)
7. [Security Architecture](#7-security-architecture)
8. [State Management](#8-state-management)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Component Architecture](#10-component-architecture)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Design Patterns](#12-design-patterns)

---

## 1. System Overview

### 1.1 Purpose
The NexaGear E-Commerce Platform is a full-stack web application that enables online shopping with product catalog management, promotional offers, shopping cart functionality, order processing, and administrative controls.

### 1.2 Key Features
- **Product Catalog**: Browse, search, and filter products with real-time stock information
- **Promotional Offers**: Item-wise discount system with percentage and fixed-amount discounts
- **Shopping Cart**: Persistent cart with automatic discount application
- **Order Management**: Complete order lifecycle from placement to delivery
- **Admin Portal**: Comprehensive management interface for products, offers, and orders
- **Guest & Registered Users**: Support for both authenticated and guest shopping experiences
- **Audit Logging**: Track all administrative actions for compliance

### 1.3 User Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| **Guest** | Unauthenticated visitor | Browse catalog, view offers (read-only) |
| **Customer** | Registered user | All guest features + cart, checkout, order history |
| **Admin** | System administrator | Full CRUD on products/offers, order management, metrics |

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React SPA (Vite + TypeScript + TailwindCSS)        │   │
│  │   - React Router v6 for navigation                   │   │
│  │   - Zustand for state management                     │   │
│  │   - Axios for HTTP client                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Express.js REST API (Node.js + TypeScript)         │   │
│  │   - JWT Authentication Middleware                    │   │
│  │   - Role-based Authorization                         │   │
│  │   - Input Validation (Zod)                           │   │
│  │   - Rate Limiting                                    │   │
│  │   - Swagger/OpenAPI Documentation                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   SQLite Database                                    │   │
│  │   - 8 tables (users, products, offers, carts, etc.)  │   │
│  │   - Prisma schema with migrations                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Patterns

#### 2.2.1 Layered Architecture
- **Presentation Layer**: React components and pages
- **API Layer**: Express routes and controllers
- **Business Logic Layer**: Service functions in controllers
- **Data Access Layer**: Prisma ORM with type-safe queries
- **Database Layer**: SQLite with Prisma migrations

#### 2.2.2 MVC Pattern (Backend)
- **Models**: Prisma schema definitions
- **Views**: JSON responses
- **Controllers**: Business logic handlers in `src/controllers/`

#### 2.2.3 Component-Based Architecture (Frontend)
- **Pages**: Route-level components
- **Layout Components**: Shell structure (Layout, Sidebar)
- **UI Components**: Reusable primitives (Button, Badge, Modal, Input)
- **Protected Routes**: Authorization wrapper components

---

## 3. Technology Stack

### 3.1 Backend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | JavaScript runtime |
| **Framework** | Express.js | 4.19.2 | Web application framework |
| **Language** | TypeScript | 5.5.3 | Type-safe development |
| **ORM** | Prisma | 5.14.0 | Database toolkit |
| **Database** | SQLite | 3.x | Embedded relational database |
| **Authentication** | jsonwebtoken | 9.0.2 | JWT token generation/verification |
| **Password Hashing** | bcryptjs | 2.4.3 | Secure password storage |
| **Validation** | Zod | 3.23.8 | Schema validation |
| **API Documentation** | swagger-jsdoc | 6.2.8 | OpenAPI spec generation |
| **Rate Limiting** | express-rate-limit | 7.3.1 | Request throttling |
| **CORS** | cors | 2.8.5 | Cross-origin resource sharing |

### 3.2 Frontend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Language** | TypeScript | 5.5.3 | Type-safe development |
| **Build Tool** | Vite | 5.3.4 | Fast build and HMR |
| **Routing** | React Router | 6.24.1 | Client-side routing |
| **State Management** | Zustand | 4.5.4 | Lightweight state store |
| **HTTP Client** | Axios | 1.7.2 | API communication |
| **Styling** | TailwindCSS | 3.4.6 | Utility-first CSS framework |
| **Font** | Poppins | - | Google Fonts typography |

### 3.3 Development Tools

- **tsx**: TypeScript execution for development
- **Prisma Studio**: Database GUI
- **Jest**: Testing framework
- **Supertest**: API testing
- **ESLint**: Code linting

---

## 4. Data Model Design

### 4.1 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │1      * │     Cart     │1      * │  CartItem   │
│─────────────│◄────────│──────────────│◄────────│─────────────│
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ name        │         │ user_id (FK) │         │ cart_id (FK)│
│ email       │         │ status       │         │ product_id  │
│ password    │         │ created_at   │         │ quantity    │
│ role        │         │ updated_at   │         │ unit_price  │
│ status      │         └──────────────┘         │ offer_flag  │
│ guest_ttl   │                                  │ discount    │
└─────────────┘                                  └─────────────┘
      │1                                                │*
      │                                                 │
      │*                                                │
┌─────────────┐                                  ┌─────────────┐
│    Order    │                                  │   Product   │
│─────────────│                                  │─────────────│
│ id (PK)     │1                               * │ id (PK)     │
│ user_id (FK)│◄─────────────────────────────────│ name        │
│ guest_email │                                  │ description │
│ total_amt   │         ┌──────────────┐         │ price       │
│ status      │1      * │  OrderItem   │*        │ stock       │
│ shipping    │◄────────│──────────────│────────►│ image_url   │
│ payment_ref │         │ id (PK)      │         │ is_active   │
│ notes       │         │ order_id (FK)│         └─────────────┘
│ placed_at   │         │ product_id   │               │1
└─────────────┘         │ quantity     │               │
      │1                │ unit_price   │               │*
      │                 │ offer_json   │         ┌─────────────┐
      │                 └──────────────┘         │    Offer    │
      │*                                         │─────────────│
┌─────────────┐                                  │ id (PK)     │
│  AuditLog   │                                  │ title       │
│─────────────│                                  │ description │
│ id (PK)     │                                  │ disc_type   │
│ user_id (FK)│                                  │ disc_value  │
│ action      │                                  │ start_date  │
│ entity_type │                                  │ end_date    │
│ entity_id   │                                  │ is_active   │
│ metadata    │                                  │ product_id  │
│ created_at  │                                  └─────────────┘
└─────────────┘
```

### 4.2 Table Specifications

#### 4.2.1 Users Table
```prisma
model User {
  id           Int       @id @default(autoincrement())
  name         String
  email        String    @unique
  passwordHash String
  role         String    @default("customer")  // admin | customer | guest
  status       String    @default("active")    // active | inactive
  guestTtl     DateTime?                       // Expiry for guest accounts
  createdAt    DateTime  @default(now())
}
```

**Purpose**: Unified user management for admins, customers, and guests

**Key Design Decisions**:
- Single table for all user types (role-based differentiation)
- Guest users have `guestTtl` for automatic cleanup
- Email uniqueness enforced at database level
- Bcrypt-hashed passwords (10 rounds)

#### 4.2.2 Products Table
```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Float
  stock       Int      @default(0)
  imageUrl    String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Purpose**: Product catalog with inventory tracking

**Key Design Decisions**:
- External image URLs (no file upload)
- Soft delete via `isActive` flag
- Automatic timestamp management
- Stock tracking for availability

#### 4.2.3 Offers Table
```prisma
model Offer {
  id            Int      @id @default(autoincrement())
  title         String
  description   String
  discountType  String                    // percentage | fixed_amount
  discountValue Float
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean  @default(true)
  productId     Int                       // Item-wise offers only
  product       Product  @relation(...)
}
```

**Purpose**: Item-wise promotional discounts

**Key Design Decisions**:
- **Item-wise only**: Each offer linked to specific `productId`
- Two discount types: `percentage` (e.g., 20 for 20%) or `fixed_amount` (e.g., 5.00 for $5 off)
- Time-bound validity with `startDate` and `endDate`
- Can be deactivated without deletion

#### 4.2.4 Carts & CartItems Tables
```prisma
model Cart {
  id        Int      @id @default(autoincrement())
  userId    Int?                          // Nullable for guest carts
  status    String   @default("active")   // active | converted
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CartItem {
  id                Int      @id @default(autoincrement())
  cartId            Int
  productId         Int
  quantity          Int
  unitPriceSnapshot Float                 // Price at time of add
  offerApplied      Boolean  @default(false)
  discountSnapshot  Float?                // Discount per unit
}
```

**Purpose**: Persistent shopping cart with price snapshots

**Key Design Decisions**:
- Carts persist across sessions
- Price snapshots prevent retroactive price changes
- Discount snapshots preserve offer details
- Status tracks cart lifecycle (active → converted)

#### 4.2.5 Orders & OrderItems Tables
```prisma
model Order {
  id                  Int      @id @default(autoincrement())
  userId              Int?                  // Nullable for guest orders
  guestEmail          String?               // Captured at guest checkout
  totalAmount         Float
  status              String   @default("Processing")  // Processing | Shipped | Delivered
  shippingAddressJson String                // JSON string
  paymentReference    String                // Simulated payment ID
  notes               String?
  placedAt            DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model OrderItem {
  id                Int     @id @default(autoincrement())
  orderId           Int
  productId         Int
  quantity          Int
  unitPriceSnapshot Float
  offerSnapshotJson String?              // JSON snapshot of applied offer
}
```

**Purpose**: Order history and fulfillment tracking

**Key Design Decisions**:
- Guest orders supported via `guestEmail`
- Shipping address stored as JSON for flexibility
- Order items snapshot prices and offers
- Status progression: Processing → Shipped → Delivered
- Admin notes for internal tracking

#### 4.2.6 AuditLog Table
```prisma
model AuditLog {
  id           Int      @id @default(autoincrement())
  userId       Int?                      // Admin who performed action
  action       String                    // e.g., CREATE_PRODUCT, UPDATE_OFFER
  entityType   String                    // product | offer | order
  entityId     Int?
  metadataJson String?                   // JSON diff/payload
  createdAt    DateTime @default(now())
}
```

**Purpose**: Compliance and admin action tracking

**Key Design Decisions**:
- Immutable log (no updates/deletes)
- Captures who, what, when, and context
- Metadata stored as JSON for flexibility

---

## 5. API Design

### 5.1 API Architecture

#### 5.1.1 RESTful Principles
- Resource-based URLs
- HTTP methods for CRUD operations
- JSON request/response bodies
- Stateless authentication via JWT
- Standard HTTP status codes

#### 5.1.2 API Structure
```
/api
├── /auth              # Authentication endpoints
├── /products          # Product catalog
├── /offers            # Promotional offers
├── /cart              # Shopping cart
├── /checkout          # Order placement
├── /orders            # Order history
├── /admin             # Admin operations
├── /docs              # Swagger UI
└── /health            # Health check
```

### 5.2 Authentication Endpoints

#### POST `/api/auth/register`
**Purpose**: Register new customer account

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201):
```json
{
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbGc..."
}
```

**Sets Cookie**: `refreshToken` (httpOnly, 7-day expiry)

---

#### POST `/api/auth/login`
**Purpose**: Authenticate existing user

**Request**:
```json
{
  "email": "admin@zone24x7.com",
  "password": "admin123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@zone24x7.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGc..."
}
```

---

#### POST `/api/auth/guest`
**Purpose**: Create guest session

**Response** (200):
```json
{
  "user": {
    "id": 15,
    "name": "Guest User",
    "email": "guest_1234567890@temp.local",
    "role": "guest"
  },
  "accessToken": "eyJhbGc..."
}
```

---

#### POST `/api/auth/refresh`
**Purpose**: Get new access token using refresh cookie

**Authorization**: Requires `refreshToken` cookie

**Response** (200):
```json
{
  "accessToken": "eyJhbGc..."
}
```

---

#### POST `/api/auth/logout`
**Purpose**: Clear refresh cookie

**Authorization**: Bearer token required

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### 5.3 Product Endpoints

#### GET `/api/products`
**Purpose**: List products with search/filter

**Query Parameters**:
- `search` (string): Search in name/description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Only show available products

**Response** (200):
```json
{
  "products": [
    {
      "id": 1,
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse",
      "price": 29.99,
      "stock": 150,
      "imageUrl": "https://example.com/mouse.jpg",
      "isActive": true,
      "activeOffer": {
        "id": 1,
        "title": "20% Off Wireless Mouse",
        "discountType": "percentage",
        "discountValue": 20,
        "finalPrice": 23.99
      }
    }
  ]
}
```

---

#### POST `/api/products`
**Purpose**: Create new product (Admin only)

**Authorization**: Bearer token with `admin` role

**Request**:
```json
{
  "name": "Gaming Keyboard",
  "description": "RGB mechanical keyboard",
  "price": 89.99,
  "stock": 50,
  "imageUrl": "https://example.com/keyboard.jpg"
}
```

**Response** (201):
```json
{
  "product": {
    "id": 9,
    "name": "Gaming Keyboard",
    "price": 89.99,
    "stock": 50,
    "isActive": true
  }
}
```

---

### 5.4 Cart Endpoints

#### GET `/api/cart`
**Purpose**: Get current user's cart with discounts

**Authorization**: Bearer token required

**Response** (200):
```json
{
  "cart": {
    "id": 5,
    "items": [
      {
        "id": 12,
        "product": {
          "id": 1,
          "name": "Wireless Mouse",
          "imageUrl": "..."
        },
        "quantity": 2,
        "unitPriceSnapshot": 29.99,
        "offerApplied": true,
        "discountSnapshot": 6.00,
        "lineTotal": 47.98
      }
    ],
    "subtotal": 59.98,
    "totalDiscount": 12.00,
    "total": 47.98
  }
}
```

---

#### POST `/api/cart/items`
**Purpose**: Add item to cart

**Authorization**: Bearer token required

**Request**:
```json
{
  "productId": 3,
  "quantity": 1
}
```

**Response** (201):
```json
{
  "cartItem": {
    "id": 15,
    "productId": 3,
    "quantity": 1,
    "unitPriceSnapshot": 49.99,
    "offerApplied": false
  }
}
```

---

### 5.5 Checkout Endpoints

#### POST `/api/checkout/preview`
**Purpose**: Calculate totals and validate cart

**Authorization**: Bearer token required

**Response** (200):
```json
{
  "items": [...],
  "subtotal": 129.97,
  "totalDiscount": 20.00,
  "total": 109.97,
  "valid": true
}
```

---

#### POST `/api/checkout/confirm`
**Purpose**: Create order and clear cart

**Authorization**: Bearer token required

**Request**:
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Colombo",
    "postalCode": "00100",
    "country": "Sri Lanka"
  },
  "guestEmail": "john@example.com"
}
```

**Response** (201):
```json
{
  "order": {
    "id": 42,
    "totalAmount": 109.97,
    "status": "Processing",
    "paymentReference": "PAY-1234567890",
    "placedAt": "2026-03-12T06:30:00.000Z"
  }
}
```

---

### 5.6 Admin Endpoints

#### GET `/api/admin/metrics`
**Purpose**: Dashboard metrics

**Authorization**: Bearer token with `admin` role

**Response** (200):
```json
{
  "totalOrders": 156,
  "totalProducts": 8,
  "activeOffers": 4,
  "totalRevenue": 12450.75
}
```

---

#### PATCH `/api/admin/orders/:id/status`
**Purpose**: Update order status

**Authorization**: Bearer token with `admin` role

**Request**:
```json
{
  "status": "Shipped",
  "notes": "Dispatched via FedEx, tracking: 1234567890"
}
```

**Response** (200):
```json
{
  "order": {
    "id": 42,
    "status": "Shipped",
    "notes": "Dispatched via FedEx, tracking: 1234567890",
    "updatedAt": "2026-03-12T08:00:00.000Z"
  }
}
```

---

### 5.7 API Documentation

**Swagger UI**: Available at `http://localhost:5000/api/docs`

**OpenAPI Spec**: `http://localhost:5000/api/docs.json`

**Features**:
- Interactive API testing
- Request/response schemas
- Authentication examples
- Error response documentation

---

## 6. Frontend Design

### 6.1 Page Structure

```
/                       → Redirect to /catalog
/login                  → Login page (public)
/register               → Registration page (public)
/catalog                → Product catalog (public)
/cart                   → Shopping cart (auth required)
/checkout               → Checkout flow (auth required)
/orders                 → Order list (auth required)
/orders/:id             → Order details (auth required)
/admin                  → Admin dashboard (admin only)
/admin/products         → Product management (admin only)
/admin/offers           → Offer management (admin only)
/admin/orders           → Order management (admin only)
```

### 6.2 Component Hierarchy

```
App
├── BrowserRouter
    ├── LoginPage (standalone)
    ├── RegisterPage (standalone)
    └── Layout (shell with sidebar)
        ├── Sidebar
        │   ├── Navigation (role-aware)
        │   └── User menu
        └── Outlet (main content area)
            ├── CatalogPage
            │   └── ProductCard (repeating)
            ├── CartPage
            │   └── CartItem (repeating)
            ├── CheckoutPage
            │   └── CheckoutForm
            ├── OrdersPage
            │   └── OrderCard (repeating)
            ├── OrderDetailPage
            │   └── OrderItem (repeating)
            └── Admin Pages
                ├── AdminDashboard
                │   └── MetricCard (repeating)
                ├── ProductsAdmin
                │   ├── ProductTable
                │   └── ProductFormModal
                ├── OffersAdmin
                │   ├── OfferTable
                │   └── OfferFormModal
                └── OrdersAdmin
                    ├── OrderTable
                    └── StatusUpdateModal
```

### 6.3 Reusable UI Components

Located in `src/components/ui/`:

- **Button**: Primary/secondary variants with loading states
- **Badge**: Status indicators (Processing, Shipped, Delivered)
- **Modal**: Overlay dialogs for forms
- **Input**: Form inputs with validation states

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │  Server  │                 │ Database │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │  POST /api/auth/login      │                            │
     ├───────────────────────────►│                            │
     │  { email, password }       │                            │
     │                            │  Verify credentials        │
     │                            ├───────────────────────────►│
     │                            │                            │
     │                            │◄───────────────────────────┤
     │                            │  User record               │
     │                            │                            │
     │                            │  Generate tokens:          │
     │                            │  - Access (15min)          │
     │                            │  - Refresh (7 days)        │
     │                            │                            │
     │  Response:                 │                            │
     │  - accessToken (JSON)      │                            │
     │  - refreshToken (cookie)   │                            │
     │◄───────────────────────────┤                            │
     │                            │                            │
     │  Store accessToken in      │                            │
     │  Zustand (memory)          │                            │
     │                            │                            │
```

### 7.2 Token Strategy

#### Access Token
- **Storage**: Zustand store (memory only)
- **Lifetime**: 15 minutes
- **Purpose**: API authorization
- **Format**: JWT with payload:
  ```json
  {
    "userId": 1,
    "email": "admin@zone24x7.com",
    "role": "admin",
    "iat": 1710230400,
    "exp": 1710231300
  }
  ```

#### Refresh Token
- **Storage**: httpOnly cookie (XSS protection)
- **Lifetime**: 7 days
- **Purpose**: Obtain new access tokens
- **Cookie attributes**:
  - `httpOnly: true` (no JavaScript access)
  - `secure: true` (HTTPS only in production)
  - `sameSite: 'strict'` (CSRF protection)

### 7.3 Silent Token Refresh

On app load (`main.tsx`):
```typescript
// Attempt to restore session
try {
  const { data } = await axios.post('/api/auth/refresh');
  authStore.setAccessToken(data.accessToken);
} catch {
  // No valid refresh token, user stays logged out
}
```

### 7.4 Authorization Middleware

**Backend** (`src/middleware/auth.ts`):
```typescript
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role: string) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

**Frontend** (`src/components/ProtectedRoute.tsx`):
```typescript
function ProtectedRoute({ requiredRole }: { requiredRole?: string }) {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/catalog" />;
  }
  
  return <Outlet />;
}
```

### 7.5 Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Passwords** | Bcrypt hashing | 10 rounds, salted |
| **XSS Protection** | httpOnly cookies | Refresh tokens inaccessible to JS |
| **CSRF Protection** | SameSite cookies | `sameSite: 'strict'` |
| **Rate Limiting** | Auth endpoints | 20 requests / 15 minutes |
| **Input Validation** | Zod schemas | All POST/PATCH endpoints |
| **SQL Injection** | Prisma ORM | Parameterized queries |
| **CORS** | Whitelist origins | Frontend URL only |

---

## 8. State Management

### 8.1 Zustand Stores

#### 8.1.1 Auth Store (`src/store/authStore.ts`)

**State**:
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}
```

**Purpose**: Manage authentication state across app

**Key Features**:
- Stores current user and access token
- Provides logout function
- Persists nothing (memory only for security)

---

#### 8.1.2 Cart Store (`src/store/cartStore.ts`)

**State**:
```typescript
interface CartState {
  itemCount: number;
  setItemCount: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
  resetCount: () => void;
}
```

**Purpose**: Track cart item count for badge display

**Key Features**:
- Lightweight counter (full cart data fetched from API)
- Updates on add/remove operations
- Resets on logout/checkout

---

### 8.2 State Flow

```
User Action (e.g., Add to Cart)
        ↓
  API Call (POST /api/cart/items)
        ↓
  Server Updates Database
        ↓
  Response with Updated Cart
        ↓
  Update Zustand Store (itemCount)
        ↓
  React Re-renders (Badge updates)
```

---

## 9. Authentication & Authorization

### 9.1 Guest Flow

```
1. User visits /catalog (no login)
   ↓
2. Clicks "Browse as Guest"
   ↓
3. POST /api/auth/guest
   ↓
4. Server creates guest user:
   - role: 'guest'
   - email: guest_<timestamp>@temp.local
   - guestTtl: now + 24 hours
   ↓
5. Returns access token
   ↓
6. User can browse but cannot:
   - Add to cart
   - Checkout
   - View orders
```

### 9.2 Guest-to-Customer Conversion

**Option 1**: Register from scratch (new account)

**Option 2**: Convert at checkout:
```
1. Guest adds items to cart
   ↓
2. Proceeds to checkout
   ↓
3. Prompted to register or provide email
   ↓
4. If registers:
   - New customer account created
   - Guest cart transferred to new user
   - Guest user marked inactive
```

### 9.3 Role-Based Access Control

| Route | Guest | Customer | Admin |
|-------|-------|----------|-------|
| `/catalog` | ✅ | ✅ | ✅ |
| `/cart` | ❌ | ✅ | ✅ |
| `/checkout` | ❌ | ✅ | ✅ |
| `/orders` | ❌ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ |

---

## 10. Component Architecture

### 10.1 Layout Component

**File**: `src/components/layout/Layout.tsx`

**Purpose**: Application shell with sidebar navigation

**Structure**:
```tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-auto bg-gray-50">
    <Outlet />  {/* React Router renders page here */}
  </main>
</div>
```

---

### 10.2 Sidebar Component

**File**: `src/components/layout/Sidebar.tsx`

**Purpose**: Role-aware navigation menu

**Navigation Items**:
```typescript
// Customer/Guest
- Catalog (all users)
- Cart (auth required)
- Orders (auth required)

// Admin
- Dashboard
- Products
- Offers
- Orders
```

**Dynamic Rendering**:
```tsx
{user?.role === 'admin' ? (
  <AdminNavigation />
) : (
  <CustomerNavigation />
)}
```

---

### 10.3 Protected Route

**File**: `src/components/ProtectedRoute.tsx`

**Purpose**: Authorization wrapper for routes

**Logic**:
```tsx
function ProtectedRoute({ requiredRole }: Props) {
  const { user } = useAuthStore();
  
  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" />;
  
  // Logged in but wrong role → redirect to catalog
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/catalog" />;
  }
  
  // Authorized → render child routes
  return <Outlet />;
}
```

---

### 10.4 Product Card

**File**: `src/pages/catalog/ProductCard.tsx`

**Purpose**: Display product with offer badge

**Features**:
- Product image, name, description
- Original price (strikethrough if offer active)
- Discounted price (if offer active)
- Offer badge (e.g., "20% OFF")
- Stock indicator
- Add to cart button

**Offer Calculation**:
```typescript
const calculateDiscount = (product: Product) => {
  if (!product.activeOffer) return null;
  
  const { discountType, discountValue, price } = product;
  
  if (discountType === 'percentage') {
    return price * (discountValue / 100);
  } else {
    return discountValue;
  }
};

const finalPrice = price - calculateDiscount(product);
```

---

## 11. Deployment Architecture

### 11.1 Local Development

**Backend**:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev  # http://localhost:5000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

---

### 11.2 Docker Compose (Optional)

**File**: `docker-compose.yml`

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=file:./dev.db
      - JWT_SECRET=your-secret-key
    volumes:
      - ./backend/prisma:/app/prisma
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend
```

**Usage**:
```bash
docker-compose up --build
```

---

### 11.3 Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-256-bit-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

**Frontend** (`.env`):
```env
VITE_API_URL="http://localhost:5000"
```

---

## 12. Design Patterns

### 12.1 Backend Patterns

#### 12.1.1 Controller Pattern
**Location**: `src/controllers/*.controller.ts`

**Purpose**: Separate business logic from routing

**Example**:
```typescript
// products.controller.ts
export const getProducts = async (req, res) => {
  const { search, minPrice, maxPrice } = req.query;
  
  const products = await prisma.product.findMany({
    where: {
      AND: [
        search ? { name: { contains: search } } : {},
        minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
        maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
      ],
    },
    include: { offers: true },
  });
  
  res.json({ products });
};
```

---

#### 12.1.2 Middleware Pattern
**Location**: `src/middleware/*.ts`

**Purpose**: Cross-cutting concerns (auth, errors, rate limiting)

**Examples**:
- `auth.ts`: JWT verification
- `errorHandler.ts`: Global error handling
- `rateLimiter.ts`: Request throttling

---

#### 12.1.3 Repository Pattern (via Prisma)
**Location**: `src/utils/prismaClient.ts`

**Purpose**: Centralized database access

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

All controllers import this shared instance.

---

### 12.2 Frontend Patterns

#### 12.2.1 Container/Presentational Pattern
**Pages** (containers): Handle data fetching and state
**Components** (presentational): Receive props, render UI

---

#### 12.2.2 Custom Hooks Pattern
**Example**: `useAuth` hook (if implemented)
```typescript
const useAuth = () => {
  const { user, accessToken, logout } = useAuthStore();
  return { user, accessToken, logout, isAuthenticated: !!user };
};
```

---

#### 12.2.3 Axios Interceptor Pattern
**File**: `src/api/client.ts`

**Purpose**: Automatic token injection and refresh

```typescript
// Request interceptor: Add access token
axios.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 with refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post('/api/auth/refresh');
        authStore.getState().setAccessToken(data.accessToken);
        // Retry original request
        return axios(error.config);
      } catch {
        authStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 13. Color Palette & Typography

### 13.1 Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary Red** | `#C62828` | Buttons, badges, offer tags, links |
| **Black** | `#111111` | Admin sidebar background, headings |
| **Dark Gray** | `#424242` | Secondary text, borders |
| **Light Gray** | `#F5F5F5` | Page backgrounds |
| **White** | `#FFFFFF` | Cards, modals, forms |

**TailwindCSS Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#C62828',
        black: '#111111',
        'dark-gray': '#424242',
        'light-gray': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
};
```

### 13.2 Typography

**Font**: Poppins (Google Fonts)

**Weights**:
- 400 (Regular): Body text
- 500 (Medium): Subheadings
- 600 (Semibold): Headings
- 700 (Bold): Emphasis

**Import** (`index.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 14. Error Handling

### 14.1 Backend Error Handler

**File**: `src/middleware/errorHandler.ts`

```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  // Validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: err.errors });
  }
  
  // Default
  res.status(500).json({ error: 'Internal server error' });
};
```

### 14.2 Frontend Error Handling

**API Client** (`src/api/client.ts`):
```typescript
try {
  const response = await axios.post('/api/cart/items', data);
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    alert(error.response.data.error);
  } else {
    // Network error
    alert('Network error. Please try again.');
  }
}
```

---

## 15. Testing Strategy

### 15.1 Backend Testing

**Framework**: Jest + Supertest

**Test Categories**:
- **Unit Tests**: Controllers, utilities
- **Integration Tests**: API endpoints
- **Database Tests**: Prisma queries

**Example**:
```typescript
describe('POST /api/auth/login', () => {
  it('should return access token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@zone24x7.com', password: 'admin123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});
```

### 15.2 Frontend Testing

**Framework**: React Testing Library (if implemented)

**Test Categories**:
- **Component Tests**: UI rendering
- **Integration Tests**: User flows
- **E2E Tests**: Playwright (optional)

---

## 16. Performance Considerations

### 16.1 Database Optimization
- **Indexes**: On `email` (unique), `productId` (foreign keys)
- **Eager Loading**: Use Prisma `include` to avoid N+1 queries
- **Pagination**: Implement for large product catalogs

### 16.2 Frontend Optimization
- **Code Splitting**: React.lazy for route-based splitting
- **Image Optimization**: External CDN URLs
- **Memoization**: React.memo for expensive components

---

## 17. Future Enhancements

### 17.1 Planned Features
- **Payment Gateway Integration**: Stripe/PayPal
- **Email Notifications**: Order confirmations
- **Product Reviews**: Customer ratings
- **Wishlist**: Save for later
- **Advanced Search**: Elasticsearch integration
- **Analytics Dashboard**: Sales trends, popular products

### 17.2 Scalability Improvements
- **Database Migration**: SQLite → PostgreSQL
- **Caching Layer**: Redis for sessions and cart
- **CDN**: Static asset delivery
- **Microservices**: Separate order processing service

---

## Appendix A: Demo Seed Data

### Users
| ID | Email | Password | Role |
|----|-------|----------|------|
| 1 | admin@zone24x7.com | admin123 | admin |
| 2 | john@example.com | customer123 | customer |

### Products (8 items)
1. Wireless Mouse - $29.99
2. Mechanical Keyboard - $89.99
3. USB-C Hub - $49.99
4. Laptop Stand - $39.99
5. Webcam HD - $79.99
6. Noise-Cancelling Headphones - $199.99
7. Portable SSD 1TB - $129.99
8. Wireless Charger - $24.99

### Offers (4 item-wise)
1. 20% off Wireless Mouse
2. $10 off Mechanical Keyboard
3. 15% off Webcam HD
4. $20 off Headphones

---

## Appendix B: API Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email |
| 500 | Server Error | Database connection failed |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-12 | Cascade AI | Initial design document |

---

**End of Design Document**
