-- Phase 6: タイマー単位のテーマ（ライト/ダーク）を保存する
-- docs/MONETIZATION.md §5.2 に基づく
--
-- デフォルトは 'light'。URL共有先でも SSR でこの値を読み出して同じテーマで表示する。

ALTER TABLE timers ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'light'
  CHECK (theme IN ('dark', 'light'));
