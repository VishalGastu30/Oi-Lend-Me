# Transaction Scenarios & ACID Properties

This document outlines key transaction scenarios implemented or required for "Oi! Lend Me" to ensure ACID (Atomicity, Consistency, Isolation, Durability) properties.

## 1. Approving a Borrow Request (Consistency & Atomicity)
When a Lender approves a request, multiple state changes must happen simultaneously. If any fail, none should apply.

**Steps:**
1.  **Begin Transaction**
2.  Update `Request` status to `APPROVED`.
3.  Update `Item` status to `REQUESTED` (or `BORROWED` if skipping pickup).
4.  Create a `Notification` for the Borrower.
5.  **Commit Transaction**

**Why:** Prevents a scenario where a Request is approved but the Item remains marked "AVAILABLE" for others to grab.

**Prisma Implementation:**
```typescript
await prisma.$transaction([
  prisma.request.update({ where: { id: reqId }, data: { status: 'APPROVED' } }),
  prisma.item.update({ where: { id: itemId }, data: { status: 'REQUESTED' } }),
  prisma.notification.create({ ... })
]);
```

## 2. Returning an Item (reputation Logic)
Returning an item involves state updates and reputation calculation.

**Steps:**
1.  **Begin Transaction**
2.  Update `Request` status to `RETURNED`, set `returnedAt`.
3.  Update `Item` status to `AVAILABLE`.
4.  Insert `ReputationLog` for the Borrower (Karma calculation).
5.  Update `User` total `karmaScore`.
6.  **Commit Transaction**

**Why:** Ensures karma is always in sync with history. Explicit locks may be needed on the User row if high concurrency is expected (Optimistic Concurrency Control via versioning or pessimistic locking).

## 3. Reassigning Group Items
If a group admin leaves, items must remain with the group but might need a new contact person (if contact is stored). Since ownership is `groupId`, this is simpler, but transferring `Group.admin` role is a transaction.

**Steps:**
1.  **Begin Transaction**
2.  Downgrade old Admin to Member (in `GroupMember`).
3.  Upgrade new Member to Admin.
4.  **Commit Transaction**

## 4. Double Borrow Prevention (Isolation)
We rely on Database Constraints (Unique Partial Index) to enforce that one item can only have one active request.

- **Scenario:** Two users click "Rent" at the exact same millisecond.
- **Handling:**
    - T1 attempts Insert.
    - T2 attempts Insert.
    - DB Serialization/Constraint detects conflict.
    - One succeeds, one throw `P2002` (Unique Constraint Violated).
- **Result:** Data integrity maintained without complex application locks.

## 5. Immutability of History
Reputation logs are financial records of trust. They must never be altered.

- **Implementation:** PostgreSQL Trigger `enforce_reputation_immutability`.
- **Behavior:** `UPDATE` or `DELETE` on `reputation_logs` raises an exception.
- **Guarantee:** Even if backend code contains a bug or valid `prisma.reputationLog.delete()` call, the Database rejects it.
