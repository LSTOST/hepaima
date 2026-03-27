-- AlterEnum
ALTER TYPE "TestMode" ADD VALUE 'SCENARIO';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "scenarioSlug" TEXT;
