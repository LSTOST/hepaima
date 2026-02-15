-- 1. 新增 RedeemCode 字段
ALTER TABLE "RedeemCode" ADD COLUMN "firstUsedAt" TIMESTAMP(3);
ALTER TABLE "RedeemCode" ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false;

-- 2. 迁移数据
UPDATE "RedeemCode" SET "firstUsedAt" = "usedAt" WHERE "usedAt" IS NOT NULL;
UPDATE "RedeemCode" SET "disabled" = true WHERE "status" = 'DISABLED';

-- 3. 创建 RedeemCodeUsage 表
CREATE TABLE "RedeemCodeUsage" (
    "id" TEXT NOT NULL,
    "redeemCodeId" TEXT NOT NULL,
    "stage" "Stage" NOT NULL,
    "sessionId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedeemCodeUsage_pkey" PRIMARY KEY ("id")
);

-- 4. 将旧的使用记录迁移到 RedeemCodeUsage（原单次使用视为 UNIVERSAL 阶段）
INSERT INTO "RedeemCodeUsage" ("id", "redeemCodeId", "stage", "sessionId", "usedAt")
SELECT gen_random_uuid()::text, id, 'UNIVERSAL'::"Stage", "sessionId", "usedAt"
FROM "RedeemCode"
WHERE "usedAt" IS NOT NULL;

-- 5. 添加唯一约束与外键
CREATE UNIQUE INDEX "RedeemCodeUsage_redeemCodeId_stage_key" ON "RedeemCodeUsage"("redeemCodeId", "stage");
ALTER TABLE "RedeemCodeUsage" ADD CONSTRAINT "RedeemCodeUsage_redeemCodeId_fkey" FOREIGN KEY ("redeemCodeId") REFERENCES "RedeemCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. 删除 RedeemCode 旧列
ALTER TABLE "RedeemCode" DROP COLUMN "status";
ALTER TABLE "RedeemCode" DROP COLUMN "usedAt";
ALTER TABLE "RedeemCode" DROP COLUMN "sessionId";

-- 7. 删除 CodeStatus 枚举
DROP TYPE "CodeStatus";
