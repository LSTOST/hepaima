#!/bin/bash
# 在本地项目根目录执行：bash scripts/deploy-from-local.sh
# 会先 push 到 origin main，再 SSH 到服务器执行部署（拉代码 + 安装 + 构建 + 重启）
#
# 使用前在本地配置一次（任选一种）：
#   export DEPLOY_SSH="root@你的服务器IP"
#   或把下面 DEPLOY_SSH 默认值改成你的 root@ip
#
# 若已配置 SSH 免密登录，一条命令即可完成部署。

set -e
cd "$(dirname "$0")/.."

DEPLOY_SSH="${DEPLOY_SSH:-}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/www/wwwroot/hepaima.kyx123.com}"

if [ -z "$DEPLOY_SSH" ]; then
  echo "未设置 DEPLOY_SSH，请先配置："
  echo "  export DEPLOY_SSH=\"root@你的服务器IP\""
  echo "或编辑本脚本，修改 DEPLOY_SSH 默认值。"
  exit 1
fi

echo ">>> 1. 推送到 origin main ..."
git push origin main

echo ">>> 2. 在服务器执行部署 ..."
ssh "$DEPLOY_SSH" "cd $REMOTE_DIR && git fetch origin && git reset --hard origin/main && pnpm install --frozen-lockfile && rm -rf .next && pnpm build && pm2 restart hepaima"

echo "全部完成，站点应已更新。"
