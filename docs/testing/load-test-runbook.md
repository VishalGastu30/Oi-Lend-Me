# Load Test Runbook

## Prerequisites
1. k6 installed ([installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/))
2. App running and accessible
3. Database seeded with test data

## Step-by-Step

### 1. Seed Database
```bash
# For load tests, use the large seed
npm run seed:large
# OR with specific size
tsx prisma/seed-large.ts --size medium  # 2k users, 5k items
```

### 2. Start the App
```bash
# Option A: Local dev server
npm run dev

# Option B: Docker (production-like)
docker compose up -d
```

### 3. Run Load Tests

#### Browsing Scenario (1,600 VUs)
```bash
k6 run tests/load/browsing-scenario.js
```

#### Write Scenario (200 VUs)
```bash
k6 run tests/load/write-scenario.js
```

#### Full 2,000 User Test
```bash
k6 run tests/load/full-load-2k.js
```

#### Stress Test (find breaking point)
```bash
k6 run tests/load/stress-test.js
```

#### Custom Base URL (staging)
```bash
k6 run -e BASE_URL=http://staging-server:3000 tests/load/full-load-2k.js
```

### 4. Capture Metrics
- During the test, monitor Grafana dashboards (if observability stack is running)
- k6 outputs summary statistics at the end of each run
- For JSON output: `k6 run --out json=results.json tests/load/full-load-2k.js`

### 5. Validate DB Integrity Post-Run
```sql
-- Run against the database after load test
SELECT 'users' as table_name, count(*) FROM users
UNION ALL SELECT 'items', count(*) FROM items  
UNION ALL SELECT 'requests', count(*) FROM requests;

-- Check for data corruption
SELECT id, status FROM items WHERE status NOT IN ('AVAILABLE', 'BORROWED', 'REQUESTED', 'ARCHIVED');
SELECT id, status FROM requests WHERE status NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'BORROWED', 'RETURNED', 'CANCELLED');
```

### 6. Fill Out Report
Use the template at `docs/testing/load-test-report-template.md`
