# Database Specification: Oi! Lend Me

**File Version:** 1.0.0
**Status:** APPROVED
**Last Updated:** 2026-02-10

---

## 1. Database Overview

*   **Database Type:** Relational Database Management System (RDBMS).
*   **Engine:** PostgreSQL (v14+).
*   **Design Philosophy:**
    *   **Strict Normalization:** 3NF (Third Normal Form) to minimize redundancy and anomalies.
    *   **Data Consistency:** Enforced at the database level using Foreign Keys (FK), Check Constraints, and Unique Indexes.
    *   **Immutability:** Financial and reputation logs are append-only.
    *   **Soft Deletes:** Applied to `Users` and `Groups` to preserve referential integrity for historical data; strict hard deletes for transient data (e.g., draft messages).
*   **Naming Conventions:**
    *   **Tables:** `snake_case`, plural (e.g., `users`, `request_logs`).
    *   **Columns:** `snake_case` (e.g., `created_at`, `is_verified`).
    *   **Primary Keys:** `id` (UUID).
    *   **Foreign Keys:** `noun_id` (e.g., `user_id`, `item_id`).
    *   **Indexes:** `idx_table_column` or `idx_table_purpose`.
*   **Primary Key Strategy:**
    *   **UUID v4 (Random):** Used for all tables to prevent ID enumeration attacks and allow easy data merging/migration.
*   **Timezone:** All timestamps are stored in `UTC` (`TIMESTAMP WITH TIME ZONE`).

---

## 2. Complete Table List

### 2.1. `users`
**Purpose:** Represents a registered identity in the system. Central to all authenticated actions.
**Real-World Concept:** A person (Student) or Administrator using the platform.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier for the user. |
| `email` | `VARCHAR(255)` | NO | - | **UNIQUE** | Canonical email address. Must be lowercase. |
| `password_hash` | `TEXT` | YES | - | - | Bcrypt/Argon2 hash. Nullable for OAuth users. |
| `name` | `VARCHAR(100)` | NO | - | - | specific display name. |
| `avatar_url` | `TEXT` | YES | - | - | URL to profile image (Supabase Storage). |
| `phone_number` | `VARCHAR(20)` | YES | - | - | Verified phone number for trust info. |
| `role` | `user_role` (ENUM) | NO | `'STUDENT'` | - | RBAC role: `STUDENT`, `ADMIN`. |
| `karma_score` | `INTEGER` | NO | `0` | - | Aggregated trust score. cached for performance. |
| `latitude` | `FLOAT` | YES | - | - | Last known location (lat) for geo-search. |
| `longitude` | `FLOAT` | YES | - | - | Last known location (long) for geo-search. |
| `is_verified` | `BOOLEAN` | NO | `FALSE` | - | Implementation specific verification status (e.g. .edu email). |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Audit timestamp. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Audit timestamp. |
| `deleted_at` | `TIMESTAMPTZ` | YES | - | - | Soft delete timestamp. |

**Indexes:**
*   `idx_users_email` (Unique)
*   `idx_users_karma_score` (B-Tree for leaderboards)
*   `idx_users_role` (Filtering)
*   `idx_users_geo` (GIST index on `ll_to_earth(latitude, longitude)` if using PostGIS, else composite on lat/long).

---

### 2.2. `groups`
**Purpose:** Represents a community or circle where items can be shared exclusively.
**Real-World Concept:** A dorm floor, a study group, a club.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier for the group. |
| `name` | `VARCHAR(100)` | NO | - | - | Display name of the group. |
| `description` | `TEXT` | YES | - | - | Markdown description of group purpose. |
| `image_url` | `TEXT` | YES | - | - | URL to group cover image. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Audit timestamp. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Audit timestamp. |
| `deleted_at` | `TIMESTAMPTZ` | YES | - | - | Soft delete timestamp. |

---

