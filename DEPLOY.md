# 合拍吗 - 部署指南

本项目为 Next.js 全栈应用（Prisma + PostgreSQL + API），支持部署到 **阿里云** 或 **Vercel**。二选一即可。

---

# 一、阿里云服务器部署（宝塔 + Node + PM2）

适用：已有阿里云 ECS、使用宝塔面板、希望用自己域名（如 hepaima.kyx123.com）。

## 1.1 架构说明

- 用 **PM2** 跑 `next start`（端口 3000）
- 用 **Nginx 反向代理** 把域名请求转到 `http://127.0.0.1:3000`
- 需在服务器安装 **PostgreSQL** 或使用云数据库

## 1.2 服务器准备

- 宝塔安装：**Node.js**（建议 20+）、**PM2**、**PostgreSQL**
- 在 PostgreSQL 中新建数据库和用户，记下连接串（用于 `DATABASE_URL`）
- 域名解析：将 hepaima.kyx123.com 解析到服务器 IP

## 1.3 代码部署到服务器

在服务器目录（如 `/www/wwwroot/hepaima.kyx123.com`）任选一种方式：

**方式 A：Git 拉取**

```bash
cd /www/wwwroot/hepaima.kyx123.com
git clone https://你的仓库地址.git .
```

**方式 B：本地上传压缩包**

本地执行：

```bash
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czvf hepaima-deploy.tar.gz .
```

上传到服务器后解压到站点目录。

## 1.4 安装依赖与构建

```bash
cd /www/wwwroot/hepaima.kyx123.com
npm install -g pnpm
pnpm install --frozen-lockfile
pnpm build
```

若构建报 Turbopack 超时，可改用 Webpack：在 `package.json` 中把 `"build": "next build"` 改为 `"build": "next build --webpack"`，或执行：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

## 1.5 环境变量

在项目根目录创建 `.env`（或把本地的 .env 上传到服务器），并确认 `DATABASE_URL` 指向该服务器可访问的数据库。**阿里云部署需要配置的变量如下：**

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接串 | `postgresql://用户名:密码@127.0.0.1:5432/数据库名` |
| `OPENROUTER_API_KEY` | 是 | OpenRouter API 密钥（报告生成） | 你的密钥 |
| `ADMIN_PASSWORD` | 是 | 兑换码管理后台登录密码 | 自定义密码 |
| `PORT` | 否 | 服务端口，默认 3000 | `3000` |
| `NEXT_PUBLIC_APP_URL` | 否 | 站点对外地址（支付回调等），不填则用默认 | `https://hepaima.kyx123.com` |
| `ADMIN_SECRET_KEY` | 否 | 生成兑换码时的密钥方式鉴权，可选 | 与后台「密钥」一致 |
| `ALIPAY_APP_ID` | 支付启用时 | 支付宝应用 App ID | - |
| `ALIPAY_PRIVATE_KEY` | 支付启用时 | 支付宝应用私钥 | - |
| `ALIPAY_ALIPAY_PUBLIC_KEY` | 支付启用时 | 支付宝公钥 | - |
| `ALIPAY_GATEWAY` | 否 | 支付宝网关，默认正式环境 | `https://openapi.alipay.com/gateway.do` |
| `ALIPAY_KEY_TYPE` | 否 | 私钥格式 PKCS8 / PKCS1 | `PKCS8` |
| `WECHAT_PAY_MCH_ID` | 支付启用时 | 微信支付商户号 | - |
| `WECHAT_PAY_APP_ID` | 支付启用时 | 微信支付 App ID | - |
| `WECHAT_PAY_API_V3_KEY` | 支付启用时 | 微信支付 API v3 密钥 | - |
| `WECHAT_PAY_CERT_DIR` | 否 | 微信证书目录，默认 `certs/wechat` | - |

**最小可运行示例（仅测评 + 兑换码后台）：**

```env
DATABASE_URL="postgresql://用户名:密码@127.0.0.1:5432/数据库名"
OPENROUTER_API_KEY="你的OpenRouter密钥"
ADMIN_PASSWORD="你的管理后台密码"
PORT=3000
```

## 1.6 数据库迁移

