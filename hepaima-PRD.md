# 合拍吗 - 产品需求文档 (PRD)

## 项目概述

**产品名称**：合拍吗
**域名**：hepaima.com
**定位**：基于心理学的情侣契合度测评工具

### 技术栈
- 前端：Next.js 15 (App Router) + TypeScript + Shadcn UI + Tailwind CSS + Framer Motion
- 后端：Next.js Route Handlers
- 数据库：PostgreSQL + Prisma ORM
- AI：DeepSeek API
- 部署：Zeabur / 阿里云

### 多端规划
- 当前：Web 版（设备ID识别用户）
- 后续：微信小程序、App（需要用户登录）
- API 设计需考虑多端复用

---

## 产品模式

### 双模式设计

| 维度 | 通用版 | 阶段版 |
|------|--------|--------|
| **定位** | 入门首选，降低决策门槛 | 精准匹配，深度分析 |
| **适合用户** | 不确定阶段、刚认识、好奇尝试 | 明确知道关系阶段 |
| **题目数量** | 38题 | 25/32/40题 |
| **答题方式** | 1-7 李克特量表 | A/B/C/D 选项 |
| **价格** | ¥12.9起 | ¥9.9/14.9/19.9起 |
| **报告特点** | 全面通用分析 | 阶段针对性建议 |

### 用户选择流程

```
首页
  │
  ├─→ 选择【通用版】 ─→ 输入昵称 ─→ 38题(1-7量表) ─→ 等待对方 ─→ 结果
  │
  └─→ 选择【阶段版】
        │
        ├─→ 暧昧期 ─→ 输入昵称 ─→ 25题(ABCD) ─→ 等待对方 ─→ 结果
        ├─→ 热恋期 ─→ 输入昵称 ─→ 32题(ABCD) ─→ 等待对方 ─→ 结果
        └─→ 稳定期 ─→ 输入昵称 ─→ 40题(ABCD) ─→ 等待对方 ─→ 结果
```

---

## 数据库设计 (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户表 - 预留多端登录
model User {
  id            String    @id @default(cuid())
  phone         String?   @unique
  wechatOpenId  String?   @unique
  deviceIds     String[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  initiatedSessions Session[] @relation("Initiator")
  joinedSessions    Session[] @relation("Partner")
}

// 测评会话
model Session {
  id            String    @id @default(cuid())
  inviteCode    String    @unique
  
  // 测评模式
  mode          TestMode
  stage         Stage
  status        SessionStatus @default(WAITING_PARTNER)
  
  // 发起者
  initiatorId   String?
  initiator     User?     @relation("Initiator", fields: [initiatorId], references: [id])
  initiatorDeviceId String
  initiatorName String
  initiatorAnswers Json?
  initiatorCompletedAt DateTime?
  
  // 参与者
  partnerId     String?
  partner       User?     @relation("Partner", fields: [partnerId], references: [id])
  partnerDeviceId String?
  partnerName   String?
  partnerAnswers Json?
  partnerCompletedAt DateTime?
  
  // 结果
  result        Result?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  expiresAt     DateTime
}

// 测评结果
model Result {
  id            String    @id @default(cuid())
  sessionId     String    @unique
  session       Session   @relation(fields: [sessionId], references: [id])
  
  overallScore  Int
  dimensions    Json
  
  initiatorAttachment AttachmentType
  partnerAttachment   AttachmentType
  
  initiatorLoveLanguage LoveLanguage
  partnerLoveLanguage   LoveLanguage
  
  // 通用版额外维度
  initiatorTraits Json?    // 性格特质得分
  partnerTraits   Json?
  
  reportBasic   Json?
  reportStandard Json?
  reportPremium Json?
  
  purchasedTier ReportTier @default(FREE)
  
  createdAt     DateTime  @default(now())
}

// 订单表
model Order {
  id            String    @id @default(cuid())
  resultId      String
  deviceId      String
  userId        String?
  
  tier          ReportTier
  amount        Int
  status        OrderStatus @default(PENDING)
  
  paymentMethod PaymentMethod?
  paymentId     String?
  paidAt        DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 枚举定义
enum TestMode {
  UNIVERSAL     // 通用版
  STAGED        // 阶段版
}

enum Stage {
  UNIVERSAL     // 通用
  AMBIGUOUS     // 暧昧期
  ROMANCE       // 热恋期
  STABLE        // 稳定期
}

enum SessionStatus {
  WAITING_PARTNER
  IN_PROGRESS
  COMPLETED
  EXPIRED
}

enum AttachmentType {
  SECURE
  ANXIOUS
  AVOIDANT
  FEARFUL
}

enum LoveLanguage {
  WORDS
  TIME
  GIFTS
  SERVICE
  TOUCH
}

enum ReportTier {
  FREE
  STANDARD
  PREMIUM
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  WECHAT
  ALIPAY
}
```

---

## 题目设计

### 通用版题目（1-7 李克特量表）

```typescript
// lib/questions-universal.ts

interface UniversalQuestion {
  id: number;
  category: 'attachment' | 'loveLanguage' | 'communication' | 'values' | 'personality' | 'conflict';
  text: string;
  // 1-7 分别对应的得分权重
  scoring: {
    dimension: string;
    weights: number[]; // [1分权重, 2分权重, ..., 7分权重]
  }[];
}

// 答案选项（所有题目通用）
const universalOptions = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '有点不符合' },
  { value: 4, label: '不确定' },
  { value: 5, label: '有点符合' },
  { value: 6, label: '比较符合' },
  { value: 7, label: '完全符合' },
];

