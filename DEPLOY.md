# 阿里云服务器部署说明

## 最快部署方式：本地一条命令

在**本地**项目根目录执行一条命令即可完成「推送 + 服务器拉代码 + 安装 + 构建 + 重启」：

```bash
# 首次使用前配置一次（把 root@你的服务器IP 换成实际 SSH 地址）
export DEPLOY_SSH="root@你的服务器IP"

# 之后每次部署
bash scripts/deploy-from-local.sh
```

脚本会先 `git push origin main`，再 SSH 到服务器执行 `scripts/deploy.sh`。若已配置 SSH 免密登录，全程无需再输入密码。

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
