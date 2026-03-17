# 🕵️ Senior Developer Project Audit Report: Oi! Lend Me
*Audit performed against the 9 Core Domains of Production Readiness.*

After a comprehensive review of the architecture, database schema, API layer, and testing infrastructure, here are the findings. This report focuses on issues that will cause the system to break under load, expose data, or become unmaintainable as traffic scales.

---

### 🔴 CRITICAL — Fix Before Any Production Deployment
*Issues that can cause data loss, security breach, full outage, or business-ending events.*

1. **Catastrophic N+1 Queries & Synchronous Blocking in Group Ban (Domain 1, 4, 6)**
   - **Location:** `src/app/admin/actions.ts` -> `performModerationAction`
   - **Why it's catastrophic:** Banning a group queries all group members, then loops through them synchronously executing `await prisma.userSuspension.create` and `await prisma.notification.create` ONE BY ONE in the HTTP request cycle. If a group has 5,000 members, this single action fires 10,000 sequential `INSERT` statements. The HTTP request will time out, the Node thread will block, and the connection pool will exhaust, taking down the entire app for all users.
   - **Fix:** Use `prisma.userSuspension.createMany` and `prisma.notification.createMany` to batch insert outside of a synchronous loop, or offload this massive fan-out operation to a background job queue.

2. **Missing Database Indexes on Chat Messages (Domain 1)**
   - **Location:** `prisma/schema.prisma` -> `Message` model
   - **Why it's catastrophic:** There are ZERO indexes on the `Message` table. Fetching history for a conversation queries `WHERE conversation_id = ? ORDER BY created_at`. Without an index, PostgreSQL will perform a full table scan for *every single chat load*. As soon as the platform accumulates meaningful message volume, database CPU will hit 100%.
   - **Fix:** Add `@@index([conversationId, createdAt])` to the `Message` model.

3. **Check-Then-Act Race Condition in Request Approvals (Domain 4)**
   - **Location:** `src/app/api/requests/[id]/approve/route.ts`
   - **Why it's catastrophic:** The endpoint reads `existingRequest` and `item`, verifies they are `PENDING` and `AVAILABLE`, and then updates them. Under concurrency (e.g., impatient user double-clicking, or approving two concurrent requests for the same item at the exact same millisecond), both requests will read the state as valid, then both will update the item. The owner receives double karma, and two users think they successfully grabbed the same physical item.
   - **Fix:** Implement Optimistic Concurrency Control. Change the update to include the expected state: `await tx.request.update({ where: { id, status: 'PENDING' }, data: { status: 'BORROWED' } })`. If it fails, another transaction got there first.

4. **Zero Rate Limiting on Authentication and API Routes (Domain 2)**
   - **Location:** `src/middleware.ts` and `src/app/api/*`
   - **Why it's catastrophic:** There is no rate limiting implemented. Attackers can brute-force the login endpoints, spam the `/api/upload` endpoint, or DDoS the search APIs effortlessly.
   - **Fix:** Implement IP-based rate limiting in Next.js Middleware (e.g., using Upstash Redis or a local memory cache wrapper).

---

### 🟠 HIGH — Fix Within This Sprint
*Issues that will cause production degradation, security exposure, or scalability failure under real load.*

1. **Unbounded Queries and In-Memory Aggregation (Domain 1)**
   - **Location:** `src/app/admin/actions.ts` -> `getAdminAnalytics()`
   - **Why it's bad:** The function executes `prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } } })` and fetches *every single user and item from the last 30 days into Node memory* just to map and count them by date. At scale, this causes Out-Of-Memory (OOM) crashes.
   - **Fix:** Perform the aggregation inside PostgreSQL. Build a raw query using `GROUP BY date(created_at)` to return just the 30 rows of counts, rather than pulling 50,000 records across the network to count them in JavaScript.

