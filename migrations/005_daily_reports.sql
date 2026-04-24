-- migrations/005_daily_reports.sql
-- docs/MONETIZATION.md §12.9 日次レポート履歴保存テーブル
--
-- Claude Routines 等から POST /api/admin/report/save で送信された日次レポート JSON を保存する。
-- (project, date) で UNIQUE 制約を持ち、同日 2 回以降の保存は ON CONFLICT で上書き。
-- 管理画面 /admin/reports で履歴の可視化に使用する。
--
-- このマイグレーションは自動実行しない。ユーザーが Neon SQL Editor で手動実行する。

CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  project VARCHAR(50) NOT NULL DEFAULT 'rate-time',
  date DATE NOT NULL,                  -- JST の日付
  generated_at TIMESTAMPTZ NOT NULL,   -- Routines が生成した時刻（UTC で保存）
  report_json JSONB NOT NULL,          -- 送信されたレポート全体（ReportPayload スキーマ）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_date ON daily_reports(project, date DESC);
