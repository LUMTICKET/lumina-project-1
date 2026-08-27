import { EventStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sulom = await prisma.organizer.upsert({
    where: { id: "org-sulom" },
    update: {
      name: "Super League of Malawi (SULOM)",
    },
    create: {
      id: "org-sulom",
      name: "Super League of Malawi (SULOM)",
    },
  });

  const sabasKitchen = await prisma.organizer.upsert({
    where: { id: "org-sabas-kitchen" },
    update: {
      name: "Saba's Kitchen",
    },
    create: {
      id: "org-sabas-kitchen",
      name: "Saba's Kitchen",
    },
  });

  const stadium = await prisma.venue.upsert({
    where: { id: "venue-bingu-stadium" },
    update: {
      name: "Bingu National Stadium",
      address: "Area 48",
      city: "Lilongwe",
    },
    create: {
      id: "venue-bingu-stadium",
      name: "Bingu National Stadium",
      address: "Area 48",
      city: "Lilongwe",
    },
  });

  const portugueseClub = await prisma.venue.upsert({
    where: { id: "venue-portuguese-club" },
    update: {
      name: "Portuguese Club",
      address: "Area 15",
      city: "Lilongwe",
    },
    create: {
      id: "venue-portuguese-club",
      name: "Portuguese Club",
      address: "Area 15",
      city: "Lilongwe",
    },
  });

  await prisma.event.upsert({
    where: { id: "evt-1" },
    update: {
      title: "Goshen City Dedza Dynamos vs FCB Nyasa Big Bullets",
      subtitle: "FDH Bank Premiership matchday",
      organizerId: sulom.id,
      venueId: stadium.id,
      startsAt: new Date("2026-05-31T14:30:00+02:00"),
      description:
        "The People's Team travel to face Goshen City Dedza Dynamos in an FDH Bank Premiership clash. Expect a tightly contested matchday as Dedza Dynamos look to upset the league heavyweights on home turf.",
      tags: ["Football", "FDH Premiership", "Malawi"],
      status: EventStatus.PUBLISHED,
      maxPerUser: 8,
    },
    create: {
      id: "evt-1",
      title: "Goshen City Dedza Dynamos vs FCB Nyasa Big Bullets",
      subtitle: "FDH Bank Premiership matchday",
      organizerId: sulom.id,
      venueId: stadium.id,
      startsAt: new Date("2026-05-31T14:30:00+02:00"),
      description:
        "The People's Team travel to face Goshen City Dedza Dynamos in an FDH Bank Premiership clash. Expect a tightly contested matchday as Dedza Dynamos look to upset the league heavyweights on home turf.",
      tags: ["Football", "FDH Premiership", "Malawi"],
      status: EventStatus.PUBLISHED,
      maxPerUser: 8,
    },
  });

  await prisma.event.upsert({
    where: { id: "evt-2" },
    update: {
      title: "Lilongwe Food Fest",
      subtitle: "A taste of Malawi and beyond",
      organizerId: sabasKitchen.id,
      venueId: portugueseClub.id,
      startsAt: new Date("2026-08-30T10:00:00+02:00"),
      description:
        "A celebration of local and international cuisine at the Portuguese Club. Food vendors, tastings, and a lively atmosphere for everyone to enjoy — book your stall or grab an entry pass to explore the flavors on offer.",
      tags: ["Food", "Festival", "Lilongwe"],
      status: EventStatus.PUBLISHED,
      maxPerUser: 4,
    },
    create: {
      id: "evt-2",
      title: "Lilongwe Food Fest",
      subtitle: "A taste of Malawi and beyond",
      organizerId: sabasKitchen.id,
      venueId: portugueseClub.id,
      startsAt: new Date("2026-08-30T10:00:00+02:00"),
      description:
        "A celebration of local and international cuisine at the Portuguese Club. Food vendors, tastings, and a lively atmosphere for everyone to enjoy — book your stall or grab an entry pass to explore the flavors on offer.",
      tags: ["Food", "Festival", "Lilongwe"],
      status: EventStatus.PUBLISHED,
      maxPerUser: 4,
    },
  });

  const tiers = [
    {
      id: "tier-evt-1-regular",
      eventId: "evt-1",
      name: "Open Stand",
      priceMinor: 400000,
      currency: "MWK",
      capacity: 120,
      available: 120,
      perks: ["General Access"],
    },
    {
      id: "tier-evt-1-vip",
      eventId: "evt-1",
      name: "VIP Stand",
      priceMinor: 15000000,
      currency: "MWK",
      capacity: 15,
      available: 15,
      perks: ["Covered Seating", "Premium View"],
    },
    {
      id: "tier-evt-2-entry",
      eventId: "evt-2",
      name: "Entry Pass",
      priceMinor: 500000,
      currency: "MWK",
      capacity: 500,
      available: 500,
      perks: ["Food Stall Access", "Tastings"],
    },
    {
      id: "tier-evt-2-stall",
      eventId: "evt-2",
      name: "Stall Booking",
      priceMinor: 2000000,
      currency: "MWK",
      capacity: 30,
      available: 30,
      perks: ["Vendor Table", "Priority Setup"],
    },
  ];

  for (const tier of tiers) {
    await prisma.ticketTier.upsert({
      where: { id: tier.id },
      update: tier,
      create: tier,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
