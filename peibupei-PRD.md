# 配不配 - 产品需求文档 (PRD)

## 项目概述

**产品名称**：配不配
**域名**：peibupei.com
**定位**：万物匹配轻测试平台——一切皆可测"配不配"
**Slogan**：「测一测，你们配不配？」

### 与知我实验室的关系

```
知我实验室（母品牌 / 微信服务号）
│
├── 💕 合拍吗 hepaima.com —— 深度情侣契合度测评（变现主力）
│
├── ⚡ 配不配 peibupei.com —— 万物匹配轻测试（流量引擎）← 本文档
│
└── 🧠 更多产品（规划中）
```

**核心定位差异**：

| 维度 | 合拍吗 | 配不配 |
|------|--------|--------|
| 深度 | 25-40题，专业心理学量表 | 5-12题，轻量趣味测试 |
| 时长 | 5-10分钟 | 1-3分钟 |
| 调性 | 专业、温暖、科学 | 有趣、社交、轻松 |
| 场景 | 情侣专属 | 万物皆可配 |
| 模式 | 双人必须都完成 | 单人可玩，双人更好玩 |
| 变现 | 付费报告 | 广告 + 引流至深度产品 |
| 角色 | 利润中心 | 流量中心 |

---

## 目标用户

### 用户画像

| 维度 | 描述 |
|------|------|
| 年龄 | 16-30岁（比合拍吗更年轻） |
| 特征 | 好奇心强、爱玩测试、社交活跃 |
| 场景 | 无聊刷手机、朋友聚会、社交话题 |
| 平台 | 小红书、抖音、微信朋友圈重度用户 |

### 用户心理

1. **好奇心**：「我和 XX 到底配不配？测测看」
2. **社交货币**：「这个结果好有趣，发出来给朋友看看」
3. **身份认同**：「原来我是这种人，好准！」
4. **轻松娱乐**：不需要认真思考，随手就能玩

---

## 产品模式

### 核心玩法

每个"配不配"测试遵循统一结构：

```
选择测试 → 回答 5-12 道题 → 生成匹配结果卡片 → 分享
                                    │
                                    ├── 单人模式：你和 [某事物] 的匹配度
                                    └── 双人模式：你和 TA 的 [某维度] 匹配度
```

### 两种游玩模式

#### 单人模式（主力）
- 用户自己完成测试
- 得到「你和 XX 的匹配度是 XX%」的结果
- 结果附带性格标签、趣味解读

#### 双人模式（社交裂变）
- A 完成后生成邀请链接
- B 完成后双方各得到匹配结果
- 类似合拍吗的机制，但更轻量

---

## 测试矩阵

### 首批上线（MVP）

| 测试名 | 类型 | 题数 | 模式 | 传播预期 |
|--------|------|------|------|---------|
| 你和哪座城市最配？ | 人×城市 | 10题 | 单人 | ⭐⭐⭐⭐⭐ |
| 你和你的闺蜜/兄弟配不配？ | 人×人 | 8题 | 双人 | ⭐⭐⭐⭐ |
| 你和什么职业最配？ | 人×职业 | 10题 | 单人 | ⭐⭐⭐⭐ |
| 你的性格色彩是什么？ | 自我认知 | 8题 | 单人 | ⭐⭐⭐⭐ |

### 第二批

| 测试名 | 类型 | 题数 | 模式 |
|--------|------|------|------|
| 你和什么宠物最配？ | 人×宠物 | 6题 | 单人 |
| 你和你的室友配不配？ | 人×人 | 8题 | 双人 |
| 你的压力类型是什么？ | 自我认知 | 8题 | 单人 |
| 你和哪个朝代最配？ | 人×历史 | 8题 | 单人 |

### 持续更新（蹭热点）

| 时机 | 测试 |
|------|------|
| 春节 | 你和哪道年夜饭最配？ |
| 毕业季 | 你和什么类型的工作最配？ |
| 暑假 | 你和哪个旅行目的地最配？ |
| 热门剧 | 你和《XX》里谁最配？ |
| 世界杯 | 你和哪支球队最配？ |

---

## 核心用户流程

### 首页

