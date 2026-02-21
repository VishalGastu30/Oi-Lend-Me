# Oi! Lend Me

Oi! Lend Me is a production-ready, full-stack campus lending application. It provides a secure, trusted platform for students to borrow and lend items with groups, reputation tracking, integrated chat, and robust moderation.

## 1. How to Run the App

### Option A: Run with Docker (Preferred)

To easily spin up both the database and the application in isolated containers:

```bash
git clone <repo-url>
cd dbms_proj
cp .env.example .env
docker compose up --build
```

The app will become available at `http://localhost:3000`.

### Option B: Run Locally (Without Docker)

*Requires Node.js 20+ and a local PostgreSQL instance or cloud database.*

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 2. Project Overview

**Oi! Lend Me** is built to solve the core problem of resource scarcity on college campuses by fostering local, trust-based borrowing and lending. It leverages verified student identities (via email), group structures (like clubs and dorms), and an overarching reputation system to ensure items are safely exchanged. The central philosophy revolves around community building, trust, and accountability.

## 3. Tech Stack

- **Frontend**: Next.js 16.1 (App Router), React 19, Tailwind CSS, Radix UI (accessible components), Framer Motion
- **Backend**: Next.js Server Actions & API Routes, Zod Validation
- **Database**: PostgreSQL (Neon Database recommended for cloud)
- **ORM**: Prisma Client v7
- **Auth System**: NextAuth (JWT-based, bcrypt password hashing), protected middleware
- **Realtime / Chat**: Background polling with robust optimistic UI updates
- **File Storage**: Local filesystem (simulated for dev, easily swappable with S3)

## 4. System Architecture

The application adopts a monolith structure optimized for quick rendering and robust API validation. 

- **User Flow**: Users sign up, join specialized Groups, and can post items for borrowing or lending. They use the built-in Chat to negotiate terms before initiating a "Request". Once accepted, the item timeline moves independently.
- **Admin Flow**: A dedicated `/admin` suite provides Super Admins the ability to oversee platform health, respond to reported items/messages/groups, and issue bans.
- **Group System**: Contextual siloing for items. Members inside a group can see the internal inventory, enhancing localized trust (e.g. "Photography Club Lenses").
- **Moderation**: A holistic suite connecting reports from the frontend directly into an aggregated admin view, empowering admins to enforce community guidelines effectively.

## 5. Roles & Permissions

- **Normal User**: Can list items, request items, join groups, send messages, and report offending content. Cannot access moderation or ban other users.
- **Group Admin**: Can manage their group's membership (accept/reject join requests) and edit the group's profile information. Has no global administrative authority.
- **Super Admin**: Has unhindered access to the global dashboard. Can ban/unban users, ban groups, ban items, and review all user-submitted feedback and reports.

## 6. Features

- **Borrowing & Lending**: Dedicated bidirectional request flows. Users can search for specific equipment globally or per-group.
- **Groups**: Localized hubs that track specific shared inventory. Support for open communities and closed (invite-only) structures.
- **Requests Hub**: State machine tracking the lifecycle of an item (Available -> Requested -> Borrowed -> Returned).
- **Chat**: Real-time contextual messaging tied to item requests. Includes smart locking when a request completes or fails.
- **Reports**: Any user can anonymously report suspicious items, groups, or malicious users.
- **Bans**: System-level suspensions locking users out of the system conditionally.
- **Analytics**: Both individual and global dashboards graphing activity rates over time.
- **Activity Timeline**: Per-item tracking of custody and operational status logs.

## 7. Admin Dashboard Overview

The Admin Dashboard provides global command-and-control over the platform. 

- **Moderation Hub**: Triages incoming reports across three distinct queues: Users, Items, and Groups.
- **Enforcement Flows**: Allows an admin to click into a report, review the context, and apply soft or permanent bans on the offending entity.
- **Feedback Loop**: Dedicated page to read anonymous system feedback submitted by users to improve the application.

## 8. Environment Variables

| Variable | Type | Description |
| --- | --- | --- |
| `DATABASE_URL` | **Required** | Prisma connection string for PostgreSQL. |
| `NEXTAUTH_SECRET` | **Required** | Used by Next-Auth to encrypt session JWTs safely. |
| `NEXTAUTH_URL` | **Required** | The base URL of the site, usually `http://localhost:3000`. |
| `UPLOAD_DIR` | Optional | Directory for file storage (defaults to `public/uploads`). |

## 9. Admin Credentials

> ⚠️ For development/testing only. Do NOT use in production.

- **Email**: valiantvishal30@gmail.com
- **Password**: IamAdmin@3004

## 10. Known Limitations / Notes

- Currently, file uploads are handled via local storage in development. For production deployment (e.g., Vercel), an S3-compatible cloud storage block is recommended.
- Real-time chat natively uses short-polling; this is sufficient for scale under 1,000 active concurrent users but might require WebSocket adoption (e.g., via Pusher/Supabase) at larger volumes.
# Oi-Lend-Me
# Oi-Lend-Me
