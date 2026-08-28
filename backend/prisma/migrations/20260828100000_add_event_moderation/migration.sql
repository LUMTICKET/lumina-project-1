ALTER TYPE "EventStatus" ADD VALUE 'REJECTED';

ALTER TABLE "Event"
ADD COLUMN "moderationNote" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT;

CREATE INDEX "Event_reviewedById_idx" ON "Event"("reviewedById");

ALTER TABLE "Event"
ADD CONSTRAINT "Event_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
