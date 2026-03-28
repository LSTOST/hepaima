# 合拍吗 · 产品需求文档（PRD）

## 文档信息

| 项目 | 说明 |
|------|------|
| 产品名称 | 合拍吗 |
| 域名 | hepaima.com |
| 定位 | 基于心理学的亲密关系自我觉察与双人契合测评工具 |
| 文档版本 | v3.1 |
| 最后更新 | 2026 年 3 月 28 日 |

### 文档修订记录（摘要）

| 版本 | 说明 |
|------|------|
| **v3.1** | **补录第三幕专章**：产品线在 **v2.0 前后已上线**「现实场景双人专题」（`SCENARIO`），此前 PRD 未单独成章；本版按仓库实现写清专题清单、流程、接口与和第二幕的差异。同步 `TestMode` 含 `PERSONAL`、`POST /quiz/start` 请求体等与代码一致。 |
| **v3.0** | 第一幕个人自测（`PERSONAL`）与首页三幕信息架构写入 PRD；三幕叙事定型。 |
| **v2.0（产品里程碑，PRD 曾滞后）** | **第三幕**：新增双人现实场景专题量表（`mode=SCENARIO` + `scenarioSlug`）、专题计分与结果页差异化（场上焦点、题脉、场景向 AI 与付费「场景深度包」）。第二幕通用版 / 阶段版能力保持不变。 |

---

## 一、产品愿景与三幕用户旅程

### 1.1 核心设想

产品按时间线组织为 **三幕**，使用户路径完整、自然：

| 幕 | 用户问题 | 产品回答 | 与现有能力的关系 |
|----|----------|----------|------------------|
| **第一幕：进入关系前** | 我是否大致准备好进入一段认真的亲密关系？我在亲密、沟通、冲突里通常是什么模式？ | **个人向**自测与解读（自我觉察，非诊断、非评判「能不能谈恋爱」） | **已上线 MVP**（`PERSONAL`）：首页三卡 → `/quiz?mode=PERSONAL&personalSlug=…` 昵称页（与第二幕同版式）→ `/quiz/[sessionId]?mode=PERSONAL` → `/ready/result/[sessionId]`；三条各 5 题 1–5 分、模板化 `reportBasic`、全免费 |
| **第二幕：进入关系后** | 我们合不合拍？在依恋、爱的语言、多维度上如何互补或张力在哪？ | **双人**通用版 / 阶段版测评 + 简版 AI + 付费深度报告 | **已上线**（`UNIVERSAL` / `STAGED`） |
| **第三幕：在一起之后** | 在具体生活场景里（沟通、钱、家务、争吵修复等）卡在哪？可以怎么练？ | **双人**现实场景专题量表（1–5 分）+ 场景向报告与「场景深度包」 | **已上线**（`SCENARIO` + `scenarioSlug`） |

叙事一句话：

> **先更了解自己 → 再一起看合拍 → 再按场景练对接与修复。**

引流可以是副产品；**完整性**来自三幕因果链本身。第一幕上线后，首页与文案宜明确这条时间线，避免三个入口看起来像互不相关的产品。

### 1.2 设计原则（第一幕规划用）

- **自我觉察优先**：避免「没准备好就别谈」类羞辱性表述；强调模式与选择，而非道德打分。
- **理论对齐**：尽量与第二幕共用或可对照的心理学语言（如依恋、沟通、冲突脚本），便于用户从「我的模式」过渡到「我们的配对」。
- **合规**：不构成心理咨询、医疗或法律意见；显著免责。

---

## 二、技术栈与工程现状

| 层级 | 技术选型（以仓库为准） |
|------|------------------------|
| 前端 | Next.js 16（App Router）+ TypeScript + Tailwind CSS 4 + Shadcn UI（New York）+ Framer Motion + Lucide |
| 后端 | Next.js Route Handlers（`/api/v1/...`） |
| 数据库 | PostgreSQL + Prisma ORM |
| AI | DeepSeek API（报告生成，见 `src/lib/ai.ts` 等） |
| 支付 | 微信支付、支付宝（订单与回调以 `src/app/api/v1/orders/` 等为准） |
| 部署 | 以实际上线环境为准（文档历史版本曾记 Zeabur / 阿里云；亦可使用 Vercel 等） |

