import { createHmac, timingSafeEqual } from 'crypto';

export function generateEditToken(slug: string): string {
  const secret = process.env.EDIT_SECRET;
  if (!secret) throw new Error('EDIT_SECRET is not set');
  return createHmac('sha256', secret).update(slug).digest('hex').slice(0, 24);
}

export function verifyEditToken(slug: string, token: string | null | undefined): boolean {
  if (!token) return false;

  // マスターキーチェック（全タイマー共通）
  const masterToken = process.env.MASTER_EDIT_TOKEN;
  if (masterToken) {
    try {
      const masterBuf = Buffer.from(masterToken, 'utf8');
      const tokenBuf = Buffer.from(token, 'utf8');
      if (masterBuf.length === tokenBuf.length && timingSafeEqual(masterBuf, tokenBuf)) {
        return true;
      }
    } catch { /* fall through to slug-specific check */ }
  }

  // slug 固有トークンチェック
  try {
    const expected = generateEditToken(slug);
    if (expected.length !== token.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
