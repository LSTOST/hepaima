# 阿里云服务器部署说明

## 最快部署方式：本地一条命令

### 方案一：服务器上构建（需服务器内存 ≥ 4G 较稳）

在**本地**执行，会 push 代码并在**服务器上**执行拉取、安装、构建、重启：

```bash
export DEPLOY_SSH="root@你的服务器IP"
bash scripts/deploy-from-local.sh
```

### 方案二：本地构建 + 上传（推荐 2 核 2G 等小内存服务器）

构建在你本机完成，服务器只接收已构建好的 `.next` 和必要文件，不再在服务器跑 `pnpm build`，避免卡死或 OOM：

```bash
export DEPLOY_SSH="root@你的服务器IP"
bash scripts/build-and-deploy.sh
```

流程：本地 `pnpm build` → rsync/scp 上传 `.next`、`public`、`prisma`、`package.json` 等 → 服务器执行 `pnpm install --frozen-lockfile` 和 `pm2 restart hepaima`。

若已配置 SSH 免密登录，两种方式均可一条命令完成。

---

## 为什么 pull + build + pm2 restart 后页面没更新？

常见原因与对应处理如下。

### 1. Git 没真正更新到最新

- **原因**：`git pull` 拉的是默认分支，若本地 main 已是最新（但代码是旧的），会显示 "Already up to date"。
- **排查**：在服务器执行 `git log -1 --oneline`，看是否是你刚推送的那条 commit。
- **处理**：确认本机已 push 成功；在服务器执行 `git fetch origin && git reset --hard origin/main` 再 build（注意会丢弃服务器上的本地修改）。

### 2. PM2 工作目录不对

- **原因**：PM2 启动时若 `cwd` 不是项目目录，`pnpm build` 更新的 `.next` 和 PM2 进程用的不是同一套。
- **排查**：在服务器执行 `pm2 show hepaima`，看 **exec cwd** 是否为 `/www/wwwroot/hepaima.kyx123.com`。
- **处理**：在项目目录下启动，例如：
  ```bash
  cd /www/wwwroot/hepaima.kyx123.com
  pm2 delete hepaima  # 若已存在
  pm2 start pnpm --name hepaima -- start
  pm2 save
  ```

### 3. Next.js 构建缓存 / 未真正重新构建

- **原因**：有时 `.next` 里旧文件残留，或 build 报错但被忽略。
- **处理**：清空后再构建，再重启：
  ```bash
  cd /www/wwwroot/hepaima.kyx123.com
  rm -rf .next
  pnpm build
  pm2 restart hepaima
  ```

### 4. 浏览器或 CDN 缓存

- **原因**：页面或静态资源被浏览器或前面 Nginx/CDN 缓存。
- **处理**：用无痕模式打开，或强制刷新（Ctrl+Shift+R / Cmd+Shift+R）；若前面有 Nginx 且配了缓存，可暂时关掉静态缓存或对 HTML 不缓存。

### 5. Nginx 反向代理缓存

- **原因**：Nginx 对后端响应做了缓存。
- **处理**：检查 `proxy_cache` 等配置，对 `hepaima.kyx123.com` 的 HTML 或接口去掉缓存或缩短时间，改完后 `nginx -t && nginx -s reload`。

---

## 推荐的标准部署流程

在服务器项目目录下执行：

```bash
cd /www/wwwroot/hepaima.kyx123.com
git fetch origin
git reset --hard origin/main
pnpm install --frozen-lockfile
rm -rf .next
pnpm build
pm2 restart hepaima
```

若仍无更新，可运行项目里的诊断脚本（在项目根目录执行）：

```bash
bash scripts/deploy-check.sh
```

根据脚本输出的 Git 最新提交、`.next` 时间、PM2 的 cwd 和命令逐项核对。

---

## 支付回调：必须配置 APP_URL

微信/支付宝的 **notify_url** 在代码里用 **运行时** 环境变量 `APP_URL` 拼出来。若未配置，会 fallback 到 `NEXT_PUBLIC_APP_URL`（本地 build 时可能被内联成 `http://localhost:3000`），导致支付完成后回调发到错误地址、无法解锁。