### 多端规划（不变）

- **当前**：Web，以 `deviceId` 区分设备（见 `src/lib/device.ts`）。
- **后续**：微信小程序、App（需账号体系）；API 设计保持可复用。

**权威数据源**：数据库结构与枚举以 `prisma/schema.prisma` 为准；题目与计分以 `src/lib/` 下对应模块为准。本文档中的代码块仅为说明性摘录，若与仓库不一致，以仓库为准。

---

## 三、产品模式与测评类型

### 3.1 测评 `mode`（已实现）

| `mode` | 名称 | 说明 | 题目来源（代码） |
|--------|------|------|------------------|
| `PERSONAL` | 第一幕 · 个人自测（三条独立测评） | 单人 1–5 分；`Session.personalSlug` 区分子测评：`trust_connect`（亲密与连接）、`conflict_boundary`（冲突与边界）、`commit_readiness`（承诺与心理准备）；各 5 题、独立计分与报告；`stage` 固定 `UNIVERSAL`；无需对方加入 | `src/lib/personal-readiness/`（`tracks.ts` + `questions.ts`） |
| `UNIVERSAL` | 通用版 | 不区分关系阶段，1–7 李克特量表 | `src/lib/questions-universal.ts` |
| `STAGED` | 阶段版 | 暧昧 / 热恋 / 稳定，选择题 | `src/lib/questions.ts` 等 |
| `SCENARIO` | 现实场景专题（第三幕） | 按生活场景选题，双人各答同一套 1–5 分量表；`stage` 在实现中固定映射为 `ROMANCE`，以 `scenarioSlug` 区分专题 | `src/lib/scenario-quizzes.ts`、`src/lib/scoring-scenario.ts` |

### 3.2 第三幕 · 现实场景专题（`SCENARIO`）— 产品说明

> **背景**：第三幕为 **v2.0 级产品增量**（相对「仅第二幕双人测评」），此前未在 PRD 中单列；以下以当前代码为权威描述。

**与第二幕的差异（用户价值）**

- **第二幕**（`UNIVERSAL` / `STAGED`）：关系整体契合 — 依恋、爱的语言、多维度互补或张力；题目为通用版量表或分阶段选择题。
- **第三幕**（`SCENARIO`）：**具体生活议题** — 沟通、修复、信任、亲密节奏、金钱、家务等；双方答**同一专题**的同一套题干，结果页强调与本专题一致的「场上焦点」、按维度的**题脉**（各维在本专题中的题目数见 `getScenarioDimensionQuestionCounts`），以及 **AI 场景复盘**（文案与模块与第二幕「契合解读」区分）。

**专题清单（6 套，代码常量 `SCENARIO_DEFINITIONS`）**

| `scenarioSlug` | 展示标题 | 副标题（摘要） | 题量 | 约时 |
|----------------|----------|----------------|------|------|
| `daily_communication` | 日常沟通与倾听 | 线上回复、打断与情绪是否被接住 | 10 题 | 约 5 分钟 |
| `conflict_repair` | 争吵与修复 | 冷战、道歉与和好方式 | 10 题 | 约 5 分钟 |
| `trust_boundaries` | 信任与个人边界 | 社交、隐私与报备的舒适度 | 10 题 | 约 5 分钟 |
| `intimacy_rhythm` | 亲密与身体节奏 | 频率期待、拒绝与相互尊重 | 10 题 | 约 5 分钟 |
| `money_values` | 金钱观与消费 | 日常分摊、大额支出与储蓄观 | 10 题 | 约 5 分钟 |
| `chores_division` | 家务与分工 | 谁做多少、隐形劳动与公平感 | 10 题 | 约 5 分钟 |

**题型与计分**

- 每题为 **1–5 分**量表（完全不符合 → 完全符合），与第一幕个人自测刻度一致，与第二幕 1–7 通用版区分。
- 每题挂载 **六维之一**（`attachment` / `loveLanguage` / `communication` / `values` / `lifestyle` / `conflict`），用于题脉与计分；某维在本专题可能为 0 题，报告侧需处理「本题未测」类展示（见 `getScenarioDimensionQuestionCounts`）。
- 计分逻辑：`src/lib/scoring-scenario.ts`；题干与 slug 校验：`isValidScenarioSlug`。

