### 合拍吗 / peibupei 多产品与多站点规划总结

---

### 一、现有项目与可复用资产

1. **现有项目定位（`hepaima.com` / `hepaima.kyx123.com`）**
   - **产品**: 情侣契合度测试
   - **方向**: 情感关系 & 性格解读（依恋类型、爱的语言、关系维度）

2. **技术栈**
   - Next.js App Router + TypeScript
   - Tailwind CSS 4 + Shadcn UI
   - Prisma + PostgreSQL
   - DeepSeek（通过 OpenRouter）生成报告
   - 微信支付 / 支付宝 支付（线上已收款）
   - 部署方式:
     - 服务器: 阿里云 2 核 2G 内存，3Mbps 固定带宽
     - 代码目录: `/www/wwwroot/hepaima.kyx123.com`
     - 部署脚本: `scripts/deploy.sh` / `scripts/deploy-from-local.sh`
     - 流程: `git reset --hard origin/main` → `pnpm install --frozen-lockfile` → `rm -rf .next` → `pnpm build` → `pm2 restart hepaima`
     - 主访问域名: `https://hepaima.kyx123.com`（`hepaima.com` 做 301 永久重定向到此）

3. **可高度复用的「测评平台骨架」**
   - **数据库模型（Prisma）**:
     - `User / Session / Result / Order / RedeemCode / PromoCode / PaymentProviderConfig`
     - `SiteSettings / AnalyticsEvent / PageSeo / ContentBlock`
     - 测评抽象相关: `Product / ProductAiTemplate / Questionnaire / QuizQuestion / QuizQuestionOption / QuizTrait`
   - **测评链路**:
     - 创建会话: `POST /api/v1/quiz/start`
     - 获取题目: `GET /api/v1/quiz/universal-questions`（以及将来可扩展为按 Product 拉题）
     - 提交答案: `POST /api/v1/quiz/submit`（写入答案、规则计分、创建 `Result` 记录、异步触发 AI 生成基础/深度报告）
     - 获取结果状态与数据: `GET /api/v1/result/[sessionId]`
     - 报告流式生成兜底: `GET /api/v1/result/[sessionId]/report/stream`
   - **前端 / 组件**:
     - 通用布局: `RootLayout`、`AnalyticsProvider`
     - 首页模块: `Navbar / Hero / StageSelector / TrustSection / ReportPreview / BottomCTA / Footer`
     - 测评 UI:
       - `components/quiz/UniversalQuiz.tsx`（1–7 量表题型、进度条、动效、断点恢复）
     - UI 基础库: `components/ui/*`（Button / Card / Input / Tabs / Dialog / Progress 等）

---

### 二、新项目规划：职业 / 城市测评（归属 peibupei 品牌）

1. **新站点与品牌定位**
   - `hepaima` 品牌: 情感关系 & 性格解读（情侣契合度等）
   - `peibupei` 品牌: 职业选择 / 城市选择 / 自我探索类测评
   - 计划域名:
     - 已备案主域: `kyx123.com`
     - 现有线上入口: `https://hepaima.kyx123.com`（APP_URL 指向这里）
     - 计划新增入口: `https://peibupei.kyx123.com`
     - 品牌域名:
       - `hepaima.com` → 已做 301 到 `hepaima.kyx123.com`
       - `peibupei.com` → 未来做 301 到 `peibupei.kyx123.com`

2. **两个独立产品（均在 peibupei 站点下）**
   - `career-fit`: 职业适配测评
   - `city-fit`: 城市生活适配测评
   - 单人测评（不走情侣双人 Session 流程）

3. **收费设计**
   - 免费基础报告:
     - 画像摘要（1 句话）
     - 维度分布（条形/雷达）
     - 推荐 TopN（职业方向 Top5 / 城市 Top10）+ 简要匹配理由 + 简要建议
   - 付费深度报告:
     - 维度深度解析
     - 细分职业/城市方案
     - 权衡建议与风险清单
     - 4 周/30 天行动计划
   - 复用现有微信/支付宝支付体系与订单模型

4. **结果生成策略（已确认的「折中方案」）**
   - **规则层（Rule Engine）负责「结论与排序」**:
     - 题目 → 维度原始分数 → 归一化 0–100 得到 `dimensionScores`
     - 对每个「职业方向」/「城市类型」/「具体城市」定义权重 `weights`:
       - `fitScore = Σ(dimensionScore[key] * weight[key])`
     - 选出 TopN 推荐项，排序锁定
     - 生成结构化的要点:
       - 匹配点（whyFitBullets）
       - 注意点（watchOutBullets）
       - 行动建议（nextStepsBullets）
       - 画像 bullet 列表（personaBullets）
   - **AI 层（DeepSeek）负责「表达与扩写」**:
     - 输入 payload 为规则层产出的结构化 JSON（RuleEngineOutput）
     - 按约定 JSON Schema 输出:
       - 免费报告: `careerReportBasic` / `cityReportBasic`
       - 付费报告: `careerReportPremium` / `cityReportPremium`
     - 严格要求:
       - 不得改变规则层提供的 TopN 名单和顺序
       - 不得引入 payload 外的「新结论」作为核心推荐
       - 只能扩写/组织结构化要点，增加示例与行动步骤
     - 利用 `ProductAiTemplate`（systemPrompt + userPromptTemplate + `{{payload}}`）实现模型/Prompt 可后台配置

