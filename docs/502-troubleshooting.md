# 502 Bad Gateway 排查清单

502 表示 Nginx 没有从上游（Next.js/PM2）收到有效响应。按下面顺序在**服务器**上排查。

## 1. 确认 Next.js 进程是否在跑

```bash
pm2 list
pm2 show hepaima
```

- 若 **status** 不是 `online`：进程挂了，看日志找原因：`pm2 logs hepaima --lines 100`
- 若没有 `hepaima`：需要重新启动，在项目目录执行：
  ```bash
  cd /www/wwwroot/hepaima.kyx123.com
  pm2 start pnpm --name hepaima -- start
  pm2 save
  ```

## 2. 看 PM2 日志（最重要）

```bash
pm2 logs hepaima --lines 200
```

关注：
- **数据库相关**：`Can't reach database server`、`Connection refused`、`ETIMEDOUT`、`P1001`、`invalid DATABASE_URL`
- **端口占用**：`EADDRINUSE`（说明 3000 被占或重复启动了）
- **内存/崩溃**：`JavaScript heap out of memory`、`SIGKILL`
- **未捕获异常**：整段 Node 报错栈

## 3. 确认数据库可连

根布局 `layout.tsx` 的 `generateMetadata()` 会请求数据库（`prisma.siteSettings.findFirst()`）。数据库不可用或超时时，可能整站 502。

在服务器上：

```bash
cd /www/wwwroot/hepaima.kyx123.com
# 看 .env 里 DATABASE_URL 是否配置（不要贴到公网）
grep DATABASE_URL .env
# 用 Node 快速测连库（可选）
node -e "
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.siteSettings.findFirst().then(() => { console.log('DB OK'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
"
```

若这里就报错或超时，先修数据库（PostgreSQL 是否在跑、DATABASE_URL 是否正确、网络/安全组是否放行）。

## 4. 确认 Nginx 反向代理配置

- 端口是否和 Next 一致（默认 3000）：  
  `grep -r "proxy_pass\|upstream" /etc/nginx/`（或你放配置的路径）
- 超时是否过短（可适当调大）：
  - `proxy_connect_timeout 60s;`
  - `proxy_send_timeout 60s;`
  - `proxy_read_timeout 60s;`
- 改完执行：`nginx -t && nginx -s reload`

## 5. 直接测 Next.js 是否响应

在服务器本机：

```bash
curl -I http://127.0.0.1:3000
```

- 若这里就 502/超时/无响应：问题在 Next/PM2/数据库，不是 Nginx。
- 若这里 200：多半是 Nginx 的 upstream 配置或缓存问题。

## 6. 常见原因小结

| 现象/日志 | 可能原因 | 处理 |
|-----------|----------|------|
| PM2 进程 status 非 online | 崩溃或未启动 | 看 `pm2 logs`，修报错后 `pm2 restart hepaima` |
| 日志里数据库连接错误/超时 | DATABASE_URL 错或 DB 不可达 | 检查 .env、PostgreSQL 状态、网络/安全组 |
| EADDRINUSE :3000 | 端口被占或重复启动 | `pm2 delete hepaima` 后重新 `pm2 start` |
| heap out of memory | 内存不足 | 加 swap 或升配，或本地构建后用 build-and-deploy 减少服务器内存占用 |
| curl 127.0.0.1:3000 正常但浏览器 502 | Nginx 配置或缓存 | 查 upstream、proxy_pass、proxy_* 超时，必要时关 proxy_cache |

---

**最可能**：数据库连接失败或超时导致请求挂起，Nginx 等不到响应就返回 502。先做第 2、3 步。
