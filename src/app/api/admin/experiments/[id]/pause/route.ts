import { NextResponse } from 'next/server';
import { pauseExperiment } from '@/lib/admin-queries';
import { invalidateActiveExperimentCache } from '@/lib/experiments';

export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * active な実験を paused に切り替える。
 * middleware で Basic 認証済みの前提。
 *
 * レスポンス:
 *   204: 成功
 *   404: 実験が存在しない
 *   409: 現在のステータスが 'active' ではない
 */
export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const result = await pauseExperiment(id);
  if (result.ok) {
    invalidateActiveExperimentCache();
    return new NextResponse(null, { status: 204 });
  }
  const status = result.reason === 'not_found' ? 404 : 409;
  return new NextResponse(result.message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
