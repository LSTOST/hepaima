-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "baiduTongjiId",
DROP COLUMN "enableBaidu",
ADD COLUMN     "umamiScriptUrl" TEXT,
ADD COLUMN     "umamiWebsiteId" TEXT,
ADD COLUMN     "enableUmami" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clarityProjectId" TEXT,
ADD COLUMN     "enableClarity" BOOLEAN NOT NULL DEFAULT false;

