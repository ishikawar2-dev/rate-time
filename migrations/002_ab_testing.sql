-- A/Bテスト基盤（docs/MONETIZATION.md §4.2）
-- 実験定義・バリアント定義・インプレッション・クリックの4テーブル。
-- 末尾で実験1〜4を status='draft' でシードする（再実行安全: ON CONFLICT DO NOTHING）。

-- =============================================================================
-- 1. 実験（テスト）定義
-- =============================================================================
CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,                   -- 例: 'timer-placement-v1'
  name TEXT NOT NULL,                    -- 人間可読の名前
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'active' | 'paused' | 'completed'
  started_at BIGINT,                     -- 開始時刻（UNIXタイムスタンプ ms、draft 時は NULL）
  ended_at BIGINT,                       -- 終了時刻（完了時のみ）
  created_at BIGINT NOT NULL
);

-- =============================================================================
-- 2. バリアント定義
-- =============================================================================
CREATE TABLE IF NOT EXISTS variants (
  id TEXT PRIMARY KEY,                   -- 例: 'timer-placement-v1__control'
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 例: 'control'
  weight INTEGER NOT NULL DEFAULT 1,     -- 割当重み（均等なら全て1）
  config JSONB NOT NULL,                 -- バリアント固有の設定
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_variants_experiment ON variants(experiment_id);

-- =============================================================================
-- 3. インプレッション
-- =============================================================================
CREATE TABLE IF NOT EXISTS impressions (
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  placement TEXT NOT NULL,               -- 例: 'timer-debt-consolidation'
  visitor_id TEXT NOT NULL,              -- Cookie `rt_vid` で割り振る UUID
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  recorded_at BIGINT NOT NULL            -- UNIXタイムスタンプ（ms）
);

CREATE INDEX IF NOT EXISTS idx_impressions_exp_var ON impressions(experiment_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_impressions_recorded ON impressions(recorded_at);
CREATE INDEX IF NOT EXISTS idx_impressions_visitor ON impressions(visitor_id);

-- =============================================================================
-- 4. クリック
-- =============================================================================
CREATE TABLE IF NOT EXISTS clicks (
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  placement TEXT NOT NULL,
  offer_id TEXT NOT NULL,                -- どのオファーがクリックされたか
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  recorded_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clicks_exp_var ON clicks(experiment_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_clicks_recorded ON clicks(recorded_at);
CREATE INDEX IF NOT EXISTS idx_clicks_offer ON clicks(offer_id);

-- =============================================================================
-- 5. 実験1〜4 のシード（draft）
-- =============================================================================
-- experiments.ts の定義と同期。再実行安全のため ON CONFLICT DO NOTHING。

-- 実験1: 配置位置テスト
INSERT INTO experiments (id, name, description, status, created_at)
VALUES (
  'timer-placement-v1',
  '配置位置テスト',
  'タイマー画面でのアフィリエイトセクション配置位置を上部/下部/両方で比較',
  'draft',
  EXTRACT(EPOCH FROM NOW()) * 1000
) ON CONFLICT (id) DO NOTHING;

INSERT INTO variants (id, experiment_id, name, weight, config, created_at) VALUES
  ('timer-placement-v1__control', 'timer-placement-v1', 'control', 1,
    '{"placement":"bottom","categoryOrder":["debt-consolidation","loan-consolidation"],"limitByCategory":{"debt-consolidation":3,"loan-consolidation":3}}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-placement-v1__top', 'timer-placement-v1', 'top', 1,
    '{"placement":"top","categoryOrder":["debt-consolidation","loan-consolidation"],"limitByCategory":{"debt-consolidation":3,"loan-consolidation":3}}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-placement-v1__both', 'timer-placement-v1', 'both', 1,
    '{"placement":"both","categoryOrder":["debt-consolidation","loan-consolidation"],"limitByCategory":{"debt-consolidation":3,"loan-consolidation":3}}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000)
ON CONFLICT (id) DO NOTHING;

-- 実験2: カテゴリ順序テスト
INSERT INTO experiments (id, name, description, status, created_at)
VALUES (
  'timer-category-order-v1',
  'カテゴリ順序テスト',
  '債務整理とおまとめローンの表示順を入れ替えて比較（実験1の勝ちバリアント固定後）',
  'draft',
  EXTRACT(EPOCH FROM NOW()) * 1000
) ON CONFLICT (id) DO NOTHING;

INSERT INTO variants (id, experiment_id, name, weight, config, created_at) VALUES
  ('timer-category-order-v1__control', 'timer-category-order-v1', 'control', 1,
    '{"categoryOrder":["debt-consolidation","loan-consolidation"]}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-category-order-v1__swapped', 'timer-category-order-v1', 'swapped', 1,
    '{"categoryOrder":["loan-consolidation","debt-consolidation"]}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000)
ON CONFLICT (id) DO NOTHING;

-- 実験3: 表示件数テスト
INSERT INTO experiments (id, name, description, status, created_at)
VALUES (
  'timer-limit-v1',
  '表示件数テスト',
  '各カテゴリの表示件数を3件と1件で比較',
  'draft',
  EXTRACT(EPOCH FROM NOW()) * 1000
) ON CONFLICT (id) DO NOTHING;

INSERT INTO variants (id, experiment_id, name, weight, config, created_at) VALUES
  ('timer-limit-v1__control', 'timer-limit-v1', 'control', 1,
    '{"limitByCategory":{"debt-consolidation":3,"loan-consolidation":3}}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-limit-v1__single', 'timer-limit-v1', 'single', 1,
    '{"limitByCategory":{"debt-consolidation":1,"loan-consolidation":1}}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000)
ON CONFLICT (id) DO NOTHING;

-- 実験4: カテゴリ種類テスト
INSERT INTO experiments (id, name, description, status, created_at)
VALUES (
  'timer-category-mix-v1',
  'カテゴリ種類テスト',
  '扱うカテゴリの組合せを比較（リスク高のため実験1〜3の後に実施）',
  'draft',
  EXTRACT(EPOCH FROM NOW()) * 1000
) ON CONFLICT (id) DO NOTHING;

INSERT INTO variants (id, experiment_id, name, weight, config, created_at) VALUES
  ('timer-category-mix-v1__safe-only', 'timer-category-mix-v1', 'safe-only', 1,
    '{"enabledCategories":["debt-consolidation","loan-consolidation"]}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-category-mix-v1__with-card-loan', 'timer-category-mix-v1', 'with-card-loan', 1,
    '{"enabledCategories":["debt-consolidation","loan-consolidation","card-loan"]}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-category-mix-v1__with-consumer-finance', 'timer-category-mix-v1', 'with-consumer-finance', 1,
    '{"enabledCategories":["debt-consolidation","loan-consolidation","consumer-finance"]}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000),
  ('timer-category-mix-v1__all', 'timer-category-mix-v1', 'all', 1,
    '{"enabledCategories":["debt-consolidation","loan-consolidation","card-loan","consumer-finance","credit-card"]}'::jsonb,
    EXTRACT(EPOCH FROM NOW()) * 1000)
ON CONFLICT (id) DO NOTHING;
