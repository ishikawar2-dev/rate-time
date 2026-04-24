/**
 * アフィリエイトオファーの型定義とヘルパー。
 * 実際のオファー定義は ASP 契約後に `affiliateOffers` に追記する。
 *
 * 扱うカテゴリは次の5つのみ（docs/MONETIZATION.md §1.1）:
 *   - debt-consolidation / loan-consolidation / card-loan / consumer-finance / credit-card
 * FX・バイナリーオプション・ギャンブル・情報商材は扱わない。
 */

export type AffiliateCategory =
  | 'debt-consolidation'
  | 'loan-consolidation'
  | 'card-loan'
  | 'consumer-finance'
  | 'credit-card';

export interface AffiliateOffer {
  /** 一意な識別子（例: 'benrikon-law', 'acom'） */
  id: string;
  category: AffiliateCategory;
  /** 表示名（例: '弁護士法人・響'） */
  name: string;
  /** 短い訴求コピー */
  tagline: string;
  /** 詳細説明（2〜3行） */
  description: string;
  /** アフィリエイトリンク（ASP が発行する URL） */
  href: string;
  /** rel 属性（省略時は 'sponsored nofollow noopener'） */
  rel?: string;
  /** 強調フラグ（一覧で先頭表示されるか） */
  featured?: boolean;
  /** 訴求ポイント（3〜5個の箇条書き） */
  bullets?: string[];
  /** ロゴ画像パス（任意） */
  logoSrc?: string;
  /** リスクカテゴリの場合の免責注記（card-loan / consumer-finance / credit-card では必須） */
  disclaimer?: string;
  /** 有効/無効フラグ（A/Bテストで一時停止したいとき用） */
  active: boolean;
}

/** すべてのオファー定義。ASP 契約後に追記する。 */
export const affiliateOffers: AffiliateOffer[] = [];

/** アフィリエイトリンクに必ず付与する rel 属性のデフォルト値 */
export const DEFAULT_AFFILIATE_REL = 'sponsored nofollow noopener';

/** `placement` 識別子（計測用） */
export const PLACEMENT_BY_CATEGORY: Record<AffiliateCategory, string> = {
  'debt-consolidation': 'timer-debt-consolidation',
  'loan-consolidation': 'timer-loan-consolidation',
  'card-loan': 'timer-card-loan',
  'consumer-finance': 'timer-consumer-finance',
  'credit-card': 'timer-credit-card',
};

/** カテゴリ別にオファーを取得するヘルパー */
export function getOffersByCategory(
  category: AffiliateCategory,
  opts?: { limit?: number; activeOnly?: boolean },
): AffiliateOffer[] {
  const { limit, activeOnly = true } = opts ?? {};
  const filtered = affiliateOffers
    .filter((o) => o.category === category)
    .filter((o) => !activeOnly || o.active)
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  return limit ? filtered.slice(0, limit) : filtered;
}

/** リスクカテゴリ（高）判定。該当する場合は免責注記が必須。 */
export function isHighRiskCategory(category: AffiliateCategory): boolean {
  return (
    category === 'card-loan' ||
    category === 'consumer-finance' ||
    category === 'credit-card'
  );
}
