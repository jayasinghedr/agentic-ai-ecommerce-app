# NexaGear — Unit Test Quickstart Guide

> All unit and integration tests for the NexaGear backend live in this folder.  
> Tests run against **zero real infrastructure** — no database, no running server required.

---

## Prerequisites

| Requirement | Check |
|---|---|
| Node.js 18+ installed | `node -v` |
| Dependencies installed | `npm install` (inside `backend/`) |

No `.env` file is needed — tests use built-in config defaults automatically.

---

## Run the Tests

Navigate to the `backend/` folder first:

```bash
cd E:\Zone24x7\agentic-ai-ecommerce-app\backend
```

### Run all tests (recommended)

```bash
npm test -- --forceExit
```

### Watch mode — re-runs on every file save

```bash
npm test -- --watch --forceExit
```

### Verbose output — shows every individual test name

```bash
npm test -- --forceExit --verbose
```

### Run a single test file or folder

```bash
# Only auth tests
npm test -- --forceExit --testPathPattern="auth"

# Only utility tests
npm test -- --forceExit --testPathPattern="utils"

# Only middleware tests
npm test -- --forceExit --testPathPattern="middleware"

# Only route integration tests
npm test -- --forceExit --testPathPattern="routes"
```

### Generate a coverage report

```bash
npm test -- --forceExit --coverage
```

After running, open `backend/coverage/lcov-report/index.html` in your browser for a
visual, line-by-line coverage breakdown.

---

## Test File Map

```
src/__tests__/
│
├── utils/
│   ├── jwt.test.ts              # generateAccessToken, verifyAccessToken,
│   │                            # generateRefreshToken, verifyRefreshToken
│   └── password.test.ts         # hashPassword, comparePassword
│
├── middleware/
│   ├── auth.test.ts             # authenticate, optionalAuthenticate, requireRole
│   └── errorHandler.test.ts     # global Express error handler
│
├── controllers/
│   └── cart.utils.test.ts       # applyDiscount (percentage / fixed / edge cases)
│
└── routes/  (supertest — HTTP-level integration tests)
    ├── auth.test.ts             # POST /api/auth/*
    ├── products.test.ts         # GET|POST|PATCH|DELETE /api/products/*
    ├── cart.test.ts             # GET|POST|DELETE /api/cart/*
    ├── orders.test.ts           # GET /api/orders/*
    └── admin.test.ts            # GET|PATCH /api/admin/*
```

---

## Test Count at a Glance

| File | Tests | What is covered |
|---|---|---|
| `utils/jwt.test.ts` | 8 | Token generation, valid decode, invalid/wrong-secret throws |
| `utils/password.test.ts` | 4 | Bcrypt hash format, salt uniqueness, compare true/false |
| `middleware/auth.test.ts` | 11 | Missing header, invalid token, valid token, role guards |
| `middleware/errorHandler.test.ts` | 2 | 500 status, error message propagation |
| `controllers/cart.utils.test.ts` | 5 | No offer, % discount, fixed discount, floor/cap at 0 |
| `routes/auth.test.ts` | 11 | Register (validation, 409, 201), login (401, 200), guest, refresh, logout |
| `routes/products.test.ts` | 10 | List, get (404), create (401/403/400/201), update, delete |
| `routes/cart.test.ts` | 6 | Auth guard, empty cart, add item (400/404/stock), remove (404) |
| `routes/orders.test.ts` | 4 | Auth guard, list orders, get (404), get (403 — wrong user) |
| `routes/admin.test.ts` | 7 | Auth/role guards, metrics (200), list orders, update status (400/200) |
| **Total** | **68** | |

---

## How the Tests Work

### No database needed
All `prisma.*` calls are intercepted by `jest.mock()`. Each test sets up its own
mock return value using `mockResolvedValueOnce()`, so tests are fully isolated and
deterministic.

```typescript
// Example: make prisma.product.findUnique return null (product not found)
mockPrisma.product.findUnique.mockResolvedValueOnce(null);
```

### No server port conflicts
`app.listen()` is skipped when `NODE_ENV=test` (set at the top of `jest.config.js`).
Supertest creates an in-process HTTP server for each request — no ports are occupied.

### No `.env` required
`src/config/index.ts` provides safe defaults for all variables (`JWT_SECRET`,
`DATABASE_URL`, etc.), so tests work out of the box on any machine.

### Mocks are reset between every test
Each test file calls `jest.resetAllMocks()` in `beforeEach`, preventing one test's
mock setup from leaking into the next.

---

## Writing a New Test

### 1 — Pure unit test (utils / helpers)

```typescript
// src/__tests__/utils/myHelper.test.ts
import { myFunction } from '../../utils/myHelper';

describe('myFunction', () => {
  test('returns expected value', () => {
    expect(myFunction(42)).toBe('42');
  });
});
```

### 2 — Route integration test (with mocked Prisma)

```typescript
// src/__tests__/routes/myRoute.test.ts

// ① Mock Prisma BEFORE any imports
jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    myModel: {
      findUnique: jest.fn(),
      create:     jest.fn(),
    },
  },
}));

import request from 'supertest';
import app from '../../app';
import prisma from '../../utils/prismaClient';
import { generateAccessToken } from '../../utils/jwt';

const mockPrisma = prisma as any;
const token = generateAccessToken({ userId: 1, role: 'customer', email: 'a@b.com' });

beforeEach(() => jest.resetAllMocks());

describe('GET /api/my-route', () => {
  test('returns 200 with data', async () => {
    mockPrisma.myModel.findUnique.mockResolvedValueOnce({ id: 1, name: 'Thing' });

    const res = await request(app)
      .get('/api/my-route/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Thing');
  });
});
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module '../../utils/prismaClient'` | Run `npm install` and `npx prisma generate` |
| Tests hang after finishing | Add `--forceExit` to the command |
| `SyntaxError: Cannot use import statement` | Ensure `ts-jest` is installed: `npm install` |
| A mock doesn't seem to intercept | Make sure `jest.mock(...)` is at the top of the file, before all imports |
| Old mock values leaking between tests | Confirm `jest.resetAllMocks()` is called in `beforeEach` |
| `PrismaClientInitializationError` | The `prismaClient` mock is missing for that test file — add `jest.mock('../../utils/prismaClient', ...)` |