2. **File I/O Inside Database Transactions (Domain 1 & 3)**
   - **Location:** `src/app/api/items/route.ts` -> `POST`
   - **Why it's bad:** The code executes `await fs.writeFile(filePath, buffer)` *inside* `prisma.$transaction`. Disk I/O is slow. Holding a database transaction open while writing files to disk means the connection is checked out of the pool but doing nothing. Under spikes of traffic (e.g., 50 people uploading items at once), the DB connection pool will exhaust.
   - **Fix:** Write the files to the filesystem *first*, collect the generated URLs, and *then* open the database transaction to insert the Item and ItemImage records.

3. **Unbounded List Endpoints in Admin (Domain 1)**
   - **Location:** `src/app/admin/actions.ts` -> `getReports()`, `getFeedback()`, `getModerationLogs()`
   - **Why it's bad:** These endpoints call `.findMany()` with no `take` or `skip`. Returning 10,000 reports in one JSON payload will crash the browser and the server.
   - **Fix:** Enforce a hard cap (e.g., `take: 100`) or implement proper pagination.

---

### 🟡 MEDIUM — Fix Within This Quarter
*Issues that are acceptable short-term but create compounding technical debt or reliability risk.*

1. **Business Logic Tangled in HTTP Handlers (Domain 6)**
   - **Location:** `/api/items/route.ts` and `/api/requests/...`
   - **Why it's bad:** Parsing formatting (`FormData`), authorization limits, database mutations, and Karma point rewards are all mashed into giant 250-line controller functions. These are "God functions." It makes testing business logic without spinning up a mock HTTP server impossible.
   - **Fix:** Introduce a Service Layer. Extract logic into `ItemService.createItem()` and `RequestService.approveRequest()`.

2. **Observability Black Holes (Domain 7)**
   - **Location:** Global
   - **Why it's bad:** Errors are caught with generic `catch (e) { console.error('Error:', e); return errorResponse(500); }`. Logs lack structured JSON formats, Request IDs, User IDs, or Correlation IDs. At 3 AM, tracking down why a specific user got a 500 error will be impossible without tracing.
   - **Fix:** Replace `console.error` with a structured logger (like Winston or Pino) that automatically injects execution context.

3. **Hardcoded Secrets in Docker Architecture (Domain 8)**
   - **Location:** `docker-compose.yml`
   - **Why it's bad:** `NEXTAUTH_SECRET` and Postgres credentials are hardcoded into the yaml file tracked by git.
   - **Fix:** Replace with variable interpolation (e.g., `NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`) and rely on `.env`.

---

### 🟢 LOW / IMPROVEMENTS
*Best practices, code quality, and proactive hardening that separates good from great.*

1. **In-Memory Chat Typing State (Domain 3)**
   - The route `api/chat/typing/route.ts` handles typing presence as a pseudo-endpoint. As noted in the code comments, this won't scale across Vercel serverless functions or multiple Node workers. Since you lack Redis, consider migrating realtime awareness to a managed service like Supabase Realtime or Pusher.
2. **Missing `updatedAt` indexes**
   - Several tables lack indexes on `updatedAt`, making chronological syncs or ordered fetches slower than they need to be.

---

### ✅ WHAT'S DONE WELL
*This is not a purely negative report. Here are the exceptional architectural decisions made:*

- **Top-Tier Testing Infrastructure (Domain 9):** The presence of `tests/load`, `tests/concurrency`, `tests/security`, and Playwright E2E suites is extremely rare and highly commendable. This demonstrates a production-first mindset.
- **Strict BOLA/IDOR Protections (Domain 2):** Object-level authorization is rigorously enforced. Endpoints consistently check `item.ownerId !== session.userId` before allowing mutations, preventing users from modifying data they don't own.
- **Relational Integrity via Database:** The `schema.prisma` makes excellent use of `onDelete: Cascade` and `SetNull`. Enforcing data integrity at the database schema level prevents ghost records and application-level orphaned data bugs.
