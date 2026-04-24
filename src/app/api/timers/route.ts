import { NextRequest, NextResponse } from 'next/server';
import { createTimer } from '@/lib/db';
import { generateEditToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

function slug(): string {
  return randomUUID().replace(/-/g, '');
}

const VALID_RATE = ['annual', 'monthly', 'daily'];
const VALID_INTEREST = ['simple', 'compound'];
const VALID_THEME = ['light', 'dark'] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, entries, theme } = body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'エントリーを1つ以上追加してください' }, { status: 400 });
    }

    // theme は未指定なら 'light' をデフォルト、指定ありなら 'light' | 'dark' 以外を 400 で拒否
    let timerTheme: 'light' | 'dark' = 'light';
    if (theme !== undefined && theme !== null) {
      if (!VALID_THEME.includes(theme)) {
        return NextResponse.json({ error: 'テーマは light か dark のみ指定できます' }, { status: 400 });
      }
      timerTheme = theme as 'light' | 'dark';
    }

    for (const e of entries) {
      if (!e.principal || isNaN(Number(e.principal)) || Number(e.principal) <= 0) {
        return NextResponse.json({ error: `${e.name || '項目'}: 元金は正の数を入力してください` }, { status: 400 });
      }
      if (e.interest_rate === undefined || isNaN(Number(e.interest_rate)) || Number(e.interest_rate) < 0) {
        return NextResponse.json({ error: `${e.name || '項目'}: 金利は0以上の数を入力してください` }, { status: 400 });
      }
      if (!VALID_RATE.includes(e.rate_type)) {
        return NextResponse.json({ error: '金利タイプが無効です' }, { status: 400 });
      }
      if (!VALID_INTEREST.includes(e.interest_type)) {
        return NextResponse.json({ error: '利息タイプが無効です' }, { status: 400 });
      }
    }

    const now = Date.now();
    const timer = {
      id: randomUUID(),
      slug: slug(),
      name: name?.trim() || null,
      theme: timerTheme,
      created_at: now,
    };

    const entryDefs = entries.map((e: Record<string, unknown>) => ({
      name: (e.name as string)?.trim() || null,
      principal: Number(e.principal),
      interest_rate: Number(e.interest_rate),
      rate_type: e.rate_type as 'annual' | 'monthly' | 'daily',
      interest_type: e.interest_type as 'simple' | 'compound',
      started_at: e.started_at ? Number(e.started_at) : now,
    }));

    const result = await createTimer(timer, entryDefs, randomUUID);
    const edit_token = generateEditToken(timer.slug);

    return NextResponse.json({ ...result, edit_token }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
