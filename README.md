# Ebraz Clinic — Monorepo

pnpm + Turborepo monorepo for the Ebraz Clinic psychology management system.

## Structure

```
apps/
  website/           Public website (port 3000)
  admin-panel/       Admin panel (port 3001)
  therapist-panel/   Therapist panel (port 3002)
  client-panel/      Client panel (port 3003)

packages/
  api/               Next.js API — all Route Handlers (port 4000)
  api-client/        Typed HTTP client for frontend apps
  auth/              JWT, refresh tokens, permissions
  bff/               BFF adapter — legacy route mapping + response transforms
  database/          Prisma schema, migrations, seed
  ui/                Shared UI components (shadcn)
  web/               Shared frontend (auth, providers, login)
  types/             TypeScript types
  validation/        Zod schemas
  utils/             Shared helpers
  config/            Constants & env validation

tooling/
  eslint/            Shared ESLint config
  tsconfig/          Shared TypeScript configs
  prettier/          Shared Prettier config
```

## Prerequisites

- Node.js >= 20
- pnpm 10+
- PostgreSQL (`ebraz-clinic-db`)

## Setup

```bash
cp .env.example .env
pnpm install
pnpm db:generate
```

## Development

```bash
pnpm dev          # all apps (via turbo)
pnpm build        # build entire workspace
pnpm lint         # lint all packages
pnpm typecheck    # typecheck all packages
```

### Run individual apps

```bash
pnpm --filter @ebraz/api dev
pnpm --filter @ebraz/website dev
pnpm --filter @ebraz/admin-panel dev
```

### Frontend apps

All apps in `apps/` use `@ebraz/bff` catch-all `/api/*` routes to proxy the new API while keeping legacy UI contracts (`/api/doctors`, Laravel-style pagination, etc.).

Set `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).

| App | Port | Auth | Notes |
|-----|------|------|-------|
| `website` | 3000 | Public + admin login | CMS pages via `fetchSiteLegacy` → API public endpoints |
| `admin-panel` | 3001 | Admin login | Full legacy admin UI migrated |
| `therapist-panel` | 3002 | Therapist login | Migrated from `psy-panel` |
| `client-panel` | 3003 | Client login | Scaffold + BFF |

**Shared packages:**
- `@ebraz/bff` — path mapping, auth handlers, response transforms, `fetchPublicLegacy` for SSR
- `@ebraz/api-client` — `createApiClient()` with `authFetch` + typed `ApiResponse`
- `@ebraz/web` — `AuthProvider`, `LoginForm`, `PanelShell`, middleware helper

## Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations (production / docker migrate service)
pnpm db:migrate

# Seed permissions (manual only)
pnpm db:seed
# or via docker:
docker compose run --rm seed
```

## Docker

```bash
docker compose up -d          # website, admin, therapist, client, api
docker compose run --rm seed  # seed only when needed
```

### Data migration (MySQL → PostgreSQL)

For migrating production data from the legacy Laravel MySQL database:

```bash
# 1. Ensure PostgreSQL schema is up to date + permissions seeded
pnpm db:migrate
pnpm db:seed

# 2. Set MYSQL_DATABASE_URL in .env (see .env.example)

# 3. Dry run (counts rows, no writes)
pnpm db:migrate:mysql:dry

# 4. Apply migration
pnpm db:migrate:mysql
```

**Options:**
- `--dry-run` — preview only
- `--force-update` — overwrite existing records matched by phone/slug (default: skip duplicates)
- `--verbose` — per-step logging

**Mapped entities:** admins, therapists (doctors), clients, companions, CMS, departments, workshops, therapist resumes/resources, medical records, appointments (referrals), payments, assessments, invoices.

**Not migrated:** Laravel system tables, therapy `sessions`, comments, legacy `classes`, refresh tokens (users re-login).

PostgreSQL and Redis are **external** — not included in docker-compose.

## API

All endpoints are versioned under `/api/v1/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/auth/admin/login` | POST | Admin login |
| `/api/v1/auth/therapist/login` | POST | Therapist login |
| `/api/v1/auth/client/login` | POST | Client login |
| `/api/v1/auth/register` | POST | Client registration |
| `/api/v1/auth/refresh` | POST | Refresh token rotation |
| `/api/v1/auth/logout` | POST | Logout |
| `/api/v1/auth/me` | GET | Current user profile (Bearer token) |
| `/api/v1/admins` | GET | List admins (paginated) |
| `/api/v1/admins` | POST | Create admin |
| `/api/v1/admins/rec-admins` | GET | List reception admins |
| `/api/v1/admins/{id}` | GET | Get admin by id |
| `/api/v1/admins/{id}` | PATCH | Update admin |
| `/api/v1/admins/{id}` | DELETE | Soft delete admin |