### 2.3. `items`
**Purpose:** Represents a physical object available for lending.
**Real-World Concept:** A calculator, a textbook, a charger.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier for the item. |
| `owner_id` | `UUID` | YES | - | **FK** (`users.id`) | The user who owns this item. |
| `group_id` | `UUID` | YES | - | **FK** (`groups.id`) | The group owning this item (if community-owned). |
| `name` | `VARCHAR(100)` | NO | - | - | Title of the listing. |
| `description` | `TEXT` | YES | - | - | Detailed condition and specs. |
| `category` | `item_category` (ENUM) | NO | - | - | Classification (Electronics, Books, etc.). |
| `status` | `item_status` (ENUM) | NO | `'AVAILABLE'` | - | Current state machine status. |
| `price` | `DECIMAL(10,2)` | YES | - | - | Replacement value or rental fee (if applicable). |
| `image_url` | `TEXT` | YES | - | - | **Legacy/Primary** thumbnail URL. |
| `latitude` | `FLOAT` | YES | - | - | Ephemeral item location (defaults to user loc). |
| `longitude` | `FLOAT` | YES | - | - | Ephemeral item location. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Audit timestamp. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Audit timestamp. |

**Constraints:**
*   **Ownership Invariant:** `CHECK ((owner_id IS NOT NULL AND group_id IS NULL) OR (owner_id IS NULL AND group_id IS NOT NULL))` -> Item must belong to EITHER a user OR a group, not both, and not neither.

**Indexes:**
*   `idx_items_owner_id`
*   `idx_items_group_id`
*   `idx_items_status` (Filtered queries for 'AVAILABLE')
*   `idx_items_category`
*   `idx_items_geo`

---

### 2.4. `item_images`
**Purpose:** Supports multiple images per item.
**Real-World Concept:** Photo gallery for an item.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `item_id` | `UUID` | NO | - | **FK** (`items.id`) | Parent item. |
| `url` | `TEXT` | NO | - | - | Storage URL. |
| `is_primary` | `BOOLEAN` | NO | `FALSE` | - | Whether this is the main cover image. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Upload timestamp. |

**Constraints:**
*   **Cascade:** `ON DELETE CASCADE` (If item is deleted, images go too).

---

### 2.5. `requests`
**Purpose:** Tracks the lifecycle of a borrowing attempt.
**Real-World Concept:** "Hey, can I borrow this?" -> "Yes" -> "Returned".

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `item_id` | `UUID` | NO | - | **FK** (`items.id`) | The item being requested. |
| `requester_id` | `UUID` | NO | - | **FK** (`users.id`) | The user asking to borrow. |
| `status` | `request_status` (ENUM) | NO | `'PENDING'` | - | State machine status. |
| `start_date` | `TIMESTAMPTZ` | YES | - | - | Proposed/Actual start of loan. |
| `end_date` | `TIMESTAMPTZ` | YES | - | - | Proposed/Actual end of loan. |
| `returned_at` | `TIMESTAMPTZ` | YES | - | - | Actual return timestamp. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Last status change. |

**Constraints:**
*   **Cascade:** `item_id` -> `ON DELETE CASCADE`.
*   **Cascade:** `requester_id` -> `ON DELETE CASCADE`.

**Indexes:**
*   `idx_requests_composite` (`item_id`, `status`) -> To quickly find active requests for an item.
*   `idx_requests_requester` (`requester_id`).
*   **Partial Unique Index:** `CREATE UNIQUE INDEX one_active_req_per_item ON requests (item_id) WHERE status IN ('PENDING', 'APPROVED', 'BORROWED')`. Ensures an item cannot be double-booked.

---

### 2.6. `conversations`
**Purpose:** Connects a request to a chat context. One request = One conversation.
**Real-World Concept:** Private chat thread about the transaction.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `request_id` | `UUID` | NO | - | **FK** (`requests.id`) | The related request. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Thread start time. |

**Constraints:**
*   **Unique Request:** `UNIQUE (request_id)` -> 1:1 Relationship.
*   **Cascade:** `ON DELETE CASCADE` (Request deleted -> chat deleted).

---

### 2.7. `messages`
**Purpose:** Individual chat messages.
**Real-World Concept:** A text bubbles in the chat.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `conversation_id`| `UUID` | NO | - | **FK** (`conversations.id`)| Parent thread. |
| `sender_id` | `UUID` | NO | - | **FK** (`users.id`) | Author. |
| `content` | `TEXT` | NO | - | - | Message body. encryption handled at app layer if needed. |
| `is_read` | `BOOLEAN` | NO | `FALSE` | - | Read receipt status. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Sent time. |

**Constraints:**
*   **Cascade:** `conversation_id` -> `ON DELETE CASCADE`.

---

