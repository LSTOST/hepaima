-- CreateEnum
CREATE TYPE "CodeStatus" AS ENUM ('UNUSED', 'USED', 'EXPIRED', 'DISABLED');

-- CreateTable
CREATE TABLE "RedeemCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "batchId" TEXT,
    "status" "CodeStatus" NOT NULL DEFAULT 'UNUSED',
    "usedByDeviceId" TEXT,
    "usedAt" TIMESTAMP(3),
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RedeemCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedeemCode_code_key" ON "RedeemCode"("code");
