# 阿里云服务器部署说明

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
