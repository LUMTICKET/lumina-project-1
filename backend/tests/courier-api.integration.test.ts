import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { POST as registerAccount } from "../src/app/api/v1/auth/register/route";
import {
  GET as listCourierServices,
  POST as createCourierService,
} from "../src/app/api/v1/courier-listings/route";
import { GET as listOrganizerCourierServices } from "../src/app/api/v1/organizer/courier-listings/route";
import {
  GET as listCourierParcels,
  POST as createCourierParcel,
} from "../src/app/api/v1/courier-listings/[listingId]/parcels/route";
import { POST as addTrackingEvent } from "../src/app/api/v1/parcels/[parcelId]/tracking-events/route";
import { GET as trackParcel } from "../src/app/api/v1/parcels/track/[trackingCode]/route";
import { prisma } from "../src/lib/prisma";

interface Envelope<T> {
  data: T;
  error?: { code?: string; message?: string };
}

interface Session {
  token: string;
  user: {
    id: string;
    organizer: { id: string } | null;
  };
}

interface Listing {
  id: string;
  name: string;
}

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  events: Array<{ status: string }>;
}

const suffix = randomUUID();
const emails = {
  owner: `courier-owner-${suffix}@example.test`,
  outsider: `courier-outsider-${suffix}@example.test`,
  customer: `courier-customer-${suffix}@example.test`,
};
const organizerIds: string[] = [];

function request(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
  token?: string,
) {
  return new Request(`http://localhost:3000/api/v1${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function payload<T>(response: Response) {
  return (await response.json()) as Envelope<T>;
}

async function register(
  email: string,
  accountType: "customer" | "organizer",
) {
  const response = await registerAccount(
    request("/auth/register", "POST", {
      name: accountType === "organizer" ? "Courier Test Operator" : "Courier Test Customer",
      email,
      password: "Integration123!",
      accountType,
    }),
  );
  assert.equal(response.status, 201);
  const body = await payload<Session>(response);
  if (body.data.user.organizer) organizerIds.push(body.data.user.organizer.id);
  return body.data;
}

after(async () => {
  await prisma.organizer.deleteMany({ where: { id: { in: organizerIds } } });
  await prisma.user.deleteMany({ where: { email: { in: Object.values(emails) } } });
  await prisma.$disconnect();
});

test("courier API protects ownership, privacy, and status transitions", async () => {
  const owner = await register(emails.owner, "organizer");
  const outsider = await register(emails.outsider, "organizer");
  const customer = await register(emails.customer, "customer");
  assert.ok(owner.user.organizer);
  assert.ok(outsider.user.organizer);

  const unauthenticatedInventory = await listOrganizerCourierServices(
    request("/organizer/courier-listings", "GET"),
  );
  assert.equal(unauthenticatedInventory.status, 401);

  const forbiddenCreate = await createCourierService(
    request(
      "/courier-listings",
      "POST",
      {
        name: "Forbidden Courier",
        description: "Customers must not create courier service listings.",
        serviceAreas: ["Blantyre"],
        serviceLevels: ["standard"],
        basePriceMinor: 100_000,
        currency: "MWK",
        estimatedMinHours: 12,
        estimatedMaxHours: 24,
      },
      customer.token,
    ),
  );
  assert.equal(forbiddenCreate.status, 403);

  const createListingResponse = await createCourierService(
    request(
      "/courier-listings",
      "POST",
      {
        name: `Integration Courier ${suffix.slice(0, 8)}`,
        description: "A courier service created by the integration contract test.",
        serviceAreas: ["Blantyre", "Lilongwe"],
        serviceLevels: ["same_day", "standard"],
        basePriceMinor: 250_000,
        currency: "MWK",
        estimatedMinHours: 4,
        estimatedMaxHours: 48,
        contactEmail: emails.owner,
        contactPhone: "+265 999 000 000",
      },
      owner.token,
    ),
  );
  assert.equal(createListingResponse.status, 201);
  const listing = (await payload<Listing>(createListingResponse)).data;

  const inventoryResponse = await listOrganizerCourierServices(
    request("/organizer/courier-listings", "GET", undefined, owner.token),
  );
  assert.equal(inventoryResponse.status, 200);
  const inventory = (await payload<Listing[]>(inventoryResponse)).data;
  assert.ok(inventory.some((item) => item.id === listing.id));

  const publicListResponse = await listCourierServices(
    request("/courier-listings", "GET"),
  );
  const publicListText = await publicListResponse.text();
  assert.equal(publicListResponse.status, 200);
  assert.equal(publicListText.includes(emails.owner), false);
  assert.equal(publicListText.includes("+265 999 000 000"), false);

  const outsiderParcels = await listCourierParcels(
    request(
      `/courier-listings/${listing.id}/parcels`,
      "GET",
      undefined,
      outsider.token,
    ),
    { params: Promise.resolve({ listingId: listing.id }) },
  );
  assert.equal(outsiderParcels.status, 404);

  const recipientName = `Private Recipient ${suffix}`;
  const recipientContact = `private-${suffix}@example.test`;
  const contentsDescription = `Private contents ${suffix}`;
  const createParcelResponse = await createCourierParcel(
    request(
      `/courier-listings/${listing.id}/parcels`,
      "POST",
      {
        origin: "Blantyre",
        destination: "Lilongwe",
        recipientName,
        recipientContact,
        contentsDescription,
      },
      owner.token,
    ),
    { params: Promise.resolve({ listingId: listing.id }) },
  );
  assert.equal(createParcelResponse.status, 201);
  const createParcelText = await createParcelResponse.text();
  assert.equal(createParcelText.includes(recipientName), false);
  assert.equal(createParcelText.includes(recipientContact), false);
  assert.equal(createParcelText.includes(contentsDescription), false);
  const parcel = (JSON.parse(createParcelText) as Envelope<Parcel>).data;
  assert.equal(parcel.status, "created");

  const invalidTransition = await addTrackingEvent(
    request(
      `/parcels/${parcel.id}/tracking-events`,
      "POST",
      { status: "delivered", message: "Skipping the required lifecycle" },
      owner.token,
    ),
    { params: Promise.resolve({ parcelId: parcel.id }) },
  );
  assert.equal(invalidTransition.status, 409);

  for (const status of ["received", "in_transit"] as const) {
    const update = await addTrackingEvent(
      request(
        `/parcels/${parcel.id}/tracking-events`,
        "POST",
        {
          status,
          location: status === "received" ? "Blantyre Depot" : "M1 Northbound",
          message: `Parcel moved to ${status}`,
        },
        owner.token,
      ),
      { params: Promise.resolve({ parcelId: parcel.id }) },
    );
    assert.equal(update.status, 200);
  }

  const trackingResponse = await trackParcel(
    request(`/parcels/track/${parcel.trackingCode}`, "GET"),
    { params: Promise.resolve({ trackingCode: parcel.trackingCode }) },
  );
  assert.equal(trackingResponse.status, 200);
  const trackingText = await trackingResponse.text();
  assert.equal(trackingText.includes(recipientName), false);
  assert.equal(trackingText.includes(recipientContact), false);
  assert.equal(trackingText.includes(contentsDescription), false);
  const tracked = (JSON.parse(trackingText) as Envelope<Parcel>).data;
  assert.equal(tracked.status, "in_transit");
  assert.deepEqual(
    tracked.events.map((event) => event.status),
    ["created", "received", "in_transit"],
  );
});
