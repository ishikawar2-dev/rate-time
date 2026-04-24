'use client';

import { useEffect, useState } from 'react';
import type { AffiliateOffer } from '@/lib/affiliates';
import { DEFAULT_AFFILIATE_REL } from '@/lib/affiliates';

interface Props {
  /** banner フィールドが定義されている AffiliateOffer */
  offer: AffiliateOffer;
  /** 計測用 placement（例: 'timer-footer-banner-debt-consolidation'） */
  placement: string;
  /** A/Bテスト計測用 */
  experimentId?: string;
  variantId?: string;
}

/**
 * 画面下部に固定表示するスティッキーフッターバナー（docs/MONETIZATION.md §13）。
 *
 * - offer.banner.href は ad-format-v1 実験でのバナー専用 URL。テキストカードの href と
 *   別 ASP トラッキングになるよう分離する。
 * - インプレッションはマウント時に 1 回だけ送信（常時可視のため IntersectionObserver 不要）。
 * - 閉じるボタンで React state で非表示化。同一マウント内で再表示しない。
 *   sessionStorage 等の永続化は使わない（アーティファクト制約に準じる）。
 */
export function StickyFooterBanner({ offer, placement, experimentId, variantId }: Props) {
  const [dismissed, setDismissed] = useState(false);

  // マウント時に一度だけインプレッション送信
  useEffect(() => {
    if (!experimentId || !variantId) return;
    try {
      const payload = JSON.stringify({
        experimentId,
        variantId,
        placement,
        pagePath: window.location.pathname,
      });
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/affiliates/impression', blob);
    } catch {
      // 計測失敗は無視（遷移を阻害しない）
    }
    // 意図的に依存配列を空に。マウント時 1 回のみ発火させる。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dismissed || !offer.banner) return null;

  const { banner } = offer;
  const rel = offer.rel ?? DEFAULT_AFFILIATE_REL;

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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-rt-card border-t border-rt-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="complementary"
      aria-label="広告バナー"
    >
      <div className="relative flex items-center justify-center py-2 px-12">
        <span
          aria-label="広告"
          className="absolute top-1 left-2 text-[9px] text-rt-text-muted tracking-wide"
        >
          PR
        </span>
        <a
          href={banner.href}
          target="_blank"
          rel={rel}
          onClick={handleClick}
          className="block leading-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            width={banner.width}
            height={banner.height}
            alt={`${offer.advertiser ?? offer.name}（広告）`}
            className="block max-w-full h-auto"
            loading="lazy"
          />
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="広告を閉じる"
          className="absolute top-0 right-0 flex items-center justify-center w-10 h-10 text-rt-text-tertiary hover:text-rt-text-primary transition-colors"
        >
          <span aria-hidden className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
