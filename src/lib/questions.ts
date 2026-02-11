/**
 * 测试题目类型定义与题目数据
 */

export type Stage = "AMBIGUOUS" | "ROMANCE" | "STABLE";

export type OptionKey = "A" | "B" | "C" | "D";

export type Category =
  | "attachment"    // 依恋类型
  | "loveLanguage"  // 爱的语言
  | "communication" // 沟通方式
  | "values"        // 价值观
  | "lifestyle"     // 生活习惯
  | "conflict";     // 冲突处理

export interface QuestionOption {
  key: string;
  text: string;
  scores: {
    attachment?: {
      secure?: number;
      anxious?: number;
      avoidant?: number;
      fearful?: number;
    };
    loveLanguage?: {
      words?: number;
      time?: number;
      gifts?: number;
      service?: number;
      touch?: number;
    };
    communication?: number;
    values?: number;
    lifestyle?: number;
    conflict?: number;
  };
}

export interface Question {
  id: number;
  stage: Stage;
  category: Category;
  text: string;
  options: QuestionOption[];
}

/** 暧昧期 28 题 + 热恋期 36 题 + 稳定期 40 题（每道题只属于一个 stage） */
const ALL_QUESTIONS: Question[] = [
  // ========== 暧昧期 AMBIGUOUS 1-28 ==========
  {
    id: 1,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "当伴侣一段时间没回你消息时，你通常会？",
    options: [
      { key: "A", text: "继续忙自己的事，等 TA 有空自然会回", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "有点不安，会再发一条问问在干嘛", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "会胡思乱想，担心是不是自己做错了什么", scores: { attachment: { fearful: 4 } } },
      { key: "D", text: "理解 TA 可能在忙，但希望 TA 忙完能主动说一声", scores: { attachment: { anxious: 2, secure: 2 } } },
    ],
  },
  {
    id: 2,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "你更倾向于如何度过周末？",
    options: [
      { key: "A", text: "和伴侣腻在一起，做什么都行", scores: { attachment: { anxious: 4 } } },
      { key: "B", text: "一半时间约会，一半时间留给自己或朋友", scores: { attachment: { secure: 4 } } },
      { key: "C", text: "希望伴侣能主动安排，不然会有点失落", scores: { attachment: { anxious: 3 } } },
      { key: "D", text: "各自有空间，偶尔一起吃饭看电影就很好", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 3,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "吵架或冷战之后，你通常？",
    options: [
      { key: "A", text: "会主动沟通，希望尽快和好", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "需要一点时间冷静，但会找机会聊开", scores: { attachment: { secure: 3 } } },
      { key: "C", text: "等对方先开口，不然会觉得自己不被重视", scores: { attachment: { anxious: 4 } } },
      { key: "D", text: "不太想深入谈，过几天自然就好了", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 4,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "伴侣提出想见你爸妈/朋友时，你的第一反应是？",
    options: [
      { key: "A", text: "很开心，说明 TA 认真对待这段关系", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "可以，但希望再相处久一点再说", scores: { attachment: { secure: 3 } } },
      { key: "C", text: "有点紧张，怕家人/朋友不满意", scores: { attachment: { anxious: 3 } } },
      { key: "D", text: "不太想，觉得还没到那一步", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 5,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "你会在伴侣面前展现脆弱的一面吗（比如哭、说压力大）？",
    options: [
      { key: "A", text: "会，TA 是让我安心的人", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "偶尔会，但不会太频繁", scores: { attachment: { secure: 3 } } },
      { key: "C", text: "不太会，怕对方觉得我矫情", scores: { attachment: { avoidant: 3 } } },
      { key: "D", text: "几乎不会，习惯自己消化", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 6,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "伴侣和异性朋友单独吃饭，你会？",
    options: [
      { key: "A", text: "信任 TA，不会多想", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "会问清楚是谁、聊了什么", scores: { attachment: { anxious: 3 } } },
      { key: "C", text: "心里不舒服，但不想表现得太小气", scores: { attachment: { fearful: 3 } } },
      { key: "D", text: "无所谓，我也有自己的社交", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 7,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "约会时对方一直看手机，你？",
    options: [
      { key: "A", text: "直接说「能不能先别看手机」", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "会有点不开心，但忍着不说", scores: { attachment: { anxious: 3 } } },
      { key: "C", text: "觉得不被重视，开始胡思乱想", scores: { attachment: { fearful: 4 } } },
      { key: "D", text: "那我也看自己的，各玩各的", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 8,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方说「想一个人静静」时，你？",
    options: [
      { key: "A", text: "尊重 TA，等 TA 愿意聊再说", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "会担心是不是自己做错了什么", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "有点受伤，觉得被推开", scores: { attachment: { fearful: 3 } } },
      { key: "D", text: "正好，我也需要自己的空间", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 9,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "恋爱后，你和朋友的联系频率？",
    options: [
      { key: "A", text: "保持平衡，恋人和朋友都重要", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "陪伴侣多了，朋友约我有时会推掉", scores: { attachment: { anxious: 3 } } },
      { key: "C", text: "更想和伴侣待着，朋友理解就行", scores: { attachment: { anxious: 4 } } },
      { key: "D", text: "还是更喜欢和哥们/闺蜜玩", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 10,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方忘记你们说好的事（比如答应陪你过生日），你？",
    options: [
      { key: "A", text: "会表达失望，但愿意听 TA 解释", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "很生气，觉得 TA 不重视我", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "失望又不敢说，怕显得矫情", scores: { attachment: { fearful: 4 } } },
      { key: "D", text: "算了，反正也不是什么大事", scores: { attachment: { avoidant: 3 } } },
    ],
  },
  {
    id: 11,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "你理想中的亲密关系是？",
    options: [
      { key: "A", text: "彼此信任、有空间也有关心", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "希望 TA 能随时回应我、让我有安全感", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "保持一定距离，太黏会喘不过气", scores: { attachment: { avoidant: 4 } } },
      { key: "D", text: "想靠近又怕受伤，有时会试探", scores: { attachment: { fearful: 4 } } },
    ],
  },
  {
    id: 12,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "伴侣出差一周，你会？",
    options: [
      { key: "A", text: "会想念，但各自忙各自的，视频聊聊就好", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "每天都要视频，不然睡不好", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "正好可以专心做自己的事", scores: { attachment: { avoidant: 4 } } },
      { key: "D", text: "想联系又怕打扰 TA，纠结", scores: { attachment: { fearful: 4 } } },
    ],
  },

  // ========== 爱的语言 loveLanguage 10 题 ==========
  {
    id: 13,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "以下哪种方式最让你感受到被爱？",
    options: [
      { key: "A", text: "对方说「我爱你」「想你了」之类的话", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "对方记得我说过的小事，并付诸行动", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "收到对方精心准备的小礼物", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "两人专心待在一起，不玩手机", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 14,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "你更常如何表达对伴侣的爱？",
    options: [
      { key: "A", text: "直接说甜言蜜语、夸 TA", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "帮 TA 做事情，比如买早餐、收拾房间", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "送 TA 喜欢的东西", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "花时间陪 TA，哪怕只是散步聊天", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 15,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "纪念日/生日你更看重？",
    options: [
      { key: "A", text: "对方用心写的卡片或说的话", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "对方花时间陪我，哪怕没礼物", scores: { loveLanguage: { time: 4 } } },
      { key: "C", text: "对方记得并提前准备惊喜", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "对方为我做一顿饭或安排一天行程", scores: { loveLanguage: { service: 4 } } },
    ],
  },
  {
    id: 16,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "当伴侣出差/旅行几天回来，你最期待？",
    options: [
      { key: "A", text: "TA 说「想死你了」之类的表达", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "TA 带回来的小礼物或特产", scores: { loveLanguage: { gifts: 4 } } },
      { key: "C", text: "TA 放下行李先抱抱我", scores: { loveLanguage: { touch: 4 } } },
      { key: "D", text: "TA 主动安排时间好好陪我", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 17,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "吵架后，什么最能让你消气？",
    options: [
      { key: "A", text: "对方诚恳地道歉、说清楚想法", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "对方主动做点事，比如买杯奶茶、做顿饭", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "对方送个小礼物表示歉意", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "对方放下手机，认真陪我聊一会儿", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 18,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "约会时，你更喜欢？",
    options: [
      { key: "A", text: "TA 经常夸我、说喜欢我", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "牵手、搂肩、拥抱等肢体接触", scores: { loveLanguage: { touch: 4 } } },
      { key: "C", text: "TA 提前安排好行程、不用我操心", scores: { loveLanguage: { service: 4 } } },
      { key: "D", text: "两个人安安静静待着，不被打扰", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 19,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "对方做什么会让你觉得「TA 心里有我」？",
    options: [
      { key: "A", text: "主动报备行程、分享日常", scores: { loveLanguage: { words: 3 } } },
      { key: "B", text: "记得我随口提过想要的东西并买给我", scores: { loveLanguage: { gifts: 4 } } },
      { key: "C", text: "我累的时候帮我做家务、跑腿", scores: { loveLanguage: { service: 4 } } },
      { key: "D", text: "愿意放下手机，专心听我说话", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 26,
    stage: "ROMANCE",
    category: "loveLanguage",
    text: "你更喜欢收到什么样的惊喜？",
    options: [
      { key: "A", text: "一封手写信或一段语音", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "一份精心挑选的礼物", scores: { loveLanguage: { gifts: 4 } } },
      { key: "C", text: "对方为我准备的一顿饭", scores: { loveLanguage: { service: 4 } } },
      { key: "D", text: "对方推掉其他事，专门留一天陪我", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 21,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "表达爱意时，你更倾向于？",
    options: [
      { key: "A", text: "直接说「我爱你」「想你」", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "用拥抱、牵手代替言语", scores: { loveLanguage: { touch: 4 } } },
      { key: "C", text: "帮 TA 做事、照顾 TA", scores: { loveLanguage: { service: 4 } } },
      { key: "D", text: "花时间陪 TA 做 TA 喜欢的事", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 27,
    stage: "ROMANCE",
    category: "loveLanguage",
    text: "伴侣生病时，你更想？",
    options: [
      { key: "A", text: "陪在身边说「没事的，有我在」", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "买药、煮粥、照顾 TA", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "买 TA 喜欢的水果、零食", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "握着 TA 的手陪着", scores: { loveLanguage: { touch: 4 } } },
    ],
  },

  // ========== 沟通方式 communication 4 题 ==========
  {
    id: 23,
    stage: "AMBIGUOUS",
    category: "communication",
    text: "当对伴侣有不满时，你通常会？",
    options: [
      { key: "A", text: "找个合适的时机，直接说出自己的想法", scores: { communication: 4 } },
      { key: "B", text: "先憋着，积累多了再一起说", scores: { communication: 2 } },
      { key: "C", text: "用开玩笑或暗示的方式表达", scores: { communication: 3 } },
      { key: "D", text: "不太说，希望对方自己能察觉到", scores: { communication: 1 } },
    ],
  },
  {
    id: 28,
    stage: "ROMANCE",
    category: "communication",
    text: "讨论未来规划（比如买房、结婚）时，你更倾向于？",
    options: [
      { key: "A", text: "一起理性分析，列出利弊再决定", scores: { communication: 4 } },
      { key: "B", text: "先听对方想法，再表达自己的", scores: { communication: 3 } },
      { key: "C", text: "感觉还早，不太想深入聊", scores: { communication: 2 } },
      { key: "D", text: "容易聊着聊着就吵起来", scores: { communication: 1 } },
    ],
  },
  {
    id: 25,
    stage: "AMBIGUOUS",
    category: "communication",
    text: "伴侣心情不好时，你通常会？",
    options: [
      { key: "A", text: "先问 TA 想聊聊还是想静静，尊重 TA 的选择", scores: { communication: 4 } },
      { key: "B", text: "主动陪在身边，等 TA 愿意说", scores: { communication: 3 } },
      { key: "C", text: "给建议，帮 TA 分析问题", scores: { communication: 2 } },
      { key: "D", text: "不太确定怎么安慰，有时会回避", scores: { communication: 1 } },
    ],
  },
  {
    id: 29,
    stage: "ROMANCE",
    category: "values",
    text: "对于「钱怎么花」这件事，你和伴侣？",
    options: [
      { key: "A", text: "会一起规划，大额支出会商量", scores: { values: 4 } },
      { key: "B", text: "各管各的，但会为共同目标存钱", scores: { values: 3 } },
      { key: "C", text: "还没深入聊过，觉得还没到那步", scores: { values: 2 } },
      { key: "D", text: "谁赚的多谁说了算，或者 AA", scores: { values: 1 } },
    ],
  },
  {
    id: 33,
    stage: "ROMANCE",
    category: "communication",
    text: "和伴侣意见不合时，你通常？",
    options: [
      { key: "A", text: "各退一步，找个折中方案", scores: { communication: 4 } },
      { key: "B", text: "尽量说服对方，但也会听 TA 的理由", scores: { communication: 3 } },
      { key: "C", text: "懒得争，你说啥就啥", scores: { communication: 2 } },
      { key: "D", text: "容易情绪上头，吵完再说", scores: { communication: 1 } },
    ],
  },

  // ========== 价值观 values 3 题 ==========
  {
    id: 27,
    stage: "AMBIGUOUS",
    category: "values",
    text: "关于「结婚」这件事，你的看法是？",
    options: [
      { key: "A", text: "是感情的归宿，遇到对的人就会想结", scores: { values: 4 } },
      { key: "B", text: "顺其自然，不刻意追求也不排斥", scores: { values: 3 } },
      { key: "C", text: "更多是两家人的事，需要各方面合适", scores: { values: 2 } },
      { key: "D", text: "只是一张纸，两个人在一起开心更重要", scores: { values: 1 } },
    ],
  },
  {
    id: 34,
    stage: "ROMANCE",
    category: "values",
    text: "对于「钱怎么花」这件事，你和伴侣？",
    options: [
      { key: "A", text: "会一起规划，大额支出会商量", scores: { values: 4 } },
      { key: "B", text: "各管各的，但会为共同目标存钱", scores: { values: 3 } },
      { key: "C", text: "还没深入聊过，觉得还没到那步", scores: { values: 2 } },
      { key: "D", text: "谁赚的多谁说了算，或者 AA", scores: { values: 1 } },
    ],
  },
  {
    id: 22,
    stage: "AMBIGUOUS",
    category: "values",
    text: "关于「要不要孩子」，你的态度？",
    options: [
      { key: "A", text: "会和伴侣认真讨论，达成共识", scores: { values: 4 } },
      { key: "B", text: "顺其自然，到时候再说", scores: { values: 3 } },
      { key: "C", text: "还没想过，离我太远了", scores: { values: 2 } },
      { key: "D", text: "和伴侣想法不一致，暂时回避", scores: { values: 1 } },
    ],
  },

  // ========== 生活习惯 lifestyle 3 题 ==========
  {
    id: 35,
    stage: "ROMANCE",
    category: "lifestyle",
    text: "周末早上，你更喜欢？",
    options: [
      { key: "A", text: "和伴侣一起睡懒觉、吃早午餐", scores: { lifestyle: 4 } },
      { key: "B", text: "早起运动或做自己的事，中午再约", scores: { lifestyle: 3 } },
      { key: "C", text: "各睡各的，醒了再说", scores: { lifestyle: 2 } },
      { key: "D", text: "希望对方配合我的作息，不然会不爽", scores: { lifestyle: 1 } },
    ],
  },
  {
    id: 24,
    stage: "AMBIGUOUS",
    category: "lifestyle",
    text: "关于家务分工，你的想法是？",
    options: [
      { key: "A", text: "一起做，谁有空谁多做点", scores: { lifestyle: 4 } },
      { key: "B", text: "可以分工，但要提前说好", scores: { lifestyle: 3 } },
      { key: "C", text: "谁看不下去谁做", scores: { lifestyle: 2 } },
      { key: "D", text: "我负责/TA 负责，分工明确", scores: { lifestyle: 2 } },
    ],
  },
  {
    id: 36,
    stage: "ROMANCE",
    category: "lifestyle",
    text: "约会时谁来决定吃什么、玩什么？",
    options: [
      { key: "A", text: "一起商量，轮流决定", scores: { lifestyle: 4 } },
      { key: "B", text: "谁有想法谁提，另一个配合", scores: { lifestyle: 3 } },
      { key: "C", text: "通常一个人说了算", scores: { lifestyle: 2 } },
      { key: "D", text: "经常纠结半天定不下来", scores: { lifestyle: 1 } },
    ],
  },
  // ROMANCE 37-60（24 题，与 AMBIGUOUS 1-24 同内容）
  { id: 37, stage: "ROMANCE", category: "attachment", text: "当伴侣一段时间没回你消息时，你通常会？", options: [{ key: "A", text: "继续忙自己的事，等 TA 有空自然会回", scores: { attachment: { secure: 4 } } }, { key: "B", text: "有点不安，会再发一条问问在干嘛", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "会胡思乱想，担心是不是自己做错了什么", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "理解 TA 可能在忙，但希望 TA 忙完能主动说一声", scores: { attachment: { anxious: 2, secure: 2 } } }] },
  { id: 38, stage: "ROMANCE", category: "attachment", text: "你更倾向于如何度过周末？", options: [{ key: "A", text: "和伴侣腻在一起，做什么都行", scores: { attachment: { anxious: 4 } } }, { key: "B", text: "一半时间约会，一半时间留给自己或朋友", scores: { attachment: { secure: 4 } } }, { key: "C", text: "希望伴侣能主动安排，不然会有点失落", scores: { attachment: { anxious: 3 } } }, { key: "D", text: "各自有空间，偶尔一起吃饭看电影就很好", scores: { attachment: { avoidant: 4 } } }] },
  { id: 39, stage: "ROMANCE", category: "attachment", text: "吵架或冷战之后，你通常？", options: [{ key: "A", text: "会主动沟通，希望尽快和好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "需要一点时间冷静，但会找机会聊开", scores: { attachment: { secure: 3 } } }, { key: "C", text: "等对方先开口，不然会觉得自己不被重视", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "不太想深入谈，过几天自然就好了", scores: { attachment: { avoidant: 4 } } }] },
  { id: 40, stage: "ROMANCE", category: "attachment", text: "伴侣提出想见你爸妈/朋友时，你的第一反应是？", options: [{ key: "A", text: "很开心，说明 TA 认真对待这段关系", scores: { attachment: { secure: 4 } } }, { key: "B", text: "可以，但希望再相处久一点再说", scores: { attachment: { secure: 3 } } }, { key: "C", text: "有点紧张，怕家人/朋友不满意", scores: { attachment: { anxious: 3 } } }, { key: "D", text: "不太想，觉得还没到那一步", scores: { attachment: { avoidant: 4 } } }] },
  { id: 41, stage: "ROMANCE", category: "attachment", text: "你会在伴侣面前展现脆弱的一面吗（比如哭、说压力大）？", options: [{ key: "A", text: "会，TA 是让我安心的人", scores: { attachment: { secure: 4 } } }, { key: "B", text: "偶尔会，但不会太频繁", scores: { attachment: { secure: 3 } } }, { key: "C", text: "不太会，怕对方觉得我矫情", scores: { attachment: { avoidant: 3 } } }, { key: "D", text: "几乎不会，习惯自己消化", scores: { attachment: { avoidant: 4 } } }] },
  { id: 42, stage: "ROMANCE", category: "attachment", text: "伴侣和异性朋友单独吃饭，你会？", options: [{ key: "A", text: "信任 TA，不会多想", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会问清楚是谁、聊了什么", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "心里不舒服，但不想表现得太小气", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "无所谓，我也有自己的社交", scores: { attachment: { avoidant: 4 } } }] },
  { id: 43, stage: "ROMANCE", category: "attachment", text: "约会时对方一直看手机，你？", options: [{ key: "A", text: "直接说「能不能先别看手机」", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会有点不开心，但忍着不说", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "觉得不被重视，开始胡思乱想", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "那我也看自己的，各玩各的", scores: { attachment: { avoidant: 4 } } }] },
  { id: 44, stage: "ROMANCE", category: "attachment", text: "对方说「想一个人静静」时，你？", options: [{ key: "A", text: "尊重 TA，等 TA 愿意聊再说", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会担心是不是自己做错了什么", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "有点受伤，觉得被推开", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "正好，我也需要自己的空间", scores: { attachment: { avoidant: 4 } } }] },
  { id: 45, stage: "ROMANCE", category: "attachment", text: "恋爱后，你和朋友的联系频率？", options: [{ key: "A", text: "保持平衡，恋人和朋友都重要", scores: { attachment: { secure: 4 } } }, { key: "B", text: "陪伴侣多了，朋友约我有时会推掉", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "更想和伴侣待着，朋友理解就行", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "还是更喜欢和哥们/闺蜜玩", scores: { attachment: { avoidant: 4 } } }] },
  { id: 46, stage: "ROMANCE", category: "attachment", text: "对方忘记你们说好的事（比如答应陪你过生日），你？", options: [{ key: "A", text: "会表达失望，但愿意听 TA 解释", scores: { attachment: { secure: 4 } } }, { key: "B", text: "很生气，觉得 TA 不重视我", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "失望又不敢说，怕显得矫情", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "算了，反正也不是什么大事", scores: { attachment: { avoidant: 3 } } }] },
  { id: 47, stage: "ROMANCE", category: "attachment", text: "你理想中的亲密关系是？", options: [{ key: "A", text: "彼此信任、有空间也有关心", scores: { attachment: { secure: 4 } } }, { key: "B", text: "希望 TA 能随时回应我、让我有安全感", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "保持一定距离，太黏会喘不过气", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想靠近又怕受伤，有时会试探", scores: { attachment: { fearful: 4 } } }] },
  { id: 48, stage: "ROMANCE", category: "attachment", text: "伴侣出差一周，你会？", options: [{ key: "A", text: "会想念，但各自忙各自的，视频聊聊就好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "每天都要视频，不然睡不好", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "正好可以专心做自己的事", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想联系又怕打扰 TA，纠结", scores: { attachment: { fearful: 4 } } }] },
  { id: 49, stage: "ROMANCE", category: "loveLanguage", text: "以下哪种方式最让你感受到被爱？", options: [{ key: "A", text: "对方说「我爱你」「想你了」之类的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方记得我说过的小事，并付诸行动", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "收到对方精心准备的小礼物", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "两人专心待在一起，不玩手机", scores: { loveLanguage: { time: 4 } } }] },
  { id: 50, stage: "ROMANCE", category: "loveLanguage", text: "你更常如何表达对伴侣的爱？", options: [{ key: "A", text: "直接说甜言蜜语、夸 TA", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "帮 TA 做事情，比如买早餐、收拾房间", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "送 TA 喜欢的东西", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "花时间陪 TA，哪怕只是散步聊天", scores: { loveLanguage: { time: 4 } } }] },
  { id: 51, stage: "ROMANCE", category: "loveLanguage", text: "纪念日/生日你更看重？", options: [{ key: "A", text: "对方用心写的卡片或说的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方花时间陪我，哪怕没礼物", scores: { loveLanguage: { time: 4 } } }, { key: "C", text: "对方记得并提前准备惊喜", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方为我做一顿饭或安排一天行程", scores: { loveLanguage: { service: 4 } } }] },
  { id: 52, stage: "ROMANCE", category: "loveLanguage", text: "当伴侣出差/旅行几天回来，你最期待？", options: [{ key: "A", text: "TA 说「想死你了」之类的表达", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "TA 带回来的小礼物或特产", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "TA 放下行李先抱抱我", scores: { loveLanguage: { touch: 4 } } }, { key: "D", text: "TA 主动安排时间好好陪我", scores: { loveLanguage: { time: 4 } } }] },
  { id: 53, stage: "ROMANCE", category: "loveLanguage", text: "吵架后，什么最能让你消气？", options: [{ key: "A", text: "对方诚恳地道歉、说清楚想法", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方主动做点事，比如买杯奶茶、做顿饭", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "对方送个小礼物表示歉意", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方放下手机，认真陪我聊一会儿", scores: { loveLanguage: { time: 4 } } }] },
  { id: 54, stage: "ROMANCE", category: "loveLanguage", text: "约会时，你更喜欢？", options: [{ key: "A", text: "TA 经常夸我、说喜欢我", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "牵手、搂肩、拥抱等肢体接触", scores: { loveLanguage: { touch: 4 } } }, { key: "C", text: "TA 提前安排好行程、不用我操心", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "两个人安安静静待着，不被打扰", scores: { loveLanguage: { time: 4 } } }] },
  { id: 55, stage: "ROMANCE", category: "loveLanguage", text: "对方做什么会让你觉得「TA 心里有我」？", options: [{ key: "A", text: "主动报备行程、分享日常", scores: { loveLanguage: { words: 3 } } }, { key: "B", text: "记得我随口提过想要的东西并买给我", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "我累的时候帮我做家务、跑腿", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "愿意放下手机，专心听我说话", scores: { loveLanguage: { time: 4 } } }] },
  { id: 56, stage: "ROMANCE", category: "communication", text: "当对伴侣有不满时，你通常会？", options: [{ key: "A", text: "找个合适的时机，直接说出自己的想法", scores: { communication: 4 } }, { key: "B", text: "先憋着，积累多了再一起说", scores: { communication: 2 } }, { key: "C", text: "用开玩笑或暗示的方式表达", scores: { communication: 3 } }, { key: "D", text: "不太说，希望对方自己能察觉到", scores: { communication: 1 } }] },
  { id: 57, stage: "ROMANCE", category: "communication", text: "伴侣心情不好时，你通常会？", options: [{ key: "A", text: "先问 TA 想聊聊还是想静静，尊重 TA 的选择", scores: { communication: 4 } }, { key: "B", text: "主动陪在身边，等 TA 愿意说", scores: { communication: 3 } }, { key: "C", text: "给建议，帮 TA 分析问题", scores: { communication: 2 } }, { key: "D", text: "不太确定怎么安慰，有时会回避", scores: { communication: 1 } }] },
  { id: 30, stage: "ROMANCE", category: "values", text: "关于「结婚」这件事，你的看法是？", options: [{ key: "A", text: "是感情的归宿，遇到对的人就会想结", scores: { values: 4 } }, { key: "B", text: "顺其自然，不刻意追求也不排斥", scores: { values: 3 } }, { key: "C", text: "更多是两家人的事，需要各方面合适", scores: { values: 2 } }, { key: "D", text: "只是一张纸，两个人在一起开心更重要", scores: { values: 1 } }] },
  { id: 31, stage: "ROMANCE", category: "values", text: "关于「要不要孩子」，你的态度？", options: [{ key: "A", text: "会和伴侣认真讨论，达成共识", scores: { values: 4 } }, { key: "B", text: "顺其自然，到时候再说", scores: { values: 3 } }, { key: "C", text: "还没想过，离我太远了", scores: { values: 2 } }, { key: "D", text: "和伴侣想法不一致，暂时回避", scores: { values: 1 } }] },
  { id: 32, stage: "ROMANCE", category: "lifestyle", text: "关于家务分工，你的想法是？", options: [{ key: "A", text: "一起做，谁有空谁多做点", scores: { lifestyle: 4 } }, { key: "B", text: "可以分工，但要提前说好", scores: { lifestyle: 3 } }, { key: "C", text: "谁看不下去谁做", scores: { lifestyle: 2 } }, { key: "D", text: "我负责/TA 负责，分工明确", scores: { lifestyle: 2 } }] },

  // ========== 暧昧期/热恋期 conflict 冲突处理 ==========
  { id: 98, stage: "AMBIGUOUS", category: "conflict", text: "和伴侣因为小事闹不愉快，冷静下来后你通常？", options: [{ key: "A", text: "主动聊聊，说说各自感受", scores: { conflict: 4 } }, { key: "B", text: "谁错谁先开口，但不会记仇", scores: { conflict: 3 } }, { key: "C", text: "翻篇就行，不想再提", scores: { conflict: 2 } }, { key: "D", text: "心里还有疙瘩，但不说", scores: { conflict: 1 } }] },
  { id: 99, stage: "AMBIGUOUS", category: "conflict", text: "对方说了让你不舒服的话，你会？", options: [{ key: "A", text: "直接说「你这样说我会难受」", scores: { conflict: 4 } }, { key: "B", text: "憋着，等情绪过了再提", scores: { conflict: 2 } }, { key: "C", text: "用开玩笑的方式暗示", scores: { conflict: 3 } }, { key: "D", text: "装作没事，不想破坏气氛", scores: { conflict: 1 } }] },
  { id: 100, stage: "AMBIGUOUS", category: "conflict", text: "意见不合时，你更倾向于？", options: [{ key: "A", text: "各退一步，找个折中方案", scores: { conflict: 4 } }, { key: "B", text: "尽量说服对方，但也会听 TA 的理由", scores: { conflict: 3 } }, { key: "C", text: "懒得争，你说啥就啥", scores: { conflict: 2 } }, { key: "D", text: "容易情绪上头", scores: { conflict: 1 } }] },
  { id: 101, stage: "ROMANCE", category: "conflict", text: "和伴侣因为小事闹不愉快，冷静下来后你通常？", options: [{ key: "A", text: "主动聊聊，说说各自感受", scores: { conflict: 4 } }, { key: "B", text: "谁错谁先开口，但不会记仇", scores: { conflict: 3 } }, { key: "C", text: "翻篇就行，不想再提", scores: { conflict: 2 } }, { key: "D", text: "心里还有疙瘩，但不说", scores: { conflict: 1 } }] },
  { id: 102, stage: "ROMANCE", category: "conflict", text: "对方说了让你不舒服的话，你会？", options: [{ key: "A", text: "直接说「你这样说我会难受」", scores: { conflict: 4 } }, { key: "B", text: "憋着，等情绪过了再提", scores: { conflict: 2 } }, { key: "C", text: "用开玩笑的方式暗示", scores: { conflict: 3 } }, { key: "D", text: "装作没事，不想破坏气氛", scores: { conflict: 1 } }] },
  { id: 103, stage: "ROMANCE", category: "conflict", text: "意见不合时，你更倾向于？", options: [{ key: "A", text: "各退一步，找个折中方案", scores: { conflict: 4 } }, { key: "B", text: "尽量说服对方，但也会听 TA 的理由", scores: { conflict: 3 } }, { key: "C", text: "懒得争，你说啥就啥", scores: { conflict: 2 } }, { key: "D", text: "容易情绪上头", scores: { conflict: 1 } }] },
  { id: 104, stage: "ROMANCE", category: "conflict", text: "约会计划临时有变，你会？", options: [{ key: "A", text: "一起商量替代方案", scores: { conflict: 4 } }, { key: "B", text: "有点失望，但会理解", scores: { conflict: 3 } }, { key: "C", text: "心里不爽，但不说", scores: { conflict: 2 } }, { key: "D", text: "直接发脾气", scores: { conflict: 1 } }] },

  // ========== 稳定期 STABLE 58-89（32 题，与 1-32 同内容） ==========
  { id: 58, stage: "STABLE", category: "attachment", text: "当伴侣一段时间没回你消息时，你通常会？", options: [{ key: "A", text: "继续忙自己的事，等 TA 有空自然会回", scores: { attachment: { secure: 4 } } }, { key: "B", text: "有点不安，会再发一条问问在干嘛", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "会胡思乱想，担心是不是自己做错了什么", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "理解 TA 可能在忙，但希望 TA 忙完能主动说一声", scores: { attachment: { anxious: 2, secure: 2 } } }] },
  { id: 59, stage: "STABLE", category: "attachment", text: "你更倾向于如何度过周末？", options: [{ key: "A", text: "和伴侣腻在一起，做什么都行", scores: { attachment: { anxious: 4 } } }, { key: "B", text: "一半时间约会，一半时间留给自己或朋友", scores: { attachment: { secure: 4 } } }, { key: "C", text: "希望伴侣能主动安排，不然会有点失落", scores: { attachment: { anxious: 3 } } }, { key: "D", text: "各自有空间，偶尔一起吃饭看电影就很好", scores: { attachment: { avoidant: 4 } } }] },
  { id: 60, stage: "STABLE", category: "attachment", text: "吵架或冷战之后，你通常？", options: [{ key: "A", text: "会主动沟通，希望尽快和好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "需要一点时间冷静，但会找机会聊开", scores: { attachment: { secure: 3 } } }, { key: "C", text: "等对方先开口，不然会觉得自己不被重视", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "不太想深入谈，过几天自然就好了", scores: { attachment: { avoidant: 4 } } }] },
  { id: 61, stage: "STABLE", category: "attachment", text: "伴侣提出想见你爸妈/朋友时，你的第一反应是？", options: [{ key: "A", text: "很开心，说明 TA 认真对待这段关系", scores: { attachment: { secure: 4 } } }, { key: "B", text: "可以，但希望再相处久一点再说", scores: { attachment: { secure: 3 } } }, { key: "C", text: "有点紧张，怕家人/朋友不满意", scores: { attachment: { anxious: 3 } } }, { key: "D", text: "不太想，觉得还没到那一步", scores: { attachment: { avoidant: 4 } } }] },
  { id: 62, stage: "STABLE", category: "attachment", text: "你会在伴侣面前展现脆弱的一面吗（比如哭、说压力大）？", options: [{ key: "A", text: "会，TA 是让我安心的人", scores: { attachment: { secure: 4 } } }, { key: "B", text: "偶尔会，但不会太频繁", scores: { attachment: { secure: 3 } } }, { key: "C", text: "不太会，怕对方觉得我矫情", scores: { attachment: { avoidant: 3 } } }, { key: "D", text: "几乎不会，习惯自己消化", scores: { attachment: { avoidant: 4 } } }] },
  { id: 63, stage: "STABLE", category: "attachment", text: "伴侣和异性朋友单独吃饭，你会？", options: [{ key: "A", text: "信任 TA，不会多想", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会问清楚是谁、聊了什么", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "心里不舒服，但不想表现得太小气", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "无所谓，我也有自己的社交", scores: { attachment: { avoidant: 4 } } }] },
  { id: 64, stage: "STABLE", category: "attachment", text: "约会时对方一直看手机，你？", options: [{ key: "A", text: "直接说「能不能先别看手机」", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会有点不开心，但忍着不说", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "觉得不被重视，开始胡思乱想", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "那我也看自己的，各玩各的", scores: { attachment: { avoidant: 4 } } }] },
  { id: 65, stage: "STABLE", category: "attachment", text: "对方说「想一个人静静」时，你？", options: [{ key: "A", text: "尊重 TA，等 TA 愿意聊再说", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会担心是不是自己做错了什么", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "有点受伤，觉得被推开", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "正好，我也需要自己的空间", scores: { attachment: { avoidant: 4 } } }] },
  { id: 66, stage: "STABLE", category: "attachment", text: "恋爱后，你和朋友的联系频率？", options: [{ key: "A", text: "保持平衡，恋人和朋友都重要", scores: { attachment: { secure: 4 } } }, { key: "B", text: "陪伴侣多了，朋友约我有时会推掉", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "更想和伴侣待着，朋友理解就行", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "还是更喜欢和哥们/闺蜜玩", scores: { attachment: { avoidant: 4 } } }] },
  { id: 67, stage: "STABLE", category: "attachment", text: "对方忘记你们说好的事（比如答应陪你过生日），你？", options: [{ key: "A", text: "会表达失望，但愿意听 TA 解释", scores: { attachment: { secure: 4 } } }, { key: "B", text: "很生气，觉得 TA 不重视我", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "失望又不敢说，怕显得矫情", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "算了，反正也不是什么大事", scores: { attachment: { avoidant: 3 } } }] },
  { id: 68, stage: "STABLE", category: "attachment", text: "你理想中的亲密关系是？", options: [{ key: "A", text: "彼此信任、有空间也有关心", scores: { attachment: { secure: 4 } } }, { key: "B", text: "希望 TA 能随时回应我、让我有安全感", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "保持一定距离，太黏会喘不过气", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想靠近又怕受伤，有时会试探", scores: { attachment: { fearful: 4 } } }] },
  { id: 69, stage: "STABLE", category: "attachment", text: "伴侣出差一周，你会？", options: [{ key: "A", text: "会想念，但各自忙各自的，视频聊聊就好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "每天都要视频，不然睡不好", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "正好可以专心做自己的事", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想联系又怕打扰 TA，纠结", scores: { attachment: { fearful: 4 } } }] },
  { id: 70, stage: "STABLE", category: "loveLanguage", text: "以下哪种方式最让你感受到被爱？", options: [{ key: "A", text: "对方说「我爱你」「想你了」之类的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方记得我说过的小事，并付诸行动", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "收到对方精心准备的小礼物", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "两人专心待在一起，不玩手机", scores: { loveLanguage: { time: 4 } } }] },
  { id: 71, stage: "STABLE", category: "loveLanguage", text: "你更常如何表达对伴侣的爱？", options: [{ key: "A", text: "直接说甜言蜜语、夸 TA", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "帮 TA 做事情，比如买早餐、收拾房间", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "送 TA 喜欢的东西", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "花时间陪 TA，哪怕只是散步聊天", scores: { loveLanguage: { time: 4 } } }] },
  { id: 72, stage: "STABLE", category: "loveLanguage", text: "纪念日/生日你更看重？", options: [{ key: "A", text: "对方用心写的卡片或说的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方花时间陪我，哪怕没礼物", scores: { loveLanguage: { time: 4 } } }, { key: "C", text: "对方记得并提前准备惊喜", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方为我做一顿饭或安排一天行程", scores: { loveLanguage: { service: 4 } } }] },
  { id: 73, stage: "STABLE", category: "loveLanguage", text: "当伴侣出差/旅行几天回来，你最期待？", options: [{ key: "A", text: "TA 说「想死你了」之类的表达", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "TA 带回来的小礼物或特产", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "TA 放下行李先抱抱我", scores: { loveLanguage: { touch: 4 } } }, { key: "D", text: "TA 主动安排时间好好陪我", scores: { loveLanguage: { time: 4 } } }] },
  { id: 74, stage: "STABLE", category: "loveLanguage", text: "吵架后，什么最能让你消气？", options: [{ key: "A", text: "对方诚恳地道歉、说清楚想法", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方主动做点事，比如买杯奶茶、做顿饭", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "对方送个小礼物表示歉意", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方放下手机，认真陪我聊一会儿", scores: { loveLanguage: { time: 4 } } }] },
  { id: 75, stage: "STABLE", category: "loveLanguage", text: "约会时，你更喜欢？", options: [{ key: "A", text: "TA 经常夸我、说喜欢我", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "牵手、搂肩、拥抱等肢体接触", scores: { loveLanguage: { touch: 4 } } }, { key: "C", text: "TA 提前安排好行程、不用我操心", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "两个人安安静静待着，不被打扰", scores: { loveLanguage: { time: 4 } } }] },
  { id: 76, stage: "STABLE", category: "loveLanguage", text: "对方做什么会让你觉得「TA 心里有我」？", options: [{ key: "A", text: "主动报备行程、分享日常", scores: { loveLanguage: { words: 3 } } }, { key: "B", text: "记得我随口提过想要的东西并买给我", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "我累的时候帮我做家务、跑腿", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "愿意放下手机，专心听我说话", scores: { loveLanguage: { time: 4 } } }] },
  { id: 77, stage: "STABLE", category: "loveLanguage", text: "你更喜欢收到什么样的惊喜？", options: [{ key: "A", text: "一封手写信或一段语音", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "一份精心挑选的礼物", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "对方为我准备的一顿饭", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "对方推掉其他事，专门留一天陪我", scores: { loveLanguage: { time: 4 } } }] },
  { id: 78, stage: "STABLE", category: "loveLanguage", text: "表达爱意时，你更倾向于？", options: [{ key: "A", text: "直接说「我爱你」「想你」", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "用拥抱、牵手代替言语", scores: { loveLanguage: { touch: 4 } } }, { key: "C", text: "帮 TA 做事、照顾 TA", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "花时间陪 TA 做 TA 喜欢的事", scores: { loveLanguage: { time: 4 } } }] },
  { id: 79, stage: "STABLE", category: "loveLanguage", text: "伴侣生病时，你更想？", options: [{ key: "A", text: "陪在身边说「没事的，有我在」", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "买药、煮粥、照顾 TA", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "买 TA 喜欢的水果、零食", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "握着 TA 的手陪着", scores: { loveLanguage: { touch: 4 } } }] },
  { id: 80, stage: "STABLE", category: "communication", text: "当对伴侣有不满时，你通常会？", options: [{ key: "A", text: "找个合适的时机，直接说出自己的想法", scores: { communication: 4 } }, { key: "B", text: "先憋着，积累多了再一起说", scores: { communication: 2 } }, { key: "C", text: "用开玩笑或暗示的方式表达", scores: { communication: 3 } }, { key: "D", text: "不太说，希望对方自己能察觉到", scores: { communication: 1 } }] },
  { id: 81, stage: "STABLE", category: "communication", text: "讨论未来规划（比如买房、结婚）时，你更倾向于？", options: [{ key: "A", text: "一起理性分析，列出利弊再决定", scores: { communication: 4 } }, { key: "B", text: "先听对方想法，再表达自己的", scores: { communication: 3 } }, { key: "C", text: "感觉还早，不太想深入聊", scores: { communication: 2 } }, { key: "D", text: "容易聊着聊着就吵起来", scores: { communication: 1 } }] },
  { id: 82, stage: "STABLE", category: "communication", text: "伴侣心情不好时，你通常会？", options: [{ key: "A", text: "先问 TA 想聊聊还是想静静，尊重 TA 的选择", scores: { communication: 4 } }, { key: "B", text: "主动陪在身边，等 TA 愿意说", scores: { communication: 3 } }, { key: "C", text: "给建议，帮 TA 分析问题", scores: { communication: 2 } }, { key: "D", text: "不太确定怎么安慰，有时会回避", scores: { communication: 1 } }] },
  { id: 83, stage: "STABLE", category: "communication", text: "和伴侣意见不合时，你通常？", options: [{ key: "A", text: "各退一步，找个折中方案", scores: { communication: 4 } }, { key: "B", text: "尽量说服对方，但也会听 TA 的理由", scores: { communication: 3 } }, { key: "C", text: "懒得争，你说啥就啥", scores: { communication: 2 } }, { key: "D", text: "容易情绪上头，吵完再说", scores: { communication: 1 } }] },
  { id: 84, stage: "STABLE", category: "values", text: "关于「结婚」这件事，你的看法是？", options: [{ key: "A", text: "是感情的归宿，遇到对的人就会想结", scores: { values: 4 } }, { key: "B", text: "顺其自然，不刻意追求也不排斥", scores: { values: 3 } }, { key: "C", text: "更多是两家人的事，需要各方面合适", scores: { values: 2 } }, { key: "D", text: "只是一张纸，两个人在一起开心更重要", scores: { values: 1 } }] },
  { id: 85, stage: "STABLE", category: "values", text: "对于「钱怎么花」这件事，你和伴侣？", options: [{ key: "A", text: "会一起规划，大额支出会商量", scores: { values: 4 } }, { key: "B", text: "各管各的，但会为共同目标存钱", scores: { values: 3 } }, { key: "C", text: "还没深入聊过，觉得还没到那步", scores: { values: 2 } }, { key: "D", text: "谁赚的多谁说了算，或者 AA", scores: { values: 1 } }] },
  { id: 86, stage: "STABLE", category: "values", text: "关于「要不要孩子」，你的态度？", options: [{ key: "A", text: "会和伴侣认真讨论，达成共识", scores: { values: 4 } }, { key: "B", text: "顺其自然，到时候再说", scores: { values: 3 } }, { key: "C", text: "还没想过，离我太远了", scores: { values: 2 } }, { key: "D", text: "和伴侣想法不一致，暂时回避", scores: { values: 1 } }] },
  { id: 87, stage: "STABLE", category: "lifestyle", text: "周末早上，你更喜欢？", options: [{ key: "A", text: "和伴侣一起睡懒觉、吃早午餐", scores: { lifestyle: 4 } }, { key: "B", text: "早起运动或做自己的事，中午再约", scores: { lifestyle: 3 } }, { key: "C", text: "各睡各的，醒了再说", scores: { lifestyle: 2 } }, { key: "D", text: "希望对方配合我的作息，不然会不爽", scores: { lifestyle: 1 } }] },
  { id: 88, stage: "STABLE", category: "lifestyle", text: "关于家务分工，你的想法是？", options: [{ key: "A", text: "一起做，谁有空谁多做点", scores: { lifestyle: 4 } }, { key: "B", text: "可以分工，但要提前说好", scores: { lifestyle: 3 } }, { key: "C", text: "谁看不下去谁做", scores: { lifestyle: 2 } }, { key: "D", text: "我负责/TA 负责，分工明确", scores: { lifestyle: 2 } }] },
  { id: 89, stage: "STABLE", category: "lifestyle", text: "约会时谁来决定吃什么、玩什么？", options: [{ key: "A", text: "一起商量，轮流决定", scores: { lifestyle: 4 } }, { key: "B", text: "谁有想法谁提，另一个配合", scores: { lifestyle: 3 } }, { key: "C", text: "通常一个人说了算", scores: { lifestyle: 2 } }, { key: "D", text: "经常纠结半天定不下来", scores: { lifestyle: 1 } }] },

  // ========== 稳定期专属 conflict 8 题 ==========
  {
    id: 90,
    stage: "STABLE",
    category: "conflict",
    text: "和伴侣因为小事吵架，冷静下来后你通常？",
    options: [
      { key: "A", text: "主动复盘，说说各自感受，避免下次", scores: { conflict: 4 } },
      { key: "B", text: "谁错谁先开口，但不会记仇", scores: { conflict: 3 } },
      { key: "C", text: "翻篇就行，不想再提", scores: { conflict: 2 } },
      { key: "D", text: "心里还有疙瘩，但不说", scores: { conflict: 1 } },
    ],
  },
  {
    id: 91,
    stage: "STABLE",
    category: "conflict",
    text: "伴侣和你的家人有矛盾时，你会？",
    options: [
      { key: "A", text: "在中间调解，传达双方想法", scores: { conflict: 4 } },
      { key: "B", text: "先站伴侣，私下再和爸妈沟通", scores: { conflict: 3 } },
      { key: "C", text: "两边都不想得罪，尽量回避", scores: { conflict: 2 } },
      { key: "D", text: "让伴侣自己处理，那是 TA 的事", scores: { conflict: 1 } },
    ],
  },
  {
    id: 92,
    stage: "STABLE",
    category: "conflict",
    text: "对方做了让你很生气的事，你会？",
    options: [
      { key: "A", text: "等情绪平复后，好好谈一次", scores: { conflict: 4 } },
      { key: "B", text: "当场说出来，但尽量控制语气", scores: { conflict: 3 } },
      { key: "C", text: "冷战几天，等对方来哄", scores: { conflict: 2 } },
      { key: "D", text: "憋着，用其他方式发泄", scores: { conflict: 1 } },
    ],
  },
  {
    id: 93,
    stage: "STABLE",
    category: "conflict",
    text: "关于「过年回谁家」这类问题，你和伴侣？",
    options: [
      { key: "A", text: "提前商量好，轮流或各回各家", scores: { conflict: 4 } },
      { key: "B", text: "每年都会讨论，有时会吵", scores: { conflict: 3 } },
      { key: "C", text: "暂时回避，还没到那步", scores: { conflict: 2 } },
      { key: "D", text: "必须回我家/TA 家，没得商量", scores: { conflict: 1 } },
    ],
  },
  {
    id: 94,
    stage: "STABLE",
    category: "conflict",
    text: "伴侣说你「变了」，你觉得委屈时？",
    options: [
      { key: "A", text: "问 TA 具体指什么，一起聊聊", scores: { conflict: 4 } },
      { key: "B", text: "解释自己的变化，希望 TA 理解", scores: { conflict: 3 } },
      { key: "C", text: "觉得 TA 不理解我，懒得解释", scores: { conflict: 2 } },
      { key: "D", text: "直接吵起来", scores: { conflict: 1 } },
    ],
  },
  {
    id: 95,
    stage: "STABLE",
    category: "conflict",
    text: "长期相处中产生倦怠感，你会？",
    options: [
      { key: "A", text: "和伴侣聊聊，一起找新鲜感", scores: { conflict: 4 } },
      { key: "B", text: "自己调整心态，多想想对方的好", scores: { conflict: 3 } },
      { key: "C", text: "顺其自然，过段时间就好了", scores: { conflict: 2 } },
      { key: "D", text: "怀疑是不是不爱了", scores: { conflict: 1 } },
    ],
  },
  {
    id: 96,
    stage: "STABLE",
    category: "conflict",
    text: "伴侣工作太忙经常忽略你，你会？",
    options: [
      { key: "A", text: "表达需求，一起找平衡点", scores: { conflict: 4 } },
      { key: "B", text: "理解 TA，但会提醒 TA 注意", scores: { conflict: 3 } },
      { key: "C", text: "忍着不说，但会不开心", scores: { conflict: 2 } },
      { key: "D", text: "用冷战或吵架表达不满", scores: { conflict: 1 } },
    ],
  },
  {
    id: 97,
    stage: "STABLE",
    category: "conflict",
    text: "双方对「要不要和父母同住」意见不同时？",
    options: [
      { key: "A", text: "理性讨论利弊，找折中方案", scores: { conflict: 4 } },
      { key: "B", text: "各让一步，比如先同城不同住", scores: { conflict: 3 } },
      { key: "C", text: "暂时搁置，等真要决定再说", scores: { conflict: 2 } },
      { key: "D", text: "坚持己见，这是原则问题", scores: { conflict: 1 } },
    ],
  },
];

/**
 * 根据阶段筛选题目
 * - 暧昧期：28 题
 * - 热恋期：36 题
 * - 稳定期：40 题（前 32 题 + 专属 8 题）
 */
export function getQuestionsByStage(stage: Stage): Question[] {
  return ALL_QUESTIONS.filter((q) => q.stage === stage).sort((a, b) => a.id - b.id);
}
