# Lumina API

API-only Next.js application for Lumina's events, venues, ticketing, courier,
parcel, feed, media, reaction, search, and moderation domains.

## Requirements

- Node.js 22.13 or newer
- PostgreSQL

## Local setup

1. Copy .env.example to .env.
2. Update DATABASE_URL for your PostgreSQL instance.
3. Install dependencies with npm ci.
4. Generate the Prisma client with npm run db:generate.
5. Create the database migration with npm run db:migrate.
6. Start the API with npm run dev.

The API runs at http://localhost:3000. Health information is available at
GET /api/health, and versioned resources will live below /api/v1.

## Validation

Run npm run lint, npm run typecheck, npm run db:validate, npm run build, and
npm audit --audit-level=high before submitting backend changes.

## Current foundation

- Next.js Route Handlers
- Zod request contracts
- PostgreSQL schema managed by Prisma
- Shared success and error response envelopes
- Initial Organizer, Venue, Event, and TicketTier models
