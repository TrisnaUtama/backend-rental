import {
  type PrismaClient,
  type Booking_Status,
  type Payment_Status,
  Prisma,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import { prisma } from "../../src/infrastructure/utils/prisma";

// --- KONFIGURASI GENERATOR ---
const DAYS_TO_GENERATE = 365;
const MIN_BOOKINGS_PER_DAY = 2;
const MAX_BOOKINGS_PER_DAY = 10;

// --- PROBABILITAS SKENARIO ---
const SCENARIOS: {
  scenario: "SUCCESS_UPCOMING" | "SUCCESS_COMPLETED" | "PENDING" | "FAILED";
  bookingStatus: Booking_Status;
  paymentStatus: Payment_Status | Payment_Status[];
  weight: number;
}[] = [
  { scenario: "SUCCESS_UPCOMING", bookingStatus: "CONFIRMED", paymentStatus: "PAID", weight: 35 },
  { scenario: "SUCCESS_COMPLETED", bookingStatus: "COMPLETE", paymentStatus: "PAID", weight: 35 },
  { scenario: "PENDING", bookingStatus: "PAYMENT_PENDING", paymentStatus: "PENDING", weight: 15 },
  { scenario: "FAILED", bookingStatus: "SUBMITTED", paymentStatus: ["FAILED", "EXPIRED", "CANCELED"], weight: 15 },
];

const weightedScenarios = SCENARIOS.flatMap((s) => Array(s.weight).fill(s));

// --- Tipe Data untuk Kejelasan ---
type UserData = { id: string };
type PromoData = { id: string };
type VehicleData = { id: string; price_per_day: Prisma.Decimal };
type TravelPackageData = {
  id: string;
  duration: number;
  pax_options: { id: string; price: Prisma.Decimal }[];
};

// --- FUNGSI HELPER ---
function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0)
    throw new Error("Attempted to get random element from an empty array.");
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateAndInsertBooking(
  creationDay: Date,
  users: UserData[],
  travelPackages: TravelPackageData[],
  vehicles: VehicleData[],
  promos: PromoData[]
) {
  const creationDateTime = faker.date.between({
    from: creationDay,
    to: new Date(creationDay.getTime() + 23 * 60 * 60 * 1000),
  });

  const randomUser = getRandomElement(users);
  const user_id = randomUser.id;
  const userIdentifier = user_id.substring(user_id.length - 6);
  const licences_id = `https://dummyimage.com/1024x768/cccccc/000000&text=Lisensi_${userIdentifier}.jpg`;
  const card_id = `https://dummyimage.com/1024x768/cccccc/000000&text=KTP_${userIdentifier}.jpg`;

  // Objek ini hanya menampung field-field dari model Booking
  const bookingInput: any = {
    user_id,
    licences_id,
    card_id,
    pick_up_at_airport: faker.datatype.boolean(),
    created_at: creationDateTime,
    notes: faker.lorem.sentence(),
  };

  let total_price = new Prisma.Decimal(0);
  let vehicleBookingData: any = null; // Variabel untuk menampung data relasi booking_vehicles

  // Tentukan tipe booking (Paket atau Kendaraan)
  if (Math.random() < 0.7 && travelPackages.length > 0) {
    const randomPackage = getRandomElement(travelPackages);
    if (randomPackage.pax_options.length === 0) return;
    const randomPaxOption = getRandomElement(randomPackage.pax_options);

    bookingInput.travel_package_id = randomPackage.id;
    bookingInput.pax_option_id = randomPaxOption.id;
    const start_date = faker.date.between({
      from: creationDateTime,
      to: faker.date.future({ years: 1, refDate: creationDateTime }),
    });
    bookingInput.start_date = start_date;
    bookingInput.end_date = new Date(
      start_date.getTime() + randomPackage.duration * 24 * 60 * 60 * 1000
    );
    total_price = new Prisma.Decimal(randomPaxOption.price);
  } else {
    const randomVehicle = getRandomElement(vehicles);
    const duration_days = faker.number.int({ min: 2, max: 7 });
    const start_date = faker.date.between({
      from: creationDateTime,
      to: faker.date.future({ years: 1, refDate: creationDateTime }),
    });
    bookingInput.start_date = start_date;
    bookingInput.end_date = new Date(
      start_date.getTime() + duration_days * 24 * 60 * 60 * 1000
    );
    total_price = new Prisma.Decimal(randomVehicle.price_per_day).mul(
      duration_days
    );
    
    // FIX 2: Siapkan data untuk tabel relasi 'booking_vehicles'
    vehicleBookingData = {
        create: [{ vehicle_id: randomVehicle.id }]
    };
  }

  if (Math.random() < 0.25 && promos.length > 0) {
    bookingInput.promo_id = getRandomElement(promos).id;
    total_price = total_price.mul(0.9); // Diskon 10%
  }
  bookingInput.total_price = total_price;

  const chosenScenario = getRandomElement(weightedScenarios);
  bookingInput.status = chosenScenario.bookingStatus;

  if (
    chosenScenario.scenario === "SUCCESS_COMPLETED" &&
    bookingInput.end_date < new Date()
  ) {
    bookingInput.status = "COMPLETE";
  } else if (
    chosenScenario.scenario === "SUCCESS_COMPLETED" &&
    bookingInput.end_date >= new Date()
  ) {
    bookingInput.status = "CONFIRMED";
  }

  const paymentStatus = Array.isArray(chosenScenario.paymentStatus)
    ? getRandomElement(chosenScenario.paymentStatus)
    : chosenScenario.paymentStatus;

  const paymentData = {
    amount: bookingInput.total_price,
    status: paymentStatus,
    payment_method: getRandomElement([
      "Credit Card",
      "Bank Transfer",
      "E-Wallet",
    ]),
    transaction_date: creationDateTime,
  };

  const finalDataForPrisma = {
    ...bookingInput,
    Payments: {
      create: [paymentData],
    },
    ...(vehicleBookingData && { booking_vehicles: vehicleBookingData }),
  };

  try {
    await prisma.bookings.create({
      data: finalDataForPrisma,
    });
    console.log(
      `[${creationDay.toISOString().split("T")[0]}] Created [${
        chosenScenario.scenario
      }] booking for user ${user_id.slice(-6)}`
    );
  } catch (e: any) {
    console.error(
      `Failed to create booking on ${creationDay.toISOString().split("T")[0]}:`,
      e.message
    );
  }
}

