import type { PrismaClient } from "@prisma/client";
import { accommodationsData } from "../seed-data/accomodation.data";
import { destinations } from "../seed-data/destination.data";
import { promosData } from "../seed-data/promo.data";
import { vehiclesData } from "../seed-data/vehicle.data";

export async function seedBasicData(prisma: PrismaClient) {
  console.log("🌱 Seeding basic data (Accommodations, Destinations, Vehicles, Promos)...");
  for (const accommodation of accommodationsData) {
    const existing = await prisma.accommodations.findFirst({
      where: { name: accommodation.name },
    });
    if (!existing) {
      await prisma.accommodations.create({ data: accommodation });
    }
  }
  
  for (const destination of destinations) {
    await prisma.destinations.upsert({
      where: { id: destination.id },
      update: destination,
      create: destination,
    });
  }
  console.log(`   - ${destinations.length} destinations seeded.`);

  for (const vehicle of vehiclesData) {
    const existing = await prisma.vehicles.findFirst({
      where: { name: vehicle.name },
    });
    if (!existing) {
      await prisma.vehicles.create({ data: vehicle });
    }
  }
  
  for (const promo of promosData) {
    const existing = await prisma.promos.findFirst({
      where: { code: promo.code },
    });
    if (!existing) {
      await prisma.promos.create({ data: promo });
    }
  }

  console.log("✅ Basic data seeded successfully.");
}