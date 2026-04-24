# AGENTS.md — Claude Code 向け指示書

このファイルは Claude Code が実装作業を行う際に最初に読むべき指示書です。

## プロジェクト概要

- **サイト名**: 利息タイマー（https://rate-time.com）
- **機能**: 借金・ローンの利息をリアルタイム計算・可視化する Web ツール
- **技術スタック**: Next.js (App Router) / TypeScript / Tailwind CSS / Neon (Postgres)

## マネタイズ方針

アフィリエイト収益化・A/Bテスト・テーマ機能の詳細仕様は
**`docs/MONETIZATION.md`** を必ず参照すること（現行版は v4）。

### 絶対に守ること

1. **扱うカテゴリは次の5つのみ**
   - 債務整理 / おまとめローン / カードローン / 消費者金融 / クレジットカード
2. **FX・バイナリーオプション・ギャンブル・情報商材は扱わない**
3. **リボ払い積極訴求のクレカは扱わない**
4. **全アフィリエイトリンクに `rel="sponsored nofollow noopener"` と `target="_blank"` を必須付与**
5. **アフィリエイト表示の前後に「広告」「PR」ラベルを必ず明示**（ステマ規制対応）
6. **ランディングページ `/` の主要UIに広告を混ぜない**。配置は `/timer/[slug]` と `/column/*` のみ
7. **リスクカテゴリ（カードローン・消費者金融・クレカ）には免責注記を必須**
8. **「今すぐ借りられる」等の借金を煽る訴求コピーは禁止**

### A/Bテスト方針

- **自前DB計測方式（Neon Postgres）で実装**
- **計測はインプレッションとクリックのみ**（CVはASP側で確認）
- **バリアント割当は middleware + Cookie 方式**で SSR と整合
- **実験は1度に1つのみアクティブ**（同時実行禁止）
- 実装順序は `docs/MONETIZATION.md` の Phase 1〜7 に従う
- 実験実施順序: placement → category-order → limit → category-mix → **default-theme（テーマ機能実装後）**

### テーマ機能（ライト/ダーク）

- **デフォルトは light**（白基調）
- **UIは iOS風トグルスイッチ**（☀️ ⇔ 🌙）
- **タイマー作成フォーム内**に配置、タイマーごとにDB保存
- URL共有先でも同じテーマが表示される
- 実装方式は CSS変数ベース推奨（`data-theme="dark"` でオーバーライド）
- **トップページ `/` ではクライアントサイド切替OK**（プレビュー目的）
- **タイマー表示画面 `/timer/[slug]` はSSR固定**（閲覧者は切替不可、トグルも表示しない）
- Phase 6 で実装、Phase 7 で初期値A/Bテスト

### 実装ファイルの配置

- オファー定義: `src/lib/affiliates.ts`
- 実験定義: `src/lib/experiments.ts`
- UI: `src/components/affiliate/`
- 計測API: `src/app/api/affiliates/{impression,click}/route.ts`
- 割当: `src/middleware.ts`
- 管理画面: `src/app/admin/experiments/`
- マイグレーション:
  - `migrations/002_ab_testing.sql`（A/Bテスト基盤）
  - `migrations/003_timer_theme.sql`（テーマ機能、Phase 6）
  - `migrations/004_theme_selected_by_user.sql`（Phase 7、テーマ実験用）

## 疑問が出たら

仕様に曖昧な点があれば、実装前にユーザーに確認すること。
独自判断で禁止カテゴリ（FX・ギャンブル等）を追加しない。
独自判断で複数実験を同時実行しない。
独自判断でタイマー表示画面にテーマトグルを表示しない。
