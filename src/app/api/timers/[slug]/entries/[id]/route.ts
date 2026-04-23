import { NextRequest, NextResponse } from 'next/server';
import { getTimerBySlug, getEntryById, updateEntry } from '@/lib/db';
import { verifyEditToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  try {
    const { slug, id } = await params;
    const timer = await getTimerBySlug(slug);
    if (!timer) {
      return NextResponse.json({ error: 'タイマーが見つかりません' }, { status: 404 });
    }

    if (!verifyEditToken(slug, req.headers.get('x-edit-token'))) {
      return NextResponse.json({ error: '編集権限がありません' }, { status: 401 });
    }

    const existing = await getEntryById(id);
    if (!existing || existing.timer_id !== (timer as { id: string }).id) {
      return NextResponse.json({ error: '項目が見つかりません' }, { status: 404 });
    }

    const body = await req.json();
    const { name, principal, interest_rate, rate_type, interest_type, started_at } = body;

    if (!principal || isNaN(Number(principal)) || Number(principal) <= 0) {
      return NextResponse.json({ error: '元金は正の数を入力してください' }, { status: 400 });
    }
    if (interest_rate === undefined || isNaN(Number(interest_rate)) || Number(interest_rate) < 0) {
      return NextResponse.json({ error: '金利は0以上の数を入力してください' }, { status: 400 });
    }
    if (!['annual', 'monthly', 'daily'].includes(rate_type)) {
      return NextResponse.json({ error: '金利タイプが無効です' }, { status: 400 });
    }
    if (!['simple', 'compound'].includes(interest_type)) {
      return NextResponse.json({ error: '利息タイプが無効です' }, { status: 400 });
    }

    const updated = await updateEntry(id, {
      name: name?.trim() || null,
      principal: Number(principal),
      interest_rate: Number(interest_rate),
      rate_type,
      interest_type,
      started_at: started_at ? Number(started_at) : existing.started_at,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
