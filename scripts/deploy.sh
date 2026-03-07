#!/bin/bash
# 在服务器项目根目录执行：bash scripts/deploy.sh
# 每步都会打印进度，便于排查「卡住」是在哪一步

set -e
cd "$(dirname "$0")/.."

echo "[1/6] git fetch origin ..."
git fetch origin

echo "[2/6] git reset --hard origin/main ..."
git reset --hard origin/main

echo "[3/6] pnpm install --frozen-lockfile（国内可能较慢，请耐心等待）..."
pnpm install --frozen-lockfile

echo "[4/6] rm -rf .next ..."
rm -rf .next

echo "[5/6] pnpm build（构建约 2～5 分钟）..."
pnpm build

echo "[6/6] pm2 restart hepaima ..."
pm2 restart hepaima

echo "部署完成。"
