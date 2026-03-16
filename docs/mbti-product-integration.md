# MBTI 测试产品与情侣契合度结合方案

## 一、目标

- **MBTI 作为独立产品**：用户可单独做 MBTI 测试，获得性格类型与解读，不依赖伴侣。
- **与情侣测评结合**：若用户做过 MBTI，在情侣契合度报告中可展示「你的 MBTI 与伴侣的搭配」等增值内容；两者数据互通但产品入口与流程独立。

## 二、现有架构简要

- **Product**：已有表，用 `slug` 区分（如 `couple-compatibility`），关联 Questionnaire、QuizTrait、ProductAiTemplate。
- **Session**：当前无 `productId`，仅支持情侣双人（mode/stage）；题目拉取、计分、报告均为「情侣单产品」逻辑。
- **Result**：情侣专用字段（overallScore、dimensions、AttachmentType、LoveLanguage、reportBasic/reportPremium 等）。

因此需要：**在 Session/Result 层引入「产品」维度**，并支持 **MBTI 单人完成** 与 **MBTI 专用计分/报告**。

---

## 三、数据模型改造

### 3.1 Session

- 新增 **`productId`**（`String?`，FK → Product）。  
  - 为兼容老数据可设为可选：`null` 视为默认情侣产品（或通过 slug 查 `couple-compatibility`）。
- MBTI 产品下：
  - **单人即可完成**：仅 initiator 答题，无需 partner；`partnerId`、`partnerDeviceId`、`partnerName`、`partnerAnswers`、`partnerCompletedAt` 均为空。
  - 当 `initiatorCompletedAt` 有值且 product 为 MBTI 时，即视为 `COMPLETED`，可生成结果。

### 3.2 Result

- 新增 **`productId`**（`String?`，FK → Product），与 Session 一致，便于按产品查结果。
- 情侣专用字段（`initiatorAttachment`、`partnerAttachment`、`initiatorLoveLanguage`、`partnerLoveLanguage`）在 MBTI 产品下可为空或存占位枚举，具体看 Prisma 是否允许 optional。
  - 若希望 schema 简单，可保持现有字段必填，MBTI 时写入固定占位值（如 SECURE / WORDS）；或改为可选（迁移时给老数据填默认值）。
- 新增 **`extraJson`**（`Json?`）：
  - MBTI 产品：存 `{ mbtiType: "INFP", dimensions: { E: 12, I: 8, S: 10, N: 14, T: 9, F: 15, J: 7, P: 17 } }` 等。
  - 情侣产品可留空。
- MBTI 的报告可复用 `reportBasic`（或单独 `reportMbti` 字段），用 ProductAiTemplate 区分模板；或报告内容统一放 `reportBasic`，通过 productId 区分展示逻辑。

### 3.3 用户维度 MBTI 结果（用于与情侣报告结合）

- **方案 A**：不新增表，通过「该 deviceId/user 最近一次 product=mbti 的 Result」得到 MBTI 类型。
- **方案 B**：在 **User** 上增加 `latestMbtiType`（`String?`），每次完成 MBTI 测评时更新，方便情侣报告生成时直接读。
- 推荐 **方案 A** 先做，后续若需要更快查询再加 User.latestMbtiType 或缓存。

---

## 四、产品与配置

- 在后台 **Product** 中新增一条：
  - `slug`: `mbti`
  - `name`: 「MBTI 性格测试」
  - 配置 MBTI 专用问卷（见下）、维度（E-I, S-N, T-F, J-P）、AI 报告模板。
- **Questionnaire**：productId = MBTI 产品，stage = `UNIVERSAL`（或单独一个 stage），题目为 MBTI 量表题（单选，选项对应 E/I、S/N、T/F、J/P 计分）。
- **QuizTrait**：MBTI 产品的 traits 可为 4 个维度或 16 类型，用于结果页展示。
- **ProductAiTemplate**：MBTI 的报告模板（生成「你是 INFP，主要特质是…」等），与情侣模板分开。

---

## 五、流程与路由

### 5.1 入口

- **首页**：保留「情侣契合度」主 CTA；增加第二入口「MBTI 性格测试」（卡片或导航），跳转 `/quiz?product=mbti` 或独立路径 `/mbti`（推荐 `/mbti` 便于 SEO 与分享）。
- `/mbti` 可做轻量落地页（介绍 + 开始按钮），点击后进入统一 quiz 流程并带上 `product=mbti`。

### 5.2 统一 Quiz 流程（按 product 分流）

