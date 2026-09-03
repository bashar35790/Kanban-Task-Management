# Mini Kanban Board

A full-stack drag-and-drop kanban board. Users can register, create boards, share them with other registered users (OWNER / EDITOR / VIEWER roles), manage columns and tasks, and reorder tasks within/across columns via drag-and-drop with fractional-index ordering.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 · Node.js + Express 5 + TypeScript · PostgreSQL + Prisma 7 · Better Auth (email/password, httpOnly cookie sessions) · Docker Compose

---

## Features

- **Auth** — email + password register/login with httpOnly session cookies (XSS-safe, immediately revocable)
- **Boards** — create, update, delete; share with other users; role-based access (VIEWER / EDITOR / OWNER)
- **Columns & Tasks** — full CRUD, cascading deletes, drag-and-drop reordering
- **Cross-column moves** — drag tasks between columns with optimistic UI + server-verified fractional indexing
- **Docker** — one-command spin-up via `docker-compose up`

---

## Project Structure

```
.
├── docker-compose.yml      # postgres + backend (5000) + frontend (3000)
├── backend/                # Express API + Prisma + Better Auth
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/     # committed; applied in Docker
│   │   └── seed.ts         # demo data (npx prisma db seed)
│   └── src/
│       ├── lib/            # prisma.ts, auth.ts (Better Auth)
│       ├── middleware/     # authenticate.ts, boardAccess.ts
│       ├── routes/         # users, boards, columns, tasks
│       └── utils/          # fractional.ts + tests
└── frontend/               # Next.js 16 app
    ├── app/                # pages: (auth), boards, boards/[boardId]
    ├── components/         # ui, auth, boards, kanban
    ├── hooks/              # useAuth, useBoards, useBoard, useKanban, useMembers
    ├── lib/                # auth-client.ts, api.ts, fractional.ts
    └── proxy.ts            # route protection (Next 16 renamed middleware → proxy)
```

---

## Quick Start (Docker — recommended)

Requires Docker + Docker Compose.

```bash
# 1. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Build and start all three services
docker-compose up --build
```

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000>
- Auth endpoints: `/api/auth/*` (Better Auth)
- Kanban API: `/api/v1/*`

`docker-compose up` runs Prisma migrations automatically, so the schema is applied on first boot. To load demo data:

```bash
docker-compose exec backend npx prisma db seed
```

Alternatively, register a fresh account from the UI.

---

## Manual Setup (without Docker)

### 1. PostgreSQL

Ensure a Postgres instance is running (e.g. `postgres:16`). Example connection strings assume a local `kanban` database:

```bash
createdb kanban
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # edit as needed
npm install
npx prisma migrate dev      # apply migrations locally (creates tables)
npm run seed                # optional: load demo data
npm run dev                 # starts API on :5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # starts app on :3000
```

Open <http://localhost:3000>, register, and create your first board.

---

## Environment Variables

### Backend (`backend/.env`, see `.env.example`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled connection string used by the runtime Prisma client |
| `DIRECT_URL` | Direct connection string used by the Prisma CLI / migrations |
| `BETTER_AUTH_SECRET` | Secret for signing session tokens (32+ chars) |
| `BETTER_AUTH_URL` | Public backend origin, e.g. `http://localhost:5000` |
| `FRONTEND_URL` | Public frontend origin, e.g. `http://localhost:3000` (CORS trusted origin) |
| `NODE_ENV` | `development` or `production` (controls cookie security) |
| `PORT` | Backend port, `5000` |

> In production with separate domains, the session cookie switches to `sameSite: "none"` + `secure: true` when `NODE_ENV=production`, and the backend must be served over HTTPS.

### Frontend (`frontend/.env.local`, see `.env.example`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend origin the browser talks to, e.g. `http://localhost:5000` |

---

## Authorization Model

| Role | Read board | Add/edit/delete columns & tasks | Manage members |
|---|---|---|---|
| VIEWER | ✅ | ❌ | ❌ |
| EDITOR | ✅ | ✅ | ❌ |
| OWNER | ✅ | ✅ | ✅ |

- Board creator automatically becomes OWNER.
- Invite an existing user by email (a 404 is returned if the email isn't registered, 409 if they're already a member).
- No user can remove themselves from a board (self-removal returns `400`).

---

## Fractional Indexing

Tasks and columns are ordered by a `position` float:

- First item → `1000`; appended items → `prev + 1000`
- Insert between → `(prev + next) / 2`; at start → `first / 2`
- When the gap between adjacent items shrinks below `1e-6`, the column is re-indexed in a single transaction

This keeps reordering an O(1) single-row update. Known limitation: very deep reorders into the same gap trigger a rebalance.

---

## API Overview

All `/api/v1/*` routes require the session cookie. Role requirements are enforced per-route.

| Method | Path | Role |
|---|---|---|
| POST | `/api/auth/sign-up/email` | — (public) |
| POST | `/api/auth/sign-in/email` | — (public) |
| POST | `/api/auth/sign-out` | — (public) |
| GET | `/api/auth/get-session` | — (public) |
| GET | `/api/v1/users/me` | auth |
| GET | `/api/v1/users/search?email=` | auth |
| POST | `/api/v1/boards` | auth |
| GET | `/api/v1/boards` | auth |
| GET | `/api/v1/boards/:boardId` | VIEWER+ |
| PATCH | `/api/v1/boards/:boardId` | EDITOR+ |
| DELETE | `/api/v1/boards/:boardId` | OWNER |
| GET/POST | `/api/v1/boards/:boardId/members` | VIEWER+ / OWNER |
| PATCH/DELETE | `/api/v1/boards/:boardId/members/:userId` | OWNER |
| POST | `/api/v1/boards/:boardId/columns` | EDITOR+ |
| PATCH/DELETE | `/api/v1/columns/:columnId` | EDITOR+ |
| POST | `/api/v1/columns/:columnId/tasks` | EDITOR+ |
| PATCH/DELETE | `/api/v1/tasks/:taskId` | EDITOR+ |
| POST | `/api/v1/tasks/:taskId/move` | EDITOR+ |

The move endpoint accepts `{ targetColumnId, afterTaskId?, beforeTaskId? }` and recomputes the position atomically.

---

## Testing

```bash
# Backend unit tests (fractional indexing)
cd backend
npm test
```

Manual QA checklist: unauthenticated → `401`; non-member board → `403`; VIEWER write → `403`; move task (same column, cross-column, to start, to end, empty column); owner cannot remove self.

---

## Known Limitations (out of scope for the MVP)

- No real-time sync / WebSockets
- No task assignees, labels, due dates, comments, or attachments
- No email verification or OAuth providers
- No automatic background job for float re-balancing (triggered inline on move)
