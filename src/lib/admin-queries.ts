/**
 * 管理画面 /admin/experiments/* 用の SQL 集計クエリ。
 *
 * 重要な実装メモ:
 *   仕様書 §4.8 の例クエリは impressions と clicks を同一クエリで LEFT JOIN するため、
 *   N × M の直積が発生して件数が過大に計上されるバグがある。
 *   このファイルでは CTE でそれぞれのテーブルを事前集計してから variants と JOIN し、
 *   直積を回避する。
 *
 * 検証用テストデータ（Phase 5 以降、実運用投入前に必ず手動確認すること）:
 *   INSERT INTO impressions (experiment_id, variant_id, placement, visitor_id, page_path, recorded_at)
 *   SELECT 'timer-placement-v1', 'timer-placement-v1__control', 'test',
 *          'v' || g::text, '/', EXTRACT(EPOCH FROM NOW()) * 1000
 *   FROM generate_series(1, 100) g;
 *   INSERT INTO clicks (experiment_id, variant_id, placement, offer_id, visitor_id, page_path, recorded_at)
 *   SELECT 'timer-placement-v1', 'timer-placement-v1__control', 'test', 'o1',
 *          'v' || g::text, '/', EXTRACT(EPOCH FROM NOW()) * 1000
 *   FROM generate_series(1, 5) g;
 *   -- /admin/experiments/timer-placement-v1 でインプレッション 100 / クリック 5 / CTR 5.00% が表示されることを確認
 *   DELETE FROM impressions WHERE placement = 'test';
 *   DELETE FROM clicks WHERE placement = 'test';
 */

import { getSql } from './db';
import type { ExperimentStatus } from './experiments';

export interface ExperimentSummary {
  id: string;
  name: string;
  status: ExperimentStatus;
  started_at: number | null;
  ended_at: number | null;
  variant_count: number;
  impression_count: number;
  click_count: number;
}

export interface ExperimentInfo {
  id: string;
  name: string;
  description: string | null;
  status: ExperimentStatus;
  started_at: number | null;
  ended_at: number | null;
  created_at: number;
}

export interface VariantStat {
  id: string;
  name: string;
  weight: number;
  unique_visitors: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
}

export interface FilterParams {
  /** UNIX ms。null なら下限なし */
  from: number | null;
  /** UNIX ms。null なら上限なし */
  to: number | null;
  /** offer_id。null ならフィルタしない。clicks のみに適用。 */
  offer: string | null;
  /** page_path。null ならフィルタしない。impressions と clicks 両方に適用。 */
  page: string | null;
}

export interface DailyPoint {
  day: string; // 'YYYY-MM-DD'
  variantId: string;
  count: number;
}

// ─── 一覧 ─────────────────────────────────────────────────────────

export async function listExperiments(): Promise<ExperimentSummary[]> {
  const rows = await getSql()`
    SELECT
      e.id,
      e.name,
      e.status,
      e.started_at,
      e.ended_at,
      (SELECT COUNT(*) FROM variants WHERE experiment_id = e.id) AS variant_count,
      (SELECT COUNT(*) FROM impressions WHERE experiment_id = e.id) AS impression_count,
      (SELECT COUNT(*) FROM clicks WHERE experiment_id = e.id) AS click_count
    FROM experiments e
    ORDER BY
      CASE e.status
        WHEN 'active' THEN 1
        WHEN 'paused' THEN 2
        WHEN 'draft' THEN 3
        WHEN 'completed' THEN 4
        ELSE 5
      END,
      e.started_at DESC NULLS LAST,
      e.id
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status as ExperimentStatus,
    started_at: r.started_at != null ? Number(r.started_at) : null,
    ended_at: r.ended_at != null ? Number(r.ended_at) : null,
    variant_count: Number(r.variant_count),
    impression_count: Number(r.impression_count),
    click_count: Number(r.click_count),
  }));
}

// ─── 詳細 ─────────────────────────────────────────────────────────

export async function getExperimentInfo(id: string): Promise<ExperimentInfo | null> {
  const rows = await getSql()`
    SELECT id, name, description, status, started_at, ended_at, created_at
    FROM experiments WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    status: r.status as ExperimentStatus,
    started_at: r.started_at != null ? Number(r.started_at) : null,
    ended_at: r.ended_at != null ? Number(r.ended_at) : null,
    created_at: Number(r.created_at),
  };
}

