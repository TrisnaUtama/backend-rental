-- CreateTable
CREATE TABLE "Destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "open_hour" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_urls" TEXT[],
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travel_Packages_Destinations" (
    "id" TEXT NOT NULL,
    "travel_package_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Travel_Packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination_Fasilities" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_Fasilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Travel_Packages_Destinations" ADD CONSTRAINT "Travel_Packages_Destinations_travel_package_id_fkey" FOREIGN KEY ("travel_package_id") REFERENCES "Travel_Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Packages_Destinations" ADD CONSTRAINT "Travel_Packages_Destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel_Packages" ADD CONSTRAINT "Travel_Packages_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination_Fasilities" ADD CONSTRAINT "Destination_Fasilities_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