### Therapists

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/therapists` | GET | List therapists (paginated) |
| `/api/v1/therapists` | POST | Create therapist |
| `/api/v1/therapists/public` | GET | Public therapist list |
| `/api/v1/therapists/{id}` | GET | Get therapist by id |
| `/api/v1/therapists/{id}` | PATCH | Update therapist |
| `/api/v1/therapists/{id}` | DELETE | Soft delete therapist |
| `/api/v1/therapists/{id}/password` | PATCH | Set therapist password |

### Clients

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/clients` | GET | List clients (paginated) |
| `/api/v1/clients` | POST | Create client |
| `/api/v1/clients/{id}` | GET | Get client by id |
| `/api/v1/clients/{id}` | PATCH | Update client |
| `/api/v1/clients/{id}` | DELETE | Soft delete client |
| `/api/v1/clients/{id}/password` | PATCH | Set client password |
| `/api/v1/clients/{id}/record` | GET | Get client medical record |
| `/api/v1/clients/{id}/record` | PUT | Create or update medical record |
| `/api/v1/clients/{id}/record` | DELETE | Soft delete medical record |

### Appointments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/appointments` | GET | List appointments (paginated, filters: date, clientId, therapistId) |
| `/api/v1/appointments` | POST | Create appointment + payment |
| `/api/v1/appointments/by-date/{date}` | GET | List appointments for a date |
| `/api/v1/appointments/{id}` | GET | Get appointment by id |
| `/api/v1/appointments/{id}` | PATCH | Update appointment + payment |
| `/api/v1/appointments/{id}` | DELETE | Soft delete appointment + payment |

### CMS

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/v1/categories` | GET | `cms.read` | List categories |
| `/api/v1/categories` | POST | `cms.write` | Create category |
| `/api/v1/categories/public` | GET | public | Public category list |
| `/api/v1/categories/{slug}` | GET/PATCH/DELETE | `cms.read/write/delete` | Category by slug |
| `/api/v1/categories/public/{slug}` | GET | public | Public category |
| `/api/v1/tags` | GET/POST | `cms.read/write` | List/create tags |
| `/api/v1/tags/public` | GET | public | Public tag list |
| `/api/v1/tags/{id}` | GET/PATCH/DELETE | `cms.read/write/delete` | Tag by id |
| `/api/v1/posts` | GET/POST | `cms.read/write` | List/create posts |
| `/api/v1/posts/public` | GET | public | Published posts only |
| `/api/v1/posts/{slug}` | GET/PATCH/DELETE | `cms.read/write/delete` | Post by slug |
| `/api/v1/posts/public/{slug}` | GET | public | Published post |
| `/api/v1/departments` | GET/POST | `cms.read/write` | List/create departments |
| `/api/v1/departments/public` | GET | public | Public department list |
| `/api/v1/departments/{slug}` | GET/PATCH/DELETE | `cms.read/write/delete` | Department by slug |
| `/api/v1/about` | GET | `cms.read` | Get clinic info |
| `/api/v1/about` | PUT | `cms.write` | Upsert clinic info |
| `/api/v1/about/public` | GET | public | Public clinic info |

### Workshops

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/v1/workshops` | GET/POST | `workshops.read/write` | List/create workshops |
| `/api/v1/workshops/public` | GET | public | Public workshop list |
| `/api/v1/workshops/{id}` | GET/PATCH/DELETE | `workshops.read/write/delete` | Workshop detail |
| `/api/v1/workshops/public/{id}` | GET | public | Public workshop detail |
| `/api/v1/workshops/public/{id}/register` | POST | public | Public registration |
| `/api/v1/workshops/{id}/sessions` | POST | `workshops.write` | Create session |
| `/api/v1/workshops/{id}/sessions/{sessionId}` | PATCH/DELETE | `workshops.write/delete` | Update/delete session |
| `/api/v1/workshops/{id}/participants` | POST | `workshops.write` | Add participant |
| `/api/v1/workshops/{id}/participants/{participantId}` | PATCH/DELETE | `workshops.write/delete` | Update/remove participant |
| `/api/v1/workshops/{id}/participants/{participantId}/approve` | PATCH | `workshops.write` | Approve enrollment |
| `/api/v1/workshops/{id}/participants/{participantId}/unapprove` | PATCH | `workshops.write` | Unapprove enrollment |

### Payments & Invoices

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/v1/payments` | GET | `payments.read` | List payments (filters: status, client, therapist, dates) |
| `/api/v1/payments/{id}` | GET | `payments.read` | Payment detail |
| `/api/v1/payments/{id}` | PATCH | `payments.write` | Update payment status/amount |
| `/api/v1/invoices` | GET | `payments.read` | List invoices |
| `/api/v1/invoices` | POST | `payments.write` | Generate invoice for client date range |
| `/api/v1/invoices/{id}` | GET | `payments.read` | Invoice detail + line items |
| `/api/v1/invoices/{id}` | DELETE | `payments.write` | Soft delete invoice |

### Assessments (Initial Evaluation)

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/v1/assessments/public` | POST | Public | Register initial assessment (find-or-create client) |
| `/api/v1/assessments` | GET | `appointments.read` | List assessments (filters: status, client, therapist, dates, search) |
| `/api/v1/assessments/{id}` | GET | `appointments.read` | Assessment detail |
| `/api/v1/assessments/{id}` | PATCH | `appointments.write` | Update status, date, therapist, file path |
| `/api/v1/assessments/{id}` | DELETE | `appointments.delete` | Soft delete assessment |

