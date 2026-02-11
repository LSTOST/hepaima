/**
 * DeepSeek AI 测试报告生成
 * 通过 OpenRouter API 调用
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat-v3-0324";

export interface ReportAttachmentAnalysis {
  title: string;
  description: string;
  tips: string[];
}

export interface ReportLoveLanguageAnalysis {
  title: string;
  description: string;
  tips: string[];
}

export interface ReportActionItem {
  title: string;
  description: string;
}

export interface PremiumDailyScenario {
  scenario: string;
  misunderstanding: string;
  betterWay: string;
}

export interface PremiumCouplesTask {
  week: string;
  title: string;
  description: string;
  goal: string;
}

export interface DeepAnalysisHighlight {
  title: string;
  detail: string;
}

export interface GeneratedPremiumReport {
  deepAnalysis: string | { summary: string; highlights: DeepAnalysisHighlight[] };
  attachmentDeep: {
    title: string;
    initiatorAnalysis: string;
    partnerAnalysis: string;
    interactionPattern: string;
    growthPath: string;
  };
  loveLanguageDeep: {
    title: string;
    mismatchAnalysis: string;
    dailyScenarios: PremiumDailyScenario[];
  };
  relationshipForecast: {
    title: string;
    shortTerm: string;
    longTerm: string;
    turningPoints: string[];
  };
  couplesTasks: PremiumCouplesTask[];
  communicationGuide: {
    title: string;
    forInitiator: string;
    forPartner: string;
    conflictResolution: string;
    /** 冲突处理分条步骤，若 AI 返回则优先使用 */
    conflictResolutionSteps?: string[];
  };
}

export interface OverallAnalysisHighlight {
  emoji: string;
  title: string;
  detail: string;
}

export interface OverallAnalysisObject {
  summary: string;
  highlights: OverallAnalysisHighlight[];
  advice: string;
}

export type OverallAnalysis = string | OverallAnalysisObject;

export interface GeneratedReport {
  summary: string;
  overallAnalysis: OverallAnalysis;
  overallAnalysisPoints?: string[];
  attachmentAnalysis: ReportAttachmentAnalysis;
  loveLanguageAnalysis: ReportLoveLanguageAnalysis;
  strengths: string[];
  challenges: string[];
  actionItems: ReportActionItem[];
}

const FALLBACK_OVERALL: OverallAnalysisObject = {
  summary: "根据测试数据，你们在多个维度上展现出良好的契合度。双方在依恋类型和爱的语言上各有特点，相互理解与沟通是关系成长的钥匙。",
  highlights: [
    { emoji: "🛡️", title: "依恋默契良好", detail: "双方的依恋类型能够相互理解与包容，为关系提供了稳定的情感基础。" },
    { emoji: "🗣️", title: "爱的语言互补", detail: "你们表达爱的方式各有特点，了解对方的语言能让心意更好地传递。" },
    { emoji: "💡", title: "沟通意愿强", detail: "愿意一起完成测试，说明你们都重视这段关系，愿意为彼此付出。" },
    { emoji: "🌱", title: "差异即成长空间", detail: "性格或习惯上的小差异不必担心，正是这些差异带来互补与成长的可能。" },
  ],
  advice: "继续保持真诚的交流，一起面对生活中的小摩擦，关系会越来越稳固。",
};

const FALLBACK_REPORT: GeneratedReport = {
  summary: "你们的关系充满潜力，值得用心经营",
  overallAnalysis: FALLBACK_OVERALL,
  attachmentAnalysis: {
    title: "独特配对",
    description:
      "你们有着独特的依恋组合。每一对情侣都有其独特的互动模式，关键在于理解彼此的需求和边界。安全型伴侣能为关系带来稳定，而其他类型也能在关系中找到自己的成长空间。多倾听、多表达，会让你们更有默契。",
    tips: [
      "定期进行坦诚的沟通，分享彼此的感受和需求",
      "尊重对方的空间和边界，给予适度的独立性",
      "在冲突时先冷静，再一起寻找解决方案",
    ],
  },
  loveLanguageAnalysis: {
    title: "爱的表达",
    description:
      "你们表达和接收爱的方式可能有所不同。了解对方的爱的语言，能帮助你们更好地传递心意。尝试用 TA 喜欢的方式去表达爱，也会收到更多温暖的回应。",
    tips: [
      "观察对方最喜欢什么样的关心方式",
      "主动尝试用对方的语言表达爱意",
      "定期问问对方：最近有感受到我的爱吗？",
    ],
  },
  strengths: [
    "你们愿意一起完成测试，说明都重视这段关系",
    "不同性格的碰撞能带来新鲜感和成长",
    "相互理解的心意是关系稳固的基础",
  ],
  challenges: [
    "表达和接收爱的方式可能需要磨合",
    "在压力下保持沟通质量需要刻意练习",
  ],
  actionItems: [
    {
      title: "每周分享会",
      description: "选一个固定时间，各自分享本周的感受和想法，不评判，只倾听",
    },
    {
      title: "爱的语言实践",
      description: "本周至少一次，用对方喜欢的方式表达爱（言语/陪伴/礼物/服务/肢体接触）",
    },
    {
      title: "冲突复盘",
      description:
        "下次有分歧时，冷静后一起回顾：各自的需求是什么，下次可以怎么表达",
    },
  ],
};

