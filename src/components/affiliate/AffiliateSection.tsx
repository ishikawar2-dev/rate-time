'use client';

import { useEffect, useRef } from 'react';
import type { AffiliateCategory } from '@/lib/affiliates';
import { getOffersByCategory } from '@/lib/affiliates';
import { AffiliateCard } from './AffiliateCard';

interface AffiliateSectionProps {
  category: AffiliateCategory;
  title: string;
  leadText?: string;
  /** 表示件数の上限 */
  limit?: number;
  /** 計測用識別子（例: 'timer-debt-consolidation'） */
  placement: string;
  /** A/Bテスト情報（計測用） */
  experimentId?: string;
  variantId?: string;
}

/**
 * 複数のアフィリエイトカードを表示するセクション（docs/MONETIZATION.md §3.1 / §4.7）。
 *
 * - セクション直前に「広告」ラベルを表示（ステマ規制対応）
 * - IntersectionObserver で「画面内に50%以上入ったとき」にインプレッションを記録
 * - 1マウントにつき1インプレッションのみ（`sent` フラグで多重送信を防止）
 * - オファーが0件の場合はセクション自体を描画しない（`null` 返却）
 */
export function AffiliateSection({
  category,
  title,
  leadText,
  limit,
  placement,
  experimentId,
  variantId,
}: AffiliateSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const sentRef = useRef(false);

  const offers = getOffersByCategory(category, { limit, activeOnly: true });

  useEffect(() => {
    if (!experimentId || !variantId) return;
    if (offers.length === 0) return;
    if (!ref.current) return;
    if (sentRef.current) return;

    const target = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !sentRef.current) {
            sentRef.current = true;
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
              // 計測失敗はユーザー体験に影響させない
            }
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [experimentId, variantId, placement, offers.length]);

  // オファーが無いカテゴリではセクションごと出さない
  if (offers.length === 0) return null;

  return (
    <section ref={ref} aria-label={`${title}（広告）`} className="max-w-2xl mx-auto px-4 my-10">
      {/* セクション直前の「広告」ラベル（ステマ規制対応） */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
          広告
        </span>
        <span className="text-[11px] text-zinc-600">当サイトはアフィリエイトプログラムに参加しています</span>
      </div>

      <header className="mb-4">
        <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
        {leadText ? (
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{leadText}</p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offers.map((offer) => (
          <AffiliateCard
            key={offer.id}
            offer={offer}
            placement={placement}
            experimentId={experimentId}
            variantId={variantId}
          />
        ))}
      </div>
    </section>
  );
}
