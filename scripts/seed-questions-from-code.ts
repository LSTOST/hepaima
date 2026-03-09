import { PrismaClient, Stage } from "@prisma/client";
import { getQuestionsByStage } from "../src/lib/questions";
import { universalQuestions } from "../src/lib/questions-universal";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Product + Questionnaires + Questions from existing code...");

  // 1. 确保有一个默认情侣测评产品
  const productSlug = "couple-compatibility";
  let product = await prisma.product.findUnique({
    where: { slug: productSlug },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        slug: productSlug,
        name: "情侣契合度测试",
        shortDescription: "基于依恋理论、爱的语言等多维度的情侣契合度测评",
        isActive: true,
        priceCents: 0,
      },
    });
    console.log("Created default Product:", product.slug);
  } else {
    console.log("Using existing Product:", product.slug);
  }

  // 2. 为 UNIVERAL / AMBIGUOUS / ROMANCE / STABLE 创建问卷
  const stages: Array<Stage | "UNIVERSAL"> = [
    "UNIVERSAL",
    "AMBIGUOUS",
    "ROMANCE",
    "STABLE",
  ];

  const questionnaireByKey: Record<string, string> = {};

  for (const stage of stages) {
    const key = stage === "UNIVERSAL" ? "UNIVERSAL" : stage;
    const titleMap: Record<string, string> = {
      UNIVERSAL: "通用版情侣测评问卷",
      AMBIGUOUS: "暧昧期情侣问卷",
      ROMANCE: "热恋期情侣问卷",
      STABLE: "稳定期情侣问卷",
    };

    const existing = await prisma.questionnaire.findFirst({
      where: { productId: product.id, stage: stage === "UNIVERSAL" ? "UNIVERSAL" : stage },
    });

    const questionnaire =
      existing ??
      (await prisma.questionnaire.create({
        data: {
          productId: product.id,
          title: titleMap[key] ?? key,
          stage: stage === "UNIVERSAL" ? "UNIVERSAL" : stage,
          isActive: true,
        },
      }));

    questionnaireByKey[key] = questionnaire.id;
    console.log("Questionnaire ready:", key, questionnaire.id);
  }

  // 3. 通用版题目（基于 universalQuestions）
  {
    const questionnaireId = questionnaireByKey["UNIVERSAL"];
    console.log("Seeding universal questions into questionnaire:", questionnaireId);

    // 清理旧数据以免重复
    await prisma.quizQuestionOption.deleteMany({
      where: { question: { questionnaireId } },
    });
    await prisma.quizQuestion.deleteMany({
      where: { questionnaireId },
    });

    let order = 1;
    for (const q of universalQuestions) {
      const qq = await prisma.quizQuestion.create({
        data: {
          questionnaireId,
          externalId: q.id,
          order: order++,
          text: q.text,
          category: q.category,
          type: "SCALE" as any,
          required: true,
          scoringJson: q.scoring as unknown as object,
        },
      });

      // 量表题的选项（1-7），这里只为了后台展示，计分仍以 scoringJson 为准
      for (let i = 1; i <= 7; i++) {
        await prisma.quizQuestionOption.create({
          data: {
            questionId: qq.id,
            key: String(i),
            text: `${i}`,
            order: i,
          },
        });
      }
    }
    console.log("Universal questions seeded:", universalQuestions.length);
  }

  // 4. 分阶段题目（基于 getQuestionsByStage）
  const stagedStages: Stage[] = ["AMBIGUOUS", "ROMANCE", "STABLE"];

  for (const stage of stagedStages) {
    const questionnaireId = questionnaireByKey[stage];
    console.log(`Seeding staged questions for ${stage} into questionnaire:`, questionnaireId);

    await prisma.quizQuestionOption.deleteMany({
      where: { question: { questionnaireId } },
    });
    await prisma.quizQuestion.deleteMany({
      where: { questionnaireId },
    });

    const questions = getQuestionsByStage(stage);
    let order = 1;
    for (const q of questions) {
      const qq = await prisma.quizQuestion.create({
        data: {
          questionnaireId,
          externalId: q.id,
          order: order++,
          text: q.text,
          category: q.category,
          type: "SINGLE_CHOICE" as any,
          required: true,
        },
      });

      let optOrder = 1;
      for (const opt of q.options) {
        await prisma.quizQuestionOption.create({
          data: {
            questionId: qq.id,
            key: opt.key,
            text: opt.text,
            order: optOrder++,
            scoringJson: opt.scores as unknown as object,
          },
        });
      }
    }
    console.log(`${stage} questions seeded:`, questions.length);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

