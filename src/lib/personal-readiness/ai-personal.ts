/**
 * 第一幕个人自测：可选 DeepSeek（经 OpenRouter）补充「综合段落 + 建议」。
 * 入参仅为维度分与少量元数据，不含任何双人/伴侣数据。
 */
import type { PersonalDimensionBreakdownItem } from "./scoring";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL =
  process.env.OPENROUTER_PERSONAL_MODEL ||
  process.env.OPENROUTER_REPORT_MODEL ||
  "deepseek/deepseek-chat-v3-0324";

export type PersonalAiInput = {
  overallScore0to100: number;
  trackTitle: string;
  trackSlug: string | null;
  dimensionBreakdown: PersonalDimensionBreakdownItem[];
};

export type PersonalAiSupplement = {
  synthesis: string;
  advice: string;
};

/**
 * 未配置 OPENROUTER_API_KEY 或请求失败时返回 null（主流程仍使用规则模板）。
 */
export async function generatePersonalReadinessAiSupplement(
  input: PersonalAiInput,
): Promise<PersonalAiSupplement | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const dimLines = input.dimensionBreakdown
    .map(
      (d) =>
        `- ${d.label}：${d.score0to100}/100（量表均值约 ${d.mean1to5}）`,
    )
    .join("\n");

  const userPayload = `以下为单人自测结果（非诊断），请仅基于这些数字写中文，不要编造未给出的信息，不要提及「伴侣/对方/双人」等双人测评内容。

子测评：${input.trackTitle}${input.trackSlug ? `（${input.trackSlug}）` : ""}
综合指数（0-100）：${input.overallScore0to100}

各子维度：
${dimLines}

请严格输出 JSON，不要 markdown 代码块：
{"synthesis":"一段综合描述，80～120字，语气温和、描述性、非评判","advice":"一条下一步建议，40字以内，可自然提到「若进入下一段关系或与人协作测评」但不要写具体产品名"}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://hepaima.com",
        "X-Title": "hepaima-personal",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "你是擅长亲密关系自我觉察的写作助手。只输出合法 JSON 对象，键为 synthesis 与 advice，不要其他文字。",
          },
          { role: "user", content: userPayload },
        ],
        temperature: 0.45,
        max_tokens: 512,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const raw = await res.json();
    const text = raw?.choices?.[0]?.message?.content;
    if (typeof text !== "string") return null;

    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      synthesis?: string;
      advice?: string;
    };
    const synthesis =
      typeof parsed.synthesis === "string" ? parsed.synthesis.trim() : "";
    const advice = typeof parsed.advice === "string" ? parsed.advice.trim() : "";
    if (!synthesis || !advice) return null;
    return { synthesis, advice };
  } catch {
    return null;
  }
}
