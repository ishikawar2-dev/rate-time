import { NextResponse } from 'next/server';
import { activateExperiment } from '@/lib/admin-queries';
import { invalidateActiveExperimentCache } from '@/lib/experiments';

export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * 実験を active に切り替える。
 *
 * middleware で Basic 認証済みの前提。
 * 複数 active を避けるため、admin-queries 側で他の active 実験の有無をチェックしている。
 *
 * レスポンス:
 *   204: 成功
 *   404: 実験が存在しない
 *   409: 他に active な実験が存在（メッセージ付き）
 */
export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const result = await activateExperiment(id);
  if (result.ok) {
    // middleware 側の TTL キャッシュを明示的に失効
    invalidateActiveExperimentCache();
    return new NextResponse(null, { status: 204 });
  }
  const status = result.reason === 'not_found' ? 404 : 409;
  return new NextResponse(result.message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
