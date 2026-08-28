import {
  EventStatus,
  PostMediaType,
  PostStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if ((adminEmail && !adminPassword) || (!adminEmail && adminPassword)) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be provided together.",
    );
  }
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters.");
    }
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: process.env.SEED_ADMIN_NAME?.trim() || "Lumina Administrator",
        passwordHash,
        role: UserRole.ADMIN,
      },
      create: {
        email: adminEmail,
        name: process.env.SEED_ADMIN_NAME?.trim() || "Lumina Administrator",
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
  }

  const feedAuthor = await prisma.user.upsert({
    where: { email: "seed-feed@lumina.local" },
    update: { name: "Saba's Kitchen", role: UserRole.ORGANIZER },
    create: {
      email: "seed-feed@lumina.local",
      name: "Saba's Kitchen",
      passwordHash: "disabled$seed$account",
      role: UserRole.ORGANIZER,
    },
  });

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
      ownerId: feedAuthor.id,
    },
    create: {
      id: "org-sabas-kitchen",
      name: "Saba's Kitchen",
      ownerId: feedAuthor.id,
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

  const posts = [
    {
      id: "post-food-fest",
      caption:
        "Lilongwe Food Fest brings together local favourites, international flavours, chef demonstrations, and a full weekend of live entertainment.",
      location: "Portuguese Club, Lilongwe",
      priceLabel: "MWK 5,000",
      dateLabel: "30 Aug 2026",
      tags: ["Food", "Festival", "Lilongwe"],
      eventId: "evt-2",
      mediaId: "media-post-food-fest",
      mediaUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop",
      altText: "Food served at an outdoor festival",
    },
    {
      id: "post-matchday",
      caption:
        "Matchday is calling. Secure your seat for Dedza Dynamos versus FCB Nyasa Big Bullets and experience the FDH Premiership atmosphere.",
      location: "Bingu National Stadium, Lilongwe",
      priceLabel: "From MWK 4,000",
      dateLabel: "31 May 2026",
      tags: ["Football", "Matchday", "Lilongwe"],
      eventId: "evt-1",
      mediaId: "media-post-matchday",
      mediaUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop",
      altText: "Football stadium during a match",
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        authorId: feedAuthor.id,
        eventId: post.eventId,
        caption: post.caption,
        location: post.location,
        priceLabel: post.priceLabel,
        dateLabel: post.dateLabel,
        tags: post.tags,
        status: PostStatus.PUBLISHED,
      },
      create: {
        id: post.id,
        authorId: feedAuthor.id,
        eventId: post.eventId,
        caption: post.caption,
        location: post.location,
        priceLabel: post.priceLabel,
        dateLabel: post.dateLabel,
        tags: post.tags,
        status: PostStatus.PUBLISHED,
      },
    });
    await prisma.postMedia.upsert({
      where: { id: post.mediaId },
      update: {
        postId: post.id,
        type: PostMediaType.IMAGE,
        url: post.mediaUrl,
        altText: post.altText,
        sortOrder: 0,
      },
      create: {
        id: post.mediaId,
        postId: post.id,
        type: PostMediaType.IMAGE,
        url: post.mediaUrl,
        altText: post.altText,
        sortOrder: 0,
      },
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
