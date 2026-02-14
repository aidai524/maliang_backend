#!/bin/bash

# =========================================
# Dream API 快速更新脚本
# 用于日常代码更新
# =========================================

set -e

APP_DIR="/opt/dream-api"

echo "========================================="
echo "  Dream API 快速更新"
echo "========================================="

cd $APP_DIR

echo "[1/5] 拉取最新代码..."
git pull origin main

echo "[2/5] 更新后端依赖..."
cd backend
npm ci

echo "[3/5] 构建后端..."
npm run build

echo "[4/5] 更新管理后台..."
cd ../admin
npm ci
npm run build

echo "[5/5] 重启服务..."
pm2 restart all

echo ""
echo "========================================="
echo "  更新完成！"
echo "========================================="
pm2 status