```
┌─────────────────────────────────────────┐
│                                         │
│  导航栏                                  │
│  Logo(配不配)            知我实验室 ↗    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         测一测，你们配不配？              │
│     万物皆可配，每个结果都是一次发现       │
│                                         │
│         🔥 已有 XX 万人参与测试           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  🔥 热门测试                             │
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │  🏙️     │  │  👫     │              │
│  │ 你和哪座 │  │ 你和闺蜜 │              │
│  │ 城市最配 │  │ 配不配？ │              │
│  │         │  │         │              │
│  │ 10题·2分钟│ │ 8题·1分钟│              │
│  │ 5.2万人  │  │ 3.8万人  │              │
│  │ 已参与   │  │ 已参与   │              │
│  └─────────┘  └─────────┘              │
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │  💼     │  │  🎨     │              │
│  │ 你和什么 │  │ 你的性格 │              │
│  │ 职业最配 │  │ 色彩    │              │
│  │         │  │         │              │
│  │ 10题·2分钟│ │ 8题·1分钟│              │
│  │ 4.1万人  │  │ 6.7万人  │              │
│  │ 已参与   │  │ 已参与   │              │
│  └─────────┘  └─────────┘              │
│                                         │
│  📢 更多测试即将上线                      │
│  想测什么？告诉我们 →                     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  💕 想要更深入的情侣测评？               │
│  试试「合拍吗」—— 基于心理学的            │
│  专业契合度分析                           │
│                    [去看看 →]            │
│                                         │
├─────────────────────────────────────────┤
│  © 知我实验室 | 隐私政策 | 服务条款       │
└─────────────────────────────────────────┘
```

### 测试页