const FALLBACK_PREMIUM_REPORT: GeneratedPremiumReport = {
  deepAnalysis: {
    summary:
      "根据依恋理论和戈特曼的婚姻研究发现，你们的关系呈现出独特的互动模式。双方在依恋类型上的差异既是吸引的来源，也可能成为需要磨合的地方。",
    highlights: [
      { title: "依恋互补", detail: "安全型依恋能为关系提供稳定基础，焦虑型或回避型若能在关系中逐渐获得安全感，也能与伴侣建立更深的联结。" },
      { title: "互动观察", detail: "建议你们在日常中多观察彼此的互动模式，在冲突时先冷静再沟通。" },
      { title: "关系土壤", detail: "逐步建立更安全的关系土壤，让双方都能在关系中感到被接纳。" },
    ],
  },
  attachmentDeep: {
    title: "依恋模式深度解析",
    initiatorAnalysis:
      "TA 在关系中的行为模式反映出一定的依恋风格。理解 TA 的内心需求和可能的触发点，能帮助你们更好地相处。多给予肯定和回应，会让 TA 感到被重视。",
    partnerAnalysis:
      "TA 有着独特的依恋模式，在亲密关系中可能有特定的需求和反应方式。了解 TA 的依恋特点，能帮助你们减少误解，增进默契。",
    interactionPattern:
      "你们的互动模式会受到各自依恋类型的影响。正向循环是：一方给予安全感，另一方回应信任；负向循环可能是：一方索求确认，另一方感到压力而退缩。有意识地打破负向循环，是关系成长的关键。",
    growthPath:
      "依恋安全感可以通过稳定的回应、坦诚的沟通、尊重边界来提升。建议你们定期进行情感复盘，分享彼此的感受和需求，逐步建立更安全的依恋模式。",
  },
  loveLanguageDeep: {
    title: "爱的语言深度解析",
    mismatchAnalysis:
      "你们表达爱和接收爱的方式可能有所不同。言语肯定型喜欢听到「我爱你」「谢谢你」；精心时刻型更看重高质量的陪伴；重视礼物的人在意用心准备的小惊喜；偏向服务型的人会因为对方帮忙做家务而感到被爱；重视肢体接触的人需要拥抱和牵手。了解彼此的差异，能减少「我明明做了很多，TA 为什么感受不到」的困惑。",
    dailyScenarios: [
      {
        scenario: "你忙了一天想静静，TA 凑过来想聊天",
        misunderstanding: "你觉得 TA 不体谅，TA 觉得你冷淡",
        betterWay: "可以提前说「我想先休息 10 分钟，之后陪你聊」",
      },
      {
        scenario: "过节你送了实用礼物，TA 表情平淡",
        misunderstanding: "你觉得 TA 不领情，TA 可能更需要陪伴",
        betterWay: "问问 TA 最希望怎么过节，用 TA 的语言表达爱",
      },
      {
        scenario: "吵架后你想抱抱，TA 想先冷静",
        misunderstanding: "你觉得 TA 在逃避，TA 觉得你逼太紧",
        betterWay: "尊重各自节奏，约定 30 分钟后再谈",
      },
    ],
  },
  relationshipForecast: {
    title: "关系趋势预测",
    shortTerm:
      "近期若保持良好沟通，关系会稳步发展。注意在压力期给予彼此更多理解，避免因小事积累情绪。",
    longTerm:
      "若持续投入时间和精力经营，你们的关系有潜力走向更深厚、更稳定的阶段。关键在于建立可持续的沟通和冲突处理模式。",
    turningPoints: [
      "第一次坦诚分享内心脆弱",
      "共同解决一个较大的分歧",
      "建立固定的情感交流时间",
    ],
  },
  couplesTasks: [
    {
      week: "第1周",
      title: "情感周记",
      description: "每天睡前各写 3 件今天对方让你感到被爱的小事，周末互相分享",
      goal: "提升对彼此爱的表达的觉察",
    },
    {
      week: "第2周",
      title: "爱的语言实践",
      description: "本周至少一次，用对方最喜欢的方式表达爱（言语/陪伴/礼物/服务/肢体接触）",
      goal: "练习用对方的语言传达心意",
    },
    {
      week: "第3周",
      title: "冲突复盘",
      description: "选一个过去的小分歧，冷静后一起回顾：各自的需求是什么，下次可以怎么表达",
      goal: "建立健康的冲突处理模式",
    },
    {
      week: "第4周",
      title: "感恩仪式",
      description: "周末一起做一件事，并各自说出 3 句感谢对方的话",
      goal: "巩固关系中的正向循环",
    },
  ],
  communicationGuide: {
    title: "专属沟通指南",
    forInitiator:
      "尝试在表达需求时用「我」开头，例如「我需要多一点确认感」。多倾听对方的感受，给予时间回应。",
    forPartner:
      "尝试在对方需要时给予明确的回应，如「我在听」「我理解你」。适度表达自己的想法，避免全部憋在心里。",
    conflictResolution:
      "冲突时：1) 先冷静 20 分钟；2) 分别说出自己的感受和需求；3) 一起想一个折中方案；4) 约定下次有类似情况时怎么处理。",
    conflictResolutionSteps: [
      "先冷静 20 分钟，避免在情绪激动时争执。",
      "分别说出自己的感受和需求，用「我」开头，不指责对方。",
      "一起想一个折中方案，照顾双方需求。",
      "约定下次有类似情况时怎么处理，形成默契。",
    ],
  },
};

