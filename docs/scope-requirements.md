# Scope & Requirements Document
## NexaGear E-Commerce Platform

---

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | NexaGear E-Commerce Platform |
| **Client** | Zone24x7 |
| **Document Type** | Scope & Requirements Specification |
| **Version** | 1.0.0 |
| **Date** | March 12, 2026 |
| **Status** | Approved |
| **Author** | Development Team |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Scope](#2-project-scope)
3. [Stakeholders](#3-stakeholders)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [User Stories](#6-user-stories)
7. [System Features](#7-system-features)
8. [Technical Requirements](#8-technical-requirements)
9. [Constraints & Assumptions](#9-constraints--assumptions)
10. [Success Criteria](#10-success-criteria)
11. [Out of Scope](#11-out-of-scope)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Executive Summary

### 1.1 Project Overview
The NexaGear E-Commerce Platform is a modern, full-stack web application designed to provide a seamless online shopping experience for tech accessories and gadgets. The platform supports product catalog management, promotional offers, shopping cart functionality, order processing, and comprehensive administrative controls.

### 1.2 Business Objectives
- **Primary Goal**: Deliver a functional e-commerce platform for Zone24x7 to sell tech products online
- **Target Users**: Tech-savvy consumers, guest shoppers, registered customers, and internal administrators
- **Timeline**: 90-minute rapid development session leveraging Agentic AI
- **Deliverables**: Working prototype with complete documentation suite

### 1.3 Key Success Metrics
- Functional product catalog with search and filtering
- Seamless cart and checkout experience
- Role-based access control for admin operations
- Complete API documentation (OpenAPI/Swagger)
- Responsive, modern UI with brand consistency

---

## 2. Project Scope

### 2.1 In Scope

#### 2.1.1 Core Features
✅ **Product Catalog Management**
- Browse products with images, descriptions, and pricing
- Search products by name/description
- Filter products by price range and stock availability
- Admin CRUD operations for products

✅ **Promotional Offers System**
- Item-wise discount management
- Support for percentage and fixed-amount discounts
- Time-bound offer validity
- Automatic discount application in cart
- Admin CRUD operations for offers

✅ **Shopping Cart**
- Persistent cart across sessions
- Add/update/remove items
- Real-time price and discount calculations
- Cart item count badge
- Price snapshot preservation

✅ **Checkout & Order Processing**
- Shipping address collection
- Order preview with totals
- Simulated payment processing
- Order confirmation with reference number
- Guest checkout with email capture

✅ **Order Management**
- Customer order history
- Order detail view with line items
- Order status tracking (Processing → Shipped → Delivered)
- Admin order management dashboard
- Status update with notes

✅ **User Authentication & Authorization**
- User registration and login
- Guest browsing mode
- JWT-based authentication
- Role-based access control (Admin, Customer, Guest)
- Secure password storage (bcrypt)
- Token refresh mechanism

✅ **Admin Portal**
- Dashboard with key metrics
- Product management interface
- Offer management interface
- Order management with status updates
- User listing
- Audit log tracking

✅ **Documentation**
- API documentation (Swagger/OpenAPI)
- Design document
- Implementation plan
- Quickstart guide
- Scope & requirements document

### 2.2 Deliverables

| # | Deliverable | Description | Status |
|---|-------------|-------------|--------|
| 1 | Backend API | Express.js REST API with 7 route modules | ✅ Complete |
| 2 | Frontend SPA | React application with 12+ pages | ✅ Complete |
| 3 | Database Schema | Prisma schema with 8 tables | ✅ Complete |
| 4 | Seed Data | Demo products, users, and offers | ✅ Complete |
| 5 | API Documentation | Swagger UI at `/api/docs` | ✅ Complete |
| 6 | Design Document | Comprehensive technical design | ✅ Complete |
| 7 | Implementation Plan | Step-by-step development guide | ✅ Complete |
| 8 | Scope Document | This document | ✅ Complete |
| 9 | Deployment Guide | Local and Docker setup instructions | ✅ Complete |

---

## 3. Stakeholders

### 3.1 Primary Stakeholders

| Role | Responsibility | Involvement |
|------|---------------|-------------|
| **Product Owner** | Define business requirements, approve features | High |
| **Development Team** | Implement features, write tests, deploy | High |
| **QA Team** | Test functionality, report bugs, validate requirements | Medium |
| **End Users (Customers)** | Use platform for shopping | High |
| **Admin Users** | Manage catalog, orders, and offers | High |
| **Business Analysts** | Document requirements, facilitate communication | Medium |

### 3.2 User Personas

#### Persona 1: Guest Shopper (Sarah)
- **Demographics**: 25-35 years old, tech enthusiast
- **Goals**: Browse products quickly without registration
- **Pain Points**: Forced registration before browsing
- **Needs**: Fast, intuitive product discovery

#### Persona 2: Registered Customer (Michael)
- **Demographics**: 30-45 years old, frequent online shopper
- **Goals**: Track orders, save cart, quick checkout
- **Pain Points**: Lost cart items, complicated checkout
- **Needs**: Persistent cart, order history, easy reordering

#### Persona 3: Admin (Lisa)
- **Demographics**: Store manager, 28-40 years old
- **Goals**: Manage inventory, create promotions, fulfill orders
- **Pain Points**: Complex interfaces, lack of insights
- **Needs**: Simple CRUD operations, clear metrics, audit trail

---

## 4. Functional Requirements

### 4.1 Authentication & User Management

#### FR-AUTH-001: User Registration
**Priority**: High  
**Description**: System shall allow new users to create customer accounts

**Requirements**:
- Accept name, email, and password
- Validate email format and uniqueness
- Hash passwords using bcrypt (10 rounds)
- Create user with `customer` role by default
- Return JWT access token and set refresh cookie
- Prevent duplicate email registrations

**Acceptance Criteria**:
- ✅ User can register with valid credentials
- ✅ System rejects duplicate emails
- ✅ Password is hashed before storage
- ✅ User receives access token immediately

---

#### FR-AUTH-002: User Login
**Priority**: High  
**Description**: System shall authenticate existing users

**Requirements**:
- Accept email and password
- Verify credentials against database
- Generate JWT access token (15-minute expiry)
- Set httpOnly refresh cookie (7-day expiry)
- Return user profile and access token
- Rate limit to 20 attempts per 15 minutes

**Acceptance Criteria**:
- ✅ Valid credentials grant access
- ✅ Invalid credentials return 401 error
- ✅ Rate limiting prevents brute force attacks
- ✅ Tokens are properly generated

---

#### FR-AUTH-003: Guest Mode
**Priority**: High  
**Description**: System shall support guest browsing

**Requirements**:
- Create temporary guest user on request
- Generate unique email (guest_timestamp@temp.local)
- Set guest_ttl to 24 hours from creation
- Assign `guest` role
- Restrict cart and checkout access
- Allow catalog browsing

**Acceptance Criteria**:
- ✅ Guest can browse without registration
- ✅ Guest cannot access cart/checkout
- ✅ Guest users expire after 24 hours
- ✅ Guest can convert to registered user

---

#### FR-AUTH-004: Token Refresh
**Priority**: High  
**Description**: System shall support silent token refresh

**Requirements**:
- Accept refresh token from httpOnly cookie
- Validate refresh token signature
- Generate new access token
- Return new access token in response
- Maintain user session without re-login

**Acceptance Criteria**:
- ✅ Valid refresh token returns new access token
- ✅ Invalid/expired refresh token returns 401
- ✅ Frontend automatically refreshes on app load
- ✅ User session persists across page refreshes

---

### 4.2 Product Catalog

#### FR-PROD-001: List Products
**Priority**: High  
**Description**: System shall display product catalog with filtering

**Requirements**:
- Return all active products by default
- Support search by name/description (case-insensitive)
- Filter by minimum price
- Filter by maximum price
- Filter by stock availability
- Include active offers in response
- Calculate discounted prices

**Acceptance Criteria**:
- ✅ Products display with images and details
- ✅ Search returns relevant results
- ✅ Filters work independently and combined
- ✅ Offers are correctly applied and displayed

---

#### FR-PROD-002: View Product Details
**Priority**: Medium  
**Description**: System shall show individual product information

**Requirements**:
- Display product name, description, price
- Show product image
- Display current stock level
- Show active offer if applicable
- Calculate and display discounted price
- Indicate if product is out of stock

**Acceptance Criteria**:
- ✅ All product details are visible
- ✅ Stock status is accurate
- ✅ Discounts are correctly calculated
- ✅ Out-of-stock products are clearly marked

---

#### FR-PROD-003: Create Product (Admin)
**Priority**: High  
**Description**: Admin shall be able to add new products

**Requirements**:
- Require admin role authorization
- Accept name, description, price, stock, imageUrl
- Validate all required fields
- Set isActive to true by default
- Log creation in audit log
- Return created product

**Acceptance Criteria**:
- ✅ Admin can create products
- ✅ Non-admin users receive 403 error
- ✅ Validation prevents invalid data
- ✅ Audit log records creation

---

#### FR-PROD-004: Update Product (Admin)
**Priority**: High  
**Description**: Admin shall be able to modify existing products

**Requirements**:
- Require admin role authorization
- Allow partial updates
- Validate updated fields
- Update timestamp automatically
- Log changes in audit log
- Return updated product

**Acceptance Criteria**:
- ✅ Admin can update any product field
- ✅ Partial updates work correctly
- ✅ Changes are logged
- ✅ Updated timestamp reflects change

---

#### FR-PROD-005: Delete Product (Admin)
**Priority**: Medium  
**Description**: Admin shall be able to soft-delete products

**Requirements**:
- Require admin role authorization
- Set isActive to false (soft delete)
- Preserve product data
- Log deletion in audit log
- Hide from customer catalog
- Retain in admin view

**Acceptance Criteria**:
- ✅ Product is hidden from catalog
- ✅ Data is preserved in database
- ✅ Admin can view inactive products
- ✅ Deletion is logged

---

### 4.3 Promotional Offers

#### FR-OFFER-001: List Active Offers
**Priority**: Medium  
**Description**: System shall display current promotional offers

**Requirements**:
- Return offers where current date is between startDate and endDate
- Filter by isActive = true
- Include associated product details
- Calculate discount amounts
- Sort by creation date (newest first)

**Acceptance Criteria**:
- ✅ Only active, valid offers are shown
- ✅ Expired offers are excluded
- ✅ Product details are included
- ✅ Discounts are correctly calculated

---

#### FR-OFFER-002: Create Offer (Admin)
**Priority**: High  
**Description**: Admin shall be able to create promotional offers

**Requirements**:
- Require admin role authorization
- Accept title, description, discountType, discountValue
- Accept startDate, endDate, productId
- Validate discountType (percentage or fixed_amount)
- Ensure productId exists
- Log creation in audit log

**Acceptance Criteria**:
- ✅ Admin can create item-wise offers
- ✅ Both discount types are supported
- ✅ Invalid product IDs are rejected
- ✅ Creation is logged

---

#### FR-OFFER-003: Update Offer (Admin)
**Priority**: Medium  
**Description**: Admin shall be able to modify offers

**Requirements**:
- Require admin role authorization
- Allow updates to all fields except productId
- Validate date ranges
- Update timestamp automatically
- Log changes in audit log

**Acceptance Criteria**:
- ✅ Admin can update offer details
- ✅ Date validation prevents invalid ranges
- ✅ Changes are logged
- ✅ Active offers update immediately

---

#### FR-OFFER-004: Delete Offer (Admin)
**Priority**: Medium  
**Description**: Admin shall be able to remove offers

**Requirements**:
- Require admin role authorization
- Permanently delete offer record
- Log deletion in audit log
- Remove from active offers immediately

**Acceptance Criteria**:
- ✅ Offer is removed from database
- ✅ Deletion is logged
- ✅ Catalog updates immediately
- ✅ Existing cart items retain snapshot

---

### 4.4 Shopping Cart

#### FR-CART-001: View Cart
**Priority**: High  
**Description**: User shall be able to view their shopping cart

**Requirements**:
- Require authentication (customer or admin)
- Return all cart items with product details
- Calculate line totals (quantity × price)
- Apply active offers automatically
- Calculate subtotal, total discount, and final total
- Show empty cart message if no items

**Acceptance Criteria**:
- ✅ Cart displays all items correctly
- ✅ Discounts are automatically applied
- ✅ Totals are accurately calculated
- ✅ Empty cart shows appropriate message

---

#### FR-CART-002: Add Item to Cart
**Priority**: High  
**Description**: User shall be able to add products to cart

**Requirements**:
- Require authentication (customer or admin)
- Accept productId and quantity
- Validate product exists and is active
- Check stock availability
- Snapshot current price
- Apply active offer if available
- Create or update cart item
- Return updated cart

**Acceptance Criteria**:
- ✅ Items are added successfully
- ✅ Stock validation prevents overselling
- ✅ Prices are snapshotted correctly
- ✅ Offers are applied automatically

---

#### FR-CART-003: Update Cart Item Quantity
**Priority**: High  
**Description**: User shall be able to change item quantities

**Requirements**:
- Require authentication
- Accept cartItemId and new quantity
- Validate stock availability
- Update quantity or remove if quantity = 0
- Recalculate line total
- Return updated cart

**Acceptance Criteria**:
- ✅ Quantity updates correctly
- ✅ Stock validation works
- ✅ Zero quantity removes item
- ✅ Totals recalculate

---

#### FR-CART-004: Remove Cart Item
**Priority**: High  
**Description**: User shall be able to remove items from cart

**Requirements**:
- Require authentication
- Accept cartItemId
- Delete cart item record
- Return updated cart
- Update cart count

**Acceptance Criteria**:
- ✅ Item is removed from cart
- ✅ Cart totals update
- ✅ Cart count badge updates
- ✅ Empty cart handled gracefully

---

### 4.5 Checkout & Orders

#### FR-CHECKOUT-001: Preview Order
**Priority**: High  
**Description**: System shall calculate order totals before confirmation

**Requirements**:
- Require authentication
- Validate cart is not empty
- Check all items are in stock
- Calculate subtotal, discounts, and total
- Return itemized breakdown
- Indicate if cart is valid for checkout

**Acceptance Criteria**:
- ✅ Preview shows accurate totals
- ✅ Out-of-stock items are flagged
- ✅ Discounts are applied correctly
- ✅ Invalid carts are rejected

---

#### FR-CHECKOUT-002: Confirm Order
**Priority**: High  
**Description**: User shall be able to place orders

**Requirements**:
- Require authentication
- Accept shipping address (name, street, city, postalCode, country)
- Accept guestEmail if user is guest
- Validate cart is not empty and items are in stock
- Create order record with status "Processing"
- Create order items with price snapshots
- Generate payment reference (simulated)
- Convert cart status to "converted"
- Reduce product stock
- Return order confirmation

**Acceptance Criteria**:
- ✅ Order is created successfully
- ✅ Stock is decremented
- ✅ Cart is cleared
- ✅ Order confirmation is returned
- ✅ Guest email is captured

---

#### FR-ORDER-001: View Order History
**Priority**: High  
**Description**: Customer shall view their past orders

**Requirements**:
- Require authentication (customer or admin)
- Return orders for current user
- Include order items with product details
- Show order status, total, and date
- Sort by date (newest first)
- Support pagination (future)

**Acceptance Criteria**:
- ✅ User sees only their orders
- ✅ All order details are visible
- ✅ Orders are sorted correctly
- ✅ Status is clearly displayed

---

#### FR-ORDER-002: View Order Details
**Priority**: High  
**Description**: Customer shall view individual order information

**Requirements**:
- Require authentication
- Accept orderId
- Verify user owns the order
- Return complete order details
- Include all order items
- Show shipping address
- Display payment reference

**Acceptance Criteria**:
- ✅ Order details are complete
- ✅ Authorization is enforced
- ✅ Line items are displayed
- ✅ Shipping info is shown

---

### 4.6 Admin Operations

#### FR-ADMIN-001: View Dashboard Metrics
**Priority**: Medium  
**Description**: Admin shall view key business metrics

**Requirements**:
- Require admin role authorization
- Calculate total orders count
- Calculate total products count
- Calculate active offers count
- Calculate total revenue (sum of order totals)
- Return metrics object

**Acceptance Criteria**:
- ✅ All metrics are accurate
- ✅ Only admin can access
- ✅ Calculations are correct
- ✅ Response is fast (<1 second)

---

#### FR-ADMIN-002: Manage All Orders
**Priority**: High  
**Description**: Admin shall view and manage all orders

**Requirements**:
- Require admin role authorization
- Return all orders (not just user's)
- Include customer information
- Support filtering by status
- Allow sorting by date
- Enable status updates

**Acceptance Criteria**:
- ✅ Admin sees all orders
- ✅ Filtering works correctly
- ✅ Customer info is visible
- ✅ Status can be updated

---

#### FR-ADMIN-003: Update Order Status
**Priority**: High  
**Description**: Admin shall update order fulfillment status

**Requirements**:
- Require admin role authorization
- Accept orderId, status, and optional notes
- Validate status (Processing, Shipped, Delivered)
- Update order record
- Log change in audit log
- Return updated order

**Acceptance Criteria**:
- ✅ Status updates successfully
- ✅ Only valid statuses accepted
- ✅ Notes are saved
- ✅ Change is logged

---

#### FR-ADMIN-004: View All Users
**Priority**: Low  
**Description**: Admin shall view user list

**Requirements**:
- Require admin role authorization
- Return all users (exclude passwords)
- Show role, status, and creation date
- Support filtering by role
- Support filtering by status

**Acceptance Criteria**:
- ✅ User list is complete
- ✅ Passwords are not exposed
- ✅ Filters work correctly
- ✅ Only admin can access

---

#### FR-ADMIN-005: Audit Log
**Priority**: Medium  
**Description**: System shall track all admin actions

**Requirements**:
- Log product creation, updates, deletions
- Log offer creation, updates, deletions
- Log order status changes
- Record userId, action, entityType, entityId
- Store metadata as JSON
- Timestamp all entries

**Acceptance Criteria**:
- ✅ All admin actions are logged
- ✅ Logs are immutable
- ✅ Metadata captures changes
- ✅ Timestamps are accurate

---

## 5. Non-Functional Requirements

### 5.1 Performance

#### NFR-PERF-001: Response Time
**Requirement**: API endpoints shall respond within 1 second for 95% of requests under normal load

**Metrics**:
- Product listing: <500ms
- Cart operations: <300ms
- Order creation: <1000ms
- Admin operations: <800ms

---

#### NFR-PERF-002: Database Query Optimization
**Requirement**: Database queries shall use indexes and eager loading to prevent N+1 queries

**Implementation**:
- Indexes on email, productId, userId
- Prisma `include` for related data
- Pagination for large datasets (future)

---

### 5.2 Security

#### NFR-SEC-001: Password Security
**Requirement**: User passwords shall be hashed using bcrypt with minimum 10 rounds

**Implementation**:
- ✅ Bcrypt with 10 rounds
- ✅ Passwords never stored in plain text
- ✅ Passwords never returned in API responses

---

#### NFR-SEC-002: Authentication
**Requirement**: System shall use JWT tokens with short expiry and refresh mechanism

**Implementation**:
- ✅ Access tokens: 15-minute expiry
- ✅ Refresh tokens: 7-day expiry
- ✅ httpOnly cookies for refresh tokens
- ✅ Bearer token authorization

---

#### NFR-SEC-003: Authorization
**Requirement**: System shall enforce role-based access control on all protected endpoints

**Implementation**:
- ✅ Middleware validates JWT tokens
- ✅ Role checks for admin operations
- ✅ User ownership validation for orders/cart
- ✅ 401 for unauthenticated, 403 for unauthorized

---

#### NFR-SEC-004: Input Validation
**Requirement**: All user inputs shall be validated before processing

**Implementation**:
- ✅ Zod schemas for request validation
- ✅ Type checking via TypeScript
- ✅ SQL injection prevention via Prisma ORM
- ✅ XSS prevention via React escaping

---

#### NFR-SEC-005: Rate Limiting
**Requirement**: Authentication endpoints shall be rate-limited to prevent brute force attacks

**Implementation**:
- ✅ 20 requests per 15 minutes on auth endpoints
- ✅ IP-based tracking
- ✅ 429 status code when exceeded

---

### 5.3 Usability

#### NFR-USE-001: Responsive Design
**Requirement**: Frontend shall be responsive and usable on desktop, tablet, and mobile devices

**Implementation**:
- ✅ TailwindCSS responsive utilities
- ✅ Mobile-first approach
- ✅ Touch-friendly UI elements

---

#### NFR-USE-002: Accessibility
**Requirement**: UI shall meet WCAG 2.1 AA standards

**Implementation**:
- Color contrast ratios meet AA standards
- Keyboard navigation support
- ARIA labels for interactive elements
- Semantic HTML structure

---

#### NFR-USE-003: User Feedback
**Requirement**: System shall provide clear feedback for all user actions

**Implementation**:
- ✅ Loading states for async operations
- ✅ Success/error messages
- ✅ Form validation feedback
- ✅ Empty state messages

---

### 5.4 Reliability

#### NFR-REL-001: Error Handling
**Requirement**: System shall handle errors gracefully without exposing sensitive information

**Implementation**:
- ✅ Global error handler middleware
- ✅ User-friendly error messages
- ✅ Stack traces only in development
- ✅ Logging for debugging

---

#### NFR-REL-002: Data Integrity
**Requirement**: System shall maintain data consistency across operations

**Implementation**:
- ✅ Database constraints (foreign keys, unique)
- ✅ Transaction support for critical operations
- ✅ Price snapshots prevent retroactive changes
- ✅ Soft deletes preserve history

---

### 5.5 Maintainability

#### NFR-MAIN-001: Code Quality
**Requirement**: Codebase shall follow TypeScript best practices and be well-documented

**Implementation**:
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Consistent naming conventions
- ✅ Modular architecture

---

#### NFR-MAIN-002: API Documentation
**Requirement**: All API endpoints shall be documented with OpenAPI/Swagger

**Implementation**:
- ✅ Swagger UI at `/api/docs`
- ✅ Request/response schemas
- ✅ Authentication requirements
- ✅ Example payloads

---

### 5.6 Scalability

#### NFR-SCALE-001: Database
**Requirement**: Database design shall support migration to production-grade RDBMS

**Implementation**:
- ✅ Prisma ORM (database-agnostic)
- ✅ Migration system
- ✅ Schema versioning
- ✅ SQLite for development, PostgreSQL-ready

---

## 6. User Stories

### 6.1 Guest User Stories

**US-001**: As a guest user, I want to browse the product catalog without registering, so that I can quickly see what's available.

**Acceptance Criteria**:
- ✅ Can view all products without login
- ✅ Can search and filter products
- ✅ Can see product details and prices
- ✅ Can view active offers

---

**US-002**: As a guest user, I want to see promotional offers on products, so that I know which items are on sale.

**Acceptance Criteria**:
- ✅ Offer badges display on product cards
- ✅ Discounted prices are shown
- ✅ Original prices are crossed out
- ✅ Discount percentage/amount is visible

---

### 6.2 Customer User Stories

**US-003**: As a registered customer, I want to add products to my cart, so that I can purchase multiple items together.

**Acceptance Criteria**:
- ✅ Can add items from catalog
- ✅ Can specify quantity
- ✅ Cart persists across sessions
- ✅ Cart count badge updates

---

**US-004**: As a registered customer, I want to see my cart total with discounts applied, so that I know how much I'll pay.

**Acceptance Criteria**:
- ✅ Subtotal is displayed
- ✅ Discounts are itemized
- ✅ Final total is shown
- ✅ Calculations are accurate

---

**US-005**: As a registered customer, I want to complete checkout with my shipping address, so that I can receive my order.

**Acceptance Criteria**:
- ✅ Can enter shipping details
- ✅ Order preview shows totals
- ✅ Order confirmation is provided
- ✅ Payment reference is generated

---

**US-006**: As a registered customer, I want to view my order history, so that I can track past purchases.

**Acceptance Criteria**:
- ✅ Can see all past orders
- ✅ Order status is visible
- ✅ Can view order details
- ✅ Orders are sorted by date

---

**US-007**: As a registered customer, I want to see the status of my orders, so that I know when to expect delivery.

**Acceptance Criteria**:
- ✅ Status is clearly displayed (Processing, Shipped, Delivered)
- ✅ Status updates are visible
- ✅ Admin notes are shown (if any)

---

### 6.3 Admin User Stories

**US-008**: As an admin, I want to add new products to the catalog, so that customers can purchase them.

**Acceptance Criteria**:
- ✅ Can create products with all details
- ✅ Can upload image URLs
- ✅ Can set initial stock
- ✅ Products appear immediately in catalog

---

**US-009**: As an admin, I want to create promotional offers, so that I can attract customers with discounts.

**Acceptance Criteria**:
- ✅ Can create percentage discounts
- ✅ Can create fixed-amount discounts
- ✅ Can set start and end dates
- ✅ Offers apply automatically

---

**US-010**: As an admin, I want to update order statuses, so that customers know their order progress.

**Acceptance Criteria**:
- ✅ Can change status to Shipped/Delivered
- ✅ Can add notes to orders
- ✅ Changes are logged
- ✅ Customers see updated status

---

**US-011**: As an admin, I want to view dashboard metrics, so that I can monitor business performance.

**Acceptance Criteria**:
- ✅ Can see total orders
- ✅ Can see total revenue
- ✅ Can see product count
- ✅ Can see active offers count

---

**US-012**: As an admin, I want to see an audit log of all actions, so that I can track changes for compliance.

**Acceptance Criteria**:
- ✅ All CRUD operations are logged
- ✅ Logs show who, what, when
- ✅ Logs are immutable
- ✅ Metadata captures details

---

## 7. System Features

### 7.1 Feature List

| Feature ID | Feature Name | Priority | Status |
|------------|--------------|----------|--------|
| F-001 | User Registration & Login | High | ✅ Complete |
| F-002 | Guest Browsing Mode | High | ✅ Complete |
| F-003 | Product Catalog with Search | High | ✅ Complete |
| F-004 | Product Filtering | Medium | ✅ Complete |
| F-005 | Item-wise Promotional Offers | High | ✅ Complete |
| F-006 | Shopping Cart Management | High | ✅ Complete |
| F-007 | Checkout & Order Placement | High | ✅ Complete |
| F-008 | Order History & Tracking | High | ✅ Complete |
| F-009 | Admin Product Management | High | ✅ Complete |
| F-010 | Admin Offer Management | High | ✅ Complete |
| F-011 | Admin Order Management | High | ✅ Complete |
| F-012 | Admin Dashboard Metrics | Medium | ✅ Complete |
| F-013 | Audit Logging | Medium | ✅ Complete |
| F-014 | JWT Authentication | High | ✅ Complete |
| F-015 | Role-Based Authorization | High | ✅ Complete |
| F-016 | API Documentation (Swagger) | Medium | ✅ Complete |

---

## 8. Technical Requirements

### 8.1 Technology Stack

#### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.19.2
- **Language**: TypeScript 5.5.3
- **ORM**: Prisma 5.14.0
- **Database**: SQLite 3.x (development), PostgreSQL-ready
- **Authentication**: jsonwebtoken 9.0.2
- **Validation**: Zod 3.23.8

#### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.3.4
- **Routing**: React Router 6.24.1
- **State**: Zustand 4.5.4
- **HTTP Client**: Axios 1.7.2
- **Styling**: TailwindCSS 3.4.6

---

### 8.2 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

### 8.3 Development Environment

- **Node.js**: 20.x or higher
- **npm**: 9.x or higher
- **Git**: 2.x or higher
- **Code Editor**: VS Code (recommended)

---

### 8.4 Deployment Requirements

#### Development
- Local machine with Node.js
- SQLite (embedded)
- 2GB RAM minimum

#### Production (Future)
- Node.js hosting (e.g., Vercel, Railway)
- PostgreSQL database
- CDN for static assets
- SSL certificate

---

## 9. Constraints & Assumptions

### 9.1 Constraints

**C-001**: Development timeline limited to 90-minute session  
**C-002**: SQLite database for demo (not production-ready)  
**C-003**: Simulated payment processing (no real gateway)  
**C-004**: External image URLs only (no file upload)  
**C-005**: Single currency (USD assumed)  
**C-006**: No email notifications (future enhancement)  
**C-007**: No real-time inventory sync  

---

### 9.2 Assumptions

**A-001**: Users have modern browsers with JavaScript enabled  
**A-002**: Internet connection is stable  
**A-003**: Product images are hosted externally  
**A-004**: Guest users accept 24-hour session expiry  
**A-005**: Admin users are trusted (no multi-level admin roles)  
**A-006**: Order fulfillment is manual (no automation)  
**A-007**: Tax and shipping calculations are out of scope  

---

## 10. Success Criteria

### 10.1 Functional Success

✅ **All core features implemented and working**
- Product catalog with search/filter
- Cart and checkout flow
- Order management
- Admin portal with CRUD operations
- Authentication and authorization

✅ **Complete documentation delivered**
- API documentation (Swagger)
- Design document
- Implementation plan
- This scope document

✅ **Demo-ready application**
- Seed data loaded
- All user flows testable
- UI is polished and responsive

---

### 10.2 Technical Success

✅ **Code quality standards met**
- TypeScript with strict mode
- No critical linting errors
- Consistent code style
- Modular architecture

✅ **Security requirements satisfied**
- Passwords hashed
- JWT authentication working
- RBAC enforced
- Input validation in place

✅ **Performance targets achieved**
- API responses <1 second
- Frontend loads <3 seconds
- No N+1 query issues

---

### 10.3 Business Success

✅ **Stakeholder approval**
- Product owner accepts deliverables
- QA validates functionality
- Documentation is complete

✅ **User acceptance**
- Flows are intuitive
- UI is visually appealing
- No critical bugs

---

## 11. Out of Scope

The following features are explicitly **NOT** included in the current scope and are deferred to future phases:

### 11.1 Deferred Features

❌ **Payment Gateway Integration**
- Real payment processing (Stripe, PayPal)
- Payment method storage
- Refund processing

❌ **Email Notifications**
- Order confirmation emails
- Shipping notifications
- Password reset emails

❌ **Advanced Features**
- Product reviews and ratings
- Wishlist functionality
- Product recommendations (AI-driven)
- Loyalty programs
- Subscription tiers

❌ **Inventory Management**
- Real-time supplier sync
- Automatic reordering
- Multi-warehouse support

❌ **Marketing Integration**
- Newsletter subscriptions
- Social media sharing
- Analytics tracking (Google Analytics)

❌ **Advanced Admin Features**
- Multi-level admin roles
- Bulk operations
- Advanced reporting
- Export functionality

❌ **Internationalization**
- Multi-language support
- Multi-currency support
- Regional pricing

❌ **Mobile Apps**
- Native iOS app
- Native Android app

❌ **Third-Party Integrations**
- Shipping providers (FedEx, UPS)
- CRM systems
- Accounting software

---

## 12. Acceptance Criteria

### 12.1 Feature Acceptance

Each feature must meet the following criteria to be considered complete:

1. **Functionality**: Feature works as specified in requirements
2. **Testing**: Manual testing confirms expected behavior
3. **Documentation**: API endpoints documented in Swagger
4. **Code Quality**: TypeScript compiles without errors
5. **Security**: Authorization checks in place where required

---

### 12.2 System Acceptance

The complete system must meet:

1. **All high-priority features implemented** ✅
2. **API documentation complete** ✅
3. **Seed data loads successfully** ✅
4. **Frontend and backend integrate correctly** ✅
5. **No critical bugs** ✅
6. **Documentation suite complete** ✅

---

### 12.3 Sign-Off Criteria

**Development Team Sign-Off**:
- ✅ All features implemented
- ✅ Code committed to repository
- ✅ Documentation complete

**QA Sign-Off**:
- ✅ Manual testing completed
- ✅ No critical defects
- ✅ User flows validated

**Product Owner Sign-Off**:
- ✅ Requirements met
- ✅ Demo successful
- ✅ Ready for deployment

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Access Token** | Short-lived JWT token for API authorization (15 minutes) |
| **Audit Log** | Immutable record of admin actions |
| **Cart** | Collection of products a user intends to purchase |
| **Guest User** | Temporary user with limited access (browse only) |
| **Item-wise Offer** | Discount applied to a specific product |
| **Offer** | Promotional discount (percentage or fixed amount) |
| **Order** | Confirmed purchase with payment reference |
| **Price Snapshot** | Historical price captured at time of cart addition |
| **Refresh Token** | Long-lived token for obtaining new access tokens (7 days) |
| **RBAC** | Role-Based Access Control |
| **Soft Delete** | Marking record as inactive instead of deleting |

---

## Appendix B: Acronyms

| Acronym | Full Form |
|---------|-----------|
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete |
| **CORS** | Cross-Origin Resource Sharing |
| **ERD** | Entity Relationship Diagram |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **RBAC** | Role-Based Access Control |
| **REST** | Representational State Transfer |
| **SPA** | Single Page Application |
| **SQL** | Structured Query Language |
| **UI** | User Interface |
| **UX** | User Experience |
| **WCAG** | Web Content Accessibility Guidelines |
| **XSS** | Cross-Site Scripting |

---

## Appendix C: References

1. **Prisma Documentation**: https://www.prisma.io/docs
2. **React Documentation**: https://react.dev
3. **Express.js Guide**: https://expressjs.com
4. **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
5. **OpenAPI Specification**: https://swagger.io/specification
6. **TailwindCSS Docs**: https://tailwindcss.com/docs

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | [Name] | _________ | 2026-03-12 |
| Tech Lead | [Name] | _________ | 2026-03-12 |
| QA Lead | [Name] | _________ | 2026-03-12 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-12 | Development Team | Initial scope & requirements document |

---

**End of Scope & Requirements Document**
