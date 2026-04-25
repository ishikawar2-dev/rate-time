import { createHmac, timingSafeEqual } from 'crypto';

export function generateEditToken(slug: string): string {
  const secret = process.env.EDIT_SECRET;
  if (!secret) throw new Error('EDIT_SECRET is not set');
  return createHmac('sha256', secret).update(slug).digest('hex').slice(0, 32);
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

  // slug 固有トークンチェック（32文字・24文字の両方を許可して互換性を維持）
  try {
    const secret = process.env.EDIT_SECRET;
    if (!secret) return false;

    if (token.length !== 24 && token.length !== 32) return false;

    const fullHmac = createHmac('sha256', secret).update(slug).digest('hex');
    const expected = fullHmac.slice(0, token.length);

    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
