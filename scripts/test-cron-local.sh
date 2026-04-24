#!/bin/bash
# ローカル開発用: cron エンドポイントを手動で叩くテストスクリプト
# 使い方:
#   1. .env.local に CRON_SECRET=任意の値 を設定
#   2. npm run dev で開発サーバ起動
#   3. ./scripts/test-cron-local.sh

SECRET=$(grep CRON_SECRET .env.local | cut -d= -f2)
if [ -z "$SECRET" ]; then
  echo "CRON_SECRET not found in .env.local"
  echo "Add: CRON_SECRET=$(openssl rand -hex 32)"
  exit 1
fi

echo "Testing /api/cron/daily-report..."
curl -H "Authorization: Bearer $SECRET" \
  "http://localhost:3000/api/cron/daily-report" | jq .
