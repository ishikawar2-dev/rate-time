import { getSql } from '@/lib/db';
import { getCookie, getStringField, isBotUserAgent, safeJson } from '../_shared';

export const runtime = 'nodejs';

/**
 * アフィリエイトセクションのインプレッションを記録する。
 * docs/MONETIZATION.md §4.6 / §4.7 に基づく。
 *
 * 呼び出し元はクライアント側の `navigator.sendBeacon('/api/affiliates/impression', ...)`。
 * 不正/欠損リクエストやボット UA は静かに 204 を返し、DB には書き込まない。
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
  const pagePath = getStringField(body, 'pagePath');
  const visitorId = getCookie(req, 'rt_vid');

  if (!visitorId || !experimentId || !variantId || !placement || !pagePath) {
    return new Response(null, { status: 204 });
  }

  try {
    await getSql()`
      INSERT INTO impressions (
        experiment_id, variant_id, placement, visitor_id,
        page_path, user_agent, referrer, recorded_at
      )
      VALUES (
        ${experimentId}, ${variantId}, ${placement}, ${visitorId},
        ${pagePath}, ${ua}, ${req.headers.get('referer')}, ${Date.now()}
      )
    `;
  } catch (err) {
    // 計測失敗は画面挙動に影響させないが、根本原因追跡のためサーバーログには残す
    console.error('[affiliates/impression] insert failed', err);
  }

  return new Response(null, { status: 204 });
}