```
┌─────────────────────────────────────────┐
│  配不配       你和哪座城市最配   3/10     │
│  ████████░░░░░░░░░░░░░░░░░ 30%          │
├─────────────────────────────────────────┤
│                                         │
│    周末你最想做的事是？                    │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │  🏃 户外运动、爬山、骑行         │  │
│    └─────────────────────────────────┘  │
│    ┌─────────────────────────────────┐  │
│    │  ☕ 找家咖啡店待一整天            │  │
│    └─────────────────────────────────┘  │
│    ┌─────────────────────────────────┐  │
│    │  🎨 逛展览、看演出、听音乐会     │  │
│    └─────────────────────────────────┘  │
│    ┌─────────────────────────────────┐  │
│    │  🏠 宅家追剧打游戏              │  │
│    └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### 结果页（核心转化页）

```
┌─────────────────────────────────────────┐
│                                         │
│          你和「成都」最配！               │
│                                         │
│          ┌───────────────┐              │
│          │               │              │
│          │     92%       │              │
│          │    匹配度     │              │
│          │               │              │
│          └───────────────┘              │
│                                         │
│    你的城市性格标签：                     │
│    #慢生活爱好者 #美食至上 #松弛感        │
│                                         │
│    成都为什么适合你：                     │
│    你骨子里追求生活的质感而非速度，        │
│    比起 996 你更信奉"适当摸鱼才是          │
│    人生真谛"……                           │
│                                         │
│    你的城市匹配排行：                     │
│    1. 成都 92%                           │
│    2. 大理 87%                           │
│    3. 厦门 83%                           │
│    4. 长沙 79%                           │
│    5. 杭州 71%                           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    [📷 保存结果图片]    [🔗 分享给朋友]   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    👀 你可能还想测                        │
│                                         │
│    ┌──────────┐  ┌──────────┐          │
│    │ 你和什么  │  │ 你的性格  │          │
│    │ 职业最配  │  │ 色彩     │          │
│    └──────────┘  └──────────┘          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    💕 正在恋爱？试试专业情侣测评          │
│    「合拍吗」—— 25-40题深度分析            │
│    你们的契合度                           │
│                    [免费开始 →]           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    📱 关注「知我实验室」                   │
│    第一时间获取新测试通知                  │
│    [服务号二维码]                          │
│                                         │
└─────────────────────────────────────────┘
```

### 分享结果卡片（图片）

```
┌─────────────────────────────────┐
│                                 │
│     我和「成都」的匹配度是       │
│                                 │
│           92%                   │
│                                 │
│   #慢生活爱好者 #美食至上        │
│                                 │
│   ─────────────────────────     │
│                                 │
│   你也来测测？                   │
│   扫码或搜索「配不配」           │
│                                 │
│   [二维码]        peibupei.com  │
│                                 │
│             配不配 × 知我实验室   │
└─────────────────────────────────┘
```

---

## 分享结果图二维码策略

分享图上的二维码应该根据场景动态切换：

| 场景 | 二维码指向 | 目的 |
|------|-----------|------|
| 单人测试结果 | peibupei.com 对应测试页 | 让朋友也来测 |
| 双人测试邀请 | 双人测试的邀请链接 | 让对方参与 |
| 所有分享图角落 | 知我实验室服务号 | 长期沉淀用户 |

---

## 裂变增长机制

### 1. 结果分享驱动（核心）

用户完成测试后，生成精美的结果卡片：
- 卡片设计要「值得发朋友圈」—— 好看、有趣、有个性标签
- 卡片上带 peibupei.com 二维码 + 知我实验室二维码
- 每张卡片就是一个免费广告位

### 2. 双人测试邀请

- A 完成后弹窗：「邀请朋友来测，看看你们有多配！」
- 生成专属邀请链接/邀请码
- B 完成后双方都收到匹配结果

### 3. 测试推荐链

结果页底部推荐其他测试，形成连续参与：
```
完成「城市匹配」→ 推荐「职业匹配」→ 推荐「性格色彩」→ ...
```

### 4. 互动引导关注

- 结果页展示知我实验室服务号二维码
- 文案：「关注获取新测试通知」或「关注解锁完整解读」
- 将一次性流量转化为长期可触达用户

---

## 变现模式

配不配的核心定位是**流量引擎**而非利润中心，变现以轻量方式为主：

### 模式 1：引流至合拍吗（主要）

- 结果页、完成页展示合拍吗广告位
- 文案因人而异：
  - 城市测试后：「找到了适合的城市，那你的另一半呢？」
  - 闺蜜测试后：「和闺蜜很配！那和对象呢？试试专业版 →」
  - 职业测试后：「工作方向有了，感情方向呢？」

### 模式 2：解锁完整报告

- 基础结果：免费（匹配度 + 标签 + 简要解读）
- 完整报告：¥1.9-3.9（详细分析 + 全部城市/职业排名 + 建议）
- 价格极低，冲动消费，走量

### 模式 3：流量广告（后期）

- 当日活达到一定规模后接入广告
- 结果页底部信息流广告
- 不急于在早期做，避免影响体验

---

## 题目设计规范

### 通用结构

每个测试由以下部分组成：

```typescript
interface QuizTemplate {
  id: string;                    // 如 "city-match"
  slug: string;                  // URL 路径，如 "city"
  title: string;                 // "你和哪座城市最配？"
  description: string;           // 简短描述
  coverImage: string;            // 封面图
  mode: 'solo' | 'duo';         // 单人 / 双人
  questionCount: number;         // 题目数量
  estimatedMinutes: number;      // 预计用时
  participantCount: number;      // 参与人数（动态）
  status: 'active' | 'coming_soon' | 'archived';
  
  questions: QuizQuestion[];
  resultCalculator: string;      // 计分逻辑标识
  results: QuizResult[];         // 所有可能的结果
}

interface QuizQuestion {
  id: number;
  text: string;
  options: {
    key: string;                 // "A" | "B" | "C" | "D"
    text: string;
    icon?: string;               // emoji
    scores: Record<string, number>;  // 各维度得分
  }[];
}