// 示例题目
const universalQuestions: UniversalQuestion[] = [
  // === 依恋类型题目 ===
  {
    id: 1,
    category: 'attachment',
    text: '我很容易与伴侣建立亲密关系',
    scoring: [
      { dimension: 'attachment_secure', weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: 'attachment_avoidant', weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 2,
    category: 'attachment',
    text: '我经常担心伴侣不是真的爱我',
    scoring: [
      { dimension: 'attachment_anxious', weights: [0, 0, 0, 1, 2, 3, 4] },
      { dimension: 'attachment_secure', weights: [4, 3, 2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 3,
    category: 'attachment',
    text: '当关系变得太亲密时，我会感到不自在',
    scoring: [
      { dimension: 'attachment_avoidant', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 4,
    category: 'attachment',
    text: '我需要伴侣经常确认对我的感情',
    scoring: [
      { dimension: 'attachment_anxious', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 5,
    category: 'attachment',
    text: '我相信伴侣在我需要时会支持我',
    scoring: [
      { dimension: 'attachment_secure', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },

  // === 爱的语言题目 ===
  {
    id: 6,
    category: 'loveLanguage',
    text: '伴侣的赞美和鼓励让我感到被爱',
    scoring: [
      { dimension: 'love_words', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 7,
    category: 'loveLanguage',
    text: '我很看重与伴侣单独相处的时间',
    scoring: [
      { dimension: 'love_time', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 8,
    category: 'loveLanguage',
    text: '收到伴侣精心准备的礼物让我很开心',
    scoring: [
      { dimension: 'love_gifts', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 9,
    category: 'loveLanguage',
    text: '伴侣帮我做事让我感到被关心',
    scoring: [
      { dimension: 'love_service', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 10,
    category: 'loveLanguage',
    text: '我喜欢与伴侣有身体上的亲近（拥抱、牵手等）',
    scoring: [
      { dimension: 'love_touch', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },

  // === 沟通风格题目 ===
  {
    id: 11,
    category: 'communication',
    text: '我会主动与伴侣分享我的想法和感受',
    scoring: [
      { dimension: 'comm_openness', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 12,
    category: 'communication',
    text: '我善于倾听伴侣的心声',
    scoring: [
      { dimension: 'comm_listening', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 13,
    category: 'communication',
    text: '遇到分歧时，我倾向于直接表达不满',
    scoring: [
      { dimension: 'comm_direct', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },

  // === 价值观题目 ===
  {
    id: 14,
    category: 'values',
    text: '我认为家庭比事业更重要',
    scoring: [
      { dimension: 'value_family', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 15,
    category: 'values',
    text: '我对金钱的态度是能省则省',
    scoring: [
      { dimension: 'value_frugal', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 16,
    category: 'values',
    text: '我认为双方应该保持一定的个人空间',
    scoring: [
      { dimension: 'value_independence', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },

  // === 冲突处理题目 ===
  {
    id: 17,
    category: 'conflict',
    text: '吵架后，我需要时间独处冷静',
    scoring: [
      { dimension: 'conflict_withdraw', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },
  {
    id: 18,
    category: 'conflict',
    text: '我会主动道歉来化解矛盾',
    scoring: [
      { dimension: 'conflict_repair', weights: [0, 0, 0, 1, 2, 3, 4] },
    ],
  },

  // ... 继续添加到 38 题
];

export { universalQuestions, universalOptions };
```

### 阶段版题目（A/B/C/D 选项）

```typescript
// lib/questions-staged.ts

interface StagedQuestion {
  id: number;
  stages: Stage[];  // 适用阶段
  category: string;
  text: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
    scores: Record<string, number>;
  }[];
}

// 示例题目
const stagedQuestions: StagedQuestion[] = [
  {
    id: 1,
    stages: ['AMBIGUOUS', 'ROMANCE', 'STABLE'],
    category: 'attachment',
    text: '当你感到压力很大时，你更希望伴侣：',
    options: [
      { 
        key: 'A', 
        text: '给我空间，让我自己消化', 
        scores: { attachment_avoidant: 2 } 
      },
      { 
        key: 'B', 
        text: '主动关心我，陪在我身边', 
        scores: { attachment_secure: 2 } 
      },
      { 
        key: 'C', 
        text: '我会反复确认TA是否还在乎我', 
        scores: { attachment_anxious: 2 } 
      },
      { 
        key: 'D', 
        text: '我不确定自己想要什么', 
        scores: { attachment_fearful: 2 } 
      },
    ],
  },
  
  // 暧昧期专属题目
  {
    id: 101,
    stages: ['AMBIGUOUS'],
    category: 'attraction',
    text: '你们目前的互动频率是：',
    options: [
      { key: 'A', text: '每天都会联系', scores: { attraction: 4 } },
      { key: 'B', text: '隔天联系一次', scores: { attraction: 3 } },
      { key: 'C', text: '一周几次', scores: { attraction: 2 } },
      { key: 'D', text: '偶尔联系', scores: { attraction: 1 } },
    ],
  },

  // 热恋期专属题目
  {
    id: 201,
    stages: ['ROMANCE'],
    category: 'commitment',
    text: '你们是否讨论过未来：',
    options: [
      { key: 'A', text: '经常讨论，有明确计划', scores: { commitment: 4 } },
      { key: 'B', text: '偶尔提及', scores: { commitment: 3 } },
      { key: 'C', text: '很少谈', scores: { commitment: 2 } },
      { key: 'D', text: '从不讨论', scores: { commitment: 1 } },
    ],
  },

  // 稳定期专属题目
  {
    id: 301,
    stages: ['STABLE'],
    category: 'gottman',
    text: '当你们有分歧时，通常如何解决：',
    options: [
      { key: 'A', text: '平和讨论，找到共识', scores: { gottman_repair: 4 } },
      { key: 'B', text: '一方妥协', scores: { gottman_repair: 2 } },
      { key: 'C', text: '冷战一段时间', scores: { gottman_repair: 1 } },
      { key: 'D', text: '经常升级为激烈争吵', scores: { gottman_contempt: 3 } },
    ],
  },

  // ... 更多题目
];

export { stagedQuestions };
```

---

## 计分逻辑

### 通用版计分

```typescript
// lib/scoring-universal.ts

interface UniversalScores {
  // 依恋类型得分
  attachment: {
    secure: number;
    anxious: number;
    avoidant: number;
    fearful: number;
  };
  // 爱的语言得分
  loveLanguage: {
    words: number;
    time: number;
    gifts: number;
    service: number;
    touch: number;
  };
  // 沟通风格得分
  communication: {
    openness: number;
    listening: number;
    direct: number;
  };
  // 价值观得分
  values: {
    family: number;
    frugal: number;
    independence: number;
  };
  // 冲突处理得分
  conflict: {
    withdraw: number;
    repair: number;
  };
}

function calculateUniversalScores(answers: { questionId: number; value: number }[]): UniversalScores {
  const scores: UniversalScores = {
    attachment: { secure: 0, anxious: 0, avoidant: 0, fearful: 0 },
    loveLanguage: { words: 0, time: 0, gifts: 0, service: 0, touch: 0 },
    communication: { openness: 0, listening: 0, direct: 0 },
    values: { family: 0, frugal: 0, independence: 0 },
    conflict: { withdraw: 0, repair: 0 },
  };

  for (const answer of answers) {
    const question = universalQuestions.find(q => q.id === answer.questionId);
    if (!question) continue;

    for (const scoring of question.scoring) {
      const weight = scoring.weights[answer.value - 1]; // value 1-7 对应 index 0-6
      const [category, dimension] = scoring.dimension.split('_');
      
      if (scores[category] && dimension in scores[category]) {
        scores[category][dimension] += weight;
      }
    }
  }

  return scores;
}

function determineAttachmentType(scores: UniversalScores['attachment']): AttachmentType {
  const { secure, anxious, avoidant, fearful } = scores;
  const max = Math.max(secure, anxious, avoidant, fearful);
  
  if (max === secure) return 'SECURE';
  if (max === anxious) return 'ANXIOUS';
  if (max === avoidant) return 'AVOIDANT';
  return 'FEARFUL';
}

function determineLoveLanguage(scores: UniversalScores['loveLanguage']): LoveLanguage {
  const entries = Object.entries(scores);
  const [topLanguage] = entries.sort((a, b) => b[1] - a[1])[0];
  
  const mapping = {
    words: 'WORDS',
    time: 'TIME',
    gifts: 'GIFTS',
    service: 'SERVICE',
    touch: 'TOUCH',
  };
  
  return mapping[topLanguage] as LoveLanguage;
}

function calculateCompatibility(
  scoresA: UniversalScores,
  scoresB: UniversalScores
): number {
  let totalScore = 0;
  let totalWeight = 0;

  // 依恋类型契合度（权重 30%）
  const attachmentCompat = calculateAttachmentCompatibility(
    scoresA.attachment,
    scoresB.attachment
  );
  totalScore += attachmentCompat * 0.3;
  totalWeight += 0.3;

  // 爱的语言契合度（权重 25%）
  const loveLanguageCompat = calculateVectorSimilarity(
    Object.values(scoresA.loveLanguage),
    Object.values(scoresB.loveLanguage)
  );
  totalScore += loveLanguageCompat * 0.25;
  totalWeight += 0.25;

  // 沟通风格契合度（权重 20%）
  const commCompat = calculateVectorSimilarity(
    Object.values(scoresA.communication),
    Object.values(scoresB.communication)
  );
  totalScore += commCompat * 0.2;
  totalWeight += 0.2;

  // 价值观契合度（权重 15%）
  const valuesCompat = calculateVectorSimilarity(
    Object.values(scoresA.values),
    Object.values(scoresB.values)
  );
  totalScore += valuesCompat * 0.15;
  totalWeight += 0.15;

  // 冲突处理契合度（权重 10%）
  const conflictCompat = calculateConflictCompatibility(
    scoresA.conflict,
    scoresB.conflict
  );
  totalScore += conflictCompat * 0.1;
  totalWeight += 0.1;

  return Math.round((totalScore / totalWeight) * 100);
}

// 向量相似度计算（余弦相似度）
function calculateVectorSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return (dotProduct / (magnitudeA * magnitudeB) + 1) / 2; // 归一化到 0-1
}

export { 
  calculateUniversalScores, 
  determineAttachmentType, 
  determineLoveLanguage,
  calculateCompatibility 
};
```

---

## API 设计

### 基础路径
`/api/v1/...`

### 1. 开始测评

#### POST /api/v1/quiz/start

```typescript
// 请求
{
  "deviceId": "dev_xxx",
  "mode": "UNIVERSAL" | "STAGED",
  "stage": "UNIVERSAL" | "AMBIGUOUS" | "ROMANCE" | "STABLE",
  "nickname": "小红"
}

// 响应
{
  "sessionId": "xxx",
  "inviteCode": "ABC123",
  "questions": [...],  // 根据 mode 和 stage 返回对应题目
  "questionCount": 38,
  "answerType": "scale" | "choice",  // scale=1-7, choice=ABCD
  "expiresAt": "2025-02-03T12:00:00Z"
}
```

### 2. 提交答案

#### POST /api/v1/quiz/submit

```typescript
// 通用版请求
{
  "sessionId": "xxx",
  "deviceId": "xxx",
  "answers": [
    { "questionId": 1, "value": 5 },  // 1-7
    { "questionId": 2, "value": 3 },
    // ...
  ]
}

// 阶段版请求
{
  "sessionId": "xxx",
  "deviceId": "xxx",
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": "C" },
    // ...
  ]
}
```

### 3. 其他 API（不变）

- `POST /api/v1/quiz/join` - 加入测评
- `GET /api/v1/quiz/status/:sessionId` - 查询状态
- `GET /api/v1/result/:sessionId` - 获取结果
- `GET /api/v1/history` - 历史记录

---

## 页面结构

```
app/
├── page.tsx                    # 首页（含通用版+阶段版选择）
├── quiz/
│   ├── page.tsx                # 选择模式 + 输入昵称
│   └── [sessionId]/
│       └── page.tsx            # 答题页（根据 mode 显示不同 UI）
├── result/
│   └── [sessionId]/
│       └── page.tsx            # 结果页
├── history/
│   └── page.tsx                # 历史记录
└── api/
    └── v1/
        ├── quiz/
        │   ├── start/route.ts
        │   ├── join/route.ts
        │   ├── submit/route.ts
        │   └── status/[sessionId]/route.ts
        └── result/
            └── [sessionId]/route.ts
```

---

## 首页布局设计

```
┌─────────────────────────────────────────────────────────────┐
│  导航栏                                                      │
│  Logo(合拍吗)                    历史记录 | 输入邀请码        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                       Hero 区域                              │
│                                                             │
│                    我们合拍吗？                              │
│              用科学的方式，读懂你们的爱情密码                  │
│                                                             │
│         30,000+ 对情侣  |  78.5% 契合度  |  96% 好评         │
│                                                             │
│                     [开始探索 ↓]                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    选择测评方式                              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  🎯 通用版                               推荐新用户    │ │
│  │                                                        │ │
│  │  不确定关系阶段？没关系！                               │ │
│  │  38题全面测评，1-7分作答，适合任何阶段的你们            │ │
│  │                                                        │ │
│  │  ⏱ 约8分钟                              ¥12.9 起      │ │
│  │                                                        │ │
│  │                                      [开始测评]        │ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│                    ─── 或按阶段选择 ───                      │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │                 │ │                 │ │                 ││
│  │    💗 暧昧期    │ │   💕 热恋期     │ │   💑 稳定期     ││
│  │                 │ │    最多人选     │ │                 ││
│  │   还在互相了解   │ │   确定关系中    │ │  1年+/同居/已婚 ││
│  │                 │ │                 │ │                 ││
│  │   25题·约5分钟  │ │  32题·约7分钟  │ │  40题·约10分钟 ││
│  │                 │ │                 │ │                 ││
│  │    ¥9.9 起     │ │    ¥14.9 起    │ │    ¥19.9 起    ││
│  │                 │ │                 │ │                 ││
│  │   [开始测试]    │ │   [开始测试]    │ │   [开始测试]    ││
│  │                 │ │                 │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   基于经典心理学理论                          │
│                    科学严谨，专业可靠                         │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   🔗 依恋理论   │ │   💬 爱的语言   │ │  📊 Gottman研究 ││
│  │                 │ │                 │ │                 ││
│  │  理解双方在亲   │ │  解码彼此表达   │ │  基于数十年婚   ││
│  │  密关系中的依   │ │  与接收爱的独   │ │  姻研究，预测   ││
│  │  恋模式...     │ │  特方式...      │ │  关系健康度...  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   专业详细的分析报告                          │
│                  深度解读，助你们更好地成长                    │
│                                                             │
│  ┌─────────────────────────┬───────────────────────────────┐│
│  │                         │                               ││
│  │    ┌─────────────┐      │  ✨ 契合度总览                ││
│  │    │             │      │     整体评分与关系健康指数     ││
│  │    │    85%      │      │                               ││
│  │    │   ○○○○○     │      │  🛡️ 依恋类型配对              ││
│  │    │             │      │     深入分析双方依恋模式       ││
│  │    └─────────────┘      │                               ││
│  │                         │  📈 成长建议                   ││
│  │  依恋契合  沟通风格  价值观 │     针对性的关系提升指南       ││
│  │    高       中       高   │                               ││
│  │                         │                               ││
│  └─────────────────────────┴───────────────────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         Footer                              │
│         © 2026 合拍吗 hepaima.com | 隐私政策 | 服务条款      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 答题页 UI 差异

### 通用版（1-7 量表）

```
┌─────────────────────────────────────────────────────────────┐
│  合拍吗          通用版测评           15/38                  │
│                                                             │
│  ████████████████░░░░░░░░░░░░░░░  39%                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     我很容易与伴侣建立亲密关系                                │
│                                                             │
│     完全                                          完全      │
│     不符合                                        符合      │
│                                                             │
│       1     2     3     4     5     6     7                │
│       ○     ○     ○     ○     ●     ○     ○                │
│                                                             │
│              [上一题]          [下一题]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 阶段版（A/B/C/D 选项）

```
┌─────────────────────────────────────────────────────────────┐
│  合拍吗          热恋期             12/32                   │
│                                                             │
│  ██████████████░░░░░░░░░░░░░░░░░  38%                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     当你感到压力很大时，你更希望伴侣：                        │
│                                                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │  A  给我空间，让我自己消化                        │    │
│     └─────────────────────────────────────────────────┘    │
│     ┌─────────────────────────────────────────────────┐    │
│     │  B  主动关心我，陪在我身边                  ✓    │    │
│     └─────────────────────────────────────────────────┘    │
│     ┌─────────────────────────────────────────────────┐    │
│     │  C  我会反复确认TA是否还在乎我                   │    │
│     └─────────────────────────────────────────────────┘    │
│     ┌─────────────────────────────────────────────────┐    │
│     │  D  我不确定自己想要什么                         │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│              [上一题]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 报告等级（更新）

| 内容 | 免费版 | 标准版 | 深度版 |
|------|--------|--------|--------|
| **通用版价格** | 免费 | ¥19.9 | ¥39.9 |
| **阶段版价格** | 免费 | ¥14.9 | ¥29.9 |
| 契合度总分 | ✅ | ✅ | ✅ |
| 依恋类型 | ✅ 仅类型 | ✅ 含分析 | ✅ 深度 |
| 爱的语言 | ✅ 仅类型 | ✅ 含分析 | ✅ 深度 |
| 五维雷达图 | ❌ | ✅ | ✅ |
| 沟通风格分析 | ❌ | ✅ | ✅ |
| 价值观匹配 | ❌ | ✅ | ✅ |
| AI 深度解读 | ❌ | ❌ | ✅ |
| 成长建议 | ❌ | ✅ 基础 | ✅ 详细 |
| 情侣任务卡 | ❌ | ❌ | ✅ |
| Gottman 指标 | ❌ | ❌ | ✅ 稳定期 |

---

## 开发顺序

### 第一阶段：核心流程（1-2周）
1. ⬜ 项目初始化
2. ⬜ 首页（V0生成）
3. ⬜ 答题页 - 通用版 UI
4. ⬜ 答题页 - 阶段版 UI
5. ⬜ 题目数据整理
6. ⬜ 开始/提交 API
7. ⬜ 邀请码流程
8. ⬜ 结果页（基础版）

### 第二阶段：AI 报告（1周）
1. ⬜ DeepSeek API 对接
2. ⬜ 计分逻辑实现
3. ⬜ 报告生成
4. ⬜ 结果页完善

### 第三阶段：完善（1周）
1. ⬜ 历史记录
2. ⬜ 分享功能
3. ⬜ 部署上线

### 第四阶段：支付（后续）
1. ⬜ 微信支付
2. ⬜ 支付宝支付

---

## V0 Prompt 示例

### 首页

```
创建情侣契合度测评产品"合拍吗"的首页。

技术栈：Next.js 15 App Router + TypeScript + Shadcn UI + Tailwind CSS + Framer Motion + Lucide Icons

设计风格：
- 温暖浪漫但不俗气
- 主色：粉色 #EC4899，紫色 #8B5CF6
- 背景：#FAFAFA
- 移动端优先

页面结构：
1. 导航栏：Logo "合拍吗"（渐变） + 历史记录 + 输入邀请码

2. Hero：标题 + 副标题 + 社会证明 + CTA按钮

3. 测评方式选择：
   - 通用版大卡片（推荐标签）：38题，1-7量表，¥12.9起，约8分钟
   - 分隔线 "或按阶段选择"
   - 三个阶段小卡片横排：暧昧期/热恋期(最多人选)/稳定期

4. 科学背书：三个理论卡片

5. 报告预览：契合度圆环 + 功能点

6. Footer
```

### 答题页（通用版）

```
创建通用版答题页，使用 1-7 李克特量表。

技术栈：Next.js 15 + TypeScript + Shadcn UI + Tailwind CSS + Framer Motion

设计要求：
- 顶部：Logo + "通用版测评" + 进度 (15/38)
- 进度条：渐变色
- 题目：居中显示
- 答案：1-7 圆形选项，横向排列
- 两端标签：完全不符合 ←→ 完全符合
- 选中效果：放大 + 渐变色填充
- 底部：上一题/下一题按钮
- 动画：题目切换淡入淡出
```

---

*文档版本：v2.0*
*最后更新：2025年2月*