export function parseReportJson(raw: string): GeneratedReport {
  let cleaned = raw.trim();

  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }
  cleaned = cleaned.replace(/^\s+|\s+$/g, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("AI 报告 JSON 解析失败:", parseErr);
    console.error("原始内容:", cleaned.slice(0, 300));
    throw parseErr;
  }
  const r = parsed as Record<string, unknown>;
  const rawOA = r.overallAnalysis;
  let overallAnalysis: OverallAnalysis;
  if (
    rawOA &&
    typeof rawOA === "object" &&
    !Array.isArray(rawOA) &&
    "summary" in rawOA &&
    "highlights" in rawOA &&
    "advice" in rawOA
  ) {
    const o = rawOA as Record<string, unknown>;
    const highlights = Array.isArray(o.highlights)
      ? (o.highlights as unknown[]).filter(
          (h): h is OverallAnalysisHighlight =>
            h != null &&
            typeof h === "object" &&
            "emoji" in h &&
            "title" in h &&
            "detail" in h
        )
      : FALLBACK_OVERALL.highlights;
    overallAnalysis = {
      summary: String(o.summary ?? FALLBACK_OVERALL.summary),
      highlights: highlights.length >= 4 ? highlights.slice(0, 4) : FALLBACK_OVERALL.highlights,
      advice: String(o.advice ?? FALLBACK_OVERALL.advice),
    };
  } else {
    overallAnalysis = typeof rawOA === "string" ? rawOA : FALLBACK_OVERALL;
  }
  const result = {
    summary: String(r.summary ?? FALLBACK_REPORT.summary),
    overallAnalysis,
    overallAnalysisPoints: Array.isArray(r.overallAnalysisPoints)
      ? (r.overallAnalysisPoints as string[]).filter((s): s is string => typeof s === "string")
      : undefined,
    attachmentAnalysis: {
      title: String(
        (r.attachmentAnalysis as Record<string, unknown>)?.title ??
          FALLBACK_REPORT.attachmentAnalysis.title
      ),
      description: String(
        (r.attachmentAnalysis as Record<string, unknown>)?.description ??
          FALLBACK_REPORT.attachmentAnalysis.description
      ),
      tips: Array.isArray((r.attachmentAnalysis as Record<string, unknown>)?.tips)
        ? ((r.attachmentAnalysis as Record<string, unknown>).tips as string[])
        : FALLBACK_REPORT.attachmentAnalysis.tips,
    },
    loveLanguageAnalysis: {
      title: String(
        (r.loveLanguageAnalysis as Record<string, unknown>)?.title ??
          FALLBACK_REPORT.loveLanguageAnalysis.title
      ),
      description: String(
        (r.loveLanguageAnalysis as Record<string, unknown>)?.description ??
          FALLBACK_REPORT.loveLanguageAnalysis.description
      ),
      tips: Array.isArray(
        (r.loveLanguageAnalysis as Record<string, unknown>)?.tips
      )
        ? ((r.loveLanguageAnalysis as Record<string, unknown>).tips as string[])
        : FALLBACK_REPORT.loveLanguageAnalysis.tips,
    },
    strengths: Array.isArray(r.strengths) ? r.strengths : FALLBACK_REPORT.strengths,
    challenges: Array.isArray(r.challenges)
      ? r.challenges
      : FALLBACK_REPORT.challenges,
    actionItems: Array.isArray(r.actionItems)
      ? (r.actionItems as ReportActionItem[])
      : FALLBACK_REPORT.actionItems,
  };
  return result;
}

