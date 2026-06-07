#!/bin/bash
# 校园智搭 - 阿里云 OSS 一键部署脚本
# 用法: bash deploy-oss.sh

set -e

PROJECT_DIR="/Users/xingguang/Desktop/校园智搭方案/campus-match"
DIST_DIR="$PROJECT_DIR/dist"
BUCKET="oss://campus-match/"
PROFILE="campus-match"

echo "🔨 构建中..."
cd "$PROJECT_DIR"
npm run build

echo ""
echo "📤 上传到 OSS..."
~/bin/ossutil --profile "$PROFILE" cp -r "$DIST_DIR/" "$BUCKET" -u -f

echo ""
echo "🔧 修复 HTML Content-Disposition..."
~/bin/ossutil --profile "$PROFILE" set-props "$BUCKET" \
  --content-disposition inline \
  --metadata-directive replace \
  --include "*.html" -r -f

echo ""
echo "✅ 部署完成！"
echo "🌐 https://campus-match.oss-cn-shenzhen.aliyuncs.com/"
