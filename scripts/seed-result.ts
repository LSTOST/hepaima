/**
 * 开发用：为已有 session 生成 Result，用于预览结果页
 * 用法：pnpm exec tsx scripts/seed-result.ts <sessionId>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessionId = process.argv[2];
  if (!sessionId) {
    console.error("用法: pnpm exec tsx scripts/seed-result.ts <sessionId>");
    console.error("示例: pnpm exec tsx scripts/seed-result.ts clxxx...");
    process.exit(1);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    console.error("未找到 session:", sessionId);
    process.exit(1);
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "COMPLETED" },
  });

  await prisma.result.upsert({
    where: { sessionId },
    create: {
      sessionId,
      overallScore: 78,
      dimensions: {
        attachment: 85,
        loveLanguage: 72,
        communication: 80,
        values: 75,
        lifestyle: 70,
        conflict: 65,
      },
      initiatorAttachment: "SECURE",
      partnerAttachment: "ANXIOUS",
      initiatorLoveLanguage: "WORDS",
      partnerLoveLanguage: "TIME",
    },
    update: {
      overallScore: 78,
      dimensions: {
        attachment: 85,
        loveLanguage: 72,
        communication: 80,
        values: 75,
        lifestyle: 70,
        conflict: 65,
      },
      initiatorAttachment: "SECURE",
      partnerAttachment: "ANXIOUS",
      initiatorLoveLanguage: "WORDS",
      partnerLoveLanguage: "TIME",
    },
  });

  console.log("✅ Result 已生成");
  console.log(`预览: http://localhost:3000/result/${sessionId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