export async function seedBookingAndPayments(prisma: PrismaClient) {
  console.log("🌱 Seeding bookings and payments...");

  const users = await prisma.users.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true },
  });

  // FIX 3: Koreksi nama model dari `travel_Packages` menjadi `travelPackage` (sesuai konvensi Prisma)
  const travelPackages = await prisma.travel_Packages.findMany({
    where: { status: true },
    select: {
      id: true,
      duration: true,
      pax_options: { select: { id: true, price: true } },
    },
  });

  const vehicles = await prisma.vehicles.findMany({
    where: { status: "AVAILABLE" },
    select: { id: true, price_per_day: true },
  });

  const promos = await prisma.promos.findMany({
    where: { status: true },
    select: { id: true },
  });

  if (
    users.length === 0 ||
    travelPackages.length === 0 ||
    vehicles.length === 0
  ) {
    console.error(
      "\n❌ FATAL: Prerequisite data not found (users, packages, or vehicles)."
    );
    console.error("Please run the primary seeders first.");
    process.exit(1);
  }
  console.log(
    `   - Found: ${users.length} users, ${travelPackages.length} packages, ${vehicles.length} vehicles.`
  );

  const today = new Date();
  const startDate = new Date(
    today.getTime() - DAYS_TO_GENERATE * 24 * 60 * 60 * 1000
  );
  const currentDate = new Date(startDate);
  let totalCreated = 0;

  while (currentDate <= today) {
    const numBookings = faker.number.int({
      min: MIN_BOOKINGS_PER_DAY,
      max: MAX_BOOKINGS_PER_DAY,
    });
    for (let i = 0; i < numBookings; i++) {
      await generateAndInsertBooking(
        currentDate,
        users,
        travelPackages,
        vehicles,
        promos
      );
      totalCreated++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(
    `✅ Bookings and payments seeding process completed. Total created: ${totalCreated}`
  );
}