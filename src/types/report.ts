/**
 * 日次レポートの型定義（docs/MONETIZATION.md §12 / docs/SPEC.md §3 と同期）。
 *
 * ReportPayload は /api/admin/report/daily の GET レスポンス、
 *                 /api/admin/report/save の POST リクエストボディ、
 *                 daily_reports.report_json の中身、
 * に共通で使われる。
 */

import type { ExperimentStatus } from '@/lib/experiments';

export interface ReportKpis {
  impressions: number;
  clicks: number;
  ctr: number;              // 0.0001 精度の小数
  unique_visitors: number;
}

export interface ReportVariant {
  id: string;
  weight: number;
  impressions: number;
  clicks: number;
  ctr: number;
  unique_visitors: number;
}

export interface ReportExperiment {
  id: string;
  name: string;
  status: ExperimentStatus;
  variants: ReportVariant[];
}

export interface ReportOffer {
  id: string;
  category: string;
  advertiser: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface ReportAnomaly {
  type: string;             // 'impressions_drop' | 'no_clicks' | 'variant_no_impressions' | 拡張
  severity: 'low' | 'medium' | 'high';
  message: string;
  context: Record<string, unknown>;
}

export interface ReportComparison {
  impressions_delta_pct: number;
  clicks_delta_pct: number;
  ctr_delta_pct: number;
}

export interface ReportPayload {
  project: string;          // 'rate-time' 等
  date: string;             // YYYY-MM-DD（JST）
  generated_at: string;     // ISO 8601 UTC
  kpis: ReportKpis;
  experiments: ReportExperiment[];
  offers: ReportOffer[];
  anomalies: ReportAnomaly[];
  comparison_to_yesterday: ReportComparison;
}

/** DB に保存された日次レポート行（daily_reports テーブル） */
export interface DailyReportRow {
  id: number;
  project: string;
  date: string;             // YYYY-MM-DD
  generated_at: string;     // ISO 8601
  report_json: ReportPayload;
  created_at: string;       // ISO 8601
}