- **创建会话**（`POST /api/v1/quiz/start`）：
  - 请求体增加 **`productSlug`**（如 `mbti` | `couple-compatibility`），若缺省则默认 `couple-compatibility`。
  - 根据 slug 查 Product，写入 **Session.productId**。
  - 若 product 为 MBTI：不生成邀请码、不要求伴侣，可选不展示「邀请伴侣」步骤。
- **题目拉取**（`GET /api/v1/quiz/universal-questions` 或按 session 的 staged）：
  - 请求增加 **sessionId** 或 **productSlug**；后端根据 **Session.productId**（或 productSlug）取对应 Product 的 Questionnaire 题目。
- **提交答案**（`POST /api/v1/quiz/submit`）：
  - 若 **Session.productId** 为 MBTI：仅校验 initiator 提交，即把 session 标为 COMPLETED，不再等待 partner。
  - 计分分支：若为 MBTI，走 MBTI 计分（四维 E-I, S-N, T-F, J-P → 得到 4 字母类型），写入 Result（overallScore 可存 0 或综合分，dimensions 存四维，extraJson 存 mbtiType + 细维度）。
  - 若为情侣：保持现有双方计分与报告逻辑。
- **结果页**（`/result/[sessionId]`）：
  - 根据 Result.productId 或 Session.productId 判断类型；
  - MBTI：展示 4 字母类型、维度雷达/条形图、AI 生成的 MBTI 解读（来自 reportBasic 或专用字段）；
  - 情侣：保持现有报告与付费解锁逻辑。

### 5.3 MBTI 计分

- 题目选项的 **scoringJson** 中为每个选项标明对 E/I、S/N、T/F、J/P 的加分（如 +1 E 或 +1 I）。
- 汇总每维两边得分，取字母（如 E>I 取 E），得到 4 字母类型（如 INFP），写入 **Result.extraJson** 及 dimensions。

---

## 六、与情侣报告的「结合」方式

- 在 **情侣报告生成**（如 `generateReport` / `generatePremiumReport`）时：
  - 根据 **initiatorDeviceId** / **partnerDeviceId**（或 userId）查询：是否存在 **productId = MBTI 产品** 的 Result，且为同一用户最近一次完成。
  - 若存在，取出 **extraJson.mbtiType**（或 dimensions 推算的类型），作为「用户 A 的 MBTI」「用户 B 的 MBTI」传入 AI 的 userPromptTemplate。
- 在 **情侣报告模板**（ProductAiTemplate）的 userPromptTemplate 中增加占位符，例如：`{{initiatorMbti}}`、`{{partnerMbti}}`；若未做过 MBTI 则传「未检测」或留空，prompt 中说明「若提供 MBTI 则增加性格搭配解读」。
- 这样既不影响未做 MBTI 的用户，又能在做过 MBTI 的情侣报告中自然出现「你们的 MBTI 搭配」等内容。

---

## 七、实现顺序建议

1. **Schema 迁移**：Session 增加 productId；Result 增加 productId、extraJson；情侣专用字段若改为可选需一并迁移默认值。
2. **Seed/后台**：新建 MBTI 产品（slug=mbti）、问卷、题目、Traits、AI 模板。
3. **API**：  
   - start：支持 productSlug，写 Session.productId；MBTI 时可不写邀请码逻辑。  
   - 题目接口：按 session 或 productSlug 拉对应产品题目。  
   - submit：按 Session.productId 分支；MBTI 单人完成即 COMPLETED，MBTI 计分写 Result + extraJson。
4. **前端**：  
   - 首页/导航增加「MBTI 测试」入口，进 `/mbti` 或 `/quiz?product=mbti`。  
   - quiz 开始页根据 product 显示不同标题/说明；MBTI 不展示「邀请伴侣」。  
   - result 页根据 productId 切换 MBTI 展示 vs 情侣报告展示。
5. **结合点**：情侣报告生成时查询两人 MBTI 结果并写入 prompt，更新情侣 AiTemplate 的 userPromptTemplate。

---

## 八、小结

- **MBTI 独立**：通过 Product + Session.productId + 单人完成 + MBTI 计分/报告实现，与情侣流程共用 Session/Result 但分支清晰。
- **与情侣结合**：在生成情侣报告时读取两人 MBTI（来自 Result + extraJson），通过 prompt 模板输出「MBTI 搭配」段落，无需改表即可扩展。
- 按上述顺序落地，即可在现有「合拍吗」架构上同时跑「情侣契合度」与「MBTI 性格测试」，并实现数据互通与报告联动。
