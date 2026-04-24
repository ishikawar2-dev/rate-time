import { NextRequest, NextResponse } from 'next/server';
import { assignVariant, getActiveExperiment, isValidVariant } from '@/lib/experiments';
import { ADMIN_WWW_AUTHENTICATE, verifyAdminBasicAuth } from '@/lib/admin-auth';

/**
 * パス別ミドルウェア。
 *
 * 1. /admin/* および /api/admin/*:
 *    - 環境変数 ADMIN_USER / ADMIN_PASSWORD が未設定なら 404（フェイルセーフ）
 *    - Basic 認証を要求し、失敗時は 401 + WWW-Authenticate を返す
 *
 * 2. それ以外（/ , /timer/* , /column/*）:
 *    - rt_vid Cookie を発行（訪問者識別用 UUID、1年保持）
 *    - DB から現在アクティブな実験を取得（experiments.ts 内で 30秒 TTL キャッシュ）
 *    - アクティブな実験があり、かつ有効な variant Cookie が無ければ割当て
 *
 * 実験 Cookie（rt_exp_*）の寿命挙動:
 *   - 実験が active → paused: Cookie はそのまま残るが middleware から触られない
 *   - paused → active に戻る: 既存 Cookie が有効 variantId ならそのまま維持（同一訪問者の一貫性）
 *   - 別の実験が active になる: 新しい Cookie 名（rt_exp_<新ID>）で別途発行
 *   - completed: キャッシュ失効後は Cookie は無視される
 */

const VISITOR_COOKIE = 'rt_vid';
const VISITOR_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1年
const EXPERIMENT_MAX_AGE_SEC = 60 * 60 * 24 * 90; // 90日

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // /api/admin/report/* と /api/cron/* は Bearer Token 認証をルートハンドラ側で行う。
  // middleware の Basic 認証チェックはスキップする。
  if (path.startsWith('/api/admin/report/') || path.startsWith('/api/cron/')) {
    return NextResponse.next({ request: { headers: withPathnameHeader(req) } });
  }

  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    return handleAdminAuth(req);
  }

  return await handlePublicPaths(req);
}

/**
 * root layout で headers() から pathname を読めるようにするためのヘッダを注入する。
 * Phase 6 でテーマ SSR 決定に使う。
 */
function withPathnameHeader(req: NextRequest): Headers {
  const h = new Headers(req.headers);
  h.set('x-pathname', req.nextUrl.pathname);
  return h;
}

function handleAdminAuth(req: NextRequest): NextResponse {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  // 環境変数未設定時は存在自体を隠す（404）
  if (!user || !pass) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (verifyAdminBasicAuth(req.headers.get('authorization'), user, pass)) {
    // 認証成功時も root layout の SSR テーマ判定用に x-pathname を渡す
    return NextResponse.next({ request: { headers: withPathnameHeader(req) } });
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': ADMIN_WWW_AUTHENTICATE },
  });
}

async function handlePublicPaths(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.next({ request: { headers: withPathnameHeader(req) } });

  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_MAX_AGE_SEC,
      sameSite: 'lax',
      secure: true,
      httpOnly: false, // 計測ビーコン用にクライアント JS からも読めるように
      path: '/',
    });
  }

  const activeExperiment = await getActiveExperiment();
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
  matcher: [
    '/',
    '/timer/:path*',
    '/column/:path*',
    '/privacy',
    '/terms',
    '/disclosure',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/cron/:path*',
  ],
};
