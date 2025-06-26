import { RatedEntityType, type Destinations, type PrismaClient, type Users } from "@prisma/client";

export async function seedRatings(prisma: PrismaClient, customers: Users[], destinations: Destinations[]) {
    console.log("🌱 Seeding ratings...");
    let count = 0;
    for (const customer of customers) {
        const destinationsToRate = [...destinations].sort(() => 0.5 - Math.random()).slice(0, 3); // Setiap customer rate 3 destinasi

        for (const destination of destinationsToRate) {
            await prisma.rating.upsert({
                where: {
                    userId_ratedType_targetId: {
                        userId: customer.id,
                        ratedType: RatedEntityType.DESTINATION,
                        targetId: destination.id,
                    }
                },
                update: {},
                create: {
                    userId: customer.id,
                    ratedType: RatedEntityType.DESTINATION,
                    targetId: destination.id,
                    ratingValue: Math.floor(Math.random() * 3) + 3, // Rating 3, 4, or 5
                    comment: `Tempat yang sangat bagus! Saya sangat menikmati waktu saya di ${destination.name}.`,
                    status: true,
                },
            });
            count++;
        }
    }
    console.log(`✅ ${count} ratings seeded.`);
}