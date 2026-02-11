/**
 * 通用版测试题目（1-7 李克特量表）
 * 38 题：依恋 8 + 爱的语言 8 + 沟通 6 + 价值观 6 + 性格 5 + 冲突 5
 */

export interface UniversalQuestion {
  id: number;
  category: "attachment" | "loveLanguage" | "communication" | "values" | "personality" | "conflict";
  text: string;
  scoring: {
    dimension: string;
    weights: number[]; // 7 个元素，对应 1-7 分的权重
  }[];
}

export const universalOptions = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "比较不符合" },
  { value: 3, label: "有点不符合" },
  { value: 4, label: "不确定" },
  { value: 5, label: "有点符合" },
  { value: 6, label: "比较符合" },
  { value: 7, label: "完全符合" },
];

export const universalQuestions: UniversalQuestion[] = [
  // ========== 依恋类型 attachment 8 题 ==========
  {
    id: 1,
    category: "attachment",
    text: "我很容易与伴侣建立亲密关系",
    scoring: [
      { dimension: "attachment_secure", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_avoidant", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 2,
    category: "attachment",
    text: "我经常担心伴侣不是真的爱我",
    scoring: [
      { dimension: "attachment_anxious", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 3,
    category: "attachment",
    text: "当关系变得太亲密时，我会感到不自在",
    scoring: [
      { dimension: "attachment_avoidant", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 4,
    category: "attachment",
    text: "我需要伴侣经常确认对我的感情",
    scoring: [{ dimension: "attachment_anxious", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 5,
    category: "attachment",
    text: "我相信伴侣在我需要时会支持我",
    scoring: [{ dimension: "attachment_secure", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 6,
    category: "attachment",
    text: "我既想靠近伴侣，又害怕受伤",
    scoring: [
      { dimension: "attachment_fearful", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 7,
    category: "attachment",
    text: "伴侣一段时间不联系我，我会胡思乱想",
    scoring: [
      { dimension: "attachment_anxious", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 8,
    category: "attachment",
    text: "我更习惯保持一点距离，不太依赖对方",
    scoring: [
      { dimension: "attachment_avoidant", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },

  // ========== 爱的语言 loveLanguage 8 题 ==========
  {
    id: 9,
    category: "loveLanguage",
    text: "伴侣的赞美和鼓励让我感到被爱",
    scoring: [{ dimension: "loveLanguage_words", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 10,
    category: "loveLanguage",
    text: "我很看重与伴侣单独相处的时间",
    scoring: [{ dimension: "loveLanguage_time", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 11,
    category: "loveLanguage",
    text: "收到伴侣精心准备的礼物让我很开心",
    scoring: [{ dimension: "loveLanguage_gifts", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 12,
    category: "loveLanguage",
    text: "伴侣帮我做事让我感到被关心",
    scoring: [{ dimension: "loveLanguage_service", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 13,
    category: "loveLanguage",
    text: "我喜欢与伴侣有身体上的亲近（拥抱、牵手等）",
    scoring: [{ dimension: "loveLanguage_touch", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 14,
    category: "loveLanguage",
    text: "对方说「我爱你」「想你了」会让我很有安全感",
    scoring: [{ dimension: "loveLanguage_words", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 15,
    category: "loveLanguage",
    text: "比起礼物，我更在意对方愿意花时间陪我",
    scoring: [
      { dimension: "loveLanguage_time", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "loveLanguage_gifts", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 16,
    category: "loveLanguage",
    text: "对方记得我说过的小事并付诸行动，让我很感动",
    scoring: [{ dimension: "loveLanguage_service", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },

  // ========== 沟通风格 communication 6 题 ==========
  {
    id: 17,
    category: "communication",
    text: "我会主动与伴侣分享我的想法和感受",
    scoring: [{ dimension: "communication_openness", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 18,
    category: "communication",
    text: "我善于倾听伴侣的心声",
    scoring: [{ dimension: "communication_listening", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 19,
    category: "communication",
    text: "遇到分歧时，我倾向于直接表达不满",
    scoring: [{ dimension: "communication_direct", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 20,
    category: "communication",
    text: "我会把心里话憋着，不太愿意说出来",
    scoring: [
      { dimension: "communication_openness", weights: [4, 3, 2, 1, 0, 0, 0] },
      { dimension: "communication_listening", weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 21,
    category: "communication",
    text: "伴侣说话时，我经常忍不住打断或给建议",
    scoring: [
      { dimension: "communication_listening", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 22,
    category: "communication",
    text: "我更习惯用暗示或冷战表达不满",
    scoring: [
      { dimension: "communication_direct", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },

  // ========== 价值观 values 6 题 ==========
  {
    id: 23,
    category: "values",
    text: "我认为家庭比事业更重要",
    scoring: [{ dimension: "values_family", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 24,
    category: "values",
    text: "我对金钱的态度是能省则省",
    scoring: [{ dimension: "values_frugal", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 25,
    category: "values",
    text: "我认为双方应该保持一定的个人空间",
    scoring: [{ dimension: "values_independence", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 26,
    category: "values",
    text: "结婚/见家长是水到渠成的事，我很看重",
    scoring: [{ dimension: "values_family", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 27,
    category: "values",
    text: "我觉得该花的钱要花，不必太省",
    scoring: [{ dimension: "values_frugal", weights: [4, 3, 2, 1, 0, 0, 0] }],
  },
  {
    id: 28,
    category: "values",
    text: "即使恋爱了，我也需要自己的爱好和朋友圈",
    scoring: [{ dimension: "values_independence", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },

  // ========== 性格特质 personality 5 题 ==========
  {
    id: 29,
    category: "personality",
    text: "聚会时我更喜欢待在角落或和熟人聊天",
    scoring: [
      { dimension: "personality_introvert", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_extrovert", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 30,
    category: "personality",
    text: "我很容易在人群中活跃气氛",
    scoring: [
      { dimension: "personality_extrovert", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_introvert", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 31,
    category: "personality",
    text: "做决定时我更依赖逻辑和分析",
    scoring: [
      { dimension: "personality_thinking", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_feeling", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 32,
    category: "personality",
    text: "做决定时我更在意大家的感受和氛围",
    scoring: [
      { dimension: "personality_feeling", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_thinking", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 33,
    category: "personality",
    text: "独处能让我恢复精力，而不是消耗",
    scoring: [
      { dimension: "personality_introvert", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_extrovert", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },

  // ========== 冲突处理 conflict 5 题 ==========
  {
    id: 34,
    category: "conflict",
    text: "吵架后，我需要时间独处冷静",
    scoring: [{ dimension: "conflict_withdraw", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 35,
    category: "conflict",
    text: "我会主动道歉来化解矛盾",
    scoring: [{ dimension: "conflict_repair", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 36,
    category: "conflict",
    text: "吵完我会想尽快和好，不想冷战",
    scoring: [
      { dimension: "conflict_repair", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "conflict_withdraw", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 37,
    category: "conflict",
    text: "意见不合时，我常选择回避或沉默",
    scoring: [{ dimension: "conflict_withdraw", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 38,
    category: "conflict",
    text: "我会主动提出「我们聊聊吧」来解决问题",
    scoring: [{ dimension: "conflict_repair", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
];
