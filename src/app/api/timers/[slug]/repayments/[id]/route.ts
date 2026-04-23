import { NextRequest, NextResponse } from 'next/server';
import { getTimerBySlug, getEntryById, deleteRepayment, updateRepayment, getRepaymentsByEntryId } from '@/lib/db';
import { verifyEditToken } from '@/lib/auth';

export const runtime = 'nodejs';

type Params = { params: Promise<{ slug: string; id: string }> };

async function resolveRepayment(slug: string, repaymentId: string) {
  const timer = await getTimerBySlug(slug);
  if (!timer) return { error: 'タイマーが見つかりません', status: 404 } as const;

  // repayment を entry 経由で検索して timer に属するか確認
  const { getRepaymentById } = await import('@/lib/db');
  const repayment = await getRepaymentById(repaymentId);
  if (!repayment) return { error: '返済履歴が見つかりません', status: 404 } as const;

  const entry = await getEntryById(repayment.entry_id);
  if (!entry || entry.timer_id !== timer.id) return { error: '返済履歴が見つかりません', status: 404 } as const;

  return { repayment, entry };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { slug, id } = await params;
    if (!verifyEditToken(slug, req.headers.get('x-edit-token'))) {
      return NextResponse.json({ error: '編集権限がありません' }, { status: 401 });
    }
    const result = await resolveRepayment(slug, id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

    await deleteRepayment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { slug, id } = await params;
    if (!verifyEditToken(slug, req.headers.get('x-edit-token'))) {
      return NextResponse.json({ error: '編集権限がありません' }, { status: 401 });
    }
    const result = await resolveRepayment(slug, id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await req.json();
    const { amount, item_name, note, repayment_target, repaid_at } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: '返済金額は正の数を入力してください' }, { status: 400 });
    }
    const target = repayment_target === 'principal' ? 'principal' : 'interest';

    const updated = await updateRepayment(id, {
      amount: Number(amount),
      item_name: item_name?.trim() || null,
      note: note?.trim() || null,
      repayment_target: target,
      repaid_at: repaid_at ? Number(repaid_at) : result.repayment.repaid_at,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
