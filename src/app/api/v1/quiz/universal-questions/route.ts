import { NextRequest, NextResponse } from "next/server";
import { getUniversalQuestionsFromDb } from "@/lib/quiz-config";

export async function GET(_req: NextRequest) {
  try {
    const questions = await getUniversalQuestionsFromDb();
    return NextResponse.json({ questions });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("GET /api/v1/quiz/universal-questions error:", err);
    return NextResponse.json(
      {
        message: "获取通用版题目失败",
      },
      { status: 500 },
    );
  }
}