---

### 三、多站点 / 多域名架构（方案 A）

1. **基本思路**
   - 使用一个代码库与一套 Prisma 数据库
   - 应用部署在同一台阿里云服务器上，由 PM2 守护一个 Next.js 服务
   - 通过 Nginx（或面板）配置多个域名/子域名反向代理到同一端口
   - 在应用内部根据 HTTP Host 解析得到 `siteKey`，从而:
     - 返回不同的首页/产品列表
     - 使用不同的站点设置/SEO/内容模块
     - 控制不同的产品曝光

2. **站点划分**
   - `siteKey="hepaima"`:
     - Host: `hepaima.kyx123.com`、`hepaima.com`
     - 站点定位: 情感关系 & 性格解读
     - 产品: 情侣契合度测试（以及未来的关系类测评）
   - `siteKey="peibupei"`:
     - Host: `peibupei.kyx123.com`、`peibupei.com`（后者 301 跳到前者）
     - 站点定位: 职业 / 城市 / 自我探索测评
     - 产品: 职业适配（career-fit）、城市生活适配（city-fit），以及将来的其他自我探索产品
   - 兜底策略:
     - 若未识别出 host（或为其他测试域名），默认 `siteKey="hepaima"`，确保现有情侣产品在任何情况下都能继续使用。

3. **数据库层建议改造**
   - 新增 `Site` 模型（示意）:
     - `id: String @id`
     - `key: String @unique`（如 `"hepaima"`、`"peibupei"`）
     - `primaryHost: String`（如 `"hepaima.kyx123.com"`）
     - 可选品牌字段: 名称、描述、主色、默认 SEO 等
   - 为以下模型增加 `siteId` 外键:
     - `Product`
     - `SiteSettings`
     - `PageSeo`
     - `ContentBlock`
     - （可选）`PaymentProviderConfig` —— 如果未来不同站点支付商户不同，可以用此区分；否则也可以共用一套配置，仅通过 `APP_URL/PEIBUPEI_APP_URL` 控制回调域名。
   - 迁移现有数据:
     - 创建 `Site("hepaima")`，`primaryHost="hepaima.kyx123.com"`
     - 所有现有 `SiteSettings/PageSeo/ContentBlock/Product` 标记为 `siteId=hepaima`
     - 创建 `Site("peibupei")`，`primaryHost="peibupei.kyx123.com"`，为其新增独立的 `SiteSettings`、内容块和产品
   - 代码适配（兼容式）:
     - 数据读取优先按 `siteId` 过滤
     - 查不到时回退到原来的「单站点默认行」，以免迁移间隙影响现网

4. **应用层逻辑**
   - 在 Server Components / Route Handlers 中实现 `getSiteKeyFromHost(req)`，逻辑:
     - 根据 Host 精确匹配 `Site.primaryHost` 或一组预设映射
     - 找不到则返回 `"hepaima"` 作为默认
   - 首页 / 产品列表:
     - `hepaima`:
       - 展示关系类产品入口（现有情侣契合度测试）
     - `peibupei`:
       - 展示职业适配 / 城市适配两张主卡片
   - 题库 / 报告 / 后台:
     - 通过 `siteId + productSlug` 访问各自站点的产品与问卷/模板
     - 避免在 `hepaima` 下看见 `peibupei` 的产品，反之亦然

5. **支付与回调（保证现有情侣产品「绝不受影响」）**
   - 当前状态:
     - `APP_URL=https://hepaima.kyx123.com`
     - 所有支付 notify/return URL 都基于 APP_URL 构造，在线上已稳定收款
   - 未来扩展:
     - 新增 `PEIBUPEI_APP_URL=https://peibupei.kyx123.com`
     - 仅在「peibupei 站点创建订单」的代码路径中使用 `PEIBUPEI_APP_URL` 来生成 return/notify URL
     - `hepaima` 站点继续使用原有 `APP_URL`，不改变任何逻辑
   - notify 回调路径:
     - 可继续共用现有 `GET/POST /api/v1/payment/*/notify` 路由，只要根据 `out_trade_no` 或订单 ID 更新对应的订单记录即可，不需要分拆为多套回调路径。

---

### 四、职业 / 城市测评 PRD 摘要（仅提要点）

