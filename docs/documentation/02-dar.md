# Decision Analysis & Resolution (DAR)

## 1. Purpose
Provide rationale for the technology and process decisions anchoring the Agentic AI E-Commerce solution so every team member can confidently build on consistent foundations.

## 2. Evaluation Criteria
1. **Speed to implement** within 90-minute session.
2. **LLM friendliness** (clear scaffolding, type safety, auto-generated docs).
3. **Maintainability** post-workshop.
4. **Workshop tooling availability** (local dev, minimal setup).
5. **Security & compliance** alignment with requirements.

## 3. Key Decisions
| # | Topic | Options Considered | Decision | Rationale |
|---|-------|--------------------|----------|-----------|
| D-01 | Frontend stack | React + Vite, Vue, Next.js | **React + Vite** | Fast scaffold, known by team, aligns with spec and existing templates.
| D-02 | State management | Redux Toolkit, Context API, Zustand | **Zustand** | Minimal boilerplate, ergonomic for LLM generation, meets session time constraint.
| D-03 | Backend framework | Express, NestJS, Fastify | **Express.js** | Lightweight, abundant examples, friendly to swagger-jsdoc.
| D-04 | ORM / DB access | Prisma, Sequelize, Knex | **Prisma** | Schema doubles as documentation, strong TypeScript integration, SQLite ready.
| D-05 | Database | SQLite, PostgreSQL, MongoDB | **SQLite** | Zero setup, file-based, perfect for workshop demo.
| D-06 | Auth strategy | Session cookies, JWT, hybrid | **JWT (access) + refresh cookie** | Clear separation of concerns, mirrored in spec, easily demoed.
| D-07 | Guest persistence | Separate table, memory, `users` table flag | **`users` table with `role='guest'` + TTL** | Reuses auth pipeline, keeps audit trail.
| D-08 | Offer model | Order-level promos, item-level, coupon codes | **Item-wise offers** | Simplifies calculations, meets requirement of tagging products with offers.
| D-09 | Documentation tooling | Mixed formats, Google Docs, repo markdown | **Repo markdown under `docs/documentation/`** | Version-controlled, easy LLM ingestion.
| D-10 | API docs | Manual markdown, Postman only, Swagger | **OpenAPI via swagger-jsdoc** | Machine-readable, aligns with requirement for `/api/docs`.

## 4. Rejected Options Notes
- **Redux Toolkit**: Powerful but slower to scaffold; risk of partial implementations during session.
- **NestJS**: Overhead from modules/decorators deemed too heavy for timebox.
- **Separate guest session table**: Added joins and migration work without extra value; TTL flag inside `users` is sufficient.

## 5. Implications
1. Prisma schema is the source of truth for data model; all docs must mirror it.
2. Security posture relies on JWT middleware and role guards; QA must stress these flows.
3. React + Zustand requires hydration logic (token refresh) captured in API and QA docs.
4. Markdown-based documentation mandates consistent templates to avoid drift; this DAR is referenced by change log.

## 6. Acceptance
Decision log maintained by documentation engineer; changes require updates to both this DAR and `10-change-log-and-traceability.md`.
