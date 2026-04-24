import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/admin-auth';
import { getDailyReportPayload } from '@/lib/admin-queries';
import { getJSTYesterday } from '@/lib/date-utils';

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

export async function GET(req: NextRequest) {
  const expectedToken = process.env.ROUTINE_API_TOKEN;
  if (!expectedToken) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (!verifyBearerToken(req.headers.get('authorization'), expectedToken)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ?? getJSTYesterday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }
  const parsed = new Date(`${date}T00:00:00+09:00`);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  try {
    const payload = await getDailyReportPayload(date);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[api/admin/report/daily]', err);
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }
}
