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
 * rt-* クラスで両テーマに対応。
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
    <article className="relative bg-rt-card border border-rt-border rounded-xl p-5 flex flex-col gap-3">
      <span
        aria-label="広告"
        className="absolute top-2 right-3 text-[10px] text-rt-text-muted tracking-wide"
      >
        PR
      </span>

      <header className="pr-10">
        <h3 className="text-base font-bold text-rt-text-primary">{offer.name}</h3>
        <p className="text-sm text-rt-text-secondary mt-1">{offer.tagline}</p>
      </header>

      {offer.description ? (
        <p className="text-xs text-rt-text-tertiary leading-relaxed">{offer.description}</p>
      ) : null}

      {offer.bullets && offer.bullets.length > 0 ? (
        <ul className="text-xs text-rt-text-secondary space-y-1">
          {offer.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-rt-accent-text flex-shrink-0">・</span>
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
        className="mt-1 inline-flex items-center justify-center bg-rt-accent-cta hover:bg-rt-accent-cta-hover text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors"
      >
        {offer.ctaText ?? '詳細を見る'}
      </a>

      {highRisk && offer.disclaimer ? (
        <p className="text-[11px] text-rt-text-tertiary leading-relaxed border-t border-rt-border pt-2 mt-1">
          {offer.disclaimer}
        </p>
      ) : null}

      {/*
        広告主の法人名はカード上には表示しない。
        提携情報の包括的な開示は /disclosure ページに集約している（ステマ規制対応）。
        AffiliateOffer.advertiser プロパティは内部メタデータとして受け取るのみ。
      */}
    </article>
  );
}