/**
 * バリアント別の集計。
 *
 * impressions と clicks を CTE で個別に事前集計してから variants と JOIN することで、
 * インプレッション N 件 × クリック M 件が N*M 件にカウントされる直積バグを回避する。
 *
 * フィルタは NULL 許容で渡し、NULL のとき各フィルタ条件を無効化する。
 */
export async function getVariantStats(
  experimentId: string,
  filters: FilterParams,
): Promise<VariantStat[]> {
  const { from, to, offer, page } = filters;
  const rows = await getSql()`
    WITH imp AS (
      SELECT variant_id, COUNT(*) AS cnt, COUNT(DISTINCT visitor_id) AS uniq
      FROM impressions
      WHERE experiment_id = ${experimentId}
        AND (${from}::bigint IS NULL OR recorded_at >= ${from}::bigint)
        AND (${to}::bigint IS NULL OR recorded_at <= ${to}::bigint)
        AND (${page}::text IS NULL OR page_path = ${page}::text)
      GROUP BY variant_id
    ),
    clk AS (
      SELECT variant_id, COUNT(*) AS cnt
      FROM clicks
      WHERE experiment_id = ${experimentId}
        AND (${from}::bigint IS NULL OR recorded_at >= ${from}::bigint)
        AND (${to}::bigint IS NULL OR recorded_at <= ${to}::bigint)
        AND (${offer}::text IS NULL OR offer_id = ${offer}::text)
        AND (${page}::text IS NULL OR page_path = ${page}::text)
      GROUP BY variant_id
    )
    SELECT
      v.id,
      v.name,
      v.weight,
      COALESCE(imp.uniq, 0) AS unique_visitors,
      COALESCE(imp.cnt, 0) AS impressions,
      COALESCE(clk.cnt, 0) AS clicks,
      CASE WHEN COALESCE(imp.cnt, 0) > 0
        THEN ROUND(COALESCE(clk.cnt, 0)::numeric / imp.cnt * 100, 2)
        ELSE NULL
      END AS ctr
    FROM variants v
    LEFT JOIN imp ON imp.variant_id = v.id
    LEFT JOIN clk ON clk.variant_id = v.id
    WHERE v.experiment_id = ${experimentId}
    ORDER BY v.name
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    weight: Number(r.weight),
    unique_visitors: Number(r.unique_visitors),
    impressions: Number(r.impressions),
    clicks: Number(r.clicks),
    ctr: r.ctr != null ? Number(r.ctr) : null,
  }));
}

// ─── 日次推移 ─────────────────────────────────────────────────────

export async function getDailyImpressions(
  experimentId: string,
  filters: FilterParams,
): Promise<DailyPoint[]> {
  const { from, to, page } = filters;
  const rows = await getSql()`
    SELECT
      TO_CHAR(
        (TO_TIMESTAMP(recorded_at / 1000) AT TIME ZONE 'Asia/Tokyo')::date,
        'YYYY-MM-DD'
      ) AS day,
      variant_id,
      COUNT(*) AS cnt
    FROM impressions
    WHERE experiment_id = ${experimentId}
      AND (${from}::bigint IS NULL OR recorded_at >= ${from}::bigint)
      AND (${to}::bigint IS NULL OR recorded_at <= ${to}::bigint)
      AND (${page}::text IS NULL OR page_path = ${page}::text)
    GROUP BY day, variant_id
    ORDER BY day, variant_id
  `;
  return rows.map((r) => ({
    day: r.day,
    variantId: r.variant_id,
    count: Number(r.cnt),
  }));
}

export async function getDailyClicks(
  experimentId: string,
  filters: FilterParams,
): Promise<DailyPoint[]> {
  const { from, to, offer, page } = filters;
  const rows = await getSql()`
    SELECT
      TO_CHAR(
        (TO_TIMESTAMP(recorded_at / 1000) AT TIME ZONE 'Asia/Tokyo')::date,
        'YYYY-MM-DD'
      ) AS day,
      variant_id,
      COUNT(*) AS cnt
    FROM clicks
    WHERE experiment_id = ${experimentId}
      AND (${from}::bigint IS NULL OR recorded_at >= ${from}::bigint)
      AND (${to}::bigint IS NULL OR recorded_at <= ${to}::bigint)
      AND (${offer}::text IS NULL OR offer_id = ${offer}::text)
      AND (${page}::text IS NULL OR page_path = ${page}::text)
    GROUP BY day, variant_id
    ORDER BY day, variant_id
  `;
  return rows.map((r) => ({
    day: r.day,
    variantId: r.variant_id,
    count: Number(r.cnt),
  }));
}

// ─── フィルタ候補値（ドロップダウン用） ──────────────────────────────

export async function getDistinctOffers(experimentId: string): Promise<string[]> {
  const rows = await getSql()`
    SELECT DISTINCT offer_id
    FROM clicks
    WHERE experiment_id = ${experimentId}
    ORDER BY offer_id
  `;
  return rows.map((r) => r.offer_id as string);
}

export async function getDistinctPages(experimentId: string): Promise<string[]> {
  const rows = await getSql()`
    SELECT DISTINCT page_path FROM (
      SELECT page_path FROM impressions WHERE experiment_id = ${experimentId}
      UNION
      SELECT page_path FROM clicks WHERE experiment_id = ${experimentId}
    ) AS pages
    ORDER BY page_path
  `;
  return rows.map((r) => r.page_path as string);
}

// ─── ステータス変更ミューテーション ──────────────────────────────────

export type MutationResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'conflict'; message: string };

/**
 * 実験を active に切り替える。
 * - 他にも active な実験があれば conflict（複数 active 禁止）
 * - draft からの遷移のときのみ started_at を現在時刻で設定
 * - paused からの遷移では started_at を変更しない
 */
export async function activateExperiment(id: string): Promise<MutationResult> {
  const sql = getSql();
  // 他の active の有無をチェック
  const conflicts = await sql`
    SELECT id FROM experiments
    WHERE status = 'active' AND id != ${id}
    LIMIT 1
  `;
  if (conflicts.length > 0) {
    return {
      ok: false,
      reason: 'conflict',
      message: `別の実験 '${conflicts[0].id}' が現在アクティブです。先に停止してください。`,
    };
  }

  const now = Date.now();
  const updated = await sql`
    UPDATE experiments
    SET
      status = 'active',
      started_at = COALESCE(started_at, ${now})
    WHERE id = ${id}
    RETURNING id
  `;
  if (updated.length === 0) {
    return { ok: false, reason: 'not_found', message: `実験 '${id}' が見つかりません。` };
  }
  return { ok: true };
}

/**
 * 実験を paused に切り替える。
 * - 現在のステータスが 'active' でなければ conflict
 */
export async function pauseExperiment(id: string): Promise<MutationResult> {
  const sql = getSql();
  const current = await sql`SELECT status FROM experiments WHERE id = ${id}`;
  if (current.length === 0) {
    return { ok: false, reason: 'not_found', message: `実験 '${id}' が見つかりません。` };
  }
  const status = current[0].status as ExperimentStatus;
  if (status !== 'active') {
    return {
      ok: false,
      reason: 'conflict',
      message: `現在のステータス '${status}' から一時停止はできません（'active' のみ可能）。`,
    };
  }
  await sql`UPDATE experiments SET status = 'paused' WHERE id = ${id}`;
  return { ok: true };
}
