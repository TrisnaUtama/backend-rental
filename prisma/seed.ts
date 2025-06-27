import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeders/seed-user";
import { seedBasicData } from "./seeders/seed-basic-data";
import { seedTravelPackages } from "./seeders/seed.-travel-package";
import { seedRatings } from "./seeders/seed-rating";
// import { seedBookingAndPayments } from "./seeders/seed-payment-book";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting the seeding process...");

  const customers = await seedUsers(prisma);
  await seedBasicData(prisma);
  const allDestinations = await prisma.destinations.findMany();
  await seedRatings(prisma, customers, allDestinations);
  await seedTravelPackages(prisma);
  // await seedBookingAndPayments(prisma);

  console.log("🎉 Seeding process completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred during the seeding process:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma client disconnected.");
  });
