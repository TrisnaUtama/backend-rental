-- CreateEnum
CREATE TYPE "Vehicle_status" AS ENUM ('RENTED', 'MAINTENANCE', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "Transmition" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "Vehicle_Types" AS ENUM ('CITY_CAR', 'HATCHBACK', 'SEDAN', 'SUV', 'MPV', 'MINIVAN', 'PICKUP', 'DOUBLE_CABIN', 'LUXURY', 'ELECTRIC_CAR');

-- CreateEnum
CREATE TYPE "Fuel" AS ENUM ('PERTALITE', 'PERTAMAX', 'DEXLITE', 'PERTAMAX_TURBO');

-- CreateTable
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "Vehicle_Types" NOT NULL,
    "transmition" "Transmition" NOT NULL,
    "status" "Vehicle_status" NOT NULL,
    "fuel" "Fuel" NOT NULL,
    "brand" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "kilometer" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price_per_day" DECIMAL(65,30) NOT NULL,
    "image_url" TEXT[],
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);
