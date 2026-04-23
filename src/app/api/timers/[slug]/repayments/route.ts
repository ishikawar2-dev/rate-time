import { NextRequest, NextResponse } from 'next/server';
import { getTimerBySlug, getEntryById, createRepayment } from '@/lib/db';
import { verifyEditToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const timer = await getTimerBySlug(slug);
    if (!timer) {
      return NextResponse.json({ error: 'タイマーが見つかりません' }, { status: 404 });
    }

    if (!verifyEditToken(slug, req.headers.get('x-edit-token'))) {
      return NextResponse.json({ error: '編集権限がありません' }, { status: 401 });
    }

    const body = await req.json();
    const { entry_id, amount, item_name, note, repayment_target, repaid_at } = body;

    if (!entry_id) {
      return NextResponse.json({ error: '返済先のエントリーを選択してください' }, { status: 400 });
    }

    const entry = await getEntryById(entry_id);
    if (!entry || entry.timer_id !== timer.id) {
      return NextResponse.json({ error: 'エントリーが見つかりません' }, { status: 404 });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: '返済金額は正の数を入力してください' }, { status: 400 });
    }

    const target = repayment_target === 'principal' ? 'principal' : 'interest';

    const repayment = await createRepayment({
      id: randomUUID(),
      entry_id,
      amount: Number(amount),
      item_name: item_name?.trim() || null,
      note: note?.trim() || null,
      repayment_target: target,
      repaid_at: repaid_at ? Number(repaid_at) : Date.now(),
      created_at: Date.now(),
    });

    return NextResponse.json(repayment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