**用户路径与入口 URL**

- 首页第三块专题卡片 → 链式入口为 **`/quiz?mode=SCENARIO&scenario=<slug>`**（查询参数名为 **`scenario`**，发起会话时请求体仍为 **`scenarioSlug`**）。
- 与第二幕相同：**填昵称 → 发起方答题 → 邀请码让对方加入 → 双方提交 → `result/[sessionId]`**（场景版式与阶段/通用不同）。

**数据与题目来源**

- `Session.mode = SCENARIO`，`Session.scenarioSlug` 存专题标识；题干**以代码为准**（`scenario-quizzes.ts`），`seed-questions-from-code` **不覆盖**场景题干。
- 答题页拉题：`GET /api/v1/quiz/scenario-questions?sessionId=...`（按会话上的 `scenarioSlug` 返回，避免客户端篡改 slug）。

**报告与付费**

- 免费层：契合向基础结果 + 场景化版块（场上焦点、题脉等，以页面为准）。
- 简版 AI：**场景复盘**导向，与第二幕简版 AI 区分。
- 付费：**场景深度包**（专题延伸分析与练习）；**不等同**第二幕完整阶段/通用深度报告；部分第二幕深度模块在场景结果下按代码分支隐藏（如 `attachmentDeep` / `relationshipForecast` 等，以 `result` 页实现为准）。

### 3.3 用户主路径（当前线上）

```
首页
  │
  ├─→ 第一幕（PERSONAL）→ 首页三卡 → `/quiz` 填昵称（`mode=PERSONAL&personalSlug`）→ 答题 → `/ready/result`（按子测评自测指数 + 模板解读）
  │
  ├─→ 通用版（UNIVERSAL）────→ 昵称 → 答题 → 等待对方 → 双人结果 / 报告
  │
  ├─→ 阶段版（STAGED）────────→ 选阶段 → 昵称 → 答题 → 等待对方 → 双人结果 / 报告
  │
  └─→ 现实场景（SCENARIO）────→ 选专题 → 昵称 → 答题 → 等待对方 → 场景结果页（含题干对照「场上焦点」、六维题脉、AI 场景复盘等）
```

### 3.4 第一幕实现说明

- 与双人共用 `Session` / `Result`，`TestMode.PERSONAL` + `Session.personalSlug` + `status` 单人闭环（发起即 `IN_PROGRESS`，提交后 `COMPLETED`）。新建个人会话须传合法 `personalSlug`；历史无 `slug` 的旧数据仍按 15 题全套兼容。  
- 邀请码加入对个人会话返回 400；历史记录与结果 API 按 `mode` / `personalSlug` 区分展示与跳转。

---

## 四、数据库设计（摘要）

完整定义见 **`prisma/schema.prisma`**。与早期 PRD 相比的主要增量：

- `Session.mode` 含 **`SCENARIO`** / **`PERSONAL`**；`Session.scenarioSlug` 表示专题；`Session.personalSlug` 表示第一幕子测评。
- `Session` 关联 **`Product`**（`productId`），产品数据来自库内配置而非硬编码。
- **订单 / 优惠码 / 兑换码**（`Order`、`PromoCode`、`RedeemCode` 等）支持支付与营销，以 schema 为准。
- `Result` 存 `dimensions`（JSON）、`reportBasic` / `reportStandard` / `reportPremium`、`purchasedTier` 等。

枚举 **`TestMode`**（以 `prisma/schema.prisma` 为准）：`UNIVERSAL` | `STAGED` | `SCENARIO` | `PERSONAL`。

---

## 五、题目与计分（文件索引）

| 内容 | 路径 |
|------|------|
| 通用版题目 | `src/lib/questions-universal.ts` |
| 分阶段题目 | `src/lib/questions.ts`（及题库拆分文件，以 import 为准） |
| 场景专题定义与题干 | `src/lib/scenario-quizzes.ts` |
| 通用 / 阶段计分与契合度 | `src/lib/scoring.ts` 等 |
| 场景专题计分 | `src/lib/scoring-scenario.ts` |
| 首页场景卡片摘要（slug / href） | `listScenarioSummariesForHome()`（`scenario-quizzes.ts`） |
| 种子数据（问卷入库） | `scripts/seed-questions-from-code.ts`（**不覆盖**场景题干；场景题以代码为准） |
| 场景报告 UI 辅助（题脉） | `src/lib/scenario-report-sections.ts` |