function getStageLabel(stage: string): string {
  if (stage === "AMBIGUOUS") return "暧昧期";
  if (stage === "ROMANCE") return "热恋期";
  if (stage === "STABLE") return "稳定期";
  return stage;
}

export async function generateReport(data: {
  stage: string;
  initiatorName: string;
  partnerName: string;
  initiatorAttachment: string;
  partnerAttachment: string;
  initiatorLoveLanguage: string;
  partnerLoveLanguage: string;
  overallScore: number;
  dimensions: Record<string, number>;
}): Promise<GeneratedReport> {
  console.log("===== 开始调用 AI =====");

  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("请求参数:", JSON.stringify({
    model: MODEL,
    url: OPENROUTER_URL,
    hasApiKey: !!apiKey,
  }));

  if (!apiKey) {
    console.log("===== 使用兜底报告 =====");
    console.warn("OPENROUTER_API_KEY not set, using fallback report");
    return FALLBACK_REPORT;
  }

  const stageLabel = getStageLabel(data.stage);

  const systemPrompt = `你是一位专业的关系心理咨询师，拥有丰富的依恋理论和爱的语言领域经验。
请根据情侣测试数据，生成一份专业、温暖、有洞察力的关系分析报告。
语气要亲切自然，像朋友一样给出建议，避免过于学术化。
所有内容用中文，不要在报告正文中出现英文单词或英文缩写（例如 attachment、secure、avoidant、gift、service 等），如需提及相关概念，请用自然的中文表述。
overallAnalysis 是一个对象，包含：
- summary：一段整体总结（60-80字），概括整体契合度和最大亮点。
- highlights：数组，必须恰好 4 条，每条包含 emoji、title、detail。四条分别涵盖：①依恋匹配 ②爱的语言 ③一个优势维度（如沟通/价值观/生活习惯等） ④一个需关注维度（相对弱项或成长空间）。emoji 要贴切不幼稚，如 🛡️ 🗣️ 💡 🌱 等；title 4-8 字；detail 40-60 字，一两句话说清楚。
- advice：一句温暖的总结建议（20-30字）。
请严格按照 JSON 格式输出，不要包含 markdown 代码块标记。`;

  const dimDesc = [
    `依恋匹配${(data.dimensions as Record<string, number>).attachment ?? 0}%`,
    `爱的语言${(data.dimensions as Record<string, number>).loveLanguage ?? 0}%`,
    `冲突处理${(data.dimensions as Record<string, number>).conflict ?? 0}%`,
    `价值观${(data.dimensions as Record<string, number>).values ?? 0}%`,
    `沟通方式${(data.dimensions as Record<string, number>).communication ?? 0}%`,
    `生活习惯${(data.dimensions as Record<string, number>).lifestyle ?? 0}%`,
  ].join("、");

  const userPrompt = `## 测试数据
- 关系阶段：${stageLabel}
- ${data.initiatorName}：依恋类型 ${data.initiatorAttachment}，爱的语言 ${data.initiatorLoveLanguage}
- ${data.partnerName}：依恋类型 ${data.partnerAttachment}，爱的语言 ${data.partnerLoveLanguage}
- 总体契合度：${data.overallScore}%
- 各维度得分：${JSON.stringify(data.dimensions)}

请输出以下 JSON。overallAnalysis 必须是对象（见下方结构），包含 summary、highlights（恰好4条）、advice。

{
  "summary": "一句话总结（15-20字）",
  "overallAnalysis": {
    "summary": "整体总结（60-80字，概括契合度与最大亮点）",
    "highlights": [
      { "emoji": "🛡️", "title": "依恋匹配相关（4-8字）", "detail": "具体分析（40-60字）" },
      { "emoji": "🗣️", "title": "爱的语言相关（4-8字）", "detail": "具体分析（40-60字）" },
      { "emoji": "💡", "title": "一个优势维度（4-8字）", "detail": "具体分析（40-60字）" },
      { "emoji": "🌱", "title": "需关注/成长维度（4-8字）", "detail": "具体分析（40-60字）" }
    ],
    "advice": "一句温暖建议（20-30字）"
  },
  "attachmentAnalysis": {
    "title": "依恋配对名称（3-5字，如：温暖港湾）",
    "description": "依恋类型配对详细分析（180-250字，分析双方互动模式、优势和可能的摩擦点）",
    "tips": ["具体可执行的建议1（20-40字）", "建议2", "建议3"]
  },
  "loveLanguageAnalysis": {
    "title": "爱的语言配对名称（3-5字）",
    "description": "爱的语言匹配分析（150-200字，说明双方表达和接收爱的方式差异）",
    "tips": ["建议1", "建议2", "建议3"]
  },
  "strengths": ["你们的优势1（15-30字）", "优势2", "优势3"],
  "challenges": ["可能的挑战1（15-30字）", "挑战2"],
  "actionItems": [
    { "title": "任务标题（5-10字）", "description": "具体做法（30-50字）" },
    { "title": "任务2", "description": "做法2" },
    { "title": "任务3", "description": "做法3" }
  ]
}`;

  const maxRetries = 1;
  const retryDelay = 2000;
  console.log("generateReport 使用模型:", MODEL);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      console.log("发送请求到 OpenRouter...");
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://hepaima.com",
          "X-Title": "hepaima",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("AI 响应状态:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from OpenRouter");
      }
      console.log("AI 返回原文（前500字）:", content.substring(0, 500));

      const parsedResult = parseReportJson(content);
      console.log("AI 解析成功，summary:", parsedResult.summary);
      return parsedResult;
    } catch (err) {
      console.error("AI 调用失败:", err);
      console.error(`generateReport attempt ${attempt}/${maxRetries}:`, err);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, retryDelay));
      } else {
        console.log("===== 使用兜底报告 =====");
        return FALLBACK_REPORT;
      }
    }
  }

  console.log("===== 使用兜底报告 =====");
  return FALLBACK_REPORT;
}

