-- CreateEnum
CREATE TYPE "TestMode" AS ENUM ('UNIVERSAL', 'STAGED');

-- AlterEnum
ALTER TYPE "Stage" ADD VALUE 'UNIVERSAL';

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "initiatorTraits" JSONB,
ADD COLUMN     "partnerTraits" JSONB;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "mode" "TestMode" NOT NULL DEFAULT 'STAGED';
