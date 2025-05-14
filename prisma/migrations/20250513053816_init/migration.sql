-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('SUPERADMIN', 'ADMIN_OPERATIONAL', 'ADMIN_FINANCE', 'DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "Notification_Type" AS ENUM ('PROMO', 'REMINDER');

-- CreateEnum
CREATE TYPE "Vehicle_status" AS ENUM ('RENTED', 'MAINTENANCE', 'AVAILABLE', 'DISABLE');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "Vehicle_Types" AS ENUM ('CITY_CAR', 'HATCHBACK', 'SEDAN', 'SUV', 'MPV', 'MINIVAN', 'PICKUP', 'DOUBLE_CABIN', 'LUXURY', 'ELECTRIC_CAR');

-- CreateEnum
CREATE TYPE "Fuel" AS ENUM ('PERTALITE', 'PERTAMAX', 'DEXLITE', 'PERTAMAXTURBO');

-- CreateEnum
CREATE TYPE "Booking_Status" AS ENUM ('SUBMITTED', 'RECEIVED', 'REJECTED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Promo_Status" AS ENUM ('ACTIVE', 'EXPIRED', 'UNACTIVE', 'CANCELED');

-- CreateEnum
CREATE TYPE "Payment_Method" AS ENUM ('CASH', 'ONLINE');

-- CreateEnum
CREATE TYPE "Payment_Status" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "Discount_Type" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "Travel_Status" AS ENUM ('WAITING_FOR_CUSTOMER', 'ON_THE_WAY', 'ARRIVED_AT_DESTINATION', 'ONGOING_TRIP', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "OTPs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expiry_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_verified" BOOLEAN,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "role" "Roles",
    "year_of_experiences" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "refresh_token" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "Notification_Type" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification_Broadcast" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "Notification_Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "Vehicle_Types" NOT NULL,
    "transmition" "Transmission" NOT NULL,
    "status" "Vehicle_status" NOT NULL,
    "fuel" "Fuel" NOT NULL,
    "brand" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "kilometer" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "price_per_day" DECIMAL(65,30) NOT NULL,
    "image_url" TEXT[],
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "open_hour" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_urls" TEXT[],
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travel_Packages_Destinations" (
    "id" TEXT NOT NULL,
    "travel_package_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Travel_Packages_Destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travel_Packages" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Travel_Packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination_Fasilities" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Destination_Fasilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "promo_id" TEXT,
    "travel_package_id" TEXT,
    "vehicle_id" TEXT,
    "status" "Booking_Status" NOT NULL DEFAULT 'SUBMITTED',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_price" DECIMAL(65,30),
    "card_id" TEXT NOT NULL,
    "licences_id" TEXT NOT NULL,
    "pick_up_at_airport" BOOLEAN NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promos" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discount_type" "Discount_Type" NOT NULL,
    "discount_value" DECIMAL(65,30) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "min_booking_amount" DECIMAL(65,30) NOT NULL,
    "max_discount" DECIMAL(65,30) NOT NULL,
    "status" "Promo_Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "payment_method" "Payment_Method" NOT NULL,
    "payment_status" "Payment_Status" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3),
    "total_amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "OTPs" ADD CONSTRAINT "OTPs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification_Broadcast" ADD CONSTRAINT "Notification_Broadcast_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification_Broadcast" ADD CONSTRAINT "Notification_Broadcast_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Packages_Destinations" ADD CONSTRAINT "Travel_Packages_Destinations_travel_package_id_fkey" FOREIGN KEY ("travel_package_id") REFERENCES "Travel_Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Packages_Destinations" ADD CONSTRAINT "Travel_Packages_Destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Packages" ADD CONSTRAINT "Travel_Packages_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination_Fasilities" ADD CONSTRAINT "Destination_Fasilities_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "Promos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_travel_package_id_fkey" FOREIGN KEY ("travel_package_id") REFERENCES "Travel_Packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