export type ReportStreamPayload = {
  stage: string;
  initiatorName: string;
  partnerName: string;
  initiatorAttachment: string;
  partnerAttachment: string;
  initiatorLoveLanguage: string;
  partnerLoveLanguage: string;
  overallScore: number;
  dimensions: Record<string, number>;
};

function buildReportPrompts(data: ReportStreamPayload) {
  const stageLabel = getStageLabel(data.stage);
  const systemPrompt = `你是一位专业的关系心理咨询师，拥有丰富的依恋理论和爱的语言领域经验。
请根据情侣测试数据，生成一份专业、温暖、有洞察力的关系分析报告。
语气要亲切自然，像朋友一样给出建议，避免过于学术化。
所有内容用中文。
overallAnalysis 是一个对象，包含：
- summary：一段整体总结（60-80字），概括整体契合度和最大亮点。
- highlights：数组，必须恰好 4 条，每条包含 emoji、title、detail。四条分别涵盖：①依恋匹配 ②爱的语言 ③一个优势维度（如沟通/价值观/生活习惯等） ④一个需关注维度（相对弱项或成长空间）。emoji 要贴切不幼稚，如 🛡️ 🗣️ 💡 🌱 等；title 4-8 字；detail 40-60 字，一两句话说清楚。
- advice：一句温暖的总结建议（20-30字）。
请严格按照 JSON 格式输出，不要包含 markdown 代码块标记。`;
  const userPrompt = `## 测试数据
- 关系阶段：${stageLabel}
- ${data.initiatorName}：依恋类型 ${data.initiatorAttachment}，爱的语言 ${data.initiatorLoveLanguage}
- ${data.partnerName}：依恋类型 ${data.partnerAttachment}，爱的语言 ${data.partnerLoveLanguage}
- 总体契合度：${data.overallScore}%
- 各维度得分：${JSON.stringify(data.dimensions)}

请输出以下 JSON。overallAnalysis 必须是对象（见下方结构），包含 summary、highlights（恰好4条）、advice。

{
  "summary": "一句话总结（15-20字）",
  "overallAnalysis": {
    "summary": "整体总结（60-80字，概括契合度与最大亮点）",
    "highlights": [
      { "emoji": "🛡️", "title": "依恋匹配相关（4-8字）", "detail": "具体分析（40-60字）" },
      { "emoji": "🗣️", "title": "爱的语言相关（4-8字）", "detail": "具体分析（40-60字）" },
      { "emoji": "💡", "title": "一个优势维度（4-8字）", "detail": "具体分析（40-60字）" },
      { "emoji": "🌱", "title": "需关注/成长维度（4-8字）", "detail": "具体分析（40-60字）" }
    ],
    "advice": "一句温暖建议（20-30字）"
  },
  "attachmentAnalysis": {
    "title": "依恋配对名称（3-5字，如：温暖港湾）",
    "description": "依恋类型配对详细分析（180-250字，分析双方互动模式、优势和可能的摩擦点）",
    "tips": ["具体可执行的建议1（20-40字）", "建议2", "建议3"]
  },
  "loveLanguageAnalysis": {
    "title": "爱的语言配对名称（3-5字）",
    "description": "爱的语言匹配分析（150-200字，说明双方表达和接收爱的方式差异）",
    "tips": ["建议1", "建议2", "建议3"]
  },
  "strengths": ["你们的优势1（15-30字）", "优势2", "优势3"],
  "challenges": ["可能的挑战1（15-30字）", "挑战2"],
  "actionItems": [
    { "title": "任务标题（5-10字）", "description": "具体做法（30-50字）" },
    { "title": "任务2", "description": "做法2" },
    { "title": "任务3", "description": "做法3" }
  ]
}`;
  return { systemPrompt, userPrompt };
}

