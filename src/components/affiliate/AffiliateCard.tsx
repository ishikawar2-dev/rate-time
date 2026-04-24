'use client';

import type { AffiliateOffer } from '@/lib/affiliates';
import { DEFAULT_AFFILIATE_REL, isHighRiskCategory } from '@/lib/affiliates';

interface AffiliateCardProps {
  offer: AffiliateOffer;
  /** 計測用のクリック元識別子（例: 'timer-debt-consolidation'） */
  placement: string;
  /** A/Bテストのバリアント識別子（計測用） */
  experimentId?: string;
  variantId?: string;
}

/**
 * 単一案件を表示するカード（docs/MONETIZATION.md §3.1）。
 *
 * - 「広告」ラベル必須（ステマ規制対応）
 * - リンクには rel="sponsored nofollow noopener" / target="_blank" 必須
 * - リスクカテゴリ（card-loan / consumer-finance / credit-card）は免責注記必須
 * - クリック時は /api/affiliates/click に sendBeacon で計測後、既定の遷移に任せる
 */
export function AffiliateCard({ offer, placement, experimentId, variantId }: AffiliateCardProps) {
  const rel = offer.rel ?? DEFAULT_AFFILIATE_REL;
  const highRisk = isHighRiskCategory(offer.category);

  const handleClick = () => {
    if (!experimentId || !variantId) return;
    try {
      const payload = JSON.stringify({
        experimentId,
        variantId,
        placement,
        offerId: offer.id,
        pagePath: window.location.pathname,
      });
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/affiliates/click', blob);
    } catch {
      // 計測失敗は画面遷移を阻害しない
    }
  };

  return (
    <article className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      {/* 「広告」ラベル（ステマ規制対応） */}
      <span
        aria-label="広告"
        className="absolute top-2 right-2 text-[10px] font-semibold text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5"
      >
        広告
      </span>

      <header className="pr-10">
        <h3 className="text-base font-bold text-zinc-100">{offer.name}</h3>
        <p className="text-sm text-zinc-400 mt-1">{offer.tagline}</p>
      </header>

      {offer.description ? (
        <p className="text-xs text-zinc-500 leading-relaxed">{offer.description}</p>
      ) : null}

      {offer.bullets && offer.bullets.length > 0 ? (
        <ul className="text-xs text-zinc-300 space-y-1">
          {offer.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-red-400 flex-shrink-0">・</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <a
        href={offer.href}
        target="_blank"
        rel={rel}
        onClick={handleClick}
        className="mt-1 inline-flex items-center justify-center bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors"
      >
        詳細を見る
      </a>

      {highRisk && offer.disclaimer ? (
        <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-800 pt-2 mt-1">
          {offer.disclaimer}
        </p>
      ) : null}
    </article>
  );
}