interface QuizResult {
  id: string;                    // 如 "chengdu"
  title: string;                 // "成都"
  subtitle: string;              // "巴适得很的慢生活之城"
  matchPercentage: number;       // 根据得分动态计算
  tags: string[];                // ["慢生活爱好者", "美食至上"]
  description: string;           // 详细解读
  image: string;                 // 结果配图
}
```

### 城市匹配测试题目示例

```typescript
const cityMatchQuiz: QuizTemplate = {
  id: "city-match",
  slug: "city",
  title: "你和哪座城市最配？",
  description: "10道题，找到最适合你的城市",
  mode: "solo",
  questionCount: 10,
  estimatedMinutes: 2,
  questions: [
    {
      id: 1,
      text: "周末早上醒来，你最理想的状态是？",
      options: [
        { 
          key: "A", text: "自然醒，不设闹钟", icon: "😴",
          scores: { pace_slow: 3, chengdu: 2, dali: 2 }
        },
        { 
          key: "B", text: "早起去晨跑或健身", icon: "🏃",
          scores: { pace_fast: 2, beijing: 2, shenzhen: 2 }
        },
        { 
          key: "C", text: "睡到中午再说", icon: "🛌",
          scores: { pace_slow: 2, changsha: 2, chongqing: 1 }
        },
        { 
          key: "D", text: "早起去赶个早市或brunch", icon: "🥐",
          scores: { lifestyle: 2, shanghai: 2, hangzhou: 2 }
        },
      ],
    },
    {
      id: 2,
      text: "你对「好吃」的定义是？",
      options: [
        { 
          key: "A", text: "麻辣鲜香，重口味才过瘾", icon: "🌶️",
          scores: { chengdu: 3, chongqing: 3, changsha: 2 }
        },
        { 
          key: "B", text: "精致讲究，食材品质最重要", icon: "🍣",
          scores: { shanghai: 3, hangzhou: 2, guangzhou: 2 }
        },
        { 
          key: "C", text: "街边小吃，烟火气才是灵魂", icon: "🍜",
          scores: { changsha: 3, guangzhou: 3, xiamen: 2 }
        },
        { 
          key: "D", text: "异国料理、创意融合菜", icon: "🍕",
          scores: { shanghai: 2, beijing: 2, shenzhen: 2 }
        },
      ],
    },
    {
      id: 3,
      text: "选一个最向往的居住环境：",
      options: [
        { 
          key: "A", text: "推开窗就是山和湖", icon: "🏔️",
          scores: { dali: 3, hangzhou: 2, kunming: 2 }
        },
        { 
          key: "B", text: "繁华都市，高楼林立", icon: "🏙️",
          scores: { shanghai: 3, shenzhen: 3, beijing: 2 }
        },
        { 
          key: "C", text: "老城区，巷子里有故事", icon: "🏘️",
          scores: { chengdu: 2, xiamen: 3, nanjing: 2 }
        },
        { 
          key: "D", text: "海边，每天听着浪声入睡", icon: "🏖️",
          scores: { xiamen: 3, dali: 2, sanya: 3 }
        },
      ],
    },
    {
      id: 4,
      text: "你更看重工作中的什么？",
      options: [
        { 
          key: "A", text: "薪资高、机会多", icon: "💰",
          scores: { beijing: 3, shanghai: 3, shenzhen: 3 }
        },
        { 
          key: "B", text: "工作生活平衡", icon: "⚖️",
          scores: { chengdu: 3, hangzhou: 2, kunming: 2 }
        },
        { 
          key: "C", text: "能做自己喜欢的事", icon: "✨",
          scores: { dali: 3, xiamen: 2, changsha: 2 }
        },
        { 
          key: "D", text: "行业资源集中、人脉广", icon: "🤝",
          scores: { beijing: 3, shanghai: 2, guangzhou: 2 }
        },
      ],
    },
    {
      id: 5,
      text: "你的社交风格是？",
      options: [
        { 
          key: "A", text: "朋友满天下，走到哪聊到哪", icon: "🎉",
          scores: { changsha: 3, chongqing: 2, chengdu: 2 }
        },
        { 
          key: "B", text: "小圈子，几个知心朋友就够", icon: "🫂",
          scores: { hangzhou: 2, nanjing: 2, kunming: 2 }
        },
        { 
          key: "C", text: "独处也很开心，社交适度就好", icon: "🧘",
          scores: { dali: 3, xiamen: 2 }
        },
        { 
          key: "D", text: "靠兴趣社群认识新朋友", icon: "🎸",
          scores: { beijing: 2, shanghai: 2, chengdu: 2 }
        },
      ],
    },
    {
      id: 6,
      text: "出门必备的是？",
      options: [
        { 
          key: "A", text: "防晒霜", icon: "☀️",
          scores: { dali: 2, sanya: 2, kunming: 2 }
        },
        { 
          key: "B", text: "一把伞（随时可能下雨）", icon: "☂️",
          scores: { hangzhou: 2, chongqing: 2, changsha: 2 }
        },
        { 
          key: "C", text: "地铁卡/交通卡", icon: "🚇",
          scores: { beijing: 2, shanghai: 2, guangzhou: 2, shenzhen: 2 }
        },
        { 
          key: "D", text: "好心情就够了", icon: "😎",
          scores: { chengdu: 2, xiamen: 2, dali: 2 }
        },
      ],
    },
    {
      id: 7,
      text: "你觉得最浪漫的事是？",
      options: [
        { 
          key: "A", text: "一起在深夜的街头散步", icon: "🌙",
          scores: { shanghai: 2, xiamen: 2, nanjing: 2 }
        },
        { 
          key: "B", text: "一起吃一顿超辣火锅", icon: "🍲",
          scores: { chongqing: 3, chengdu: 2, changsha: 2 }
        },
        { 
          key: "C", text: "一起看日出或日落", icon: "🌅",
          scores: { dali: 3, sanya: 2, xiamen: 2 }
        },
        { 
          key: "D", text: "一起在书店待一下午", icon: "📚",
          scores: { beijing: 2, nanjing: 2, hangzhou: 2 }
        },
      ],
    },
    {
      id: 8,
      text: "你对「房价」的态度是？",
      options: [
        { 
          key: "A", text: "能接受高房价，大城市机会多", icon: "🏢",
          scores: { beijing: 2, shanghai: 2, shenzhen: 2 }
        },
        { 
          key: "B", text: "性价比很重要，最好压力小", icon: "🏡",
          scores: { chengdu: 2, changsha: 3, kunming: 2 }
        },
        { 
          key: "C", text: "租房也很好，不一定要买", icon: "🔑",
          scores: { dali: 2, xiamen: 2 }
        },
        { 
          key: "D", text: "新一线城市，兼顾发展和生活", icon: "⭐",
          scores: { hangzhou: 3, chengdu: 2, nanjing: 2 }
        },
      ],
    },
    {
      id: 9,
      text: "你的穿衣风格更接近？",
      options: [
        { 
          key: "A", text: "舒适随性，T恤拖鞋出门", icon: "👕",
          scores: { chengdu: 3, dali: 2, changsha: 2 }
        },
        { 
          key: "B", text: "注重品味，精致但不夸张", icon: "👔",
          scores: { shanghai: 3, hangzhou: 2 }
        },
        { 
          key: "C", text: "潮流前卫，喜欢尝试新风格", icon: "🧥",
          scores: { beijing: 2, shenzhen: 2, guangzhou: 2 }
        },
        { 
          key: "D", text: "看心情，没有固定风格", icon: "🎭",
          scores: { chongqing: 2, changsha: 2, xiamen: 2 }
        },
      ],
    },
    {
      id: 10,
      text: "如果让你用一个词形容理想生活：",
      options: [
        { 
          key: "A", text: "自由", icon: "🕊️",
          scores: { dali: 3, xiamen: 2, kunming: 2 }
        },
        { 
          key: "B", text: "精彩", icon: "🎆",
          scores: { shanghai: 3, beijing: 2, shenzhen: 2 }
        },
        { 
          key: "C", text: "安逸", icon: "🍵",
          scores: { chengdu: 3, hangzhou: 2, nanjing: 2 }
        },
        { 
          key: "D", text: "热闹", icon: "🎊",
          scores: { changsha: 3, chongqing: 3, guangzhou: 2 }
        },
      ],
    },
  ],
  results: [
    {
      id: "chengdu",
      title: "成都",
      subtitle: "巴适得很的慢生活之城",
      matchPercentage: 0, // 动态计算
      tags: ["慢生活爱好者", "美食至上", "松弛感"],
      description: "你骨子里追求生活的质感而非速度。火锅串串、盖碗茶、人民公园的竹椅——成都的节奏和你的灵魂频率完美共振。你相信'适当摸鱼才是人生真谛'，而成都会用一碗冒菜告诉你：你是对的。",
      image: "/results/chengdu.jpg",
    },
    {
      id: "shanghai",
      title: "上海",
      subtitle: "精致与野心并存的魔都",
      matchPercentage: 0,
      tags: ["品质生活", "国际视野", "精致主义"],
      description: "你骨子里有一种精致的追求，不将就、不凑合。外滩的灯光、梧桐区的brunch、小马路上的独立买手店——上海的精致和你的品味一拍即合。在这里，你的讲究不是矫情，是生活态度。",
      image: "/results/shanghai.jpg",
    },
    {
      id: "beijing",
      title: "北京",
      subtitle: "胸怀天下的理想主义之城",
      matchPercentage: 0,
      tags: ["有野心", "文化控", "格局大"],
      description: "你的内心装着大事。胡同里聊理想，三里屯谈未来，五道口的深夜食堂里全是故事——北京吸引的从来不是追求安逸的人，而是像你这样心里有火的人。",
      image: "/results/beijing.jpg",
    },
    {
      id: "dali",
      title: "大理",
      subtitle: "面朝洱海春暖花开",
      matchPercentage: 0,
      tags: ["自由灵魂", "理想主义", "慢节奏"],
      description: "你的灵魂需要空间去呼吸。苍山洱海、古城小巷、路边弹吉他的旅人——大理不是逃避，是你选择的另一种活法。在这里，自由不是奢侈品，是日常。",
      image: "/results/dali.jpg",
    },
    {
      id: "changsha",
      title: "长沙",
      subtitle: "越夜越热烈的不夜城",
      matchPercentage: 0,
      tags: ["热情似火", "夜生活达人", "社交高手"],
      description: "你身上有一种天然的热情和感染力。凌晨两点的解放西、排队两小时的茶颜悦色、橘子洲头的烟花——长沙的热烈和你的能量磁场完全对上了。生活嘛，就要够辣够热闹！",
      image: "/results/changsha.jpg",
    },
    // 更多城市...
  ],
};
```

---

## 数据库设计

```prisma
// prisma/schema.prisma（peibupei 独立数据库）

