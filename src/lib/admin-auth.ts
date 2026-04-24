/**
 * 管理画面 /admin/* および /api/admin/* 用の Basic 認証ヘルパー。
 * middleware（Edge Runtime）から呼ばれるため、Node.js 専用 API は使わない。
 *
 * 認証情報は環境変数 ADMIN_USER / ADMIN_PASSWORD で設定する。
 * どちらかが未設定の場合は middleware 側で 404 を返すフェイルセーフ構成。
 */

/**
 * 定数時間比較。文字列長の一致を前提に、各コードポイントを XOR して差分ビットを OR 累積する。
 * 長さが異なる場合は短絡する（長さ自体は副次情報として漏れる可能性があるが、
 * ユーザー名・パスワードの長さ漏洩は実運用で受容される範囲）。
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** "Basic base64(user:pass)" ヘッダを分解する */
function parseBasicAuth(header: string | null): { user: string; pass: string } | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (!trimmed.toLowerCase().startsWith('basic ')) return null;
  try {
    const decoded = atob(trimmed.slice(6).trim());
    const idx = decoded.indexOf(':');
    if (idx < 0) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

/**
 * Authorization ヘッダを検証。
 * ユーザー名・パスワードの両方を timingSafeEqual で比較し、短絡評価によるタイミング差を避ける。
 */
export function verifyAdminBasicAuth(
  authHeader: string | null,
  expectedUser: string,
  expectedPass: string,
): boolean {
  const creds = parseBasicAuth(authHeader);
  if (!creds) return false;
  // 両方を評価してから AND を取る（早期 return による時間差を作らない）
  const userOk = timingSafeEqual(creds.user, expectedUser);
  const passOk = timingSafeEqual(creds.pass, expectedPass);
  return userOk && passOk;
}

/** 401 Unauthorized レスポンス用のヘッダ */
export const ADMIN_WWW_AUTHENTICATE = 'Basic realm="rate-time admin", charset="UTF-8"';

/**
 * Bearer Token 認証（定数時間比較）。
 * Claude Routines 等の外部サービスから /api/admin/report/* を叩く際の認証に使う。
 * 環境変数 ROUTINE_API_TOKEN と Authorization: Bearer ヘッダを比較。
 */
export function verifyBearerToken(authHeader: string | null, expectedToken: string): boolean {
  if (!authHeader) return false;
  const trimmed = authHeader.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) return false;
  const token = trimmed.slice(7).trim();
  if (token.length === 0) return false;
  return timingSafeEqual(token, expectedToken);
}
