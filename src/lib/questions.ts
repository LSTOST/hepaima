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

/** 暧昧期 28 题 + 热恋期 35 题 + 稳定期 40 题（每道题只属于一个 stage） */
const ALL_QUESTIONS: Question[] = [
  // ========== 暧昧期 AMBIGUOUS 1-28 ==========
  {
    id: 1,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "你发了条微信，对方过了两三个小时还没回，你会咋样？",
    options: [
      { key: "A", text: "继续忙自己的，等对方有空自然会回", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "有点急，会再发一条或打个岔问问在干嘛", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "会想是不是自己说错话了、对方在躲着自己", scores: { attachment: { fearful: 4 } } },
      { key: "D", text: "理解可能在忙，但希望对方忙完能回一句，不然心里不踏实", scores: { attachment: { anxious: 2, secure: 2 } } },
    ],
  },
  {
    id: 2,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "周末想和对方见面，你一般是？",
    options: [
      { key: "A", text: "很想和对方待着，对方不约我也会主动约", scores: { attachment: { anxious: 4 } } },
      { key: "B", text: "一半想约对方，一半也想留时间给自己或朋友", scores: { attachment: { secure: 4 } } },
      { key: "C", text: "希望对方能先约我，不然会有点失落", scores: { attachment: { anxious: 3 } } },
      { key: "D", text: "偶尔一起吃个饭看个电影就挺好，不用总黏着", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 3,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "和对方闹了点不愉快，或者感觉对方突然变冷淡了，你一般会？",
    options: [
      { key: "A", text: "会主动发消息或找话题，想尽快缓和", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "需要一点时间冷静，但会找机会聊开", scores: { attachment: { secure: 3 } } },
      { key: "C", text: "等对方先开口，不然会觉得对方不在乎自己", scores: { attachment: { anxious: 4 } } },
      { key: "D", text: "不太想深聊，过几天自然就好了", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 4,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方说想把你介绍给对方的朋友认识，你第一反应是啥？",
    options: [
      { key: "A", text: "挺开心的，说明对方想让我融入他的生活", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "可以啊，但想再熟一点再说也行", scores: { attachment: { secure: 3 } } },
      { key: "C", text: "有点紧张，怕对方朋友对我不满意", scores: { attachment: { anxious: 3 } } },
      { key: "D", text: "不太想，觉得还没到那一步", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 5,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "你会在对方面前哭、说压力大、露怯吗（比如压力大、心情差）？",
    options: [
      { key: "A", text: "会，对方是让我安心的人", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "偶尔会，但不会太频繁", scores: { attachment: { secure: 3 } } },
      { key: "C", text: "不太会，怕对方觉得我矫情或太负能量", scores: { attachment: { avoidant: 3 } } },
      { key: "D", text: "几乎不会，习惯自己消化", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 6,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方和异性朋友单独吃饭、看电影，你会？",
    options: [
      { key: "A", text: "信任对方，不会多想", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "会问清楚是谁、什么情况，不然心里膈应", scores: { attachment: { anxious: 3 } } },
      { key: "C", text: "心里不舒服，但不想表现得太小气", scores: { attachment: { fearful: 3 } } },
      { key: "D", text: "无所谓，我也有自己的社交，各玩各的", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 7,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "和对方吃饭或喝东西时，对方一直看手机，你会咋样？",
    options: [
      { key: "A", text: "直接说「先别看手机呗」或开玩笑提醒", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "会有点不开心，但忍着不说", scores: { attachment: { anxious: 3 } } },
      { key: "C", text: "觉得不被重视，会想是不是对我没兴趣", scores: { attachment: { fearful: 4 } } },
      { key: "D", text: "那我也看自己的，各玩各的", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 8,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方说「最近有点累，想一个人静静」时，你？",
    options: [
      { key: "A", text: "尊重对方，等对方愿意聊再说", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "会担心是不是自己做错了什么", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "有点受伤，觉得被推开", scores: { attachment: { fearful: 3 } } },
      { key: "D", text: "正好，我也需要自己的空间", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 9,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "和对方暧昧/相处之后，你和朋友的联系？",
    options: [
      { key: "A", text: "保持平衡，对方和朋友都重要", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "陪对方多了，朋友约我有时会推掉", scores: { attachment: { anxious: 3 } } },
      { key: "C", text: "更想和对方待着，朋友理解就行", scores: { attachment: { anxious: 4 } } },
      { key: "D", text: "还是更喜欢和哥们/闺蜜玩", scores: { attachment: { avoidant: 4 } } },
    ],
  },
  {
    id: 10,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方答应你的事忘了（比如约好一起过生日却放鸽子），你会咋样？",
    options: [
      { key: "A", text: "会表达失望，但愿意听对方解释", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "很生气，觉得对方不重视我", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "失望又不敢说，怕显得矫情", scores: { attachment: { fearful: 4 } } },
      { key: "D", text: "算了，反正也不是什么大事", scores: { attachment: { avoidant: 3 } } },
    ],
  },
  {
    id: 11,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "你心里觉得两个人最好啥样？",
    options: [
      { key: "A", text: "互相信任，有各自空间又互相惦记", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "希望对方能随时回应我、让我有安全感", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "保持一定距离，太黏会喘不过气", scores: { attachment: { avoidant: 4 } } },
      { key: "D", text: "想靠近又怕受伤，有时会试探", scores: { attachment: { fearful: 4 } } },
    ],
  },
  {
    id: 12,
    stage: "AMBIGUOUS",
    category: "attachment",
    text: "对方要出差或去外地一周，你们见不到面，你会？",
    options: [
      { key: "A", text: "会想念，但各自忙各自的，偶尔视频聊聊就好", scores: { attachment: { secure: 4 } } },
      { key: "B", text: "每天都要视频或语音，不然睡不好", scores: { attachment: { anxious: 4 } } },
      { key: "C", text: "正好可以专心做自己的事", scores: { attachment: { avoidant: 4 } } },
      { key: "D", text: "想联系又怕打扰对方，纠结", scores: { attachment: { fearful: 4 } } },
    ],
  },

  // ========== 爱的语言 loveLanguage ==========
  {
    id: 13,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "以下哪种方式最让你感受到「对方在意我」？",
    options: [
      { key: "A", text: "对方说「想你了」「今天开心吗」之类的话", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "对方记得我说过的小事记着并做到了（比如提到想吃的店就带我去）", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "收到对方精心准备的小礼物或小惊喜", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "两人专心待在一起，不刷手机", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 14,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "你一般会怎样向对方表达好感？",
    options: [
      { key: "A", text: "直接夸对方、说想对方", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "帮对方做点事，比如买杯咖啡、顺手带个东西", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "送对方喜欢的小东西", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "花时间陪对方，哪怕只是散步聊天", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 15,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "节日（比如生日、情人节）对方没什么表示，你会咋样？",
    options: [
      { key: "A", text: "有点失落，希望至少有一句祝福或小礼物", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "会暗示或开玩笑问「今天有没有惊喜」", scores: { loveLanguage: { time: 4 } } },
      { key: "C", text: "自己会准备，但会记着对方没表示", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "无所谓，不看重形式", scores: { loveLanguage: { service: 4 } } },
    ],
  },
  {
    id: 16,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "对方从外地回来，你最期待？",
    options: [
      { key: "A", text: "对方说「想死你了」之类的表达", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "对方带回来的小礼物或特产", scores: { loveLanguage: { gifts: 4 } } },
      { key: "C", text: "见面先抱一下、搂一下", scores: { loveLanguage: { touch: 4 } } },
      { key: "D", text: "对方主动留出时间好好陪我", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 17,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "和对方闹不愉快之后，什么最能让你消气？",
    options: [
      { key: "A", text: "对方诚恳地说清楚想法、道歉", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "对方主动做点事，比如买杯奶茶、约你出来", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "对方送个小礼物表示心意", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "对方放下手机，认真听你聊一会儿", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 18,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "约会时，你更喜欢哪种？",
    options: [
      { key: "A", text: "对方经常夸我、说喜欢和我待着", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "牵手、搂肩、拥抱等肢体接触", scores: { loveLanguage: { touch: 4 } } },
      { key: "C", text: "对方提前安排好行程、不用我操心", scores: { loveLanguage: { service: 4 } } },
      { key: "D", text: "两个人安安静静待着，不被打扰", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 19,
    stage: "AMBIGUOUS",
    category: "loveLanguage",
    text: "对方做什么会让你觉得「对方心里有我」？",
    options: [
      { key: "A", text: "会跟我说到哪了、在干嘛、日常琐事", scores: { loveLanguage: { words: 3 } } },
      { key: "B", text: "记得我随口提过想要的东西并买给我", scores: { loveLanguage: { gifts: 4 } } },
      { key: "C", text: "我累的时候帮我拿东西、跑腿", scores: { loveLanguage: { service: 4 } } },
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
    text: "想对对方好的时候，你一般会咋做？",
    options: [
      { key: "A", text: "直接说「想你」「喜欢你」", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "用拥抱、牵手代替言语", scores: { loveLanguage: { touch: 4 } } },
      { key: "C", text: "帮对方做事、照顾对方", scores: { loveLanguage: { service: 4 } } },
      { key: "D", text: "花时间陪对方做对方喜欢的事", scores: { loveLanguage: { time: 4 } } },
    ],
  },
  {
    id: 106,
    stage: "ROMANCE",
    category: "loveLanguage",
    text: "伴侣生病时，你更想做啥？",
    options: [
      { key: "A", text: "陪在身边说「没事的，有我在」", scores: { loveLanguage: { words: 4 } } },
      { key: "B", text: "买药、煮粥、照顾对方", scores: { loveLanguage: { service: 4 } } },
      { key: "C", text: "买对方喜欢的水果、零食", scores: { loveLanguage: { gifts: 4 } } },
      { key: "D", text: "握着对方的手陪着", scores: { loveLanguage: { touch: 4 } } },
    ],
  },

  // ========== 沟通方式 communication 4 题 ==========
  {
    id: 23,
    stage: "AMBIGUOUS",
    category: "communication",
    text: "对方答应你的事没做到（比如约好见面又临时改期），你会咋样？",
    options: [
      { key: "A", text: "找个机会直接说，希望下次能说到做到", scores: { communication: 4 } },
      { key: "B", text: "先憋着，次数多了再一起提", scores: { communication: 2 } },
      { key: "C", text: "用开玩笑或阴阳的方式暗示一下", scores: { communication: 3 } },
      { key: "D", text: "不太说，希望对方自己能意识到", scores: { communication: 1 } },
    ],
  },
  {
    id: 28,
    stage: "ROMANCE",
    category: "communication",
    text: "聊到以后买房、结婚这些事时，你一般会？",
    options: [
      { key: "A", text: "一起想想利弊，摊开说清楚再定", scores: { communication: 4 } },
      { key: "B", text: "先听对方想法，再表达自己的", scores: { communication: 3 } },
      { key: "C", text: "感觉还早，不太想深入聊", scores: { communication: 2 } },
      { key: "D", text: "容易聊着聊着就吵起来", scores: { communication: 1 } },
    ],
  },
  {
    id: 25,
    stage: "AMBIGUOUS",
    category: "communication",
    text: "对方心情不好、明显低落时，你一般会？",
    options: [
      { key: "A", text: "先问对方想聊聊还是想静静，看对方想怎样就怎样", scores: { communication: 4 } },
      { key: "B", text: "主动陪在身边，等对方愿意说", scores: { communication: 3 } },
      { key: "C", text: "给建议，帮对方分析问题", scores: { communication: 2 } },
      { key: "D", text: "不太确定怎么安慰，有时会躲开", scores: { communication: 1 } },
    ],
  },
  {
    id: 29,
    stage: "ROMANCE",
    category: "values",
    text: "对于「钱怎么花」这件事，你和伴侣？",
    options: [
      { key: "A", text: "会一起打算，大笔钱会商量", scores: { values: 4 } },
      { key: "B", text: "各管各的，但会为共同目标存钱", scores: { values: 3 } },
      { key: "C", text: "还没细聊过，觉得还没到那步", scores: { values: 2 } },
      { key: "D", text: "谁赚的多谁说了算，或者 AA", scores: { values: 1 } },
    ],
  },
  {
    id: 33,
    stage: "ROMANCE",
    category: "communication",
    text: "和伴侣意见不合时，你一般会？",
    options: [
      { key: "A", text: "各让一步，取个中间", scores: { communication: 4 } },
      { key: "B", text: "尽量说服对方，但也会听对方的理由", scores: { communication: 3 } },
      { key: "C", text: "懒得争，你说啥就啥", scores: { communication: 2 } },
      { key: "D", text: "容易情绪上头，吵完再说", scores: { communication: 1 } },
    ],
  },

  // ========== 价值观 values 3 题 ==========
  {
    id: 27,
    stage: "AMBIGUOUS",
    category: "values",
    text: "关于「以后会不会结婚」，你现在的看法是？",
    options: [
      { key: "A", text: "遇到对的人就会想结，顺其自然", scores: { values: 4 } },
      { key: "B", text: "顺其自然，不刻意追求也不排斥", scores: { values: 3 } },
      { key: "C", text: "更多是两家人的事，需要各方面合适", scores: { values: 2 } },
      { key: "D", text: "只是一张纸，两个人在一起开心更重要", scores: { values: 1 } },
    ],
  },
  {
    id: 22,
    stage: "AMBIGUOUS",
    category: "values",
    text: "关于「以后要不要孩子」，你现在的态度？",
    options: [
      { key: "A", text: "会和另一半好好聊，聊拢了再说", scores: { values: 4 } },
      { key: "B", text: "顺其自然，到时候再说", scores: { values: 3 } },
      { key: "C", text: "还没想过，离我太远了", scores: { values: 2 } },
      { key: "D", text: "和对方想法不一致的话，先搁着", scores: { values: 1 } },
    ],
  },

  // ========== 生活习惯 lifestyle 3 题 ==========
  {
    id: 35,
    stage: "ROMANCE",
    category: "lifestyle",
    text: "周末早上，你更喜欢哪种？",
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
    text: "如果以后一起住，关于家务你的想法是？",
    options: [
      { key: "A", text: "一起做，谁有空谁多做点", scores: { lifestyle: 4 } },
      { key: "B", text: "可以分工，但要提前说好", scores: { lifestyle: 3 } },
      { key: "C", text: "谁看不下去谁做", scores: { lifestyle: 2 } },
      { key: "D", text: "我负责/对方负责，分工明确", scores: { lifestyle: 2 } },
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
  // ROMANCE 37-60（24 题，热恋期情境化表述）
  { id: 37, stage: "ROMANCE", category: "attachment", text: "晚上你发了条消息，对方到第二天早上才回说昨晚睡着了，你会咋样？", options: [{ key: "A", text: "没事，下次要是先睡可以说一声就好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会有点失落，希望对方以后睡前能说一声", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "会想是不是对方没那么在意自己了", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "理解对方在忙，但希望忙完能回一句，不然不踏实", scores: { attachment: { anxious: 2, secure: 2 } } }] },
  { id: 38, stage: "ROMANCE", category: "attachment", text: "周末你一般想怎么过？", options: [{ key: "A", text: "和对方腻在一起，做什么都行", scores: { attachment: { anxious: 4 } } }, { key: "B", text: "一半时间和对方约会，一半留给自己或朋友", scores: { attachment: { secure: 4 } } }, { key: "C", text: "希望对方能主动安排约会，不然会有点失落", scores: { attachment: { anxious: 3 } } }, { key: "D", text: "各自有空间，偶尔一起吃饭看电影就很好", scores: { attachment: { avoidant: 4 } } }] },
  { id: 39, stage: "ROMANCE", category: "attachment", text: "吵架或冷战之后，你一般会？", options: [{ key: "A", text: "会主动找对方聊，想快点好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "需要一点时间冷静，但会找机会聊开", scores: { attachment: { secure: 3 } } }, { key: "C", text: "等对方先开口，不然会觉得自己不被重视", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "不太想深入谈，过几天自然就好了", scores: { attachment: { avoidant: 4 } } }] },
  { id: 40, stage: "ROMANCE", category: "attachment", text: "伴侣提出想见你爸妈/朋友时，你第一反应是啥？", options: [{ key: "A", text: "很开心，说明对方认真对待这段关系", scores: { attachment: { secure: 4 } } }, { key: "B", text: "可以，但希望再相处久一点再说", scores: { attachment: { secure: 3 } } }, { key: "C", text: "有点紧张，怕家人/朋友不满意", scores: { attachment: { anxious: 3 } } }, { key: "D", text: "不太想，觉得还没到那一步", scores: { attachment: { avoidant: 4 } } }] },
  { id: 41, stage: "ROMANCE", category: "attachment", text: "你会在伴侣面前哭、说压力大、露怯吗（比如哭、说压力大）？", options: [{ key: "A", text: "会，对方是让我安心的人", scores: { attachment: { secure: 4 } } }, { key: "B", text: "偶尔会，但不会太频繁", scores: { attachment: { secure: 3 } } }, { key: "C", text: "不太会，怕对方觉得我矫情", scores: { attachment: { avoidant: 3 } } }, { key: "D", text: "几乎不会，习惯自己消化", scores: { attachment: { avoidant: 4 } } }] },
  { id: 42, stage: "ROMANCE", category: "attachment", text: "伴侣和异性朋友单独吃饭、经常私聊，你会？", options: [{ key: "A", text: "信任对方，不会多想", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会问清楚是谁、什么关系，需要对方让我安心", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "心里不舒服，但不想表现得太小气", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "无所谓，我也有自己的社交", scores: { attachment: { avoidant: 4 } } }] },
  { id: 43, stage: "ROMANCE", category: "attachment", text: "约会时对方一直看手机，你？", options: [{ key: "A", text: "直接说「能不能先别看手机」", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会有点不开心，但忍着不说", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "觉得不被重视，开始胡思乱想", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "那我也看自己的，各玩各的", scores: { attachment: { avoidant: 4 } } }] },
  { id: 44, stage: "ROMANCE", category: "attachment", text: "对方说「想一个人静静」时，你？", options: [{ key: "A", text: "尊重对方，等对方愿意聊再说", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会担心是不是自己做错了什么", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "有点受伤，觉得被推开", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "正好，我也需要自己的空间", scores: { attachment: { avoidant: 4 } } }] },
  { id: 45, stage: "ROMANCE", category: "attachment", text: "恋爱后，你和朋友的联系频率？", options: [{ key: "A", text: "保持平衡，恋人和朋友都重要", scores: { attachment: { secure: 4 } } }, { key: "B", text: "陪伴侣多了，朋友约我有时会推掉", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "更想和伴侣待着，朋友理解就行", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "还是更喜欢和哥们/闺蜜玩", scores: { attachment: { avoidant: 4 } } }] },
  { id: 46, stage: "ROMANCE", category: "attachment", text: "对方忘记你们说好的事（比如答应陪你过生日），你？", options: [{ key: "A", text: "会表达失望，但愿意听对方解释", scores: { attachment: { secure: 4 } } }, { key: "B", text: "很生气，觉得对方不重视我", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "失望又不敢说，怕显得矫情", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "算了，反正也不是什么大事", scores: { attachment: { avoidant: 3 } } }] },
  { id: 47, stage: "ROMANCE", category: "attachment", text: "你理想中的亲密关系是？", options: [{ key: "A", text: "互相信任，有各自空间又互相惦记", scores: { attachment: { secure: 4 } } }, { key: "B", text: "希望对方能随时回应我、让我有安全感", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "保持一定距离，太黏会喘不过气", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想靠近又怕受伤，有时会试探", scores: { attachment: { fearful: 4 } } }] },
  { id: 48, stage: "ROMANCE", category: "attachment", text: "伴侣出差一周，你会？", options: [{ key: "A", text: "会想念，但各自忙各自的，视频聊聊就好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "每天都要视频，不然睡不好", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "正好可以专心做自己的事", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想联系又怕打扰对方，纠结", scores: { attachment: { fearful: 4 } } }] },
  { id: 49, stage: "ROMANCE", category: "loveLanguage", text: "以下哪种方式最让你感受到被爱？", options: [{ key: "A", text: "对方说「我爱你」「想你了」之类的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方记得我说过的小事，记着并做到了", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "收到对方精心准备的小礼物", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "两人专心待在一起，不玩手机", scores: { loveLanguage: { time: 4 } } }] },
  { id: 50, stage: "ROMANCE", category: "loveLanguage", text: "你一般会怎样表达对伴侣的爱？", options: [{ key: "A", text: "直接说甜言蜜语、夸对方", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "帮对方做事情，比如买早餐、收拾房间", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "送对方喜欢的东西", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "花时间陪对方，哪怕只是散步聊天", scores: { loveLanguage: { time: 4 } } }] },
  { id: 51, stage: "ROMANCE", category: "loveLanguage", text: "纪念日或生日，你更看重哪样？", options: [{ key: "A", text: "对方用心写的卡片或说的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方花时间陪我，哪怕没礼物", scores: { loveLanguage: { time: 4 } } }, { key: "C", text: "对方记得并提前准备惊喜", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方为我做一顿饭或安排一天行程", scores: { loveLanguage: { service: 4 } } }] },
  { id: 52, stage: "ROMANCE", category: "loveLanguage", text: "当伴侣出差/旅行几天回来，你最期待？", options: [{ key: "A", text: "对方说「想死你了」之类的表达", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方带回来的小礼物或特产", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "对方放下行李先抱抱我", scores: { loveLanguage: { touch: 4 } } }, { key: "D", text: "对方主动安排时间好好陪我", scores: { loveLanguage: { time: 4 } } }] },
  { id: 53, stage: "ROMANCE", category: "loveLanguage", text: "吵架后，什么最能让你消气？", options: [{ key: "A", text: "对方诚恳地道歉、说清楚想法", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方主动做点事，比如买杯奶茶、做顿饭", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "对方送个小礼物表示歉意", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方放下手机，认真陪我聊一会儿", scores: { loveLanguage: { time: 4 } } }] },
  { id: 54, stage: "ROMANCE", category: "loveLanguage", text: "约会时，你更喜欢哪种？", options: [{ key: "A", text: "对方经常夸我、说喜欢我", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "牵手、搂肩、拥抱等肢体接触", scores: { loveLanguage: { touch: 4 } } }, { key: "C", text: "对方提前安排好行程、不用我操心", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "两个人安安静静待着，不被打扰", scores: { loveLanguage: { time: 4 } } }] },
  { id: 55, stage: "ROMANCE", category: "loveLanguage", text: "对方做什么会让你觉得「对方心里有我」？", options: [{ key: "A", text: "到哪了会说一声、会分享日常", scores: { loveLanguage: { words: 3 } } }, { key: "B", text: "记得我随口提过想要的东西并买给我", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "我累的时候帮我做家务、跑腿", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "愿意放下手机，专心听我说话", scores: { loveLanguage: { time: 4 } } }] },
  { id: 56, stage: "ROMANCE", category: "communication", text: "当对伴侣有不满时，你一般会？", options: [{ key: "A", text: "找机会直接说咋想的", scores: { communication: 4 } }, { key: "B", text: "先憋着，积累多了再一起说", scores: { communication: 2 } }, { key: "C", text: "用开玩笑或暗示的方式表达", scores: { communication: 3 } }, { key: "D", text: "不太说，希望对方自己能感觉到", scores: { communication: 1 } }] },
  { id: 57, stage: "ROMANCE", category: "communication", text: "伴侣心情不好时，你一般会？", options: [{ key: "A", text: "先问对方想聊聊还是想静静，看对方想怎样就怎样", scores: { communication: 4 } }, { key: "B", text: "主动陪在身边，等对方愿意说", scores: { communication: 3 } }, { key: "C", text: "给建议，帮对方分析问题", scores: { communication: 2 } }, { key: "D", text: "不太确定怎么安慰，有时会躲开", scores: { communication: 1 } }] },
  { id: 30, stage: "ROMANCE", category: "values", text: "关于「结婚」这件事，你的看法是？", options: [{ key: "A", text: "是感情的归宿，遇到对的人就会想结", scores: { values: 4 } }, { key: "B", text: "顺其自然，不刻意追求也不排斥", scores: { values: 3 } }, { key: "C", text: "更多是两家人的事，需要各方面合适", scores: { values: 2 } }, { key: "D", text: "只是一张纸，两个人在一起开心更重要", scores: { values: 1 } }] },
  { id: 31, stage: "ROMANCE", category: "values", text: "关于「要不要孩子」，你的态度？", options: [{ key: "A", text: "会和伴侣认真讨论，聊拢了", scores: { values: 4 } }, { key: "B", text: "顺其自然，到时候再说", scores: { values: 3 } }, { key: "C", text: "还没想过，离我太远了", scores: { values: 2 } }, { key: "D", text: "和伴侣想法不一致，先搁着", scores: { values: 1 } }] },
  { id: 32, stage: "ROMANCE", category: "lifestyle", text: "关于家务分工，你的想法是？", options: [{ key: "A", text: "一起做，谁有空谁多做点", scores: { lifestyle: 4 } }, { key: "B", text: "可以分工，但要提前说好", scores: { lifestyle: 3 } }, { key: "C", text: "谁看不下去谁做", scores: { lifestyle: 2 } }, { key: "D", text: "我负责/对方负责，分工明确", scores: { lifestyle: 2 } }] },

  // ========== 暧昧期/热恋期 conflict 冲突处理 ==========
  { id: 98, stage: "AMBIGUOUS", category: "conflict", text: "和对方因为小事闹不愉快，冷静下来之后你一般会咋办？", options: [{ key: "A", text: "主动聊聊，说说各自感受", scores: { conflict: 4 } }, { key: "B", text: "谁错谁先开口，但不会记仇", scores: { conflict: 3 } }, { key: "C", text: "翻篇就行，不想再提", scores: { conflict: 2 } }, { key: "D", text: "心里还有疙瘩，但不说", scores: { conflict: 1 } }] },
  { id: 99, stage: "AMBIGUOUS", category: "conflict", text: "对方说了让你不舒服的话，你会？", options: [{ key: "A", text: "直接说「你这样说我会难受」", scores: { conflict: 4 } }, { key: "B", text: "憋着，等情绪过了再提", scores: { conflict: 2 } }, { key: "C", text: "用开玩笑的方式暗示", scores: { conflict: 3 } }, { key: "D", text: "装作没事，不想破坏气氛", scores: { conflict: 1 } }] },
  { id: 100, stage: "AMBIGUOUS", category: "conflict", text: "和对方意见不合时（比如去哪玩、吃什么），你一般会？", options: [{ key: "A", text: "各让一步，取个中间", scores: { conflict: 4 } }, { key: "B", text: "尽量说服对方，但也会听对方的理由", scores: { conflict: 3 } }, { key: "C", text: "懒得争，你说啥就啥", scores: { conflict: 2 } }, { key: "D", text: "容易情绪上头，争完再说", scores: { conflict: 1 } }] },
  { id: 101, stage: "ROMANCE", category: "conflict", text: "和伴侣因为小事闹不愉快，冷静下来之后你一般会咋办？", options: [{ key: "A", text: "主动聊聊，说说各自感受", scores: { conflict: 4 } }, { key: "B", text: "谁错谁先开口，但不会记仇", scores: { conflict: 3 } }, { key: "C", text: "翻篇就行，不想再提", scores: { conflict: 2 } }, { key: "D", text: "心里还有疙瘩，但不说", scores: { conflict: 1 } }] },
  { id: 102, stage: "ROMANCE", category: "conflict", text: "对方说了让你不舒服的话，你会？", options: [{ key: "A", text: "直接说「你这样说我会难受」", scores: { conflict: 4 } }, { key: "B", text: "憋着，等情绪过了再提", scores: { conflict: 2 } }, { key: "C", text: "用开玩笑的方式暗示", scores: { conflict: 3 } }, { key: "D", text: "装作没事，不想破坏气氛", scores: { conflict: 1 } }] },
  { id: 103, stage: "ROMANCE", category: "conflict", text: "和伴侣意见不合时，你一般会？", options: [{ key: "A", text: "各让一步，取个中间", scores: { conflict: 4 } }, { key: "B", text: "尽量说服对方，但也会听对方的理由", scores: { conflict: 3 } }, { key: "C", text: "懒得争，你说啥就啥", scores: { conflict: 2 } }, { key: "D", text: "容易情绪上头，吵完再说", scores: { conflict: 1 } }] },
  { id: 104, stage: "ROMANCE", category: "conflict", text: "约会计划临时有变，你会？", options: [{ key: "A", text: "一起商量替代方案", scores: { conflict: 4 } }, { key: "B", text: "有点失望，但会理解", scores: { conflict: 3 } }, { key: "C", text: "心里不爽，但不说", scores: { conflict: 2 } }, { key: "D", text: "直接发脾气", scores: { conflict: 1 } }] },

  // ========== 稳定期 STABLE 58-89（32 题，专属长期关系阶段） ==========
  // 依恋 attachment 12 题
  { id: 58, stage: "STABLE", category: "attachment", text: "在一起久了，伴侣忙工作几天没好好陪你，你一般会？", options: [{ key: "A", text: "理解，各自忙完再好好相处", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会有点失落，希望对方主动说句「想你了」", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "会怀疑是不是感情淡了、对方没那么需要我了", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "正好，我也需要自己的时间和空间", scores: { attachment: { avoidant: 4 } } }] },
  { id: 59, stage: "STABLE", category: "attachment", text: "在一起久了，你更看重两个人咋相处？", options: [{ key: "A", text: "既有共同时间，也尊重彼此独处", scores: { attachment: { secure: 4 } } }, { key: "B", text: "希望经常黏在一起，分开会不踏实", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "保持一定距离，太紧密会喘不过气", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想靠近又怕依赖太多会受伤", scores: { attachment: { fearful: 4 } } }] },
  { id: 60, stage: "STABLE", category: "attachment", text: "吵完架或冷战，你们一般怎么和好？", options: [{ key: "A", text: "会主动聊开，不让矛盾过夜", scores: { attachment: { secure: 4 } } }, { key: "B", text: "需要一点时间冷静，但会找机会说清楚", scores: { attachment: { secure: 3 } } }, { key: "C", text: "等对方先低头，不然觉得不被在乎", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "不太想深聊，过几天自然就好了", scores: { attachment: { avoidant: 4 } } }] },
  { id: 61, stage: "STABLE", category: "attachment", text: "谈到见家长、结婚这类「下一步」时，你的反应是？", options: [{ key: "A", text: "愿意一起往前推，也会和对方商量节奏", scores: { attachment: { secure: 4 } } }, { key: "B", text: "可以，但希望对方先表态、给我信心", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "有点压力，怕被绑得太紧", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "既期待又怕失望，会探探对方咋想", scores: { attachment: { fearful: 4 } } }] },
  { id: 62, stage: "STABLE", category: "attachment", text: "遇到工作或生活上的压力，你会和伴侣说吗？", options: [{ key: "A", text: "会，对方是我最信任的人", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会说一些，但不会全倒", scores: { attachment: { secure: 3 } } }, { key: "C", text: "不太说，怕对方觉得我负能量", scores: { attachment: { avoidant: 3 } } }, { key: "D", text: "习惯自己扛，说了也没用", scores: { attachment: { avoidant: 4 } } }] },
  { id: 63, stage: "STABLE", category: "attachment", text: "伴侣和异性同事/朋友走得比较近，你会？", options: [{ key: "A", text: "信任对方，不会多想", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会问清楚情况，需要对方让我安心", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "心里不舒服，但不想显得小气", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "无所谓，我也有自己的圈子", scores: { attachment: { avoidant: 4 } } }] },
  { id: 64, stage: "STABLE", category: "attachment", text: "在家时对方总刷手机、很少交流，你？", options: [{ key: "A", text: "会直接说「咱们聊聊呗」，一起定个无手机时间", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会不开心，但不太说", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "觉得被忽视，容易胡思乱想", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "那我也忙自己的，各干各的", scores: { attachment: { avoidant: 4 } } }] },
  { id: 65, stage: "STABLE", category: "attachment", text: "伴侣说「最近想一个人待会儿」时，你？", options: [{ key: "A", text: "尊重，等对方愿意聊再陪", scores: { attachment: { secure: 4 } } }, { key: "B", text: "会想是不是我哪里做得不好", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "有点受伤，觉得被推开", scores: { attachment: { fearful: 3 } } }, { key: "D", text: "正好，我也需要自己的空间", scores: { attachment: { avoidant: 4 } } }] },
  { id: 66, stage: "STABLE", category: "attachment", text: "在一起久了，你和朋友、家人的联系？", options: [{ key: "A", text: "伴侣和亲友都重要，会平衡", scores: { attachment: { secure: 4 } } }, { key: "B", text: "陪伴侣多了，朋友约有时会推", scores: { attachment: { anxious: 3 } } }, { key: "C", text: "更想和伴侣待着，亲友理解就行", scores: { attachment: { anxious: 4 } } }, { key: "D", text: "还是更需要自己的社交和独处", scores: { attachment: { avoidant: 4 } } }] },
  { id: 67, stage: "STABLE", category: "attachment", text: "伴侣忘了你们约好的事（比如纪念日、答应的事），你？", options: [{ key: "A", text: "会表达失望，但愿意听解释、一起改", scores: { attachment: { secure: 4 } } }, { key: "B", text: "很生气，觉得不被重视", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "失望但不太敢说，怕显得计较", scores: { attachment: { fearful: 4 } } }, { key: "D", text: "算了，久了也习惯了", scores: { attachment: { avoidant: 3 } } }] },
  { id: 68, stage: "STABLE", category: "attachment", text: "你心里觉得稳定期两个人最好啥样？", options: [{ key: "A", text: "互相信任，有各自空间也有依靠", scores: { attachment: { secure: 4 } } }, { key: "B", text: "希望对方经常表达在乎、让我有安全感", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "保持独立，不要太黏", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想依赖又怕依赖，有时会试探", scores: { attachment: { fearful: 4 } } }] },
  { id: 69, stage: "STABLE", category: "attachment", text: "伴侣要出差或回老家一段时间，你会？", options: [{ key: "A", text: "会想念，但各自忙，定期联系就好", scores: { attachment: { secure: 4 } } }, { key: "B", text: "希望每天视频或语音，不然不踏实", scores: { attachment: { anxious: 4 } } }, { key: "C", text: "正好可以专注自己的事", scores: { attachment: { avoidant: 4 } } }, { key: "D", text: "想联系又怕打扰，会纠结", scores: { attachment: { fearful: 4 } } }] },
  // 爱的语言 loveLanguage 10 题
  { id: 70, stage: "STABLE", category: "loveLanguage", text: "日常里，哪种方式最让你感到被爱？", options: [{ key: "A", text: "对方说「辛苦了」「有你真好」之类的话", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方主动分担家务、帮我办事", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "对方记得我喜欢的并买回来", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方放下手机，专心陪我聊会儿或待着", scores: { loveLanguage: { time: 4 } } }] },
  { id: 71, stage: "STABLE", category: "loveLanguage", text: "你平时一般会怎样向伴侣表达爱？", options: [{ key: "A", text: "直接夸对方、说感谢和爱", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "帮对方做事，比如做饭、收拾", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "送对方需要或喜欢的东西", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "留出时间一起吃饭、散步、聊天", scores: { loveLanguage: { time: 4 } } }] },
  { id: 72, stage: "STABLE", category: "loveLanguage", text: "纪念日或生日，你更看重哪样？", options: [{ key: "A", text: "对方用心写的话或当面的表达", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方留出时间专门陪我", scores: { loveLanguage: { time: 4 } } }, { key: "C", text: "对方记得并准备的小惊喜/礼物", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方做一桌菜或安排一天行程", scores: { loveLanguage: { service: 4 } } }] },
  { id: 73, stage: "STABLE", category: "loveLanguage", text: "对方出差或旅行回来，你最期待？", options: [{ key: "A", text: "对方说「想你了」之类的表达", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方带的小礼物或特产", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "先抱一下、搂一下", scores: { loveLanguage: { touch: 4 } } }, { key: "D", text: "对方留出时间好好陪我", scores: { loveLanguage: { time: 4 } } }] },
  { id: 74, stage: "STABLE", category: "loveLanguage", text: "吵架或冷战和好后，什么最让你感到被在乎？", options: [{ key: "A", text: "对方认真道歉、说清楚想法", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "对方做点事，比如做顿饭、买吃的", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "对方送个小东西表示心意", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "对方放下别的事，专心和我聊一会儿", scores: { loveLanguage: { time: 4 } } }] },
  { id: 75, stage: "STABLE", category: "loveLanguage", text: "下班或周末在家，你更喜欢哪种？", options: [{ key: "A", text: "对方夸我、说喜欢我", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "拥抱、牵手、靠在一起", scores: { loveLanguage: { touch: 4 } } }, { key: "C", text: "对方把饭做好或把事安排好", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "两个人一起待着，不被打扰", scores: { loveLanguage: { time: 4 } } }] },
  { id: 76, stage: "STABLE", category: "loveLanguage", text: "对方做什么会让你觉得「对方心里一直有我」？", options: [{ key: "A", text: "到哪了会说一声、会分享日常", scores: { loveLanguage: { words: 3 } } }, { key: "B", text: "记得我提过的东西并买给我", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "我累的时候主动分担家务、跑腿", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "愿意放下手机，专心听我说话", scores: { loveLanguage: { time: 4 } } }] },
  { id: 77, stage: "STABLE", category: "loveLanguage", text: "你更喜欢收到什么样的心意？", options: [{ key: "A", text: "一条走心的消息或手写卡片", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "一份用心挑的礼物", scores: { loveLanguage: { gifts: 4 } } }, { key: "C", text: "对方为我做的一顿饭或一件事", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "对方推掉别的安排，专门留时间陪我", scores: { loveLanguage: { time: 4 } } }] },
  { id: 78, stage: "STABLE", category: "loveLanguage", text: "示好的时候，你更习惯咋做？", options: [{ key: "A", text: "直接说「爱你」「想你」", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "用拥抱、牵手表达", scores: { loveLanguage: { touch: 4 } } }, { key: "C", text: "帮对方做事、照顾对方", scores: { loveLanguage: { service: 4 } } }, { key: "D", text: "花时间陪对方做对方喜欢的事", scores: { loveLanguage: { time: 4 } } }] },
  { id: 79, stage: "STABLE", category: "loveLanguage", text: "伴侣生病或情绪低落时，你更想做啥？", options: [{ key: "A", text: "陪在身边说「有我在」", scores: { loveLanguage: { words: 4 } } }, { key: "B", text: "买药、做饭、照顾对方", scores: { loveLanguage: { service: 4 } } }, { key: "C", text: "买对方喜欢的水果、吃的", scores: { loveLanguage: { gifts: 4 } } }, { key: "D", text: "握着对方的手陪着", scores: { loveLanguage: { touch: 4 } } }] },
  // 沟通 communication 4 题
  { id: 80, stage: "STABLE", category: "communication", text: "对伴侣有不满时，你一般会？", options: [{ key: "A", text: "找合适时机直接说", scores: { communication: 4 } }, { key: "B", text: "先忍着，攒多了再说", scores: { communication: 2 } }, { key: "C", text: "用玩笑或暗示表达", scores: { communication: 3 } }, { key: "D", text: "很少说，希望对方自己发现", scores: { communication: 1 } }] },
  { id: 81, stage: "STABLE", category: "communication", text: "聊到买房、结婚、要孩子这些大事时，你一般会？", options: [{ key: "A", text: "一起摊开说利弊，一块儿定", scores: { communication: 4 } }, { key: "B", text: "先听对方想法，再说自己想法", scores: { communication: 3 } }, { key: "C", text: "不太想深聊，顺其自然", scores: { communication: 2 } }, { key: "D", text: "容易聊着聊着吵起来", scores: { communication: 1 } }] },
  { id: 82, stage: "STABLE", category: "communication", text: "伴侣工作或家里有事心情不好，你一般会？", options: [{ key: "A", text: "先问对方想聊还是想静静，尊重对方", scores: { communication: 4 } }, { key: "B", text: "陪在身边，等对方愿意说", scores: { communication: 3 } }, { key: "C", text: "给建议、帮分析", scores: { communication: 2 } }, { key: "D", text: "不太会安慰，有时会躲开", scores: { communication: 1 } }] },
  { id: 83, stage: "STABLE", category: "communication", text: "和伴侣意见不一致时，你一般会？", options: [{ key: "A", text: "各让一步，取个中间", scores: { communication: 4 } }, { key: "B", text: "会说服对方，但也听对方理由", scores: { communication: 3 } }, { key: "C", text: "懒得争，听对方的", scores: { communication: 2 } }, { key: "D", text: "容易上头，吵完再说", scores: { communication: 1 } }] },
  // 价值观 values 3 题
  { id: 84, stage: "STABLE", category: "values", text: "关于「结婚」或「领证」，你和伴侣？", options: [{ key: "A", text: "说好了，在打算了或已经排上日程了", scores: { values: 4 } }, { key: "B", text: "顺其自然，不催但也不排斥", scores: { values: 3 } }, { key: "C", text: "两家人的事，要各方面合适再说", scores: { values: 2 } }, { key: "D", text: "觉得形式不重要，在一起就好", scores: { values: 1 } }] },
  { id: 85, stage: "STABLE", category: "values", text: "对于「钱怎么花、谁管钱」，你们？", options: [{ key: "A", text: "一起规划，大额支出会商量，谁管都行", scores: { values: 4 } }, { key: "B", text: "各管各的，共同目标一起存", scores: { values: 3 } }, { key: "C", text: "还没说开，基本各花各的", scores: { values: 2 } }, { key: "D", text: "谁赚得多谁说了算 / 必须 AA，不然不公平", scores: { values: 1 } }] },
  { id: 86, stage: "STABLE", category: "values", text: "关于「要不要孩子、什么时候要」，你们？", options: [{ key: "A", text: "好好聊过，说好了", scores: { values: 4 } }, { key: "B", text: "顺其自然，到时候再说", scores: { values: 3 } }, { key: "C", text: "还没细聊", scores: { values: 2 } }, { key: "D", text: "想法不一致，先搁着，甚至可能谈不拢", scores: { values: 1 } }] },
  // 生活习惯 lifestyle 3 题
  { id: 87, stage: "STABLE", category: "lifestyle", text: "周末早上，你更喜欢哪种？", options: [{ key: "A", text: "和伴侣一起睡懒觉、吃早午餐", scores: { lifestyle: 4 } }, { key: "B", text: "早起运动或做自己的事，中午再一起", scores: { lifestyle: 3 } }, { key: "C", text: "各睡各的，醒了再说", scores: { lifestyle: 2 } }, { key: "D", text: "希望对方配合我作息，不然会不爽", scores: { lifestyle: 1 } }] },
  { id: 88, stage: "STABLE", category: "lifestyle", text: "家务你们一般是咋分的？", options: [{ key: "A", text: "一起做，谁有空谁多做", scores: { lifestyle: 4 } }, { key: "B", text: "有分工，提前说好", scores: { lifestyle: 3 } }, { key: "C", text: "谁看不下去谁做", scores: { lifestyle: 2 } }, { key: "D", text: "固定谁负责什么，分工明确", scores: { lifestyle: 2 } }] },
  { id: 89, stage: "STABLE", category: "lifestyle", text: "日常谁来决定吃什么、去哪玩、买什么？", options: [{ key: "A", text: "一起商量，轮流决定", scores: { lifestyle: 4 } }, { key: "B", text: "谁有想法谁提，另一个配合", scores: { lifestyle: 3 } }, { key: "C", text: "多半一个人说了算", scores: { lifestyle: 2 } }, { key: "D", text: "经常纠结半天定不下来", scores: { lifestyle: 1 } }] },

  // ========== 稳定期专属 conflict 8 题 ==========
  {
    id: 90,
    stage: "STABLE",
    category: "conflict",
    text: "和伴侣因为小事吵架，冷静下来之后你一般会咋办？",
    options: [
      { key: "A", text: "会事后拿出来聊聊，说说各自咋想的，下次少吵", scores: { conflict: 4 } },
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
      { key: "A", text: "在中间传话，两边都说说", scores: { conflict: 4 } },
      { key: "B", text: "先站伴侣，私下再和爸妈沟通", scores: { conflict: 3 } },
      { key: "C", text: "两边都不想得罪，尽量躲开", scores: { conflict: 2 } },
      { key: "D", text: "让伴侣自己处理，那是对方的事", scores: { conflict: 1 } },
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
      { key: "D", text: "必须回我家/对方家，没得商量", scores: { conflict: 1 } },
    ],
  },
  {
    id: 94,
    stage: "STABLE",
    category: "conflict",
    text: "伴侣说你「变了」，你觉得委屈时？",
    options: [
      { key: "A", text: "问对方具体指什么，一起聊聊", scores: { conflict: 4 } },
      { key: "B", text: "解释自己的变化，希望对方理解", scores: { conflict: 3 } },
      { key: "C", text: "觉得对方不理解我，懒得解释", scores: { conflict: 2 } },
      { key: "D", text: "直接吵起来", scores: { conflict: 1 } },
    ],
  },
  {
    id: 95,
    stage: "STABLE",
    category: "conflict",
    text: "在一起久了觉得没劲了，你会？",
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
    text: "伴侣连续一两周加班，很少在家吃饭、也没空陪你，你会？",
    options: [
      { key: "A", text: "会和对方说说自己的感受，一起想想咋挤出时间", scores: { conflict: 4 } },
      { key: "B", text: "理解对方忙，但会提醒对方别忘了我", scores: { conflict: 3 } },
      { key: "C", text: "忍着不说，但心里会不开心", scores: { conflict: 2 } },
      { key: "D", text: "用冷战或吵架让对方知道我不爽", scores: { conflict: 1 } },
    ],
  },
  {
    id: 97,
    stage: "STABLE",
    category: "conflict",
    text: "俩人对「要不要和父母同住」想法不一样时？",
    options: [
      { key: "A", text: "摊开说利弊，找个折中的办法（如同城不同住）", scores: { conflict: 4 } },
      { key: "B", text: "各让一步，先试试再调整", scores: { conflict: 3 } },
      { key: "C", text: "先搁着，等真要决定再说", scores: { conflict: 2 } },
      { key: "D", text: "坚持己见，这是原则问题", scores: { conflict: 1 } },
    ],
  },
];

/**
 * 根据阶段筛选题目
 * - 暧昧期：28 题
 * - 热恋期：35 题
 * - 稳定期：40 题（专属 32 题 + 冲突处理 8 题）
 */
export function getQuestionsByStage(stage: Stage): Question[] {
  return ALL_QUESTIONS.filter((q) => q.stage === stage).sort((a, b) => a.id - b.id);
}