### 2.8. `notifications`
**Purpose:** Async alerts for users.
**Real-World Concept:** Bell icon alerts.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `user_id` | `UUID` | NO | - | **FK** (`users.id`) | Recipient. |
| `type` | `notif_type` (ENUM)| NO | - | - | e.g. `REQUEST_RECEIVED`. |
| `title` | `VARCHAR(100)` | NO | - | - | Short header. |
| `message` | `TEXT` | NO | - | - | Body text. |
| `resource_path` | `TEXT` | YES | - | - | Deep link (e.g. `/requests/123`). |
| `is_read` | `BOOLEAN` | NO | `FALSE` | - | Read status. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Created time. |

---

### 2.9. `reputation_logs`
**Purpose:** Immutable history of karma changes.
**Real-World Concept:** Bank statement for "Social Credit".

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `user_id` | `UUID` | NO | - | **FK** (`users.id`) | Affected user. |
| `change_amount` | `INTEGER` | NO | - | - | Delta (e.g. +5, -2). |
| `reason` | `TEXT` | NO | - | - | Human readable reason (e.g. "Item returned on time"). |
| `related_request_id`| `UUID` | YES | - | **FK** (`requests.id`) | Provenance link. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Timestamp. |

---

### 2.10. `activity_logs` (NEW - AUDIT REQUIREMENT)
**Purpose:** System-wide audit trail for security and debugging.
**Real-World Concept:** Security camera footage / server logs.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK** | Unique identifier. |
| `actor_id` | `UUID` | YES | - | **FK** (`users.id`) | Who did it? Nullable for system events. |
| `action` | `VARCHAR(50)` | NO | - | - | `LOGIN`, `CREATE_ITEM`, `DELETE_GROUP`. |
| `entity_type` | `VARCHAR(50)` | NO | - | - | `ITEM`, `USER`, `REQUEST`. |
| `entity_id` | `UUID` | YES | - | - | ID of the affected object. |
| `metadata` | `JSONB` | YES | - | - | Previous values, IP address, user agent. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Timestamp. |

---

## 3. Relationships & Join Tables

### 3.1 `group_members` (Join Table)
**Type:** Many-to-Many (`users` <-> `groups`)
**Ownership:** Pivot table.

| Column Name | Data Type | Nullable | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `group_id` | `UUID` | NO | - | **FK, PK Component** | Reference to Group. |
| `user_id` | `UUID` | NO | - | **FK, PK Component** | Reference to User. |
| `role` | `group_role` (ENUM)| NO | `'MEMBER'` | - | `ADMIN` or `MEMBER`. |
| `joined_at` | `TIMESTAMPTZ` | NO | `NOW()` | - | Membership start. |

**Constraints:**
*   **Primary Key:** `PRIMARY KEY (group_id, user_id)`
*   **Foreign Keys:** Both `ON DELETE CASCADE`.

### Relationship Summary

1.  **User -> Items (One-to-Many):**
    *   **Owns:** User owns multiple items.
    *   **FK:** `items.owner_id` references `users.id`.
    *   **Delete:** `Cascade` (User deleted -> Items deleted).
2.  **User -> Requests (One-to-Many):**
    *   **Owns:** User makes multiple requests.
    *   **FK:** `requests.requester_id` references `users.id`.
    *   **Delete:** `Cascade`.
3.  **Group -> Items (One-to-Many):**
    *   **Owns:** Group owns multiple items (communal property).
    *   **FK:** `items.group_id` references `groups.id`.
    *   **Delete:** `Cascade`.
4.  **Item -> Requests (One-to-Many):**
    *   **Owns:** Item receives multiple requests (historically), but only one *active* one (enforced by constraint).
    *   **FK:** `requests.item_id` references `items.id`.
    *   **Delete:** `Cascade`.
5.  **Request -> Conversation (One-to-One):**
    *   **Owns:** Request spawns one conversation.
    *   **FK:** `conversations.request_id` references `requests.id`.
    *   **Unique Check:** `request_id` is unique in `conversations`.
    *   **Delete:** `Cascade`.
6.  **Conversation -> Messages (One-to-Many):**
    *   **Owns:** Conversation contains messages.
    *   **FK:** `messages.conversation_id` references `conversations.id`.
    *   **Delete:** `Cascade`.

---

## 4. Join Tables
*See Section 3.1: `group_members`.*
This is the only explicit Many-to-Many relationship requiring a junction table.

---

## 5. Constraints & Business Rules

1.  **Mutual Exclusion (Item Ownership):**
    *   **Rule:** An item cannot be personal property AND group property simultaneously.
    *   **Enforcement:** `CHECK` constraint on `items` table.
