import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/admin-auth';
import { saveDailyReport } from '@/lib/admin-queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 日次レポート JSON を daily_reports テーブルに保存する（UPSERT）。
 *
 * 認証: Authorization: Bearer <ROUTINE_API_TOKEN>（未設定時 404）
 * リクエストボディ: /api/admin/report/daily が返す ReportPayload と同じ形式
 *
 * レスポンス:
 *   201: { id, saved_at }
 *   400: { error: 'invalid_payload', details: string }
 *   401: { error: 'unauthorized' }
 *   404: 環境変数未設定（ボディを返さない）
 *   500: { error: 'database_error' }
 */
export async function POST(req: NextRequest) {
  const expectedToken = process.env.ROUTINE_API_TOKEN;
  if (!expectedToken) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (!verifyBearerToken(req.headers.get('authorization'), expectedToken)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_payload', details: 'body must be valid JSON' },
      { status: 400 },
    );
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'invalid_payload', details: 'body must be a JSON object' },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;

  // date: 必須、YYYY-MM-DD 形式
  const date = payload.date;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'invalid_payload', details: 'date is required in YYYY-MM-DD format' },
      { status: 400 },
    );
  }

  // project: 省略時は 'rate-time'
  const project =
    typeof payload.project === 'string' && payload.project.length > 0
      ? payload.project
      : 'rate-time';

  // generated_at: 省略時は現在時刻。ISO 文字列としてそのまま保存（TIMESTAMPTZ にキャスト）
  const generatedAt =
    typeof payload.generated_at === 'string'
      ? payload.generated_at
      : new Date().toISOString();

  try {
    const { id, savedAt } = await saveDailyReport(project, date, generatedAt, payload);
    return NextResponse.json(
      { id, saved_at: savedAt.toISOString() },
      { status: 201 },
    );
  } catch (err) {
    console.error('[api/admin/report/save]', err);
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }
}