1. **通用配置**
   - 题型: 1–7 李克特量表
   - 耗时: 5–8 分钟（约 30 题）
   - UI:
     - 顶部: 返回 / 产品名 / 题号 + 进度条
     - 中部: 题干 + 7 个圆形按钮（完全不符合 → 完全符合）
     - 底部: 上一题 / 提交按钮
     - 支持断点恢复（sessionStorage）

2. **职业适配测评（career-fit）**
   - 维度示例:
     - 兴趣取向: 与人 / 与事 / 与信息 / 与创意
     - 工作方式: 结构 vs 探索、独立 vs 协作、节奏偏好
     - 动机价值: 成长 / 稳定 / 影响力 / 自由
     - 能量与压力: 社交能量、抗压与恢复方式
   - 输出:
     - 免费:
       - 画像摘要 + 维度条形图
       - 职业方向 Top5（如: 产品/运营/销售/咨询/设计/研发/内容/数据/项目管理等方向）
       - 每个方向的匹配点/注意点/简单下一步建议
     - 付费:
       - 各维度的深度解析（洞察、常见坑、练习）
       - 每个 Top 职业方向的岗位变体、技能路线、作品集建议、面试准备要点
       - 4 周行动计划（按周拆分目标与任务）

3. **城市生活适配测评（city-fit）**
   - 维度示例:
     - 气候偏好（温度、湿度、四季）
     - 生活节奏容忍度（慢 / 中 / 快）
     - 噪音与人群密度容忍度
     - 消费敏感度 & 收入预期
     - 通勤容忍度（时长、拥挤程度）
     - 社交匿名感偏好（熟人社会 vs 匿名感）
     - 自然 / 文化偏好（山海/公园/展演/夜生活）
     - 机会偏好（行业/岗位机会密度）
   - 输出:
     - 免费:
       - 城市生活画像摘要 + 城市类型（如: 一线高机会、沿海舒适、内陆慢生活等）
       - 城市 Top10 列表（可先做国内 20 城池中的推荐）
       - 每个城市的适合点 / 注意点 / 落地建议（预算、通勤、行业）
     - 付费:
       - Top 城市的生活模型（住房/通勤/社交/周末）
       - 行业与岗位机会连接建议
       - 风险清单与权衡矩阵
       - 30 天行动计划与迁移尝试策略（试住、求职、社交）

---

### 五、部署与性能优化方向（摘要）

1. **当前部署痛点**
   - 低配服务器上直接执行 `pnpm install + pnpm build`，每次部署耗时较长
   - 每次部署都在服务器上做重活，对 CPU/内存压力大

2. **更高效的部署方案方向**
   - 核心思想: 将「构建步骤」从服务器迁出，让服务器只做「解压 + 重启」
   - 方案 A（推荐）: GitHub Actions 构建 Next.js standalone 产物 →
     - CI 上 `pnpm install + pnpm build`
     - 打包 `.next/standalone`、`.next/static`、`public` 等必需文件
     - scp 上传到服务器 releases 目录
     - 服务器解压为 `current` 版本并 `pm2 restart hepaima`
   - 方案 B: 本地构建 + 上传产物（类似 A，但将 CI 换成本地机器）
   - 方案 C: 在服务器侧做增量优化（仅在 lockfile 变更时 install 等），只能有限提速

---

### 六、关键共识与后续优先级

1. **域名与站点策略共识**
   - `hepaima` 站点继续承载情感 & 性格类产品
   - `peibupei` 站点承载职业 & 城市 & 自我探索类产品
   - 两站共用一套代码与数据库，通过 Host 识别与 `Site`/`siteId` 分流

2. **结果生成共识**
   - 采用「规则可解释 + AI 表达」折中方案:
     - 规则层锁定画像和 TopN 推荐
     - AI 负责将结构化要点写成报告，不得改结论

3. **不影响现有业务的硬约束**
   - 现有情侣契合度产品的:
     - 支付回调域名（`APP_URL=https://hepaima.kyx123.com`）
     - 路由结构与数据结构
     - 部署与 PM2 管理
   - 在多站点与新产品接入过程中必须保持这些不变，所有新增逻辑需以兼容方式叠加。

4. **建议的下一步优先级**
   - 1）引入 `Site` 与 `siteId`，完成数据层多站点改造（保持 hepaima 兜底）
   - 2）实现基于 Host 的站点识别与首页/产品列表分流
   - 3）为 peibupei 站点接入 `career-fit` / `city-fit` 最小可行 MVP（题库 + 规则引擎 + 免费报告）
   - 4）接入 peibupei 的付费深度报告（使用 `PEIBUPEI_APP_URL`，不改 hepaima 支付逻辑）
   - 5）视需要引入 GitHub Actions 或本地构建方案，加速部署。

