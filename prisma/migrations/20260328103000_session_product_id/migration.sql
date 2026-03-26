-- Session 必须关联 Product；若本地/线上已加过列，整段 DO 会跳过（避免重复 ADD COLUMN）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Session'
      AND column_name = 'productId'
  ) THEN
    INSERT INTO "Product" ("id", "slug", "name", "isActive", "createdAt", "updatedAt", "priceCents", "allowRedeemCode")
    SELECT
      'cmigration_core_couple_compat',
      'couple-compatibility',
      '情侣契合度测试',
      true,
      NOW(),
      NOW(),
      0,
      true
    WHERE NOT EXISTS (SELECT 1 FROM "Product" WHERE "slug" = 'couple-compatibility');

    ALTER TABLE "Session" ADD COLUMN "productId" TEXT;

    UPDATE "Session" s
    SET "productId" = p.id
    FROM "Product" p
    WHERE p.slug = 'couple-compatibility'
      AND s."productId" IS NULL;

    ALTER TABLE "Session" ALTER COLUMN "productId" SET NOT NULL;

    ALTER TABLE "Session"
      ADD CONSTRAINT "Session_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    CREATE INDEX "Session_productId_idx" ON "Session"("productId");
  END IF;
END $$;
