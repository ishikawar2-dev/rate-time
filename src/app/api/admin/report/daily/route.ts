import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/admin-auth';
import { affiliateOffers, type AffiliateCategory } from '@/lib/affiliates';
import {
  getDailyExperimentVariantStats,
  getDailyOfferClicks,
  getDailyPlacementImpressions,
  getDayTotals,
  placementToCategory,
  type DateRangeMs,
  type DailyVariantRow,
  type DayTotals,
} from '@/lib/admin-queries';
import type { ExperimentStatus } from '@/lib/experiments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Claude Routines 等の外部サービスから叩く日次レポート API。
 *
 * 認証: Authorization: Bearer <ROUTINE_API_TOKEN>
 * ROUTINE_API_TOKEN 未設定時は 404（admin 系と同じフェイルセーフ）
 *
 * クエリ: ?date=YYYY-MM-DD（JST、省略時は前日）
 *
 * レスポンス JSON スキーマは docs/SPEC.md §「複数プロジェクト共通 Routines API」を参照。
 */

const PROJECT_NAME = 'rate-time';

// ─── 日付ヘルパー（JST 基準） ─────────────────────────────────────

/** `Date` を JST の YYYY-MM-DD 文字列に変換（Intl で確実に JST 表記に） */
function formatJSTDate(d: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(d);
}

/** 現在時刻時点での JST 前日（YYYY-MM-DD） */
function getJSTYesterday(): string {
  const now = Date.now();
  // 24 時間前の時刻を JST で日付フォーマット（DST は日本では無関係）
  return formatJSTDate(new Date(now - 24 * 3600 * 1000));
}

/** JST の 1 日前の YYYY-MM-DD を返す */
function subtractJSTDay(date: string): string {
  // JST の 00:00:00 → UTC タイムスタンプ経由で -1 日
  const jstMidnight = new Date(`${date}T00:00:00+09:00`).getTime();
  return formatJSTDate(new Date(jstMidnight - 24 * 3600 * 1000));
}

/** YYYY-MM-DD (JST) から UNIX ms の [from, to] を計算 */
function jstDateToRange(date: string): DateRangeMs {
  const from = new Date(`${date}T00:00:00+09:00`).getTime();
  const to = new Date(`${date}T23:59:59.999+09:00`).getTime();
  return { from, to };
}

// ─── 数値ヘルパー ─────────────────────────────────────────────────

/** CTR = clicks / impressions、0.0001 精度で丸める */
function calcCtr(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 10000;
}

/** (today - yesterday) / yesterday * 100、小数2桁。yesterday=0 のときは 0 を返す */
function deltaPct(today: number, yesterday: number): number {
  if (yesterday === 0) return 0;
  return Math.round(((today - yesterday) / yesterday) * 10000) / 100;
}

// ─── レスポンス構築 ───────────────────────────────────────────────

type Anomaly = {
  type: 'impressions_drop' | 'no_clicks' | 'variant_no_impressions';
  severity: 'low' | 'medium' | 'high';
  message: string;
  context: Record<string, unknown>;
};

interface ExperimentReport {
  id: string;
  name: string;
  status: ExperimentStatus;
  variants: Array<{
    id: string;
    weight: number;
    impressions: number;
    clicks: number;
    ctr: number;
    unique_visitors: number;
  }>;
}

function buildExperimentsReport(rows: DailyVariantRow[]): ExperimentReport[] {
  const map = new Map<string, ExperimentReport>();
  for (const r of rows) {
    if (!map.has(r.experiment_id)) {
      map.set(r.experiment_id, {
        id: r.experiment_id,
        name: r.experiment_name,
        status: r.experiment_status,
        variants: [],
      });
    }
    map.get(r.experiment_id)!.variants.push({
      id: r.variant_id,
      weight: r.weight,
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: calcCtr(r.clicks, r.impressions),
      unique_visitors: r.unique_visitors,
    });
  }
  return Array.from(map.values());
}

/** placement 別インプレッションを category 別に集計 */
function impressionsByCategory(
  placementStats: Array<{ placement: string; impressions: number }>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const p of placementStats) {
    const cat = placementToCategory(p.placement);
    if (!cat) continue;
    result[cat] = (result[cat] ?? 0) + p.impressions;
  }
  return result;
}

/**
 * per-offer レポート生成。
 * - impressions は「同カテゴリのセクションが表示された回数」をそのまま割り当てる
 *   （1 セクション表示 = そのカテゴリの全 offer に 1 インプレッション、という現行の表示仕様）
 * - clicks は offer_id ベースで正確
 */
