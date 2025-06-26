import { Prisma, type PrismaClient } from "@prisma/client";
import { travelPackageService } from "../../src/application/instances"; // Sesuaikan path ini
import type {
  CreatePaxInput,
  CreateTravelItinerariesnput,
  CreateTravelPackage,
  CreateTravelPackageDesinationInput,
} from "../../src/infrastructure/entity/types";

export async function seedTravelPackages(prisma: PrismaClient) {
    console.log("🌱 Seeding travel packages...");

    const existingDestinations = await prisma.destinations.findMany({ select: { id: true, category: true } });
    const existingAccommodations = await prisma.accommodations.findMany({ select: { id: true, name: true } });

    if (existingDestinations.length < 10 || existingAccommodations.length < 5) {
        throw new Error("Cannot seed Travel Packages: Not enough destinations or accommodations found. Run the basic seeder first.");
    }

    const getBaliAccomodationId = (name: string, fallbackIndex: number) => {
        return existingAccommodations.find(acc => acc.name.toLowerCase().includes(name.toLowerCase()))?.id || existingAccommodations[fallbackIndex].id;
    };
    
    const getDestinationIdByCategory = (category: string, index: any = 0) => {
        const filtered = existingDestinations.filter(d => d.category === category);
        if (filtered.length === 0) throw new Error(`No destinations found for category: ${category}`);
        return filtered[index % filtered.length].id;
    };

    const dests1 = [
        getDestinationIdByCategory("Beaches", 0),
        getDestinationIdByCategory("Spas", 0),
        getDestinationIdByCategory("Restaurant", 5),
        getDestinationIdByCategory("Water Parks", 0),
        getDestinationIdByCategory("Beaches", 1),
    ];
    const package1 = {
      payload: {
        name: "Ultimate Bali Beach & Luxury Escape 5D4N",
        image: "https://www.ritzcarlton.com/content/dam/the-ritz-carlton/hotels/dpssw/dpssw-cliff-villa-pool-view-50669259.jpg",
        duration: 5,
        description: "Indulge in the ultimate luxury on Bali's most beautiful beaches. This package offers a stay at a 5-star resort, spa treatments, and exquisite dining experiences.",
        accommodation_id: getBaliAccomodationId("ritz-carlton", 0),
      },
      destinations: dests1.map(id => ({ destination_id: id })),
      pax: [
        { pax: 2, price: new Prisma.Decimal(12500000) },
        { pax: 4, price: new Prisma.Decimal(22000000) },
      ],
      itineraries: [
        { day_number: 1, destination_id: dests1[0], description: "Arrival, check-in to your luxury villa in Nusa Dua, and enjoy the private beach." },
        { day_number: 2, destination_id: dests1[1], description: "Morning relaxation followed by an afternoon of rejuvenating spa treatments." },
        { day_number: 3, destination_id: dests1[2], description: "Explore Seminyak's high-end boutiques and enjoy a sunset dinner at a famous beach club." },
        { day_number: 4, destination_id: dests1[3], description: "A day of fun at Waterbom Bali, one of Asia's best water parks." },
        { day_number: 5, destination_id: dests1[4], description: "Final breakfast with an ocean view before departure." },
      ]
    };

    const dests2 = [
        getDestinationIdByCategory("Scenic Walking Areas", 0),
        getDestinationIdByCategory("Religious Sites", 0),
        getDestinationIdByCategory("Art Galleries", 0),
        getDestinationIdByCategory("Waterfalls", 0),
    ];
    const package2 = {
      payload: {
        name: "Spiritual Ubud & Cultural Immersion 4D3N",
        image: "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-0,0000-1600,0000-900,0000/publish/content/dam/fourseasons/images/web/SAY/SAY_004_original.jpg",
        duration: 4,
        description: "Discover the heart and soul of Bali in Ubud. This journey takes you through lush rice terraces, sacred temples, and vibrant art villages.",
        accommodation_id: getBaliAccomodationId("sayan", 1),
      },
      destinations: dests2.map(id => ({ destination_id: id })),
      pax: [
          { pax: 1, price: new Prisma.Decimal(6800000) },
          { pax: 2, price: new Prisma.Decimal(11500000) },
      ],
      itineraries: [
        { day_number: 1, destination_id: dests2[0], description: "Arrive in Ubud, check into a serene resort. Enjoy an evening walk through Campuhan Ridge." },
        { day_number: 2, destination_id: dests2[1], description: "Visit the sacred Tirta Empul temple for a spiritual cleansing experience and explore the Goa Gajah 'Elephant Cave'." },
        { day_number: 3, destination_id: dests2[2], description: "Explore the Ubud Art Market and visit a local art gallery to see the works of Balinese artists." },
        { day_number: 4, destination_id: dests2[3], description: "Visit a hidden waterfall like Tegenungan for a refreshing morning swim before heading to the airport." },
      ]
    };
    
    const dests3 = [
        getDestinationIdByCategory("Beaches", 2),
        getDestinationIdByCategory("Points of Interest & Landmarks", 1),
        getDestinationIdByCategory("Beaches", 3),
    ];
    const package3 = {
      payload: {
        name: "Nusa Islands Paradise Hopping 3D2N",
        image: "https://static.saltinourhair.com/wp-content/uploads/2019/07/23145448/things-to-do-nusa-penida-diamond-beach.jpg",
        duration: 3,
        description: "Escape to the breathtaking beauty of the Nusa Islands. Witness dramatic cliffs, pristine white-sand beaches, and crystal-clear waters perfect for snorkeling.",
        accommodation_id: null,
      },
      destinations: dests3.map(id => ({ destination_id: id })),
      pax: [
          { pax: 2, price: new Prisma.Decimal(3500000) },
          { pax: 4, price: new Prisma.Decimal(6500000) },
      ],
      itineraries: [
        { day_number: 1, destination_id: dests3[0], description: "Fast boat to Nusa Penida. Explore the west coast, including the iconic Kelingking Beach viewpoint." },
        { day_number: 2, destination_id: dests3[1], description: "Snorkeling day trip to see manta rays, followed by a visit to Angel's Billabong and Broken Beach." },
        { day_number: 3, destination_id: dests3[2], description: "Explore the stunning eastern coastline, including Diamond Beach, before returning to the mainland." },
      ]
    };

    const dests4 = [
        getDestinationIdByCategory("Religious Sites", 5),
        getDestinationIdByCategory("Waterfalls", 1),
        getDestinationIdByCategory("Nature & Wildlife Areas", 1),
        getDestinationIdByCategory("Mountains", 0),
    ];
    const package4 = {
      payload: {
        name: "North Bali's Hidden Waterfalls & Lakes 4D3N",
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Pura_Ulun_Danu_Bratan_A.JPG",
        duration: 4,
        description: "Journey to the cooler climates of North Bali. Discover majestic waterfalls, serene mountain lakes, and the iconic Ulun Danu Beratan temple.",
        accommodation_id: getBaliAccomodationId("apurva kempinski", 3),
      },
      destinations: dests4.map(id => ({ destination_id: id })),
      pax: [
          { pax: 2, price: new Prisma.Decimal(4200000) },
          { pax: 4, price: new Prisma.Decimal(7800000) },
      ],
      itineraries: [
        { day_number: 1, destination_id: dests4[0], description: "Travel from South Bali to the Bedugul area. Visit the iconic Pura Ulun Danu Beratan on Lake Bratan." },
        { day_number: 2, destination_id: dests4[1], description: "Full-day waterfall trekking to explore the magnificent Gitgit and Sekumpul waterfalls." },
        { day_number: 3, destination_id: dests4[2], description: "Explore the West Bali National Park, a haven for biodiversity and wildlife." },
        { day_number: 4, destination_id: dests4[3], description: "Hike to see the sunrise over Mount Batur before traveling back south for departure." },
      ]
    };
    
    // Package 5: Culinary Tour
    const dests5 = [
        getDestinationIdByCategory("Restaurant", 0),
        getDestinationIdByCategory("Beaches", 4),
        getDestinationIdByCategory("Restaurant", 10),
        getDestinationIdByCategory("Restaurant", 11),
    ];
    const package5 = {
      payload: {
        name: "Bali Culinary & Sunset Chase 3D2N",
        image: "https://www.marriott.com/content/dam/marriott-digital/w/dpswh/en_us/photos/2023/w-bali-seminyak-exterior-2-2050-16923.jpeg",
        duration: 3,
        description: "A dream for foodies and sunset lovers. Taste your way through Bali's best cafes and restaurants, and end each day with a spectacular sunset view.",
        accommodation_id: getBaliAccomodationId("w bali", 4),
      },
      destinations: dests5.map(id => ({ destination_id: id })),
      pax: [{ pax: 2, price: new Prisma.Decimal(7200000) }],
      itineraries: [
        { day_number: 1, destination_id: dests5[0], description: "Check into your stylish Seminyak hotel. Begin your culinary tour with dinner at a renowned local restaurant." },
        { day_number: 2, destination_id: dests5[1], description: "Morning Balinese cooking class. In the afternoon, relax at a famous beach club and watch the iconic sunset." },
        { day_number: 3, destination_id: dests5[3], description: "Cafe hopping in the trendy Canggu area before your flight home." },
      ]
    };
    
    // An array containing all package data to loop through
    const travelPackagesData = [package1, package2, package3, package4, package5];

    for (const data of travelPackagesData) {
        const existingPackage = await prisma.travel_Packages.findFirst({
            where: { name: data.payload.name }
        });
        if (!existingPackage) {
            console.log(`Creating package: "${data.payload.name}"...`);
            await travelPackageService.create(
                data.payload as CreateTravelPackage,
                data.destinations as CreateTravelPackageDesinationInput[],
                data.pax as CreatePaxInput[],
                data.itineraries as CreateTravelItinerariesnput[]
            );
        } else {
            console.log(`Skipping package, already exists: "${data.payload.name}"`);
        }
    }

    console.log("✅ Travel packages seeding process completed.");
}