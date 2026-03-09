import { NextRequest, NextResponse } from "next/server";
import type { Stage } from "@/lib/questions";
import { getStagedQuestionsFromDb } from "@/lib/quiz-config";

const VALID_STAGES: Stage[] = ["AMBIGUOUS", "ROMANCE", "STABLE"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stageParam = (searchParams.get("stage") ?? "ROMANCE") as Stage;

    if (!VALID_STAGES.includes(stageParam)) {
      return NextResponse.json(
        { message: "stage 参数不合法" },
        { status: 400 },
      );
    }

    const questions = await getStagedQuestionsFromDb(stageParam);
    return NextResponse.json({ questions });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/quiz/staged-questions error:", err);
    return NextResponse.json(
      { message: "获取阶段版题目失败" },
      { status: 500 },
    );
  }
}

