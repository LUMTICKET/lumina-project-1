CREATE TYPE "CourierListingStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "CourierServiceLevel" AS ENUM ('SAME_DAY', 'NEXT_DAY', 'STANDARD');
CREATE TYPE "ParcelStatus" AS ENUM ('CREATED', 'RECEIVED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'CANCELLED');

CREATE TABLE "CourierListing" (
  "id" TEXT NOT NULL,
  "organizerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "logoUrl" TEXT,
  "serviceAreas" TEXT[],
  "serviceLevels" "CourierServiceLevel"[],
  "basePriceMinor" INTEGER NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "estimatedMinHours" INTEGER NOT NULL,
  "estimatedMaxHours" INTEGER NOT NULL,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "status" "CourierListingStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourierListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Parcel" (
  "id" TEXT NOT NULL,
  "trackingCode" TEXT NOT NULL,
  "courierListingId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "recipientContact" TEXT NOT NULL,
  "contentsDescription" TEXT,
  "status" "ParcelStatus" NOT NULL DEFAULT 'CREATED',
  "estimatedDelivery" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParcelTrackingEvent" (
  "id" TEXT NOT NULL,
  "parcelId" TEXT NOT NULL,
  "status" "ParcelStatus" NOT NULL,
  "location" TEXT,
  "message" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParcelTrackingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourierListing_status_name_idx" ON "CourierListing"("status", "name");
CREATE INDEX "CourierListing_organizerId_idx" ON "CourierListing"("organizerId");
CREATE UNIQUE INDEX "Parcel_trackingCode_key" ON "Parcel"("trackingCode");
CREATE INDEX "Parcel_courierListingId_createdAt_idx" ON "Parcel"("courierListingId", "createdAt");
CREATE INDEX "Parcel_status_idx" ON "Parcel"("status");
CREATE INDEX "ParcelTrackingEvent_parcelId_occurredAt_idx" ON "ParcelTrackingEvent"("parcelId", "occurredAt");

ALTER TABLE "CourierListing" ADD CONSTRAINT "CourierListing_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_courierListingId_fkey" FOREIGN KEY ("courierListingId") REFERENCES "CourierListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ParcelTrackingEvent" ADD CONSTRAINT "ParcelTrackingEvent_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParcelTrackingEvent" ADD CONSTRAINT "ParcelTrackingEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
