-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "baiduTongjiId" TEXT,
ADD COLUMN     "enableBaidu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableGa4" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ga4MeasurementId" TEXT;

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "path" TEXT,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
