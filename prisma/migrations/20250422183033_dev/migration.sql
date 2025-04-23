-- CreateTable
CREATE TABLE "OTPs" (
    "otp_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expiry_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPs_pkey" PRIMARY KEY ("otp_id")
);

-- AddForeignKey
ALTER TABLE "OTPs" ADD CONSTRAINT "OTPs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
