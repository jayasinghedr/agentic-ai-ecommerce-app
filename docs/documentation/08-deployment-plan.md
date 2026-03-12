# Deployment Plan

## 1. Overview
Provide a lightweight yet complete deployment and runbook for the Agentic AI E-Commerce prototype so teams can stand up the stack locally or via optional Docker Compose during the Vibe Coding session.

## 2. Environments
| Environment | Purpose | URL / Host | Notes |
|-------------|---------|------------|-------|
| Local Dev (default) | Day-of workshop development | Frontend: `http://localhost:5173`, Backend: `http://localhost:5000` | Uses Vite dev server + Node dev server with SQLite file. |
| Docker Compose (optional) | Consistent demo runtime | Frontend service + backend service + SQLite volume | Triggered via `docker-compose up --build`. |

## 3. Prerequisites
- Node.js 20 (LTS) + npm 10.
- SQLite (bundled, no manual install required).
- Docker & Docker Compose (optional path).
- Git + editor with Markdown support (for docs updates).

## 4. Configuration
| Variable | Location | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | `backend/.env` | Express server port | `5000` |
| `DATABASE_URL` | `backend/.env` | Prisma SQLite connection string | `file:./dev.db` |
| `JWT_SECRET` | `backend/.env` | Symmetric signing key | `super-secret` |
| `REFRESH_TOKEN_SECRET` | `backend/.env` | Refresh token key | `refresh-secret` |
| `FRONTEND_URL` | `backend/.env` | CORS + cookie domain | `http://localhost:5173` |
| `VITE_API_BASE_URL` | `frontend/.env` | Frontend API base | `http://localhost:5000` |

Provide `.env.example` with placeholders; never commit secrets.

## 5. Local Setup Steps
```
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```
- Backend serves API at `http://localhost:5000` and Swagger at `/api/docs`.
- Frontend accessible via `http://localhost:5173` with hot reload.

## 6. Docker Compose Workflow
```
docker-compose up --build
```
- Services: `frontend` (Vite build served via nginx or Vite preview), `backend` (Node), `db` (SQLite volume mounted).
- Exposed ports: 5173 (frontend), 5000 (backend).
- Environment variables passed through `.env` files referenced in compose file.

## 7. Health Checks
| Component | Check | Command |
|-----------|-------|---------|
| Backend | Liveness | `curl http://localhost:5000/api/health` (implement simple endpoint). |
| Swagger | Documentation reachable | Browser `http://localhost:5000/api/docs`. |
| Frontend | UI served | Browser `http://localhost:5173`. |
| DB | Prisma migration status | `npx prisma migrate status`. |

## 8. Deployment Checklist
1. Verify `.env` values populated (never leave defaults for secrets in demos).
2. Run Prisma migrations + seed without errors.
3. Start backend, confirm logs show `Server running on port 5000`.
4. Start frontend, confirm inventory loads from API.
5. Execute smoke test (login, add to cart, checkout) before client demo.
6. Export latest OpenAPI spec (if needed) via `npx prisma generate` + swagger build.
7. Archive documentation folder (`docs/documentation/`) with other deliverables.

## 9. Rollback / Recovery
- Since deployment is local/demo, rollback = stop services, re-run migrations/seed, restart.
- For Docker path: `docker-compose down -v` to wipe volumes; rerun `up --build`.

## 10. Traceability
- Supports REQ-007 (documentation) and Task Guide requirement for deployment plan.
- References Implementation Plan “Running Locally” and “Docker Compose” sections to keep instructions synchronized.