/** 流式生成基础报告，返回 AI 返回内容的纯文本流（供前端边收边解析或累积后解析） */
export async function generateReportStream(
  data: ReportStreamPayload
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set, cannot stream report");
    return null;
  }
  const { systemPrompt, userPrompt } = buildReportPrompts(data);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://hepaima.com",
        "X-Title": "hepaima",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
    }
    if (!res.body) throw new Error("No response body");
    const decoder = new TextDecoder();
    let buffer = "";
    const stream = res.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, ctrl) {
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6)) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const content = json.choices?.[0]?.delta?.content;
                if (typeof content === "string" && content) {
                  ctrl.enqueue(new TextEncoder().encode(content));
                }
              } catch {
                /* ignore malformed line */
              }
            }
          }
        },
        flush(ctrl) {
          if (buffer.trim().startsWith("data: ") && buffer.trim() !== "data: [DONE]") {
            try {
              const json = JSON.parse(buffer.trim().slice(6)) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const content = json.choices?.[0]?.delta?.content;
              if (typeof content === "string" && content) {
                ctrl.enqueue(new TextEncoder().encode(content));
              }
            } catch {
              /* ignore */
            }
          }
        },
      })
    );
    return stream;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("generateReportStream error:", err);
    return null;
  }
}

function parsePremiumReportJson(raw: string): GeneratedPremiumReport {
  let cleaned = raw.trim();
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }
  cleaned = cleaned.replace(/^\s+|\s+$/g, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("AI 深度报告 JSON 解析失败:", parseErr);
    throw parseErr;
  }
  const r = parsed as Record<string, unknown>;

  const attachmentDeep = r.attachmentDeep as Record<string, unknown>;
  const loveLanguageDeep = r.loveLanguageDeep as Record<string, unknown>;
  const relationshipForecast = r.relationshipForecast as Record<string, unknown>;
  const communicationGuide = r.communicationGuide as Record<string, unknown>;

  const rawDeep = r.deepAnalysis ?? FALLBACK_PREMIUM_REPORT.deepAnalysis;
  const deepAnalysis =
    rawDeep && typeof rawDeep === "object" && "summary" in rawDeep && Array.isArray((rawDeep as { highlights?: unknown }).highlights)
      ? {
          summary: String((rawDeep as { summary?: unknown }).summary ?? ""),
          highlights: ((rawDeep as { highlights?: { title?: unknown; detail?: unknown }[] }).highlights ?? []).map((h) => ({
            title: String(h?.title ?? ""),
            detail: String(h?.detail ?? ""),
          })),
        }
      : { summary: String(rawDeep), highlights: [] as DeepAnalysisHighlight[] };

  return {
    deepAnalysis,
    attachmentDeep: {
      title: String(attachmentDeep?.title ?? FALLBACK_PREMIUM_REPORT.attachmentDeep.title),
      initiatorAnalysis: String(attachmentDeep?.initiatorAnalysis ?? FALLBACK_PREMIUM_REPORT.attachmentDeep.initiatorAnalysis),
      partnerAnalysis: String(attachmentDeep?.partnerAnalysis ?? FALLBACK_PREMIUM_REPORT.attachmentDeep.partnerAnalysis),
      interactionPattern: String(attachmentDeep?.interactionPattern ?? FALLBACK_PREMIUM_REPORT.attachmentDeep.interactionPattern),
      growthPath: String(attachmentDeep?.growthPath ?? FALLBACK_PREMIUM_REPORT.attachmentDeep.growthPath),
    },
    loveLanguageDeep: {
      title: String(loveLanguageDeep?.title ?? FALLBACK_PREMIUM_REPORT.loveLanguageDeep.title),
      mismatchAnalysis: String(loveLanguageDeep?.mismatchAnalysis ?? FALLBACK_PREMIUM_REPORT.loveLanguageDeep.mismatchAnalysis),
      dailyScenarios: Array.isArray(loveLanguageDeep?.dailyScenarios)
        ? (loveLanguageDeep.dailyScenarios as PremiumDailyScenario[])
        : FALLBACK_PREMIUM_REPORT.loveLanguageDeep.dailyScenarios,
    },
    relationshipForecast: {
      title: String(relationshipForecast?.title ?? FALLBACK_PREMIUM_REPORT.relationshipForecast.title),
      shortTerm: String(relationshipForecast?.shortTerm ?? FALLBACK_PREMIUM_REPORT.relationshipForecast.shortTerm),
      longTerm: String(relationshipForecast?.longTerm ?? FALLBACK_PREMIUM_REPORT.relationshipForecast.longTerm),
      turningPoints: Array.isArray(relationshipForecast?.turningPoints)
        ? (relationshipForecast.turningPoints as string[])
        : FALLBACK_PREMIUM_REPORT.relationshipForecast.turningPoints,
    },
    couplesTasks: (() => {
      const raw = Array.isArray(r.couplesTasks)
        ? (r.couplesTasks as PremiumCouplesTask[])
        : FALLBACK_PREMIUM_REPORT.couplesTasks;
      if (raw.length >= 4) return raw;
      const fallback = FALLBACK_PREMIUM_REPORT.couplesTasks;
      return [...raw, ...fallback.slice(raw.length, 4)] as PremiumCouplesTask[];
    })(),
    communicationGuide: {
      title: String(communicationGuide?.title ?? FALLBACK_PREMIUM_REPORT.communicationGuide.title),
      forInitiator: String(communicationGuide?.forInitiator ?? FALLBACK_PREMIUM_REPORT.communicationGuide.forInitiator),
      forPartner: String(communicationGuide?.forPartner ?? FALLBACK_PREMIUM_REPORT.communicationGuide.forPartner),
      conflictResolution: String(communicationGuide?.conflictResolution ?? FALLBACK_PREMIUM_REPORT.communicationGuide.conflictResolution),
      conflictResolutionSteps: Array.isArray(communicationGuide?.conflictResolutionSteps)
        ? (communicationGuide.conflictResolutionSteps as string[])
        : FALLBACK_PREMIUM_REPORT.communicationGuide.conflictResolutionSteps,
    },
  };
}

