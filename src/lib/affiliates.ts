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
  /** 一意な識別子（例: 'istowl-nini-seiri'） */
  id: string;
  category: AffiliateCategory;
  /** サービス/ブランド名（カード上部に表示） */
  name: string;
  /** 短い訴求コピー（name 直下に表示） */
  tagline: string;
  /** 詳細説明（2〜3行） */
  description: string;
  /** アフィリエイトリンク（ASP が発行する URL、計測パラメータ含めて一切加工禁止） */
  href: string;
  /** rel 属性（省略時は 'sponsored nofollow noopener'、必ず sponsored を含める） */
  rel?: string;
  /** 強調フラグ（一覧で先頭表示されるか） */
  featured?: boolean;
  /** 訴求ポイント（3〜5個の箇条書き） */
  bullets?: string[];
  /** ロゴ画像パス（任意） */
  logoSrc?: string;
  /** リスクカテゴリの場合の免責注記（card-loan / consumer-finance / credit-card では必須） */
  disclaimer?: string;
  /** CTA ボタンの文言。未指定時はカード側で '詳細を見る' にフォールバック */
  ctaText?: string;
  /** 広告主の法人名等。ステマ規制対応の補助表示に使う（カード下部に小さく表示） */
  advertiser?: string;
  /**
   * バナー広告用の素材（スティッキーフッターバナー等で使う）。
   * href は必ずバナー専用の ASP 発行 URL を使い、テキストクリックと別計測する。
   */
  banner?: {
    href: string;
    imageUrl: string;
    width: number;
    height: number;
  };
  /** 有効/無効フラグ（A/Bテストで一時停止したいとき用） */
  active: boolean;
}

/**
 * ASP（A8.net）で提携中のオファー定義。
 * href の計測パラメータは一切加工しない（成果トラッキングに影響するため）。
 */
export const affiliateOffers: AffiliateOffer[] = [
  // ─── 債務整理（無料相談系、低リスク） ────────────────────────────
  {
    id: 'istowl-nini-seiri',
    category: 'debt-consolidation',
    name: 'イストワール法律事務所',
    tagline: '借金問題の無料相談（弁護士対応）',
    description:
      '弁護士による無料相談で、任意整理・個人再生・自己破産など自分の状況に合った手続きの見立てが得られます。相談内容は守秘義務で守られます。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+325AS2+4FR4+5YRHE',
    bullets: ['初回相談は無料', '弁護士法人による対応', '全国対応・秘密厳守'],
    ctaText: '無料で相談する',
    advertiser: '弁護士法人イストワール法律事務所',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+325AS2+4FR4+639IP',
      imageUrl: 'https://www22.a8.net/svt/bgt?aid=260424357185&wid=005&eno=01&mid=s00000020704001023000&mc=1',
      width: 320,
      height: 50,
    },
    active: true,
  },
  {
    id: 'earth-shihoshoshi',
    category: 'debt-consolidation',
    name: 'アース司法書士事務所',
    tagline: '全国対応・無料相談の債務整理',
    description:
      '司法書士による無料相談。任意整理を中心に、借金総額と収入状況に応じた現実的な整理方法の目安が分かります。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+33C5ZM+4LX2+5YRHE',
    bullets: ['相談無料・秘密厳守', '全国対応', '任意整理の対応実績'],
    ctaText: '無料で相談する',
    advertiser: 'アース司法書士事務所',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+33C5ZM+4LX2+601S1',
      imageUrl: 'https://www26.a8.net/svt/bgt?aid=260424357187&wid=005&eno=01&mid=s00000021503001008000&mc=1',
      width: 320,
      height: 50,
    },
    active: true,
  },

  // ─── おまとめローン（借入整理用途、低リスク） ────────────────────
  {
    id: 'daily-cashing',
    category: 'loan-consolidation',
    name: 'デイリーキャッシング',
    tagline: 'おまとめ・借換え目的のフリーローン',
    description:
      '複数社の借入を1本化する目的で利用できるフリーローン・おまとめローン。月々の返済整理の検討に活用できます。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+41VB2Q+4WSG+5YJRM',
    bullets: ['おまとめ・借換え目的に対応', '来店不要・Web完結', '全国対応'],
    ctaText: '公式サイトで詳細を見る',
    advertiser: '株式会社デイリープランニング',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+41VB2Q+4WSG+5ZEMP',
      imageUrl: 'https://www29.a8.net/svt/bgt?aid=260424357245&wid=005&eno=01&mid=s00000022912001005000&mc=1',
      width: 320,
      height: 50,
    },
    active: true,
  },
  {
    id: 'central-personal',
    category: 'loan-consolidation',
    name: 'セントラル',
    tagline: '来店不要・振込型のキャッシング',
    description:
      'Web 完結で利用できる個人向けキャッシング。複数社の返済を1本化したい場合のおまとめ用途にも活用できます。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+36BC0I+363I+5YJRM',
    bullets: ['来店不要・Web完結', '全国どこからでも利用可', '利息制限法の範囲内で運用'],
    ctaText: '公式サイトで詳細を見る',
    advertiser: '株式会社セントラル',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+36BC0I+363I+62U35',
      imageUrl: 'https://www20.a8.net/svt/bgt?aid=260424357192&wid=005&eno=01&mid=s00000014787001021000&mc=1',
      width: 320,
      height: 50,
    },
    active: true,
  },

  // ─── カードローン（リスク高、免責注記必須） ─────────────────────
  {
    id: 'futaba-cashing',
    category: 'card-loan',
    name: 'フタバ',
    tagline: '即日振込型のキャッシング',
    description:
      '即日振込に対応する個人向けキャッシング。Web 申込から契約まで完結でき、急な資金需要にも対応します。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+2Z64R6+38S6+BXQOJ',
    bullets: ['即日振込対応', 'Web 申込可能', '全国対応'],
    ctaText: '公式サイトで詳細を見る',
    advertiser: 'フタバ株式会社',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+2Z64R6+38S6+BYLJL',
      imageUrl: 'https://www28.a8.net/svt/bgt?aid=260424357180&wid=005&eno=01&mid=s00000015135002009000&mc=1',
      width: 320,
      height: 50,
    },
    disclaimer:
      '借入は計画的に。返済が困難になった場合は債務整理もご検討ください。適用金利は利息制限法の範囲内です。',
    active: true,
  },
  {
    id: 'futaba-ladies',
    category: 'card-loan',
    name: 'レディースフタバ',
    tagline: '女性スタッフ対応・初回30日間無利息',
    description:
      '女性スタッフが対応する女性向けキャッシング。初回借入は30日間無利息のキャンペーンが利用できます。',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+2YKP5E+38S6+5ZMCI',
    bullets: ['女性スタッフが対応', '30日間無利息キャンペーン', 'Web 申込可能'],
    ctaText: '30日間無利息で相談する',
    advertiser: 'フタバ株式会社',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B1SPX+2YKP5E+38S6+609HT',
      imageUrl: 'https://www25.a8.net/svt/bgt?aid=260424357179&wid=005&eno=01&mid=s00000015135001009000&mc=1',
      width: 320,
      height: 50,
    },
    disclaimer:
      '借入は計画的に。30日間無利息は初回借入時のみ適用されます。返済が困難になった場合は債務整理もご検討ください。',
    active: true,
  },
];

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
