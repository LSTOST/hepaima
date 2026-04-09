#!/bin/bash
# 方案二：本地构建，只把构建结果部署到服务器（适合 2 核 2G 等小内存服务器）
# 在本地项目根目录执行：bash scripts/build-and-deploy.sh
#
# 使用前配置（与 deploy-from-local.sh 相同）：
#   export DEPLOY_SSH="root@你的服务器IP"
#   export DEPLOY_REMOTE_DIR="/www/wwwroot/hepaima.kyx123.com"  # 可选，默认即此路径

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_SSH="${DEPLOY_SSH:-}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/www/wwwroot/hepaima.kyx123.com}"

if [ -z "$DEPLOY_SSH" ]; then
  echo "未设置 DEPLOY_SSH，请先配置："
  echo "  export DEPLOY_SSH=\"root@你的服务器IP\""
  exit 1
fi

echo ">>> 1. 本地构建（pnpm build）..."
pnpm build
if [ ! -d .next ]; then
  echo "构建失败或未生成 .next 目录"
  exit 1
fi

echo ">>> 2. 上传构建结果与必要文件到服务器..."
ssh "$DEPLOY_SSH" "mkdir -p $REMOTE_DIR"
# 先本地打 tar 包再 scp，避免管道传输时 SSH 断开导致 Broken pipe
# 使用绝对路径，避免 ssh/scp 或环境改变 cwd 后相对路径找不到包
TARBALL="$ROOT/.deploy-next.tar.gz"
cleanup_tarball() { rm -f "$TARBALL"; }
trap cleanup_tarball EXIT
echo ">>> 2.0 正在打包 .next（可能需要几十秒）..."
COPYFILE_DISABLE=1 tar -czf "$TARBALL" -C "$ROOT" .next
if [ ! -s "$TARBALL" ]; then
  echo "错误：本地打包失败，未生成或非空文件: $TARBALL"
  exit 1
fi
ssh "$DEPLOY_SSH" "rm -rf $REMOTE_DIR/.next"
scp -q "$TARBALL" "$DEPLOY_SSH:$REMOTE_DIR/"
ssh "$DEPLOY_SSH" "cd $REMOTE_DIR && tar -xzf $(basename "$TARBALL") && rm -f $(basename "$TARBALL")"
# 上传其余目录和文件（含 src、scripts，供 seed 用代码里的题目更新数据库）
scp -r -q public "$DEPLOY_SSH:$REMOTE_DIR/"
scp -r -q prisma "$DEPLOY_SSH:$REMOTE_DIR/"
scp -r -q src "$DEPLOY_SSH:$REMOTE_DIR/"
scp -r -q scripts "$DEPLOY_SSH:$REMOTE_DIR/"
scp -q package.json pnpm-lock.yaml next.config.ts "$DEPLOY_SSH:$REMOTE_DIR/"

echo ">>> 2.1 校验关键文件是否上传成功..."
if ! ssh "$DEPLOY_SSH" "test -f $REMOTE_DIR/.next/routes-manifest.json"; then
  echo "错误：服务器上缺少 .next/routes-manifest.json，上传可能不完整，请重试部署。"
  exit 1
fi

echo ">>> 3. 服务器安装依赖、执行数据库迁移、用代码里的题目更新数据库并重启..."
# 注意：ssh 远程执行默认是非交互、非登录 shell，不会读 ~/.bashrc，nvm/fnm 下的 node、pnpm 常因此找不到。
ssh "$DEPLOY_SSH" "bash -s" <<EOF
set -e
cd "$REMOTE_DIR"
# 宝塔 Node 与系统 /usr/bin/node 并存时，必须优先用宝塔目录，否则 corepack/pnpm 装在 v24 上而 SSH 却用了系统 node。
bt_bin=""
for d in /www/server/nodejs/v*/bin; do
  if [ -d "\$d" ]; then
    bt_bin="\$d"
  fi
done
if [ -n "\$bt_bin" ]; then
  export PATH="\$bt_bin:\$PATH"
fi
export NVM_DIR="\${NVM_DIR:-\$HOME/.nvm}"
if [ -s "\$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "\$NVM_DIR/nvm.sh"
fi
if ! command -v pnpm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@latest --activate
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "错误：远程仍找不到 pnpm。请 SSH 登录服务器执行: which node; which pnpm; type corepack" >&2
  exit 127
fi
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm seed
pm2 restart hepaima
EOF

echo "全部完成，站点应已更新。"
