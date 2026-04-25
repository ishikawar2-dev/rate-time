import { NextRequest, NextResponse } from 'next/server';
import { getDailyReportPayload, saveDailyReport } from '@/lib/admin-queries';
import { getJSTYesterday } from '@/lib/date-utils';
import { upsertDailyReportToNotion } from '@/lib/notion-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Vercel Cron が毎日 JST 10:00（UTC 01:00）に叩く日次レポート自動保存エンドポイント。
 *
 * 認証: Authorization: Bearer <CRON_SECRET>
 * CRON_SECRET は Vercel の Environment Variables に設定する。
 * Vercel Cron はリクエスト時に自動でこのヘッダを付与する。
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const date = getJSTYesterday();

  try {
    const payload = await getDailyReportPayload(date);

    // 1. DB に保存（既存）
    const { id, savedAt } = await saveDailyReport(
      payload.project,
      date,
      payload.generated_at,
      payload,
    );

    // 2. Notion に書き込み（失敗しても DB 保存は成功扱い）
    let notionResult: { ok: boolean; created?: boolean; error?: string } = { ok: false };

    if (process.env.NOTION_TOKEN && process.env.NOTION_DB_ID) {
      try {
        const result = await upsertDailyReportToNotion(process.env.NOTION_DB_ID, {
          date,
          project: payload.project,
          impressions: payload.kpis.impressions,
          clicks: payload.kpis.clicks,
          ctr: payload.kpis.ctr,
          anomalies: payload.anomalies.length,
          detailUrl: `https://rate-time.com/admin/reports/${date}`,
        });
        notionResult = { ok: true, created: result.created };
        console.log('[api/cron/daily-report] Notion sync:', notionResult);
      } catch (notionErr) {
        console.error('[api/cron/daily-report] Notion sync failed:', notionErr);
        notionResult = {
          ok: false,
          error: notionErr instanceof Error ? notionErr.message : 'unknown',
        };
      }
    } else {
      console.log('[api/cron/daily-report] Notion env vars not set, skipping');
      notionResult = { ok: false, error: 'env_not_configured' };
    }

    console.log('[api/cron/daily-report] Success:', {
      date,
      impressions: payload.kpis.impressions,
      clicks: payload.kpis.clicks,
      anomalies: payload.anomalies.length,
      notion: notionResult,
    });

    return NextResponse.json({ ok: true, date, id, saved_at: savedAt.toISOString(), notion: notionResult });
  } catch (err) {
    console.error('[api/cron/daily-report]', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