// 测试模板
model Quiz {
  id              String    @id @default(cuid())
  slug            String    @unique       // URL 标识
  title           String
  description     String
  coverImage      String?
  mode            QuizMode               // SOLO / DUO
  questionCount   Int
  estimatedMinutes Int
  status          QuizStatus @default(ACTIVE)
  sortOrder       Int        @default(0)  // 首页排序
  
  questions       Json                   // QuizQuestion[]
  results         Json                   // QuizResult[]
  
  participantCount Int       @default(0)
  
  sessions        QuizSession[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// 用户答题会话
model QuizSession {
  id              String    @id @default(cuid())
  quizId          String
  quiz            Quiz      @relation(fields: [quizId], references: [id])
  inviteCode      String?   @unique       // 双人模式用
  
  // 发起者
  initiatorId     String                  // deviceId
  initiatorName   String?
  initiatorAnswers Json?
  initiatorResult  Json?                  // 计算后的结果快照
  initiatorCompletedAt DateTime?
  
  // 参与者（双人模式）
  partnerId       String?
  partnerName     String?
  partnerAnswers  Json?
  partnerResult   Json?
  partnerCompletedAt DateTime?
  
  // 双人匹配结果
  matchResult     Json?
  
  status          SessionStatus @default(IN_PROGRESS)
  
  createdAt       DateTime  @default(now())
  expiresAt       DateTime?
}

enum QuizMode {
  SOLO
  DUO
}

enum QuizStatus {
  ACTIVE
  COMING_SOON
  ARCHIVED
}

enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  WAITING_PARTNER
  EXPIRED
}
```

---

## API 设计

### 基础路径 `/api/v1/`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/quizzes` | 获取所有测试列表 |
| GET | `/api/v1/quizzes/:slug` | 获取单个测试详情（含题目） |
| POST | `/api/v1/quizzes/:slug/start` | 开始答题，创建 session |
| POST | `/api/v1/sessions/:id/submit` | 提交答案 |
| GET | `/api/v1/sessions/:id/result` | 获取结果 |
| POST | `/api/v1/sessions/:id/join` | 加入双人测试 |
| GET | `/api/v1/sessions/:id/share-image` | 生成分享图片 |

---

## 技术方案

### 技术栈（与合拍吗一致）

- **框架**：Next.js 15 (App Router) + TypeScript
- **样式**：Tailwind CSS 4 + Shadcn UI
- **动画**：Framer Motion
- **数据库**：PostgreSQL + Prisma
- **分享图**：Satori（服务端 SVG→PNG 生成）或 html2canvas（客户端截图）
- **部署**：Zeabur / 阿里云（与合拍吗共享基础设施）

### 页面结构

```
app/
├── page.tsx                      # 首页（测试列表）
├── quiz/
│   └── [slug]/
│       ├── page.tsx              # 测试介绍 + 开始
│       └── [sessionId]/
│           ├── page.tsx          # 答题页
│           └── result/
│               └── page.tsx      # 结果页
├── join/
│   └── [inviteCode]/
│       └── page.tsx              # 双人测试加入页
├── api/
│   └── v1/
│       ├── quizzes/
│       │   └── route.ts
│       └── sessions/
│           └── route.ts
└── layout.tsx
```

---

## 设计规范

### 调性

与合拍吗的「温暖专业」不同，配不配走「活泼、有趣、年轻」路线：

| 维度 | 配不配 | 合拍吗 |
|------|--------|--------|
| 色彩 | 明快、多彩、对比强 | 粉紫渐变、温暖柔和 |
| 字体 | 更大、更粗、更有冲击力 | 优雅、克制 |
| 动画 | 弹跳、旋转、夸张一点 | 平滑、渐变 |
| 图标 | Emoji 为主 | Lucide Icons |
| 整体感觉 | 像刷到一个好玩的H5 | 像打开一个专业工具 |

### 配色

每个测试可以有自己的主题色，但整体品牌色：

```
品牌主色：#6366F1（靛蓝，通用感、科技感）
品牌辅色：#F59E0B（琥珀黄，活力、趣味）
背景：#FFFFFF / #F8FAFC
正文：#0F172A
次要文字：#64748B
```

每个测试的主题色示例：
- 城市匹配：🟢 #10B981（绿色，自然/城市）
- 职业匹配：🔵 #3B82F6（蓝色，职业/专业）
- 闺蜜匹配：🩷 #EC4899（粉色，友情/温暖）
- 性格色彩：🟣 #8B5CF6（紫色，神秘/个性）

---

## 开发计划

### 第一阶段：MVP（1-2周）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 项目搭建 | Next.js + Prisma + 基础配置 |
| P0 | 测试框架 | 通用的 Quiz 组件（题目渲染、选项、进度条） |
| P0 | 城市匹配测试 | 第一个完整测试，10题 + 结果页 |
| P0 | 结果分享图生成 | 服务端生成 PNG，支持保存和分享 |
| P0 | 首页 | 测试列表展示 |
| P1 | 数据统计 | 参与人数、完成率 |

### 第二阶段：扩展（1-2周）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 职业匹配测试 | 第二个测试 |
| P0 | 性格色彩测试 | 第三个测试 |
| P0 | 闺蜜/兄弟双人测试 | 第一个双人模式测试 |
| P1 | 合拍吗引流位 | 结果页底部广告位 |
| P1 | 知我实验室引导 | 服务号二维码 |

### 第三阶段：增长（持续）

| 任务 | 说明 |
|------|------|
| 更多测试上线 | 每 1-2 周上线一个新测试 |
| 热点测试 | 节日/热门话题快速出测试 |
| 管理后台 | 在线创建/编辑测试，无需改代码 |
| 数据分析 | 用户行为、转化漏斗、分享率 |
| SEO 优化 | 各测试页面的搜索引擎优化 |

---

## 关键指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 测试完成率 | >80% | 题少、有趣，应该很高 |
| 结果分享率 | >30% | 核心增长指标 |
| 服务号关注转化率 | >5% | 从结果页到关注 |
| 合拍吗引流点击率 | >3% | 从配不配到合拍吗 |
| 单次访问测试数 | >1.5 | 推荐链做得好的话 |

---

*文档版本：v1.0*
*最后更新：2026年3月*
