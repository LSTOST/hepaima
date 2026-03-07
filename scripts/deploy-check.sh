#!/bin/bash
# 在阿里云服务器上运行：bash scripts/deploy-check.sh
# 用于排查「pull + build + pm2 restart 后页面没更新」的问题

set -e
cd "$(dirname "$0")/.."
echo "=== 当前目录 ==="
pwd
echo ""
echo "=== 1. Git 是否拉到了最新 ==="
git log -1 --oneline
git status -sb
echo ""
echo "=== 2. .next 目录最后修改时间（应为本次 build 时间） ==="
ls -la .next 2>/dev/null | head -5 || echo ".next 不存在，请先执行 pnpm build"
echo ""
echo "=== 3. PM2 进程信息（确认 cwd 和 启动命令） ==="
pm2 show hepaima 2>/dev/null || echo "未找到 pm2 应用 hepaima"
echo ""
echo "=== 4. 建议的完整部署命令 ==="
echo "  git pull origin main"
echo "  pnpm install --frozen-lockfile"
echo "  rm -rf .next && pnpm build"
echo "  pm2 restart hepaima"
echo ""
echo "若仍不生效：浏览器无痕/强制刷新(Ctrl+Shift+R)，或检查 Nginx 是否做了静态缓存。"
