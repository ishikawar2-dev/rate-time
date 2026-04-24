import { getSql } from '@/lib/db';
import { getCookie, getStringField, isBotUserAgent, safeJson } from '../_shared';

export const runtime = 'nodejs';

/**
 * アフィリエイトリンクのクリックを記録する。
 * docs/MONETIZATION.md §4.6 / §4.7 に基づく。
 *
 * クリック時にクライアントから `navigator.sendBeacon('/api/affiliates/click', ...)` で送信。
 * ネットワーク失敗や計測失敗は画面遷移を阻害しない（UI 側の責務として呼び出し→即 href 遷移）。
 */
export async function POST(req: Request): Promise<Response> {
  const ua = req.headers.get('user-agent');
  if (isBotUserAgent(ua)) {
    return new Response(null, { status: 204 });
  }

  const body = await safeJson(req);
  const experimentId = getStringField(body, 'experimentId');
  const variantId = getStringField(body, 'variantId');
  const placement = getStringField(body, 'placement');
  const offerId = getStringField(body, 'offerId');
  const pagePath = getStringField(body, 'pagePath');
  const visitorId = getCookie(req, 'rt_vid');

  if (!visitorId || !experimentId || !variantId || !placement || !offerId || !pagePath) {
    return new Response(null, { status: 204 });
  }

  try {
    await getSql()`
      INSERT INTO clicks (
        experiment_id, variant_id, placement, offer_id,
        visitor_id, page_path, user_agent, recorded_at
      )
      VALUES (
        ${experimentId}, ${variantId}, ${placement}, ${offerId},
        ${visitorId}, ${pagePath}, ${ua}, ${Date.now()}
      )
    `;
  } catch (err) {
    console.error('[affiliates/click] insert failed', err);
  }

  return new Response(null, { status: 204 });
}