### SMS

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/v1/sms/single` | POST | `appointments.write` | Send SMS to one phone |
| `/api/v1/sms/multi` | POST | `appointments.write` | Send SMS to multiple phones |

**Side effects:** Creating an appointment sends SMS to the therapist. Public assessment registration sends SMS to the client (and to `SMS_ADMIN_PHONE` when configured). Without `SMSIR_API_KEY`, messages are logged only (placeholder mode).

### Notifications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/notifications` | GET | JWT | List notifications visible to current user |
| `/api/v1/notifications` | POST | `settings.write` | Create notification (broadcast or targeted) |
| `/api/v1/notifications/unread` | GET | JWT | List unread notifications |
| `/api/v1/notifications/me` | GET | JWT | Current user notifications + `unreadCount` in meta |
| `/api/v1/notifications/{id}/read` | POST | JWT | Mark notification as read |

**Side effects:** Creating an appointment also creates an in-app notification for the therapist. Real-time broadcast is placeholder-only (`NOTIFICATIONS_REALTIME_ENABLED` for future WebSocket/Pusher).

### Therapist Panel

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/therapist-panel/dashboard` | GET | Therapist JWT | Dashboard stats (appointments, unread, assessments) |
| `/api/v1/therapist-panel/resume` | GET | Therapist JWT | Structured resume profile |
| `/api/v1/therapist-panel/resume` | POST | Therapist JWT | Upsert structured resume |
| `/api/v1/therapist-panel/appointments` | GET | Therapist JWT | Own appointments (filters: date, search) |
| `/api/v1/therapist-panel/assessments` | GET | Therapist JWT | Assigned assessments |
| `/api/v1/therapist-panel/notifications` | GET | Therapist JWT | Own notifications |
| `/api/v1/therapist-panel/resources` | GET | Therapist JWT | Therapy resources list |
| `/api/v1/therapist-panel/resources` | POST | Therapist JWT | Create resource (link/file path) |
| `/api/v1/therapist-panel/resources/{id}` | PATCH | Therapist JWT | Update resource |
| `/api/v1/therapist-panel/resources/{id}` | DELETE | Therapist JWT | Delete resource |
| `/api/v1/therapists/{id}/panel/seven-days` | GET | `appointments.read` | Admin view: next 7 days appointments |
| `/api/v1/therapists/{id}/panel/thirty-days` | GET | `appointments.read` | Admin view: next 30 days appointments |

### File Upload

Multipart form fields: `file` (required), `category` (required on generic endpoint), `subfolder` (required for `medical_record_image`).

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/uploads` | POST | JWT + category permission | Generic upload; returns public path `/uploads/...` |
| `/api/v1/therapists/me/avatar` | POST | Therapist JWT | Upload avatar and update own profile |
| `/api/v1/therapists/{id}/avatar` | POST | Therapist self or `therapists.write` | Upload avatar for therapist |
| `/api/v1/therapist-panel/resume/file` | POST | Therapist JWT | Upload resume PDF and update `TherapistResume.filePath` |
| `/api/v1/clients/{id}/record/images` | POST | `clients.write` | Upload medical record image and append to record |

**Categories** (for `/api/v1/uploads`): `therapist_avatar`, `therapist_resume_pdf`, `post_image`, `category_image`, `tag_image`, `department_image`, `workshop_image`, `about_logo`, `invoice_pdf`, `medical_record_image` (needs `subfolder=clientId`), `assessment_file`, `resource_file`.

**Storage:** Files are saved under `packages/api/public/uploads/{folder}/` and served statically at `{API_URL}/uploads/...`. Override root with `UPLOAD_ROOT` if needed.

### Backup / Restore

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/v1/backup/{entity}` | GET | `settings.write` | Export entity JSON, save file, return download `url` |
| `/api/v1/restore/{entity}` | POST | `settings.write` | Import JSON array (or `{ data: [...] }`) |

**Entities:** `admins`, `therapists` (alias: `doctors`), `therapist-resumes` (alias: `doctor-resumes`), `clients`, `posts`, `categories`, `tags`, `workshops`, `about`, `departments`, `client-records`, `appointments`, `assessments`, `payments`.

**Storage:** JSON files under `packages/api/public/backups/` (served at `/backups/...`). Audit rows in `backups` and `restores` tables.

### Dev users (after `pnpm db:seed`)

Requires `SEED_DEV_USERS=true` in `.env`.

| Role | Phone | Password |
|------|-------|----------|
| Admin (boss) | 09121234567 | Ebraz@1234 |
| Therapist | 09131234567 | Ebraz@1234 |
| Client | 09141234567 | Ebraz@1234 |

## Notes

- Legacy apps (`website/`, `admin-panel/`, `psy-panel/`, `client-panel/` at repo root) are **not** part of the new monorepo. They remain until feature migration.