**说明**：通用版题量以 `universalQuestions` 数组长度为准；历史文档中的「38 题」等数字可能过期，**一律以代码为准**。

---

## 六、API 设计（要点）

基础路径：`/api/v1/...`

### 6.1 开始测评 `POST /api/v1/quiz/start`

请求体（核心字段）：

```typescript
{
  deviceId: string;
  nickname: string;
  mode: "UNIVERSAL" | "STAGED" | "SCENARIO" | "PERSONAL";
  stage?: "UNIVERSAL" | "AMBIGUOUS" | "ROMANCE" | "STABLE"; // STAGED 时必选合理值；SCENARIO 固定规范为 ROMANCE；UNIVERSAL / PERSONAL 为 UNIVERSAL
  scenarioSlug?: string;  // mode === "SCENARIO" 时必填且通过 isValidScenarioSlug
  personalSlug?: string;  // mode === "PERSONAL" 时必填且通过 isValidPersonalSlug（如 trust_connect）
  productSlug?: string;   // 默认 couple-compatibility
  usageId?: string;       // 兑换等场景
}
```

- `SCENARIO`：必须传入合法 **`scenarioSlug`**。  
- `PERSONAL`：必须传入合法 **`personalSlug`**（三条子测评之一）。  

### 6.2 其他接口（已实现，细节以路由为准）

- `POST /api/v1/quiz/join` — 加入会话  
- `POST /api/v1/quiz/submit` — 提交答案  
- `GET /api/v1/quiz/status/:sessionId` — 状态轮询  
- `GET /api/v1/quiz/preview` — 预览题目（若已启用）  
- `GET /api/v1/quiz/scenario-questions?sessionId=` — **第三幕**按会话返回专题题干（防篡改 slug）  
- `GET /api/v1/quiz/personal-questions?sessionId=&deviceId=` — 第一幕按会话与个人子类型返题（以路由为准）  
- `GET /api/v1/result/:sessionId` — 结果与报告数据  
- `GET /api/v1/result/:sessionId/report/stream` — 报告流式输出（若已启用）  
- 订单与支付：`/api/v1/orders/...`  

---

## 七、页面与路由（当前）

```
src/app/
├── page.tsx                      # 首页（三幕步骤：个人自测 + 阶段选择 + 场景专题等）
├── me/page.tsx                   # 重定向首页（旧链接兼容）
├── me/[personalSlug]/page.tsx    # 重定向 /quiz?mode=PERSONAL&personalSlug=…
├── ready/result/[sessionId]/     # 第一幕：个人自测结果（非双人结果页）
├── quiz/
│   ├── page.tsx                  # 开始测评 / 填昵称等
│   ├── join/page.tsx             # 输入邀请码加入
│   └── [sessionId]/page.tsx      # 答题（含 PERSONAL / Universal / Staged / Scenario UI）
├── result/[sessionId]/page.tsx   # 双人结果与报告（阶段 vs 场景版式不同）
└── api/v1/...
```

---

## 八、结果与报告（第二幕 / 第三幕）

### 8.1 阶段版 / 通用版（双人）

- 免费：总分、依恋与爱的语言类型、六维等（以实际页面为准）。  
- 简版 AI：契合向解读（文案见产品实现）。  
- 付费深度：更深分析、情景演练、周任务、沟通指南等；**不包含**场景专题下已隐藏模块的，以代码分支为准（如场景下对 `attachmentDeep` / `relationshipForecast` 等的处理）。

### 8.2 场景专题（双人 · 第三幕）

- 见 **§3.2**：六套专题、每套 10 题、1–5 分、六维题脉与 `scenario-questions` 拉题方式。  
- 结果页强调与本专题**题干一致**的「场上焦点」、按维度展示**题脉**、**AI 场景复盘**（与阶段版「契合解读」区分）。  
- 付费：**场景深度包**（专题向延伸分析与练习，**不等同**第二幕完整深度报告；部分第二幕深度模块在场景结果下隐藏，以代码为准）。

