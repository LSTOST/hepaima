/**
 * 通用版测试题目（1-7 李克特量表）
 * 30 题：依恋 6 + 爱的语言 6 + 沟通 5 + 价值观 5 + 性格 4 + 冲突 4
 *
 * 设计原则：
 * - 所有题目均为自我描述性陈述，适配"完全不符合→完全符合"量表
 * - 使用"对方/TA"而非"伴侣"，无论处于何种关系阶段都能自然作答
 * - 聚焦个人特质与倾向，而非特定关系场景
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
  // ========== 依恋类型 attachment 6 题 ==========
  {
    id: 1,
    category: "attachment",
    text: "在亲密关系中，我很自然地信任对方",
    scoring: [
      { dimension: "attachment_secure", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_avoidant", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 2,
    category: "attachment",
    text: "对方没有及时回复消息时，我容易感到不安",
    scoring: [
      { dimension: "attachment_anxious", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 3,
    category: "attachment",
    text: "我习惯自己消化情绪，不太会向亲近的人倾诉",
    scoring: [
      { dimension: "attachment_avoidant", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_secure", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 4,
    category: "attachment",
    text: "我渴望和人亲近，但又怕靠太近会受伤",
    scoring: [
      { dimension: "attachment_fearful", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_anxious", weights: [0, 0, 0, 0, 1, 2, 3] },
    ],
  },
  {
    id: 5,
    category: "attachment",
    text: "我觉得在感情中依赖彼此是很自然的事",
    scoring: [
      { dimension: "attachment_secure", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_avoidant", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 6,
    category: "attachment",
    text: "我对感情比较有安全感，不太会患得患失",
    scoring: [
      { dimension: "attachment_secure", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "attachment_anxious", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },

  // ========== 爱的语言 loveLanguage 6 题 ==========
  {
    id: 7,
    category: "loveLanguage",
    text: "听到对方真诚的夸奖和肯定，我会特别开心",
    scoring: [{ dimension: "loveLanguage_words", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 8,
    category: "loveLanguage",
    text: "两个人安安静静地待在一起，就是我最享受的时光",
    scoring: [{ dimension: "loveLanguage_time", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 9,
    category: "loveLanguage",
    text: "收到对方用心准备的礼物，我会非常感动",
    scoring: [{ dimension: "loveLanguage_gifts", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 10,
    category: "loveLanguage",
    text: "对方主动帮我分担事情，比说什么都让我暖心",
    scoring: [{ dimension: "loveLanguage_service", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 11,
    category: "loveLanguage",
    text: "拥抱、牵手等肢体接触会让我很有安全感",
    scoring: [{ dimension: "loveLanguage_touch", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 12,
    category: "loveLanguage",
    text: "比起收到礼物，我更在意对方愿意花时间陪我",
    scoring: [
      { dimension: "loveLanguage_time", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "loveLanguage_gifts", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },

  // ========== 沟通风格 communication 5 题 ==========
  {
    id: 13,
    category: "communication",
    text: "我习惯主动说出自己的真实想法和感受",
    scoring: [{ dimension: "communication_openness", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 14,
    category: "communication",
    text: "别人向我倾诉时，我能耐心听完再回应",
    scoring: [{ dimension: "communication_listening", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 15,
    category: "communication",
    text: "有不满的时候，我更倾向于直接表达",
    scoring: [{ dimension: "communication_direct", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 16,
    category: "communication",
    text: "很多心事我宁愿自己消化，不太会说出来",
    scoring: [
      { dimension: "communication_openness", weights: [4, 3, 2, 1, 0, 0, 0] },
      { dimension: "communication_direct", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 17,
    category: "communication",
    text: "我比较善于站在对方的角度去理解TA",
    scoring: [{ dimension: "communication_listening", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },

  // ========== 价值观 values 5 题 ==========
  {
    id: 18,
    category: "values",
    text: "我觉得家庭和感情比事业成就更重要",
    scoring: [{ dimension: "values_family", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 19,
    category: "values",
    text: "花钱之前，我会习惯性地衡量值不值得",
    scoring: [{ dimension: "values_frugal", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 20,
    category: "values",
    text: "即使关系再亲密，我也需要属于自己的空间",
    scoring: [{ dimension: "values_independence", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 21,
    category: "values",
    text: "感情到了一定程度，自然应该认真考虑未来",
    scoring: [{ dimension: "values_family", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 22,
    category: "values",
    text: "喜欢的东西就该买，生活不必过度节省",
    scoring: [{ dimension: "values_frugal", weights: [4, 3, 2, 1, 0, 0, 0] }],
  },

  // ========== 性格特质 personality 4 题 ==========
  {
    id: 23,
    category: "personality",
    text: "在人多的场合，我更喜欢观察和倾听",
    scoring: [
      { dimension: "personality_introvert", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_extrovert", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 24,
    category: "personality",
    text: "认识新朋友、参加社交活动让我充满能量",
    scoring: [
      { dimension: "personality_extrovert", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_introvert", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 25,
    category: "personality",
    text: "面对选择时，我更相信理性分析和逻辑判断",
    scoring: [
      { dimension: "personality_thinking", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_feeling", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 26,
    category: "personality",
    text: "做决定时，我会优先考虑相关人的感受",
    scoring: [
      { dimension: "personality_feeling", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "personality_thinking", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },

  // ========== 冲突处理 conflict 4 题 ==========
  {
    id: 27,
    category: "conflict",
    text: "发生分歧后，我需要先独处冷静一下",
    scoring: [{ dimension: "conflict_withdraw", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 28,
    category: "conflict",
    text: "出现矛盾时，我希望尽快面对面沟通解决",
    scoring: [{ dimension: "conflict_repair", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
  {
    id: 29,
    category: "conflict",
    text: "在气头上，我宁愿先沉默也不想说伤人的话",
    scoring: [
      { dimension: "conflict_withdraw", weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: "conflict_repair", weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 30,
    category: "conflict",
    text: "即使是我有错，我也愿意先主动示好",
    scoring: [{ dimension: "conflict_repair", weights: [0, 0, 0, 1, 2, 3, 4] }],
  },
];
