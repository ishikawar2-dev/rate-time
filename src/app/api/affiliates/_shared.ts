/**
 * 計測API (impression / click) で共有するヘルパー。
 * docs/MONETIZATION.md §4.6 に基づく。
 */

/** ボット UA 判定（簡易版）。該当時は計測を行わない。 */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return /bot|crawler|spider|scraper/i.test(ua);
}

/** sendBeacon が `Blob({type: 'application/json'})` で送信してくるため、安全に JSON を取り出す */
export async function safeJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** string 型かつ空でない値を取り出す。それ以外は null。 */
export function getStringField(
  body: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!body) return null;
  const v = body[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

/** Cookie ヘッダから特定の Cookie 値を取り出す（Edge Runtime 用） */
export function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  const escaped = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const match = new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`).exec(header);
  return match ? decodeURIComponent(match[1]) : null;
}