### 8.3 第一幕（个人自测 · MVP）

- 免费：自测指数（0–100）、五维条形、`reportBasic` 规则模板（`type: personal_readiness`）；不生成付费深度报告。  
- CTA：引导 `/quiz` 双人测评与首页阶段/场景入口。

---

## 九、付费与报告等级

历史上 PRD 中的价格档（通用 ¥12.9 / 阶段分档等）**可能已与现网不一致**。以下原则以代码与运营配置为准：

- 免费简版 + 付费解锁深度（微信支付 / 支付宝）。  
- 优惠码、兑换码逻辑见 `prisma` 与 `src/app/api` 实现。  

**建议**：在 PRD 中不再写死具体金额，或单独维护「运营价格表」链接/附录并定期同步。

---

## 十、首页与信息架构（方向）

当前首页已包含：**步骤 1 个人自测**、**步骤 2 按关系阶段选择**、通用版入口、**步骤 3 按现实场景选择** 等模块（见 `src/components/home/StageSelector.tsx`）。

**三幕对齐（现状）**：

1. **第一块**：先了解自己（三卡链至 `/quiz?mode=PERSONAL&personalSlug=…`）。  
2. **第二块**：双人合拍 — 通用版 + 阶段版。  
3. **第三块**：在一起之后 · 现实场景 — 专题卡片。

社会证明数据、Hero 文案以实际上线为准，需与法务/运营核对真实性。

---

## 十一、答题与报告 UI 要点

- **个人自测**：1–5 分量表（`PersonalReadinessQuiz`），题目来自 `GET /api/v1/quiz/personal-questions`（需 `sessionId`、`deviceId` 查询参数）。  
- **通用版**：1–7 量表，进度与动效（`UniversalQuiz` 等）。  
- **阶段版**：选项题 UI（`StagedQuizUI` 等）。  
- **场景版**：1–5 分场景量表（如 `ScenarioScaleQuiz`），与 `scenarioSlug` 对应文案。  

详细线框图可参考本文档历史版本或设计稿；实现以组件为准。

---

## 十二、开发阶段与状态（滚动维护）

### 已完成（核心）

- 项目脚手架、首页与测评入口  
- 通用版 / 阶段版全流程（开始、加入、答题、提交、结果）  
- 第三幕场景专题（`SCENARIO`、`scenarioSlug`、六套量表、计分、结果页差异化版块、`/quiz/scenario-questions`）— **v2.0 产品增量，PRD 于 v3.1 补录专章**  
- 第一幕个人自测（`PERSONAL`、题库与计分、个人结果页、首页三幕步骤）  
- AI 报告与流式/轮询（以当前实现为准；**不含** `PERSONAL` 单人链）  
- 支付与订单、优惠相关能力（以 schema 与 API 为准）  
- 设备 ID、邀请码、基础风控与文案免责  

### 进行中 / 待办（产品向）

- 第一幕迭代：分享策略、更细报告维度、可选 AI 润色等  
- 运营数据看板、转化漏斗（可选）  
- 微信小程序 / App（长期）  

### 数据与部署

- 新环境：`prisma migrate deploy` 必备。  
- `prisma db seed`：在**新库**或需把**代码中的通用/阶段题目**同步到 DB 时执行；脚本会重建部分问卷题目，**生产执行前需评估**；场景题干主要走代码，不一定依赖该 seed。

---

## 十三、附录：给设计与前端的 Brief 摘要（可选）

**品牌**：主色粉 `#EC4899`、紫 `#8B5CF6`；背景 `#FAFAFA` / `#FDF2F8`；中文文案；移动端优先，桌面最大宽度约 1000px。

**三幕文案方向**：

- 第一幕：了解自己、无评判、非诊断。  
- 第二幕：科学看合拍、双人同行。  
- 第三幕：真实场景、可练可聊。

---

*若本文与代码冲突，以仓库当前实现为准；重大产品变更请同步更新版本号、「文档修订记录」与「最后更新」日期。*
