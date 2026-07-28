# TeamFlow Backend

Express + MongoDB (Mongoose) + Cloudinary + Socket.IO backend, implementing the
routes, models, and role rules from `TeamFlow-Technical-Documentation.md`.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm run dev            # or: npm start
```

Requires a running MongoDB instance (local or Atlas) reachable at `MONGO_URI`.

## Structure

Matches §6 of the spec:

```
src/
  config/       db.js, cloudinary.js, socket.js
  models/       User, Client, Project, Task, Attendance, LeaveRequest,
                Conversation, Message, Notification, Reward
  routes/       one file per resource
  controllers/  one file per route file
  middlewares/  auth, role, projectAccess, errorHandler
  utils/        jwt, apiResponse, notify
  app.js
server.js
```

## Auth

- `POST /api/v1/auth/login` → `{ token, user }`. Token is also set as an httpOnly
  cookie when `USE_COOKIE_AUTH=true`.
- Pass `Authorization: Bearer <token>` (or rely on the cookie) on every other route.
- JWT payload: `{ userId, role }`.

## Role rules enforced in middleware/controllers

- Manager and CEO are treated as interchangeable everywhere **except**:
  - `salary` — never serialized for manager/team_leader/employee (HR & CEO only).
  - `revenue` — stripped from every project response except for CEO.
- HR has full project authority (create, add members, set team leader) alongside Manager/CEO.
- `POST /projects/:id/team-leader` — Manager/CEO/HR only, must be an existing project member, replaces the current Team Leader.
- `POST /projects/:projectId/tasks` — Team Leader of that project (or Manager/CEO for oversight); `assignedTo` must be in `project.members`.
- `GET /projects/:projectId/tasks` — force-filtered to `assignedTo: currentUser` for plain employees, regardless of query params.
- `PATCH /tasks/:id/status` — assignee can only move to `in_progress`/`submitted`; Team Leader/Manager/CEO only can move to `approved`/`rejected`.
- Leave decisions — any one of HR/Manager/CEO, single-step, triggers a Notification.
- Project creation auto-creates an empty `project_group` Conversation; assigning a task adds the assignee to that conversation's participants (previous assignee is not removed on reassignment).

## Real-time (Socket.IO)

- Client connects with `io(url, { auth: { token } })`; the same JWT used for REST.
- Rooms: `user:<userId>` (personal, for notifications) and `conversation:<conversationId>`.
- Events: `message:new`, `message:read`, `typing:start`/`typing:stop`, `notification:new`.
- REST remains the source of truth — Socket.IO only pushes live updates to already-open clients.

## File uploads (Cloudinary)

Three uploader configs in `src/config/cloudinary.js` enforcing the caps from the spec's Decisions Log:
- avatars ≤ 2MB (jpg/png/webp) — `POST /users/:id/avatar`
- project documents ≤ 15MB (pdf/doc/docx/xlsx/png/jpg) — `POST /projects/:id/documents`
- task attachments ≤ 10MB (same types) — wired via `uploadTaskAttachment`, ready to attach to a task-attachment route if/when you add one (not explicitly listed as its own endpoint in the spec's route table).

## Notes / assumptions made while building

- `employeeId` is auto-generated as `EMP-000N` (sequential) on user creation — the doc didn't specify a generation scheme.
- Attendance's "Manager (team only)" scoping is done via `User.reportingManager` pointing at the manager — the doc doesn't define "team" precisely, so this is the most natural reading.
- No password-reset/forgot-password flow — not in the spec; add if needed.
- No rate limiting / helmet — not mentioned in the spec; recommended to add before production.
- Task attachments (`uploadTaskAttachment`) are configured but not yet wired to a specific route, since §5.4 doesn't list a dedicated attachment endpoint for tasks (only `attachments` field on the Task model itself, populated e.g. via `submissionNote` flow). Let me know if you want a `POST /tasks/:id/attachments` route added.

## Production hardening added

- **Security headers** — `helmet()`.
- **Rate limiting** — general API limiter (300 req/15min/IP by default) plus a stricter limiter on `/auth/login` (10/15min/IP) to slow brute force. Tune via `RATE_LIMIT_*` / `AUTH_RATE_LIMIT_MAX` env vars.
- **NoSQL injection protection** — `express-mongo-sanitize` strips `$`/`.` operators from `body`/`query`/`params`.
- **Input validation** — `express-validator` wired onto `POST /auth/login` and `POST /users` as the reference pattern (`src/validators/`, `src/middlewares/validate.js`). Extend the same pattern to other write routes (projects, tasks, clients, leave) as needed.
- **Compression** — gzip via `compression`.
- **Structured logging** — `winston` (JSON in production, colorized in dev) + `morgan` piped through it for request logs.
- **Centralized, fail-fast config** — `src/config/env.js` validates required env vars (`MONGO_URI`, `JWT_SECRET`) on boot and refuses to start with a short `JWT_SECRET` in production, instead of failing later with a cryptic error.
- **DB resilience & performance** — connection pooling (`maxPoolSize`, default 20), server selection timeout, reconnect/error logging, and indexes added on every hot query path (`User`, `Project`, `Task`, `Attendance` [unique per user/day], `LeaveRequest`, `Message`, `Conversation`, `Notification`).
- **Pagination** — `GET /users` now supports `?page=&limit=` (default 25, capped at 100) instead of returning the whole collection; apply the same pattern to `GET /projects`, `GET /leave`, etc. if your data grows large.
- **Graceful shutdown** — `SIGTERM`/`SIGINT` drain in-flight requests, close Socket.IO and the Mongo connection before exiting; unhandled rejections/exceptions are logged instead of crashing silently.
- **Docker** — multi-stage `Dockerfile` (non-root user, healthcheck) + `docker-compose.yml` (app + Mongo) for one-command local/staging spin-up: `npm run docker:up`.

### Scaling notes for when you deploy for real

- Run multiple instances behind a load balancer (or Node's `cluster`/PM2) — the app is stateless except for Socket.IO, so use the [Socket.IO Redis adapter](https://socket.io/docs/v4/redis-adapter/) once you run more than one instance, so `notification:new`/`message:new` reach clients connected to a different instance.
- Move rate-limit state to Redis (`rate-limit-redis`) once you're behind multiple instances, since the in-memory limiter used here is per-process.
- Consider a managed MongoDB (Atlas) with replica sets for HA, and enable `retryWrites=true` in the URI.

## Verification performed

- Full app module graph (`app.js` → all routes → all controllers → all models) loads without syntax or wiring errors (verified via `node -e "require('./src/app')"`).
- JWT sign/verify round-trip verified.
- Could **not** run a live end-to-end test against a real MongoDB in this sandbox (no `mongod` binary available, and MongoDB's binary CDN isn't reachable from this environment's network allowlist). Please run the app against a real MongoDB instance and exercise the role-based rules manually or with your own test suite before deploying.
