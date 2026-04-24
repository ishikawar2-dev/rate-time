import { NextRequest, NextResponse } from 'next/server';
import { getDailyReportPayload, saveDailyReport } from '@/lib/admin-queries';
import { getJSTYesterday } from '@/lib/date-utils';

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
    const { id, savedAt } = await saveDailyReport(
      payload.project,
      date,
      payload.generated_at,
      payload,
    );
    return NextResponse.json({ ok: true, date, id, saved_at: savedAt.toISOString() });
  } catch (err) {
    console.error('[api/cron/daily-report]', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