2.  **Concurrency Control (lending):**
    *   **Rule:** An item strictly cannot be promised to two people at once.
    *   **Enforcement:** Partial Unique Index on `requests(item_id)` where status is `PENDING`, `APPROVED`, or `BORROWED`.
3.  **Karma Updates:**
    *   **Rule:** Karma is calculated as an aggregate but cached on `users.karma_score`.
    *   **Enforcement:** Application logic (Triggers avoided for complexity unless strictly required). Writes to `reputation_logs` must update `users.karma_score` in a transaction.
4.  **Self-Lending:**
    *   **Rule:** A user cannot request their own item.
    *   **Enforcement:** Application level check `if item.owner_id == request.requester_id` -> Error.

---

## 6. Enums & Status Fields

### `user_role`
*   `STUDENT`: Standard access.
*   `ADMIN`: System-wide moderation capabilities.

### `item_category`
*   `Electronics`, `Books`, `Lab`, `Misc`, `Chargers`.

### `item_status`
*   `AVAILABLE`: Visible in search.
*   `BORROWED`: Currently out with a user.
*   `REQUESTED`: An active request exists, awaiting approval.

### `request_status`
*   `PENDING`: Awaiting owner approval.
*   `APPROVED`: Owner said yes, awaiting pickup.
*   `REJECTED`: Owner said no (Terminal).
*   `BORROWED`: Item picked up (Active).
*   `RETURNED`: Item brought back (Terminal).
*   `CANCELLED`: Requester changed mind (Terminal).

### `group_role`
*   `ADMIN`: Can remove members/items.
*   `MEMBER`: Can borrow/list items.

### `notif_type`
*   `REQUEST_RECEIVED`
*   `REQUEST_APPROVED`
*   `REQUEST_REJECTED`
*   `ITEM_DUE`
*   `MESSAGE_RECEIVED`

---

## 7. Audit & Activity Logging

*   **Financial/Reputation:** `reputation_logs` table tracks all score changes.
    *   **Required:** `reason`, `change_amount`, `related_request_id` (if applicable).
*   **Security/Usage:** `activity_logs` table.
    *   **Events:** Logins, password changes, group deletions, forced admin actions.
    *   **Retention:** Keep indefinitely or compliant with local policy (e.g. 1 year).

---

## 8. Security & Data Integrity Notes

*   **Passwords:** Do NOT store plain text. Use bcrypt or Argon2 via Supabase Auth/NextAuth.
*   **PII:** `phone_number`, `email`, `latitude`/`longitude` are PII.
    *   **Exposure:** Never send `latitude`/`longitude` raw to frontend for other users. Send "distance" or "fuzzy location".
*   **RLS (Row Level Security):** If using Supabase directly:
    *   `users`: Read Public (Profile info only), Update Self.
    *   `messages`: Read Participant Only.
    *   `requests`: Read Participant/Owner Only.
*   **Data Retention:**
    *   `users`: Soft delete (`deleted_at`). allows restoring accounts.
    *   `requests`: Keep strictly for history/karma calculation.

---

## 9. Sample Data

**User 1 (Owner):**
`id`: `u-1`, `name`: "Vishal", `email`: "v@test.com", `karma`: 10

**User 2 (Requester):**
`id`: `u-2`, `name`: "Agent", `email`: "a@test.com", `karma`: 5

**Item 1:**
`id`: `i-1`, `owner_id`: `u-1`, `name`: "MacBook Charger", `status`: `REQUESTED`

**Request 1:**
`id`: `r-1`, `item_id`: `i-1`, `requester_id`: `u-2`, `status`: `PENDING`

**Relationship Flow:**
`u-2` -> `requests(r-1)` -> `items(i-1)` -> `users(u-1)`

---

## 10. Final Validation Checklist

- [x] **All Relationships Defined:** FKs are mapped for every relation.
- [x] **No Orphan Records:** Cascade deletes handled for sub-resources (messages, requests).
- [x] **Normalization:** No repeating groups or non-atomic values.
- [x] **Scaling:** UUIDs used, indexes defined on query patterns (`status`, `owner_id`).
- [x] **Business Logic Covered:** Mutual exclusivity of item ownership and Request concurrency are enforced.
- [x] **Safety:** PII identified, Password hashing mandated.
- [x] **Audit:** Logs defined for critical actions.
