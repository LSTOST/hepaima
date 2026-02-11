-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AttachmentType" AS ENUM ('SECURE', 'ANXIOUS', 'AVOIDANT', 'FEARFUL');

-- CreateEnum
CREATE TYPE "public"."LoveLanguage" AS ENUM ('WORDS', 'TIME', 'GIFTS', 'SERVICE', 'TOUCH');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('WECHAT', 'ALIPAY');

-- CreateEnum
CREATE TYPE "public"."ReportTier" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('WAITING_PARTNER', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."Stage" AS ENUM ('AMBIGUOUS', 'ROMANCE', 'STABLE');

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT,
    "tier" "public"."ReportTier" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "public"."PaymentMethod",
    "paymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Result" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "initiatorAttachment" "public"."AttachmentType" NOT NULL,
    "partnerAttachment" "public"."AttachmentType" NOT NULL,
    "initiatorLoveLanguage" "public"."LoveLanguage" NOT NULL,
    "partnerLoveLanguage" "public"."LoveLanguage" NOT NULL,
    "reportBasic" JSONB,
    "reportStandard" JSONB,
    "reportPremium" JSONB,
    "purchasedTier" "public"."ReportTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "stage" "public"."Stage" NOT NULL,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'WAITING_PARTNER',
    "initiatorId" TEXT,
    "initiatorDeviceId" TEXT NOT NULL,
    "initiatorName" TEXT NOT NULL,
    "initiatorAnswers" JSONB,
    "initiatorCompletedAt" TIMESTAMP(3),
    "partnerId" TEXT,
    "partnerDeviceId" TEXT,
    "partnerName" TEXT,
    "partnerAnswers" JSONB,
    "partnerCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "wechatOpenId" TEXT,
    "deviceIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Result_sessionId_key" ON "public"."Result"("sessionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Session_inviteCode_key" ON "public"."Session"("inviteCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_wechatOpenId_key" ON "public"."User"("wechatOpenId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
