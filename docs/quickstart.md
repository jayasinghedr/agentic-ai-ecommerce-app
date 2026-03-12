# NexaGear — Quickstart Guide

> **Next-gen, every gear** · Full-stack e-commerce application powered by Node.js, React, and Prisma.

---

## Prerequisites

Make sure the following are installed on your machine before you begin:

| Tool | Minimum Version | Check |
|---|---|---|
| Node.js | 18.x or higher | `node -v` |
| npm | 9.x or higher | `npm -v` |
| Git | Any recent version | `git --version` |
| Docker *(optional)* | 20.x or higher | `docker -v` |

---

## Project Structure

```
agentic-ai-ecommerce-app/
├── backend/          # Node.js + Express + Prisma API
│   ├── prisma/       # Schema, migrations, seed
│   └── src/          # Controllers, routes, middleware, utils
├── frontend/         # React + Vite + TailwindCSS SPA
│   └── src/          # Pages, components, stores, API client
├── docs/             # Project documentation
└── docker-compose.yml
```

---

## Option A — Run Locally (Recommended for Development)

### Step 1 — Clone the repository

```bash
git clone https://github.com/jayasinghedr/agentic-ai-ecommerce-app.git
cd agentic-ai-ecommerce-app
```

---

### Step 2 — Backend Setup

```bash
cd backend
```

**Install dependencies**
```bash
npm install
```

**Create the environment file**

Create a file named `.env` inside the `backend/` folder with the following content:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="SECRET1"
JWT_REFRESH_SECRET="SECRET2"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Run database migrations**
```bash
npx prisma migrate dev --name init
```

**Seed the database** (creates demo accounts + sample products)
```bash
npm run seed
```

**Start the backend dev server**
```bash
npm run dev
```

The backend will be available at **http://localhost:5000**

---

### Step 3 — Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

## Option B — Run with Docker Compose

From the project root, run:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

To stop:
```bash
docker-compose down
```

---

## Key URLs

| URL | Description |
|---|---|
| http://localhost:5173 | NexaGear storefront |
| http://localhost:5173/login | Login page |
| http://localhost:5173/catalog | Product catalog |
| http://localhost:5173/admin | Admin dashboard *(admin only)* |
| http://localhost:5000/api/docs | Interactive Swagger API docs |
| http://localhost:5000/api/health | Backend health check |

---

## Useful Commands

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run seed` | Reset & re-seed the database |
| `npm run migrate` | Run pending Prisma migrations |
| `npx prisma studio` | Open Prisma database GUI |
| `npm test` | Run Jest test suite |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## Features Overview

### Customer
- Browse product catalog with search & filters
- Add items to cart (works as a guest too)
- Apply item-wise discounts automatically at checkout
- Place orders with shipping details
- View order history and order status

### Admin
- Dashboard with key metrics (orders, revenue, products, users)
- Manage products — create, edit, activate/deactivate
- Manage offers — percentage or fixed-amount discounts per product
- Manage orders — view all orders and update their status

---

## Resetting the Database

If you need a clean slate:

```bash
cd backend
npm run seed
```

This will wipe all existing data and re-seed with fresh demo products, offers, and accounts.

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite file path | `file:./dev.db` |
| `JWT_SECRET` | Access token signing key | *(set in .env)* |
| `JWT_REFRESH_SECRET` | Refresh token signing key | *(set in .env)* |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (`development`/`production`) | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

---

## Troubleshooting

**Backend won't start**
- Make sure `.env` file exists inside the `backend/` folder
- Run `npx prisma generate` if Prisma client is missing

**"Invalid credentials" on login**
- Ensure the database has been seeded: `npm run seed`
- Use the exact credentials from the Demo Accounts table above

**Images not loading**
- This project uses `placehold.co` placeholder images which require internet access
- In air-gapped/restricted environments the placeholders will fall back to broken image icons gracefully

**Frontend can't reach the backend**
- Confirm the backend is running on port `5000`
- The Vite dev server proxies `/api` → `http://localhost:5000` automatically

**Port already in use**
- Change `PORT` in `backend/.env` and update `vite.config.ts` proxy target accordingly