**在服务器项目目录的 `.env` 中增加：**

```bash
APP_URL=https://hepaima.kyx123.com
```

改完后执行 `pm2 restart hepaima`。确认支付流程时，可在 PM2 日志中看到 `[WeChat Native] 下单 notify_url: https://hepaima.kyx123.com/...` 和 `[wechat notify] 收到回调 bodyLen=...`。

---

## 微信回调验签：拉取平台证书失败

若日志里已出现 `[wechat notify] 进入回调`、`bodyLen=...`，但接着报 **验签异常: 拉取平台证书失败**，说明回调能收到，但验签时向微信请求「平台证书」失败（SDK 会请求 `https://api.mch.weixin.qq.com/v3/certificates`）。

### 可能原因与处理

1. **服务器访问不了微信接口**  
   在服务器上执行：`curl -I https://api.mch.weixin.qq.com`  
   若超时或不通，检查安全组/防火墙是否放行**出站** HTTPS（一般默认放行）。

2. **证书路径不对**  
   进程的当前工作目录（PM2 的 cwd）下要有 `certs/wechat/apiclient_cert.pem` 和 `apiclient_key.pem`。  
   在服务器项目目录执行：`ls -la certs/wechat/` 确认两个文件存在。  
   若证书放在别的目录，在 `.env` 里设置：`WECHAT_PAY_CERT_DIR=/绝对路径/到证书目录`，然后 `pm2 restart hepaima`。

3. **商户号 / 证书 / APIv3 密钥错误**  
   确认 `.env` 里 `WECHAT_PAY_MCH_ID`、`WECHAT_PAY_APP_ID`、`WECHAT_PAY_API_V3_KEY` 与微信商户平台一致；证书是否为该商户的「API 证书」（不是「平台证书」）。

4. **看微信返回的真实错误**  
   在服务器 `.env` 里临时加一行：`ENABLE_DEBUG_ROUTES=true`，执行 `pm2 restart hepaima`。  
   在服务器上执行：`curl -s https://hepaima.kyx123.com/api/v1/debug/wechat-certificates`（或浏览器打开该 URL）。  
   返回里的 `status`、`body` 即微信接口的真实状态和错误信息（如 401 及 code/message）。  
   排查完后删除 `ENABLE_DEBUG_ROUTES` 或设为 `false`，再次 `pm2 restart hepaima`。

---

## 部署时命令「卡住」怎么办？

通常卡在 **`pnpm install`** 或 **`pnpm build`**，看起来像没反应。

### 先确认卡在哪一步

建议**一条条单独执行**，看停在哪条：

```bash
cd /www/wwwroot/hepaima.kyx123.com
echo ">>> 1. git fetch"
git fetch origin
echo ">>> 2. git reset"
git reset --hard origin/main
echo ">>> 3. pnpm install（国内可能较慢，请耐心等 1～3 分钟）"
pnpm install --frozen-lockfile
echo ">>> 4. rm .next"
rm -rf .next
echo ">>> 5. pnpm build（构建可能要 2～5 分钟）"
pnpm build
echo ">>> 6. pm2 restart"
pm2 restart hepaima
```

### 若卡在 `pnpm install`

- **国内服务器**：多半是访问 npm 官方源慢。可改用国内镜像再装：
  ```bash
  pnpm config set registry https://registry.npmmirror.com
  pnpm install --frozen-lockfile
  ```
- 安装时会有很多日志；若长时间**完全无新输出**（超过 3～5 分钟），再考虑网络/防火墙问题。

### 若卡在 `pnpm build`

- Next 构建本身要几分钟，且默认输出可能不频繁，**看起来像卡住**。
- 可加环境变量让输出更频繁，便于确认在跑：
  ```bash
  NODE_OPTIONS='--max-old-space-size=2048' pnpm build
  ```
- 若服务器内存很小（如 1GB），可能因内存不足卡死，可先 `free -m` 看内存，必要时加 swap 或升配。

### 一键部署脚本（带进度提示）

在项目根目录执行，每步都会打印进度，便于判断卡在哪：

```bash
bash scripts/deploy.sh
```
