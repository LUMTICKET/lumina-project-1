# Lumina API

API-only Next.js application for Lumina's events, venues, ticketing, courier,
parcel, feed, media, reaction, search, and moderation domains.

## Requirements

- Node.js 22.13 or newer
- Docker Desktop, or a PostgreSQL 17 instance

## Local setup

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm ci`.
3. Start the repository database from the project root with
   `docker compose -f backend/compose.yaml up -d`.
4. Apply committed migrations with `npx prisma migrate deploy`.
5. Load development records with `npm run db:seed`.
6. Start the API with `npm run dev`.

The container exposes PostgreSQL on port 5433 so it can coexist with a local
PostgreSQL installation on the default port. Use `npm run db:migrate -- --name
<change-name>` when intentionally creating a new development migration.

The API runs at http://localhost:3000. Health information is available at
GET `/api/health`. Public read endpoints are:

- GET `/api/v1/events` with optional `q`, `city`, `cursor`, and `limit`
- GET `/api/v1/events/:eventId`
- GET `/api/v1/venues` with optional `q`, `city`, `cursor`, and `limit`
- GET `/api/v1/venues/:venueId`
- GET `/api/v1/posts` with optional `q`, `cursor`, and `limit`
- GET `/api/v1/posts/:postId`

Authentication endpoints are:

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- GET `/api/v1/auth/me`
- POST `/api/v1/auth/logout`

Register with `accountType: "customer"` or `accountType: "organizer"`. Login
and registration return an opaque bearer token. Send it as `Authorization:
Bearer <token>` to protected endpoints. The database stores only a SHA-256 hash
of each token, sessions expire after 30 days, and passwords are hashed with
scrypt.

Organizer-only event workflow endpoints are:

- POST `/api/v1/events` to save a draft owned by the authenticated organizer
- PATCH `/api/v1/events/:eventId` to update an owned `draft` or `rejected`
  event
- GET `/api/v1/organizer/events` to list that organizer's events
- POST `/api/v1/events/:eventId/submit` to move an owned draft to
  `pending_review`

Public event reads return published events only. Draft and moderation states are
available only through the organizer-owned endpoint.

Administrator moderation endpoints are:

- GET `/api/v1/admin/moderation/events` to list events in `pending_review`
- POST `/api/v1/admin/moderation/events/:eventId` with `decision: "approve"`
  or `decision: "reject"`
- GET `/api/v1/admin/moderation/posts` to list posts with open reports
- POST `/api/v1/admin/moderation/posts/:postId` with `decision: "dismiss"`
  or `decision: "hide"`

Approval publishes the event. Rejection requires a note and returns the event to
the organizer as `rejected`; editing it resets it to `draft` so it can be
submitted again.

Administrator registration is intentionally unavailable over the public API.
For local development, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in
`backend/.env` before running `npm run db:seed`. The password must contain at
least 12 characters.

Authenticated feed endpoints are:

- POST `/api/v1/posts` to publish a post with one or more ordered image/video
  URL records and an optional published event link
- POST and DELETE `/api/v1/posts/:postId/reactions` to add or remove a like
- POST `/api/v1/posts/:postId/reports` to report a visible post

Reaction writes are idempotent. Authors cannot report their own posts. Hiding a
reported post removes it from public feed, detail, and search responses.

List responses expose the next cursor in `meta.nextCursor`. Event detail reads
only return published events.

## Validation

Run npm run lint, npm run typecheck, npm run db:validate, npm run build, and
npm audit --audit-level=high before submitting backend changes.

## Current foundation

- Next.js Route Handlers
- Zod request contracts
- PostgreSQL schema managed by Prisma
- Shared success and error response envelopes
- Initial Organizer, Venue, Event, and TicketTier models
- Deterministic development seed for event and venue integration