```bash
pnpm prisma migrate deploy
```

## 1.7 用 PM2 启动

```bash
pm2 start pnpm --name hepaima -- start
pm2 save
pm2 startup
```

## 1.8 宝塔 Nginx 反向代理

- 网站 → hepaima.kyx123.com → 设置 → **反向代理**
- 添加反向代理：目标 URL 填 `http://127.0.0.1:3000`，发送域名 `$host`
- 可选：SSL → Let's Encrypt 申请证书并强制 HTTPS

## 1.8.1 常见错误排查

- **`ENOENT: .next/prerender-manifest.json`**：说明 `.next` 未生成或未在正确目录。必须在**项目根目录**执行 `pnpm build`，且 PM2 的「运行目录」为该根目录（`pm2 start pnpm --name hepaima -- start` 时当前目录即项目根）。若只上传了代码未在服务器执行 build，请执行 1.4 再 1.7。
- **兑换码/列表/统计接口 500**：多为数据库未迁移。在项目根执行 `pnpm prisma migrate deploy` 后 `pm2 restart hepaima`。
- **日志出现 `TypeError: Cannot read properties of undefined (reading 'count')` 或 `(reading 'findMany')`**：说明运行时的 Prisma Client 是旧版或未在服务器上重新生成（缺少 `redeemCode` 等模型）。在项目根执行 `pnpm prisma generate`，再执行 `pnpm build` 后 `pm2 restart hepaima`。若只上传了 `.next` 未在服务器执行过 `pnpm install`，需在服务器完整执行 1.4（install + build），保证 `node_modules/.prisma/client` 与当前 schema 一致。
- **AI 报告 JSON 解析失败**：若日志出现「原始内容: json {」，多为 AI 返回带 `json ` 前缀，已做兼容；仍报错可查看 `src/lib/ai.ts` 中 `parseReportJson` / 深度报告解析逻辑。
- **`/admin/redeem` 打开 404**：见下方「1.8.2 /admin/redeem 出现 404」。

## 1.8.2 /admin/redeem 出现 404

本应用是 **Next.js 全栈**，所有路径（含 `/admin/redeem`）都由 Node 进程处理，Nginx 只做反向代理，**不能**按「静态站」或「PHP」那样用 `try_files` 找文件，否则子路径会 404。

**1）先确认 Next 本机是否正常**

在服务器上执行：

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/admin/redeem
```

- 若输出 **200**：说明 Next 能访问，问题在 **Nginx 配置**。
- 若输出 **404**：说明 Next 未提供该路由。常见原因见下方「3）执行 install/build 后后台 404」。

**2）检查 Nginx 配置（宝塔）**

- 网站 → hepaima.kyx123.com → **设置** → **反向代理**。
- 应有一条「代理目录」为 **`/`** 的配置，目标 URL 为 **`http://127.0.0.1:3000`**（不要带尾部斜杠）。
- 在 **配置文件** 里确认：**不要**出现对 `/admin` 或子路径的 `return 404`、`try_files` 等规则；所有请求应统一走 `proxy_pass http://127.0.0.1:3000;`（或 127.0.0.1:3000/ 且与上面一致）。
- 若有「伪静态」或「重写」规则把非根路径指向静态文件，请删掉或改为只对静态资源生效，避免把 `/admin/redeem` 等交给静态处理。

**推荐的反向代理配置示例（在 Nginx 配置里）：**

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

保存后重载 Nginx：`nginx -t && nginx -s reload`（或宝塔里点「重载配置」）。

**3）执行 install/build 后后台 404**

若**之前**能访问 `/admin/redeem`，在服务器执行 `pnpm install`、`pnpm build`、`pm2 restart` **之后**变成 404，多半是：**服务器上的源码不是最新**。`pnpm build` 会按当前目录的源码重新生成 `.next`，若当时仓库里没有 `src/app/admin/redeem/page.tsx`（例如未拉取最新代码），新构建里就不会包含该路由，覆盖掉之前能用的版本。

**处理步骤：**

1. 在服务器项目根先更新代码再构建，例如：
   ```bash
   cd /www/wwwroot/hepaima.kyx123.com
   git pull
   pnpm install --frozen-lockfile
   pnpm prisma generate
   pnpm build
   pm2 restart hepaima
   ```
2. 若未用 Git，则把本地**包含 `src/app/admin/redeem/` 的完整源码**重新上传到服务器后再执行上述 install → build → restart。
3. 构建前可确认文件存在：`ls src/app/admin/redeem/page.tsx`，有输出再执行 `pnpm build`。

## 1.8.3 /admin/redeem 能打开但无法生成兑换码

本地能生成、阿里云或 Vercel 上不能，常见原因如下。

**1）环境变量未配置或未生效**

- **阿里云**：在项目根目录的 `.env` 中必须配置 `ADMIN_PASSWORD`（与登录时输入的密码一致）。若用 PM2 启动，确保 PM2 工作目录是项目根（这样会加载根目录的 `.env`）。修改 `.env` 后需执行 `pm2 restart hepaima`。
- **Vercel**：在 **Settings → Environment Variables** 中必须添加 `ADMIN_PASSWORD`（Production/Preview 按需勾选）。未配置时接口会返回 403「无权限」。添加或修改后需重新部署一次才会生效。

**2）数据库未就绪**

- 生成兑换码会读写 `RedeemCode` 表。若 `DATABASE_URL` 未配置、错误或数据库未执行迁移，接口会返回 500「生成失败」。
- 阿里云：在项目根执行 `pnpm prisma migrate deploy` 后 `pm2 restart hepaima`。
- Vercel：确认 `DATABASE_URL` 指向已迁移过的库，必要时在本地用生产库连接串执行一次 `pnpm prisma migrate deploy`。

**3）如何确认具体原因**

- 打开浏览器开发者工具 → **Network**，在后台点击「生成兑换码」。
- 找到请求 `POST /api/v1/admin/generate-codes`：
  - **403**：鉴权失败，检查 `ADMIN_PASSWORD` 是否与登录密码一致、部署环境是否已配置并生效。
  - **500**：多为数据库连接或迁移问题，检查 `DATABASE_URL` 与迁移状态、服务端日志。

**4）日志出现 Prisma 相关 TypeError（reading 'count' / 'findMany'）**

- 说明 Node 进程里用的 Prisma Client 与当前 `prisma/schema.prisma` 不一致（例如部署时只上传了 `.next`，服务器上的 `node_modules` 未更新或未在服务器执行过 `prisma generate`）。
- **处理**：在服务器项目根目录执行：`pnpm install --frozen-lockfile` → `pnpm prisma generate` → `pnpm build` → `pm2 restart hepaima`。保证构建与运行都在同一环境，且 `node_modules/.prisma/client` 包含最新 schema。

## 1.9 后续更新（把当前改动部署到阿里云）

**若服务器上已是旧版，用 Git 更新并重新构建：**

```bash
cd /www/wwwroot/hepaima.kyx123.com   # 换成你的站点目录
git pull
pnpm install --frozen-lockfile
pnpm build
pnpm prisma migrate deploy
pm2 restart hepaima
```

**若首次部署或没有 Git：**

1. 在服务器创建站点目录，用 **Git 拉取** 或 **本地上传压缩包**（见 1.3）。
2. 在项目根目录创建或上传 **`.env`**，填好 1.5 中的变量（至少 `DATABASE_URL`、`OPENROUTER_API_KEY`、`ADMIN_PASSWORD`）。
3. 执行 1.4 安装依赖与构建，再执行 1.6 数据库迁移，最后 1.7 用 PM2 启动，1.8 配置 Nginx 反向代理。

---

# 二、Vercel 部署

适用：希望免运维、自动 CI/CD、用 Vercel 域名或自定义域名。

## 2.1 前置条件

- 代码在 **GitHub / GitLab / Bitbucket** 仓库
- 有一个可公网访问的 **PostgreSQL**（如 [Vercel Postgres](https://vercel.com/storage/postgres)、[Neon](https://neon.tech)、[Supabase](https://supabase.com)、阿里云 RDS 等），并拿到连接串

## 2.2 在 Vercel 创建项目

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 等登录
2. **Add New** → **Project** → 选择本项目的仓库（如 `hepaima`）
3. 选择仓库后进入配置页

## 2.3 配置构建设置（一般可保持默认）

- **Framework Preset**：Next.js（自动识别）
- **Build Command**：`pnpm build` 或 `npm run build`（与仓库根目录的 `package.json` 一致）
- **Output Directory**：留空（Next.js 默认）
- **Install Command**：`pnpm install` 或 `npm install`

若使用 pnpm，需在项目根目录有 `pnpm-lock.yaml`；Vercel 会自动用 pnpm。

## 2.4 环境变量

在 Vercel 项目 **Settings → Environment Variables** 中添加：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串（必填） | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `OPENROUTER_API_KEY` | OpenRouter API 密钥（必填） | 你的密钥 |
| `ADMIN_PASSWORD` | 兑换码管理后台登录密码（必填，否则 /admin/redeem 无法登录与生成） | 自定义密码 |

- 环境选择：**Production / Preview / Development** 按需勾选（Production 必填）
- 若使用 Vercel Postgres / Neon 等，控制台会提供 `DATABASE_URL`，直接粘贴即可
- **未配置 `ADMIN_PASSWORD` 时**：管理员登录会失败，生成兑换码会返回 403「无权限」

## 2.5 数据库迁移（首次或 schema 变更后）

Vercel 构建时**不会**自动执行 `prisma migrate deploy`，需要先让数据库表结构就绪，任选一种方式：

**方式 A：在构建时自动迁移（推荐）**

在 `package.json` 的 `build` 前增加迁移步骤，例如：

```json
"scripts": {
  "build": "prisma migrate deploy && next build",
  ...
}
```

这样每次部署都会先执行迁移再构建。若使用 pnpm，确保 `postinstall` 中有 `prisma generate`（本项目已有）。

**方式 B：本地或 CI 执行一次**

在本地或任意能访问数据库的环境执行：

```bash
DATABASE_URL="你的生产库连接串" pnpm prisma migrate deploy
```

只需在首次部署或修改 Prisma schema 后执行。

## 2.6 部署

- 点击 **Deploy** 开始首次部署
- 之后每次向所连分支（如 `main`）推送代码，Vercel 会自动重新构建和发布

## 2.7 自定义域名（可选）

- 项目 **Settings → Domains** → 添加域名（如 `hepaima.kyx123.com`）
- 按提示在域名服务商处添加 CNAME 或 A 记录
- 若域名在国内且需备案，阿里云备案的域名可解析到 Vercel，但访问走 Vercel 海外节点，国内可能较慢

## 2.8 注意事项

- **冷启动**：Serverless 函数冷启动可能带来首请求略慢，属正常现象
- **数据库**：确保 PostgreSQL 允许从 Vercel 的 IP 访问（云数据库一般用公网地址 + 白名单或 0.0.0.0/0）；Neon / Vercel Postgres 等与 Vercel 同区域时通常无需额外配置
- **流式 / 长连接**：若使用流式接口（如报告生成），Vercel 对函数执行时间有限制（约 60s～300s 视计划而定），需在超时前完成或拆分为多步

---

# 三、对比小结

| 项目 | 阿里云（宝塔 + PM2） | Vercel |
|------|----------------------|--------|
| 服务器 | 需自备 ECS + 宝塔 | 无需服务器 |
| 数据库 | 自建 PostgreSQL 或 RDS | 需外部 Postgres（Neon / Supabase / Vercel Postgres 等） |
| 域名 / 备案 | 可用已备案域名，完全自控 | 可用自定义域名，国内访问可能走海外 |
| 更新方式 | git pull + build + pm2 restart | 推代码即自动部署 |
| 成本 | 服务器 + 数据库费用 | 免费额度 + 按用量 |

按需选择其一部署即可；同一套代码两种方式都支持。

以后有代码更新时
本机：改代码 → pnpm build → 再打一次 tar -czvf hepaima-next.tar.gz .next → 上传 hepaima-next.tar.gz 到服务器。
若依赖有变：服务器上执行 git pull、pnpm install --frozen-lockfile，再按上面上传新的 .next 并 pm2 restart hepaima。
这样构建都在本机完成，阿里云只负责运行，可以避免在服务器上卡住。