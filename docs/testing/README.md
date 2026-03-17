# Testing Documentation — Oi-Lend-Me

## Quick Reference

| Test Type | Command | Requires |
|-----------|---------|----------|
| Unit tests | `npm run test:unit` | Nothing |
| Integration tests | `npm run test:integration` | Test DB |
| E2E tests | `npm run test:e2e` | App running + DB seeded |
| E2E (headed) | `npm run test:e2e:headed` | Same as E2E |
| Concurrency tests | `npm run test:concurrency` | Nothing (mocked) |
| Security tests | `npm run test:security` | Nothing (mocked) |
| Coverage report | `npm run test:coverage` | Nothing |
| All tests | `npm run test:all` | Test DB + App running |

## Setup

### 1. Test Database
```bash
npm run test:db:up          # Start isolated PostgreSQL on port 5433
npx prisma migrate deploy   # Apply migrations to test DB
npm run seed:test            # Seed deterministic test data
```

### 2. Seed Data Options
```bash
npm run seed:test            # 5 users, 10 items (for E2E/integration)
npm run seed:large           # 10k users, 20k items (for load testing)
tsx prisma/seed-large.ts --size small    # 500 users
tsx prisma/seed-large.ts --size medium   # 2k users
tsx prisma/seed-large.ts --sanitize      # PII-free variant
```

### 3. Test Credentials
| User | Email | Password | Role |
|------|-------|----------|------|
| Alice | alice@college.edu | password123 | STUDENT |
| Bob | bob@college.edu | password123 | STUDENT |
| Charlie | charlie@college.edu | password123 | STUDENT |
| Diana | diana@college.edu | password123 | STUDENT |
| Admin | valiantvishal30@gmail.com | IamAdmin@3004 | ADMIN |

## Test Architecture

### Unit Tests (`tests/unit/`)
Mock-based tests for API route handlers and library functions.
- `lib/` — Auth guards, moderation logic
- `api/auth/` — Login, signup routes
- `api/items/` — Item CRUD
- `api/requests/` — Request state machine (PENDING→BORROWED→RETURNED)
- `api/admin/` — Warn, ban, suspend flows
- `api/groups/` — Group management
- `api/chat/` — Conversations

### E2E Tests (`e2e/`)
Playwright browser tests against running app.
- `critical-flows.spec.ts` — Landing, login, dashboard, search
- `lending-lifecycle.spec.ts` — Owner/borrower flows
- `group-flows.spec.ts` — Group navigation
- `moderation-flows.spec.ts` — Admin moderation + banned user
- `chat-flow.spec.ts` — Chat functionality

### Load Tests (`tests/load/`)
k6 scripts for performance validation.
```bash
# Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
k6 run tests/load/browsing-scenario.js              # 1,600 VUs
k6 run tests/load/write-scenario.js                 # 200 VUs
k6 run tests/load/full-load-2k.js                   # 2,000 VUs combined
k6 run tests/load/stress-test.js                    # 0→5,000 VUs
k6 run -e BASE_URL=http://staging:3000 tests/load/full-load-2k.js  # Custom URL
```

**KPI Thresholds:**
- Read p95 < 800ms
- Write p95 < 1500ms
- Error rate < 1%
- DB CPU < 70%

### Security Tests
```bash
npm run test:security                                # Jest security checks
npx semgrep --config .semgrep.yml src/              # Static analysis
```

## CI/CD Pipelines

### PR Checks (`.github/workflows/pr-checks.yml`)
- Lint + TypeScript check
- Unit tests with PostgreSQL service
- Security scan (npm audit + Semgrep)
- E2E smoke on main branch pushes

### Nightly (`.github/workflows/nightly.yml`)
- Full E2E suite
- Load test smoke (100 VUs, 2 min)
- Weekly security scan with OWASP rules

## Observability

```bash
docker compose -f docker-compose.observability.yml up -d
```
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

## Backup & Restore

See [backup-restore-runbook.md](./backup-restore-runbook.md)
