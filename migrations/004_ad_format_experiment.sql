-- migrations/004_ad_format_experiment.sql
-- docs/MONETIZATION.md §13 広告フォーマット A/B テスト
--
-- このマイグレーションは自動実行しない。ユーザーが Neon SQL Editor で手動実行する想定。
-- 手順:
--   1. 既存の active 実験 'timer-category-mix-v1' を paused に（実質データなし = 影響なし）
--   2. 新実験 'ad-format-v1' を active で投入
--   3. 3 つのバリアント（text-only / banner-only / text-and-banner）を weight 1 で追加

-- 1. 既存実験を paused に
UPDATE experiments SET status = 'paused' WHERE id = 'timer-category-mix-v1';

-- 2. 新実験を追加（started_at と created_at は UNIX ms で記録）
INSERT INTO experiments (id, name, description, status, started_at, created_at) VALUES (
  'ad-format-v1',
  '広告フォーマットテスト',
  'タイマー画面でテキストカード / スティッキーフッターバナー / 両方の CTR を比較',
  'active',
  EXTRACT(EPOCH FROM NOW()) * 1000,
  EXTRACT(EPOCH FROM NOW()) * 1000
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  started_at = COALESCE(experiments.started_at, EXCLUDED.started_at);

-- 3. バリアント追加（experiments.ts の定義と同期、再実行安全）
INSERT INTO variants (id, experiment_id, name, weight, config, created_at) VALUES
  ('ad-format-v1__text-only', 'ad-format-v1', 'text-only', 1,
    '{"format":"text-only"}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('ad-format-v1__banner-only', 'ad-format-v1', 'banner-only', 1,
    '{"format":"banner-only"}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('ad-format-v1__text-and-banner', 'ad-format-v1', 'text-and-banner', 1,
    '{"format":"text-and-banner"}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000)
ON CONFLICT (id) DO NOTHING;