function buildOffersReport(
  placementStats: Array<{ placement: string; impressions: number }>,
  offerClicks: Array<{ offer_id: string; clicks: number }>,
): Array<{
  id: string;
  category: AffiliateCategory;
  advertiser: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
}> {
  const impsByCat = impressionsByCategory(placementStats);
  const clicksByOffer = new Map(offerClicks.map((c) => [c.offer_id, c.clicks]));

  return affiliateOffers
    .filter((o) => o.active)
    .map((o) => {
      const imps = impsByCat[o.category] ?? 0;
      const clicks = clicksByOffer.get(o.id) ?? 0;
      return {
        id: o.id,
        category: o.category,
        advertiser: o.advertiser ?? null,
        impressions: imps,
        clicks,
        ctr: calcCtr(clicks, imps),
      };
    });
}

/** 異常値検知ルール */
function detectAnomalies(
  today: DayTotals,
  yesterday: DayTotals,
  experiments: ExperimentReport[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // 1. インプレッション数が前日比 50% 以上減少
  if (yesterday.impressions > 0) {
    const dropPct = ((yesterday.impressions - today.impressions) / yesterday.impressions) * 100;
    if (dropPct >= 50) {
      anomalies.push({
        type: 'impressions_drop',
        severity: 'high',
        message: `インプレッション数が前日比で ${Math.round(dropPct)}% 減少しました`,
        context: {
          yesterday: yesterday.impressions,
          today: today.impressions,
          drop_pct: Math.round(dropPct * 100) / 100,
        },
      });
    }
  }

  // 2. impressions >= 10 かつ clicks = 0
  if (today.impressions >= 10 && today.clicks === 0) {
    anomalies.push({
      type: 'no_clicks',
      severity: 'medium',
      message: `クリックが 0 件です（インプレッション ${today.impressions} 件）`,
      context: { impressions: today.impressions, clicks: 0 },
    });
  }

  // 3. active な実験のバリアントで、合計 >= 10 インプレッションありつつ特定バリアントだけ 0
  for (const exp of experiments) {
    if (exp.status !== 'active') continue;
    const total = exp.variants.reduce((s, v) => s + v.impressions, 0);
    if (total < 10) continue;
    for (const v of exp.variants) {
      if (v.impressions === 0) {
        anomalies.push({
          type: 'variant_no_impressions',
          severity: 'high',
          message: `実験 ${exp.id} のバリアント ${v.id} がインプレッション 0 です（割り当てバグの可能性）`,
          context: {
            experiment_id: exp.id,
            variant_id: v.id,
            experiment_total_impressions: total,
          },
        });
      }
    }
  }

  return anomalies;
}

// ─── GET ハンドラ ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // 認証: ROUTINE_API_TOKEN 未設定時は存在自体を隠す（404）
  const expectedToken = process.env.ROUTINE_API_TOKEN;
  if (!expectedToken) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (!verifyBearerToken(req.headers.get('authorization'), expectedToken)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // date パラメータ検証
  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ?? getJSTYesterday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }
  const parsed = new Date(`${date}T00:00:00+09:00`);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  const todayRange = jstDateToRange(date);
  const yesterdayRange = jstDateToRange(subtractJSTDay(date));

  try {
    const [todayTotals, yesterdayTotals, variantStats, placementStats, offerClicks] =
      await Promise.all([
        getDayTotals(todayRange),
        getDayTotals(yesterdayRange),
        getDailyExperimentVariantStats(todayRange),
        getDailyPlacementImpressions(todayRange),
        getDailyOfferClicks(todayRange),
      ]);

    const experiments = buildExperimentsReport(variantStats);
    const offers = buildOffersReport(placementStats, offerClicks);
    const anomalies = detectAnomalies(todayTotals, yesterdayTotals, experiments);

    const todayCtr = calcCtr(todayTotals.clicks, todayTotals.impressions);
    const yesterdayCtr = calcCtr(yesterdayTotals.clicks, yesterdayTotals.impressions);

    return NextResponse.json({
      project: PROJECT_NAME,
      date,
      generated_at: new Date().toISOString(),
      kpis: {
        impressions: todayTotals.impressions,
        clicks: todayTotals.clicks,
        ctr: todayCtr,
        unique_visitors: todayTotals.unique_visitors,
      },
      experiments,
      offers,
      anomalies,
      comparison_to_yesterday: {
        impressions_delta_pct: deltaPct(todayTotals.impressions, yesterdayTotals.impressions),
        clicks_delta_pct: deltaPct(todayTotals.clicks, yesterdayTotals.clicks),
        ctr_delta_pct: deltaPct(todayCtr, yesterdayCtr),
      },
    });
  } catch (err) {
    console.error('[api/admin/report/daily]', err);
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }
}
