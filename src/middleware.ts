import { NextRequest, NextResponse } from 'next/server';
import { assignVariant, getActiveExperiment, isValidVariant } from '@/lib/experiments';

/**
 * 訪問者 Cookie の発行と A/B テストのバリアント割当。
 * docs/MONETIZATION.md §4.5 に基づく。
 *
 * - `rt_vid`: 訪問者識別用 UUID（1年保持、クライアントからも読める）
 * - `rt_exp_<experimentId>`: 割り当てられたバリアント ID（90日保持）
 *
 * バリアント割当はハッシュベースの決定的関数（experiments.ts の `assignVariant`）で行うため、
 * 同一 visitor は同一 experiment に対して常に同じバリアントを引く。
 */

const VISITOR_COOKIE = 'rt_vid';
const VISITOR_MAX_AGE_SEC = 60 * 60 * 24 * 365;         // 1年
const EXPERIMENT_MAX_AGE_SEC = 60 * 60 * 24 * 90;        // 90日

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // visitor_id Cookie の発行
  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_MAX_AGE_SEC,
      sameSite: 'lax',
      secure: true,
      // 計測ビーコン用にクライアント JS からも読めるようにする
      httpOnly: false,
      path: '/',
    });
  }

  // アクティブな実験のバリアント割当
  const activeExperiment = getActiveExperiment();
  if (activeExperiment) {
    const cookieKey = `rt_exp_${activeExperiment.id}`;
    const existing = req.cookies.get(cookieKey)?.value;

    if (!existing || !isValidVariant(activeExperiment, existing)) {
      const variantId = assignVariant(visitorId, activeExperiment);
      res.cookies.set(cookieKey, variantId, {
        maxAge: EXPERIMENT_MAX_AGE_SEC,
        sameSite: 'lax',
        secure: true,
        httpOnly: false,
        path: '/',
      });
    }
  }

  return res;
}

export const config = {
  // タイマー画面・コラム・トップページのみ対象（API・管理画面・静的アセットは除外）
  matcher: ['/', '/timer/:path*', '/column/:path*'],
};
