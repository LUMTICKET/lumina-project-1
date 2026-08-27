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

- GET `/api/v1/events` with optional `q`, `city`, `status`, `cursor`, and `limit`
- GET `/api/v1/events/:eventId`
- GET `/api/v1/venues` with optional `q`, `city`, `cursor`, and `limit`
- GET `/api/v1/venues/:venueId`

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
