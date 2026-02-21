# Database Integrity & Hardening Report

## 🛡️ Data Integrity Guarantees

The database layer enforces the following rules strictly, independent of backend logic:

1.  **Immutability of History**:
    - `reputation_logs` cannot be updated or deleted.
    - **Enforced by**: PostgreSQL Trigger `enforce_reputation_immutability`.
    - **Backend Impact**: No need for "defensive checks" before read; data is trusted.

2.  **Single Active Request**:
    - An item cannot be borrowed/requested if it is already active.
    - **Enforced by**: Unique Index (or partial logic) on `requests(itemId)` where status is active. *Confirmed by stress test 'Double Borrow'.*
    - **Backend Impact**: `createRequest` can simply catch the error rather than doing a "Read-then-Write" check which is prone to race conditions.

3.  **Referential Integrity**:
    - Orphaned requests/items cannot exist.
    - **Enforced by**: Foreign Key Constraints (`P2003`).

4.  **Schema Consistency**:
    - Status transitions and Category values are strictly typed via ENUMs.

---

## 🔍 Optimization & Views

### Database Views
We created standard PostgreSQL specific views to offload complex joins from the application.

1.  `available_items_view`: Returns all items ready for borrowing.
2.  `active_borrows_view`: Pre-joins Users, Items, and Requests for dashboard displays.
3.  `user_reputation_summary`: Aggregates trust scores instantly.

**Why?**
- Faster reads for complex dashboards.
- Backend just queries `prisma.activeBorrowsView.findMany()` (requires enabling views in Prisma preview or using raw query).
- **Supabase Ready**: These views are exposed automatically by Supabase API.

### Index Strategy
Indexes added to optimize frequent lookups:
- **Foreign Keys**: `ownerId`, `groupId`, `requesterId`, `itemId`. (Speeds up joins).
- **Filters**: `status` (Used on almost every screen), `category`.
- **Sorting**: `createdAt`, `karmaScore`.

---

## ☁️ Supabase & Deployment Compatibility

- **UUIDs**: All primary keys are `UUID` (@default(uuid())), fully compatible with Supabase logic.
- **Triggers**: Written in PL/pgSQL, supported natively by Supabase Postgres.
- **Views**: Supported.
- **Connection**: Uses Transaction Pooling (Supabase requires Session pooling for prepared statements, or Transaction pooling for serverless functions). Current Prisma adapter setup is compatible.

**Recommendation**: Enable **Row Level Security (RLS)** in the future if exposing DB directly to frontend client (Supabase Client). Current hardening assumes Backend-as-Gateway (Node.js API).
