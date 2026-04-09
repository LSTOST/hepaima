#!/usr/bin/env bash
# 本地构建后打包经 SSH 上传到服务器，不在服务器执行 npm run build。
# 使用 tar 管道（远端只需 tar，无需 rsync）。
# 用法：在项目根目录执行 ./deploy.sh
# 依赖：本机已 npm install；服务器已配置 pm2 进程 hepaima、.env、next.config 等（本脚本不同步这些）。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

DEPLOY_SSH="${DEPLOY_SSH:-root@hepaima.kyx123.com}"
REMOTE_DIR="${REMOTE_DIR:-/www/wwwroot/hepaima.kyx123.com}"
# 大文件经 SSH 管道传输时防止中间网络/防火墙踢掉空闲连接
SSH_OPTS=(-o ServerAliveInterval=30 -o ServerAliveCountMax=360 -o TCPKeepAlive=yes)

echo ">>> 1. 本地构建（npm run build）..."
npm run build

if [[ ! -d .next ]]; then
  echo "错误：未生成 .next 目录，构建失败。"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "错误：缺少 node_modules，请先在本机执行 npm install。"
  exit 1
fi

echo ">>> 2. 确保远端目录存在..."
ssh "${SSH_OPTS[@]}" "$DEPLOY_SSH" "mkdir -p '$REMOTE_DIR'"

echo ">>> 3. 上传 .next、public、package.json、node_modules..."
export COPYFILE_DISABLE=1
# macOS 打 tar 时避免把 ._ 资源叉打进包
tar -czf - -C "$ROOT" .next | ssh "${SSH_OPTS[@]}" "$DEPLOY_SSH" "rm -rf '$REMOTE_DIR/.next' && mkdir -p '$REMOTE_DIR' && tar -xzf - -C '$REMOTE_DIR'"
tar -czf - -C "$ROOT" public | ssh "${SSH_OPTS[@]}" "$DEPLOY_SSH" "rm -rf '$REMOTE_DIR/public' && mkdir -p '$REMOTE_DIR' && tar -xzf - -C '$REMOTE_DIR'"
scp "${SSH_OPTS[@]}" -q "$ROOT/package.json" "${DEPLOY_SSH}:${REMOTE_DIR}/package.json"
echo ">>> 3b. 上传 node_modules（体积大，可能需数分钟）..."
tar -czf - -C "$ROOT" node_modules | ssh "${SSH_OPTS[@]}" "$DEPLOY_SSH" "rm -rf '$REMOTE_DIR/node_modules' && mkdir -p '$REMOTE_DIR' && tar -xzf - -C '$REMOTE_DIR'"

echo ">>> 4. 重启 pm2..."
ssh "${SSH_OPTS[@]}" "$DEPLOY_SSH" "pm2 restart hepaima"

echo ">>> 部署完成。"
