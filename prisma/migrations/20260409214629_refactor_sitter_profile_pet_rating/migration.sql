/*
  Warnings:

  - You are about to drop the column `notes` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `SitterProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "rating" INTEGER;

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "notes",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "SitterProfile" DROP COLUMN "isVerified",
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