export async function generatePremiumReport(data: {
  stage: string;
  initiatorName: string;
  partnerName: string;
  initiatorAttachment: string;
  partnerAttachment: string;
  initiatorLoveLanguage: string;
  partnerLoveLanguage: string;
  overallScore: number;
  dimensions: Record<string, number>;
}): Promise<GeneratedPremiumReport> {
  console.log("===== 开始调用 AI 生成深度报告 =====");

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log("===== 使用兜底深度报告 =====");
    return FALLBACK_PREMIUM_REPORT;
  }

  const stageLabel = getStageLabel(data.stage);

  const systemPrompt = `你是一位资深的关系心理咨询师，拥有 15 年以上的依恋理论研究和婚姻咨询经验。
请根据情侣测试数据，生成一份深度、专业、有温度的关系分析报告。
分析要具体、有深度、有可操作性，避免泛泛而谈。
引用具体的心理学理论来支撑你的分析。
所有内容用中文，语气像一位温暖的老朋友在给建议。报告正文中不要出现英文单词或英文缩写（例如 attachment、secure、avoidant、gift、service 等），如需提及专业名词，请用中文全称或常用音译（例如用「戈特曼」而不是 "Gottman"），并用自然中文解释。
请严格按照 JSON 格式输出，不要包含 markdown 代码块标记。
重要格式要求：报告中不要使用英文单引号「'」或双引号「"」「"」来强调；需要强调的词语一律用加粗，在 JSON 字符串中用 **文字** 表示（例如 "这是**重点**内容"）。`;

  const userPrompt = `## 测试数据
- 关系阶段：${stageLabel}
- ${data.initiatorName}：依恋类型 ${data.initiatorAttachment}，爱的语言 ${data.initiatorLoveLanguage}
- ${data.partnerName}：依恋类型 ${data.partnerAttachment}，爱的语言 ${data.partnerLoveLanguage}
- 总体契合度：${data.overallScore}%
- 各维度得分：${JSON.stringify(data.dimensions)}

请输出以下 JSON。注意：couplesTasks 必须包含恰好 4 条（第1周、第2周、第3周、第4周），与关系阶段无关（暧昧期、热恋期、稳定期均输出 4 周任务）。
{
  "deepAnalysis": {
    "summary": "深度关系解读总结（80-120字，从心理学角度概括两人的互动模式、关系动力与深层原因，提到依恋理论或 Gottman 研究。）",
    "highlights": [
      { "title": "亮点标题（4-8字）", "detail": "亮点说明（50-80字）" },
      { "title": "亮点2", "detail": "说明2" },
      { "title": "亮点3", "detail": "说明3" },
      { "title": "亮点4", "detail": "说明4（可选）" }
    ]
  },
  "attachmentDeep": {
    "title": "依恋模式深度解析",
    "initiatorAnalysis": "${data.initiatorName}的依恋模式详细分析（100-150字，分析TA在关系中的行为模式、内心需求、可能的触发点）",
    "partnerAnalysis": "${data.partnerName}的依恋模式详细分析（100-150字）",
    "interactionPattern": "两人互动模式分析（150-200字，分析两种依恋类型在一起会产生什么样的互动循环，可能的正向循环和负向循环）",
    "growthPath": "依恋安全感提升路径（100-150字，具体的改善方向）"
  },
  "loveLanguageDeep": {
    "title": "爱的语言深度解析",
    "mismatchAnalysis": "爱的语言错位分析（150-200字，分析双方表达爱和接收爱的方式差异会在日常中造成什么误解）",
    "dailyScenarios": [
      {
        "scenario": "一个具体的日常场景描述（30-50字）",
        "misunderstanding": "可能产生的误解（30-50字）",
        "betterWay": "更好的做法（30-50字）"
      },
      { "scenario": "场景2", "misunderstanding": "误解2", "betterWay": "做法2" },
      { "scenario": "场景3", "misunderstanding": "误解3", "betterWay": "做法3" }
    ]
  },
  "relationshipForecast": {
    "title": "关系趋势预测",
    "shortTerm": "近期关系走向预测（80-120字，基于当前数据分析未来1-3个月可能的发展）",
    "longTerm": "长期关系展望（80-120字，如果按当前模式发展，长期会怎样）",
    "turningPoints": ["可能的关系转折点1（20-30字）", "转折点2", "转折点3"]
  },
  "couplesTasks": [
    { "week": "第1周", "title": "任务1", "description": "说明1", "goal": "目标1" },
    { "week": "第2周", "title": "任务2", "description": "说明2", "goal": "目标2" },
    { "week": "第3周", "title": "任务3", "description": "说明3", "goal": "目标3" },
    { "week": "第4周", "title": "任务4", "description": "说明4", "goal": "目标4" }
  ],
  "communicationGuide": {
    "title": "专属沟通指南",
    "forInitiator": "给${data.initiatorName}的沟通建议（80-120字，针对TA的依恋类型和爱的语言，给出具体的沟通技巧）",
    "forPartner": "给${data.partnerName}的沟通建议（80-120字）",
    "conflictResolution": "冲突处理锦囊概述（50字内，可选）",
    "conflictResolutionSteps": [
      "第一步具体描述（20-40字）",
      "第二步具体描述",
      "第三步具体描述",
      "第四步具体描述（3-5条即可）"
    ]
  }
}`;

  const maxRetries = 2;
  const retryDelay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://hepaima.com",
          "X-Title": "hepaima",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from OpenRouter");
      }

      return parsePremiumReportJson(content);
    } catch (err) {
      console.error("AI 深度报告生成失败:", err);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, retryDelay));
      } else {
        console.log("===== 使用兜底深度报告 =====");
        return FALLBACK_PREMIUM_REPORT;
      }
    }
  }

  return FALLBACK_PREMIUM_REPORT;
}
