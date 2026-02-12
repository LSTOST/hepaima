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

在项目根目录创建 `.env`（或上传本地已有的 .env，并确认 `DATABASE_URL` 指向服务器可访问的数据库）：

```env
DATABASE_URL="postgresql://用户名:密码@127.0.0.1:5432/数据库名"
OPENROUTER_API_KEY="你的OpenRouter密钥"
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

## 1.9 后续更新

```bash
cd /www/wwwroot/hepaima.kyx123.com
git pull
pnpm install --frozen-lockfile
pnpm build
pnpm prisma migrate deploy
pm2 restart hepaima
```

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

- 环境选择：**Production / Preview / Development** 按需勾选（Production 必填）
- 若使用 Vercel Postgres / Neon 等，控制台会提供 `DATABASE_URL`，直接粘贴即可

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
