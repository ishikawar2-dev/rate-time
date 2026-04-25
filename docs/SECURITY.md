# セキュリティ対応履歴

## 2026-04-25: 実用レベル強化

### 対応内容

#### 1. Cron 認証を timingSafeEqual に変更
- `src/app/api/cron/daily-report/route.ts`
- **Before**: `authHeader !== \`Bearer ${secret}\`` （文字列 `!==` は早期 short-circuit するため Timing Attack に脆弱）
- **After**: `node:crypto` の `timingSafeEqual` で固定時間比較

#### 2. セキュリティ HTTP ヘッダー追加
- `next.config.js`
- 全パス (`/:path*`) に以下を付与:
  - `X-Content-Type-Options: nosniff` — ブラウザの Content-Type スニッフィング防止（XSS 対策）
  - `X-Frame-Options: SAMEORIGIN` — 外部サイトからの iframe 埋め込み禁止（clickjacking 対策）
  - `Referrer-Policy: strict-origin-when-cross-origin` — 外部リンク時のリファラ情報を最小化
  - `X-DNS-Prefetch-Control: on` — DNS 事前解決によるパフォーマンス向上
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — HTTPS 強制（中間者攻撃対策）
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` — 不要なブラウザ API を明示的に無効化

#### 3. Notion 同期エラーをレスポンスから除外
- `src/app/api/cron/daily-report/route.ts`
- **Before**: `notion: { ok, created, error }` — エラー詳細（メッセージ）がレスポンスに含まれていた
- **After**: `notion: { ok, created? }` — エラー詳細はサーバーログのみ、レスポンスには含めない

#### 4. 編集トークン長を 32 文字に拡張
- `src/lib/auth.ts`
- **Before**: HMAC-SHA256 の先頭 24 文字
- **After**: 新規発行は先頭 32 文字（HMAC-SHA256 の 128 bit 分）
- **互換性**: 既存の 24 文字トークンも引き続き検証可能（長さで分岐して同じ HMAC の先頭 N 文字と比較）

### 対応しなかった項目（今後の検討事項）

- **Content-Security-Policy (CSP)**: 設定が複雑でインラインスクリプト等を壊す可能性があるため保留
- **レート制限**: Upstash Rate Limit 等を使った API エンドポイントへのリクエスト制限
- **Affiliates API の認証強化**: 現状の認証方式の見直し
- **構造化ロギング**: JSON 形式でのログ出力（モニタリング・アラート連携）
