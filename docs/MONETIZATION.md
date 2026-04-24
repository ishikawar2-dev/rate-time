# マネタイズ仕様（アフィリエイト実装方針）

このドキュメントは、rate-time プロジェクト（利息タイマー / https://rate-time.com）における
アフィリエイト収益化の実装仕様を定めたものです。Claude Code が実装を進める際の
意思決定の基準として使用します。

**重要**: このドキュメントは v4 です。変更履歴は §11 参照。
- v1: 債務整理・おまとめローンのみ扱う方針
- v2: カードローン・消費者金融・クレカに拡大、A/Bテスト仕様追加
- v3: テーマ機能（ダーク/ライト選択）追加
- v4: デフォルトテーマを light に変更、トップページでプレビュー可能に

---

## 1. 基本方針

### 1.1 扱うカテゴリ

A/Bテストで反応を計測する対象として、以下のカテゴリを扱う。

| カテゴリID | カテゴリ名 | 想定単価 | リスクレベル |
|---|---|---|---|
| `debt-consolidation` | 債務整理（弁護士・司法書士無料相談） | 5,000〜15,000円/件 | 低 |
| `loan-consolidation` | おまとめローン | 3,000〜15,000円/件 | 低 |
| `card-loan` | カードローン（新規申込） | 10,000〜20,000円/件 | **高** |
| `consumer-finance` | 消費者金融（新規申込） | 10,000〜20,000円/件 | **高** |
| `credit-card` | クレジットカード | 5,000〜15,000円/件 | 中 |

### 1.2 絶対に扱わない案件

以下は**高単価でも扱わない**。サイトの社会的許容範囲を超えるため。

- **FX・バイナリーオプション・CFD 等の投機性金融商品**
  - 借金に悩む層への誘導はギャンブル依存の入口になりうる
- **ギャンブル系**（オンラインカジノ、競馬情報商材等）
- **情報商材系**（「借金から抜け出す方法」等の高額教材、情報商材）
- **リボ払い利用を前提とした訴求のクレジットカード**
  - クレジットカード自体は扱うが、リボ払いを積極訴求する訴求文言は NG

### 1.3 リスクカテゴリ（高）取り扱い時の制約

`card-loan` / `consumer-finance` / `credit-card` を扱う際は、以下の制約を守る。

- **訴求コピーで「借金を増やす」ニュアンスを避ける**
  - ❌ 「今すぐ借りられる」「即日融資」
  - ✅ 「低金利で借り換え」「計画的な利用をサポート」
- **免責的注記を必須で併記**
  - 例: 「借入は計画的に。返済が困難な場合は債務整理をご検討ください」
- **債務整理カテゴリへの導線を必ず同じ画面に残す**
  - カードローン広告だけを単独で表示するページを作らない

### 1.4 配置場所

| 配置 | 目的 | 優先度 |
|---|---|---|
| タイマー表示画面 `/timer/[slug]` | 利息が膨らむ現実を見た直後の心理的フック | 高 |
| 新規コラムページ `/column/配下` | SEO流入獲得 + 記事内からの自然な誘導 | 高 |

**ランディングページ `/` の主要UIセクションには広告を配置しない**。
トップページは「ツールとしての信頼性」を保ち、コラムへの内部リンクのみに留める。

---

## 2. ASP 非依存の汎用設計

ASP（アフィリエイトサービスプロバイダ）は現時点で未確定のため、
**どの ASP を採用しても差し替えられる設計**にする。

### 2.1 データ構造

アフィリエイト案件は型定義ベースで管理し、一元的な設定ファイルに集約する。

**推奨ファイル**: `src/lib/affiliates.ts`

```ts
export type AffiliateCategory =
  | 'debt-consolidation'
  | 'loan-consolidation'
  | 'card-loan'
  | 'consumer-finance'
  | 'credit-card';

export interface AffiliateOffer {
  /** 一意な識別子（例: 'benrikon-law', 'acom'） */
  id: string;
  /** カテゴリ */
  category: AffiliateCategory;
  /** 表示名（例: '弁護士法人・響'） */
  name: string;
  /** 短い訴求コピー */
  tagline: string;
  /** 詳細説明（2〜3行） */
  description: string;
  /** アフィリエイトリンク（ASP が発行する URL） */
  href: string;
  /** rel 属性（通常 'sponsored nofollow noopener'） */
  rel?: string;
  /** 強調フラグ（一覧で先頭表示されるか） */
  featured?: boolean;
  /** 訴求ポイント（3〜5個の箇条書き） */
  bullets?: string[];
  /** ロゴ画像パス（任意） */
  logoSrc?: string;
  /** リスクカテゴリの場合の免責注記（必須） */
  disclaimer?: string;
  /** 有効/無効フラグ（A/Bテストで一時停止したいとき用） */
  active: boolean;
}

/** すべてのオファー定義 */
export const affiliateOffers: AffiliateOffer[] = [
  // ASP 契約後に追記
];

/** カテゴリ別に取得するヘルパー */
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

/** リスクカテゴリ判定 */
export function isHighRiskCategory(category: AffiliateCategory): boolean {
  return category === 'card-loan'
    || category === 'consumer-finance'
    || category === 'credit-card';
}
```

### 2.2 リンクの属性要件（必須）

すべてのアフィリエイトリンクに以下を付与する。

- `rel="sponsored nofollow noopener"`
- `target="_blank"`
- Google の広告ポリシー（`sponsored`）と SEO 観点の両方で必須

### 2.3 表記義務（景表法・ステマ規制対応）

2023年10月施行のステマ規制および景品表示法への対応として、
**広告を含むページには必ず「広告」または「PR」表記を行う**。

- アフィリエイトセクションの**直前**に「広告」または「PR」ラベルを明示
- コラム記事で商品を紹介する場合、ページ冒頭に「本ページにはプロモーションが含まれます」と記載
- 利用規約・プライバシーポリシーにアフィリエイト参加の旨を記載

---

## 3. コンポーネント設計

### 3.1 新規作成するコンポーネント

**ファイル**: `src/components/affiliate/AffiliateCard.tsx`

単一案件を表示するカードコンポーネント。

```tsx
interface AffiliateCardProps {
  offer: AffiliateOffer;
  /** 計測用のクリック元識別子 */
  placement: string;
  /** A/Bテストのバリアント識別子（計測用） */
  experimentId?: string;
  variantId?: string;
}
```

表示要素:
- 「広告」ラベル（右上 or 左上に小さく）
- サービス名（`offer.name`）
- タグライン（`offer.tagline`）
- 訴求ポイント（`offer.bullets` を箇条書き）
- CTA ボタン（「無料相談はこちら」「詳細を見る」など）
- リスクカテゴリの場合は `offer.disclaimer` を小さめのテキストで併記
- ボタンクリックで `offer.href` へ遷移（`rel`・`target` 付与）

デザイン方針:
- 既存の `card` クラスに準拠（`bg-zinc-900 border border-zinc-800 rounded-xl`）
- タイマー画面の既存UIから浮かないダーク系
- CTA ボタンは赤系 (`bg-red-600` 等) で既存ブランドと統一

クリック時の挙動:
- リンククリック前に `/api/affiliates/click` を呼び出してクリックを記録（詳細は §4）
- ネットワーク失敗しても遷移を阻害しない（`navigator.sendBeacon` で非同期送信）

**ファイル**: `src/components/affiliate/AffiliateSection.tsx`

複数カードをまとめて表示するセクション。

```tsx
interface AffiliateSectionProps {
  /** 表示するカテゴリ */
  category: AffiliateCategory;
  /** セクションタイトル */
  title: string;
  /** 導入文 */
  leadText?: string;
  /** 表示件数の上限 */
  limit?: number;
  /** 計測用識別子 */
  placement: string;
  /** A/Bテスト情報（計測用） */
  experimentId?: string;
  variantId?: string;
}
```

挙動:
- マウント時（または viewport に入ったとき）にインプレッションを記録
- `IntersectionObserver` で「画面内に50%以上入ったとき」をトリガーに
- 1セクション1インプレッション（同一ページ内で複数回カウントしない）

---

## 4. A/Bテスト仕様（自前DB計測方式）

### 4.1 設計方針

- **データはすべて Neon (Postgres) に保持**（外部サービス非依存）
- **バリアント割当は middleware + Cookie 方式**で CLS を避ける
- **計測はインプレッションとクリックのみ**（CV は ASP 側で確認）
- **管理画面は最小限**（一覧と集計の表示のみ、編集は `affiliateOffers` のコード変更で行う）

### 4.2 DB スキーマ

**マイグレーション**: `migrations/002_ab_testing.sql`

```sql
-- 実験（テスト）定義
CREATE TABLE experiments (
  id TEXT PRIMARY KEY,                -- 例: 'timer-placement-v1'
  name TEXT NOT NULL,                 -- 人間可読の名前
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'active' | 'paused' | 'completed'
  started_at BIGINT,                  -- 開始時刻（UNIXタイムスタンプ ms）。draft 時は NULL、active 切替時に UPDATE で設定する運用
  ended_at BIGINT,                    -- 終了時刻（完了時のみ）
  created_at BIGINT NOT NULL
);

-- バリアント定義
CREATE TABLE variants (
  id TEXT PRIMARY KEY,                -- 例: 'timer-placement-202604__bottom-3cards'
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                 -- 例: 'bottom-3cards'
  weight INTEGER NOT NULL DEFAULT 1,  -- 割当重み（均等なら全て1）
  config JSONB NOT NULL,              -- バリアント固有の設定（§4.4参照）
  created_at BIGINT NOT NULL
);

CREATE INDEX idx_variants_experiment ON variants(experiment_id);

-- インプレッション
CREATE TABLE impressions (
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  placement TEXT NOT NULL,            -- 例: 'timer-bottom-saimu'
  visitor_id TEXT NOT NULL,           -- Cookieで割り振るUUID
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  recorded_at BIGINT NOT NULL         -- UNIXタイムスタンプ（ms）
);

CREATE INDEX idx_impressions_exp_var ON impressions(experiment_id, variant_id);
CREATE INDEX idx_impressions_recorded ON impressions(recorded_at);
CREATE INDEX idx_impressions_visitor ON impressions(visitor_id);

-- クリック
CREATE TABLE clicks (
  id BIGSERIAL PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  placement TEXT NOT NULL,
  offer_id TEXT NOT NULL,             -- どのオファーがクリックされたか
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  recorded_at BIGINT NOT NULL
);

CREATE INDEX idx_clicks_exp_var ON clicks(experiment_id, variant_id);
CREATE INDEX idx_clicks_recorded ON clicks(recorded_at);
CREATE INDEX idx_clicks_offer ON clicks(offer_id);
```

### 4.3 実験定義の管理

実験定義は**コード内のファイル**で管理する（DBにINSERTするスクリプトも用意）。

**ファイル**: `src/lib/experiments.ts`

```ts
export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: VariantConfig[];
}

export interface VariantConfig {
  id: string;
  name: string;
  weight: number;
  config: VariantPayload;
}

/** バリアントごとの表示設定 */
export interface VariantPayload {
  /** 配置位置（タイマー画面） */
  placement?: 'top' | 'bottom' | 'both';
  /** カテゴリの表示順 */
  categoryOrder?: AffiliateCategory[];
  /** カテゴリごとの表示件数 */
  limitByCategory?: Partial<Record<AffiliateCategory, number>>;
  /** このバリアントで表示するカテゴリ */
  enabledCategories?: AffiliateCategory[];
}

export const experiments: ExperimentConfig[] = [
  // 実験定義をここに追加
];
```

### 4.4 初回に実施する実験（MVP）

Claude Code は最初に以下の実験を定義する。

**実験1: `timer-placement-v1`** — 配置位置のテスト

| バリアント | placement | categoryOrder | limit |
|---|---|---|---|
| control | bottom | [debt-consolidation, loan-consolidation] | 各3件 |
| top | top | 同上 | 同上 |
| both | both | 同上 | 同上 |

**実験2: `timer-category-order-v1`** — カテゴリ順序のテスト
（実験1の勝ちバリアントで配置を固定して実施）

| バリアント | categoryOrder |
|---|---|
| control | [debt-consolidation, loan-consolidation] |
| swapped | [loan-consolidation, debt-consolidation] |

**実験3: `timer-limit-v1`** — 表示件数のテスト

| バリアント | limit |
|---|---|
| control | 3件 |
| single | 1件 |

**実験4: `timer-category-mix-v1`** — カテゴリ種類のテスト

| バリアント | enabledCategories |
|---|---|
| safe-only | [debt-consolidation, loan-consolidation] |
| with-card-loan | [debt-consolidation, loan-consolidation, card-loan] |
| with-consumer-finance | [debt-consolidation, loan-consolidation, consumer-finance] |
| all | [debt-consolidation, loan-consolidation, card-loan, consumer-finance, credit-card] |

**実験5: `timer-default-theme-v1`** — テーマ初期値のテスト

ユーザーがタイマー作成時に**明示的にテーマを選ばなかった場合**のデフォルト値を出し分ける。
既にテーマを選択したタイマーには影響しない。

| バリアント | default_theme |
|---|---|
| control | dark |
| light-default | light |

**計測対象**:
- 「明示的にテーマを選ばずに作成されたタイマー」の配下で発生するインプレッション・クリック
- `timers.theme_selected_by_user` のような boolean カラムを追加して判別する必要あり
  - マイグレーション 004 で対応（実験5実施時に追加）

**同時実行ルール**:
- 実験は原則として**1度に1つのみアクティブ**にする（交互作用を避ける）
- 実験4は特にリスクが高いので、実験1〜3で基盤の動作確認後に実施
- 実験5は実験1〜4の後に実施。テーマ機能の実装（§5）が完了していること

### 4.5 バリアント割当ロジック

**source of truth について**:

- **コード（`experiments.ts`）** は実験の**設計図**（id / variants / weight / config）のみを持つ。
- **DB の `experiments` テーブル** が実験の**運用状態**（status / started_at / ended_at）の唯一の真実。
- 管理画面 `/admin/experiments` から status を操作する。
- middleware は `getActiveExperiment()` を通じて DB から active 実験を読み取る。

**キャッシュと反映ラグについて**:

`getActiveExperiment()` はモジュールスコープで **30 秒 TTL のインメモリキャッシュ**を持つ。
これは middleware を毎リクエスト DB に問い合わせさせないための措置。

- 管理画面から実験の status を変更した場合、変更したインスタンス上の API は明示的にキャッシュを失効する（`invalidateActiveExperimentCache()`）
- 他のインスタンス（別リージョン・別プロセス）は最大 30 秒のタイムラグで反映される
- A/B テストの実施上この遅延は許容範囲（1実験は数日〜数週単位で走らせる想定）
- 即時反映が必要な場合は Vercel 側でサーバーを再デプロイ・再起動する

**Cookie の寿命挙動**:

- 実験が `active → paused` に遷移: 既存の `rt_exp_<id>` Cookie はそのまま残るが middleware から触られない
- `paused → active` に戻る: 既存 Cookie が有効な variantId ならそのまま維持（同一訪問者の一貫性を保持）
- 別の実験が `active` になる: 新しい Cookie 名で別途発行される（旧 Cookie は 90 日後に失効）
- `completed`: キャッシュ失効後は Cookie は参照されない

**ファイル**: `src/middleware.ts`

```ts
// 疑似コード
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // visitor_id Cookie
  let visitorId = req.cookies.get('rt_vid')?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookies.set('rt_vid', visitorId, {
      maxAge: 60 * 60 * 24 * 365, // 1年
      sameSite: 'lax',
      secure: true,
      httpOnly: false, // クライアントからも読めるように（計測ビーコン用）
    });
  }
  
  // アクティブな実験のバリアント割当
  const activeExperiment = getActiveExperiment();
  if (activeExperiment) {
    const cookieKey = `rt_exp_${activeExperiment.id}`;
    let variantId = req.cookies.get(cookieKey)?.value;
    
    if (!variantId || !isValidVariant(activeExperiment, variantId)) {
      variantId = assignVariant(visitorId, activeExperiment);
      res.cookies.set(cookieKey, variantId, {
        maxAge: 60 * 60 * 24 * 90, // 90日
        sameSite: 'lax',
        secure: true,
      });
    }
  }
  
  return res;
}

// ハッシュベースの決定的割当（同一visitorIdには常に同じバリアント）
function assignVariant(visitorId: string, exp: ExperimentConfig): string {
  const hash = hashString(`${visitorId}:${exp.id}`);
  const totalWeight = exp.variants.reduce((s, v) => s + v.weight, 0);
  const bucket = hash % totalWeight;
  let acc = 0;
  for (const v of exp.variants) {
    acc += v.weight;
    if (bucket < acc) return v.id;
  }
  return exp.variants[0].id;
}
```

**matcher の設定**:

```ts
export const config = {
  matcher: [
    // タイマー画面とコラムのみ対象（API・静的アセットは除外）
    '/timer/:path*',
    '/column/:path*',
    '/',
  ],
};
```

### 4.6 計測API

**ファイル**: `src/app/api/affiliates/impression/route.ts`

```ts
export async function POST(req: Request) {
  const body = await req.json();
  const { experimentId, variantId, placement, pagePath } = body;
  const visitorId = req.cookies.get('rt_vid')?.value;
  
  if (!visitorId || !experimentId || !variantId || !placement) {
    return new Response(null, { status: 204 });
  }
  
  await getSql()`
    INSERT INTO impressions (experiment_id, variant_id, placement, visitor_id, page_path, user_agent, referrer, recorded_at)
    VALUES (${experimentId}, ${variantId}, ${placement}, ${visitorId}, ${pagePath}, ${req.headers.get('user-agent')}, ${req.headers.get('referer')}, ${Date.now()})
  `;
  
  return new Response(null, { status: 204 });
}
```

**ファイル**: `src/app/api/affiliates/click/route.ts`

```ts
export async function POST(req: Request) {
  const body = await req.json();
  const { experimentId, variantId, placement, offerId, pagePath } = body;
  const visitorId = req.cookies.get('rt_vid')?.value;
  
  if (!visitorId || !offerId) {
    return new Response(null, { status: 204 });
  }
  
  await getSql()`
    INSERT INTO clicks (experiment_id, variant_id, placement, offer_id, visitor_id, page_path, user_agent, recorded_at)
    VALUES (${experimentId}, ${variantId}, ${placement}, ${offerId}, ${visitorId}, ${pagePath}, ${req.headers.get('user-agent')}, ${Date.now()})
  `;
  
  return new Response(null, { status: 204 });
}
```

**ボット除外（簡易版）**:
- `user-agent` に `bot`, `crawler`, `spider`, `scraper` を含む場合は記録しない
- これを middleware or API 側でフィルタする

### 4.7 送信はクライアントから sendBeacon で

計測APIはクライアント側から非同期に呼び出す。

```tsx
// AffiliateSection.tsx 内
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      const payload = JSON.stringify({
        experimentId, variantId, placement, pagePath: location.pathname,
      });
      navigator.sendBeacon('/api/affiliates/impression', new Blob([payload], { type: 'application/json' }));
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);
```

### 4.8 管理画面（最小限）

**パス**: `/admin/experiments`

**認証**: 環境変数 `ADMIN_SECRET` によるベーシック認証、または Cookie ベースの簡易認証。
一般公開はしないこと。middleware でアクセス制限する。

**表示内容**:
- 全実験の一覧（ステータス・開始日）
- 実験詳細画面で、バリアント別の集計を表示:
  - インプレッション数
  - クリック数
  - CTR（クリック/インプレッション）
  - 期間指定フィルタ
- ユニークビジタ数（`DISTINCT visitor_id`）も併記

**集計クエリ**:

※ 当初この文書に記載されていた単一クエリで impressions/clicks を LEFT JOIN する方式は、N×M の直積が発生してカウントが過大になるバグがある。
実装は CTE で事前集計してから JOIN する形に修正済み（`src/lib/admin-queries.ts` の `getVariantStats` 参照）。

```sql
WITH imp AS (
  SELECT variant_id, COUNT(*) AS cnt, COUNT(DISTINCT visitor_id) AS uniq
  FROM impressions
  WHERE experiment_id = $1 [AND 期間・ページフィルタ]
  GROUP BY variant_id
),
clk AS (
  SELECT variant_id, COUNT(*) AS cnt
  FROM clicks
  WHERE experiment_id = $1 [AND 期間・オファー・ページフィルタ]
  GROUP BY variant_id
)
SELECT
  v.id, v.name, v.weight,
  COALESCE(imp.uniq, 0) AS unique_visitors,
  COALESCE(imp.cnt, 0) AS impressions,
  COALESCE(clk.cnt, 0) AS clicks,
  CASE WHEN COALESCE(imp.cnt, 0) > 0
    THEN ROUND(COALESCE(clk.cnt, 0)::numeric / imp.cnt * 100, 2)
    ELSE NULL
  END AS ctr
FROM variants v
LEFT JOIN imp ON imp.variant_id = v.id
LEFT JOIN clk ON clk.variant_id = v.id
WHERE v.experiment_id = $1
ORDER BY v.name;
```

**SQL 検証の TODO（Phase 5 で実施）**:

Phase 4 時点では実データがまだ入っていないため、集計クエリは Phase 5 で ASP 契約・実データ投入後に以下の手順で手動検証する。

```sql
-- 1. テストデータ投入（既存 variant に紐付ける）
INSERT INTO impressions (experiment_id, variant_id, placement, visitor_id, page_path, recorded_at)
SELECT 'timer-placement-v1', 'timer-placement-v1__control', 'test',
       'v' || g::text, '/', EXTRACT(EPOCH FROM NOW()) * 1000
FROM generate_series(1, 100) g;

INSERT INTO clicks (experiment_id, variant_id, placement, offer_id, visitor_id, page_path, recorded_at)
SELECT 'timer-placement-v1', 'timer-placement-v1__control', 'test', 'o1',
       'v' || g::text, '/', EXTRACT(EPOCH FROM NOW()) * 1000
FROM generate_series(1, 5) g;

-- 2. /admin/experiments/timer-placement-v1 を開き、control バリアント行で
--    impressions=100 / clicks=5 / CTR=5.00% が表示されることを確認

-- 3. 検証後のクリーンアップ
DELETE FROM impressions WHERE placement = 'test';
DELETE FROM clicks WHERE placement = 'test';
```

**統計的有意性について**:
- 現段階では自動判定はしない
- 管理画面には件数と CTR を表示するだけ
- 判断は「CTR の差が十分に大きく、かつサンプル数が各バリアント 1000インプレッション以上」を目安に目視で行う
- より厳密な判定が必要になったら PostHog 等への移行を検討

---

## 5. テーマ機能（ダーク/ライト）

### 5.1 基本方針

- **ユーザーがタイマー作成時に「ライト / ダーク」を選択できる機能として実装**
- **テーマはタイマーごとに DB に保存**し、URL共有した相手にも同じテーマで表示される
- **デフォルトは「ライト」**（白基調）
- **トップページ `/` ではプレビューとして機能**：フォーム内のテーマ選択を変えるとトップページの見た目が即座に切り替わる（クライアントサイドでの状態切替）
- **タイマー表示画面 `/timer/[slug]` ではSSRで固定**：作成者が選んだテーマで表示され、閲覧者は切替できない
- 将来的に「システム設定に従う（OSのprefers-color-scheme）」を追加する可能性あり

### 5.2 DB スキーマ変更

`timers` テーブルに `theme` カラムを追加する。

**マイグレーション**: `migrations/003_timer_theme.sql`

```sql
ALTER TABLE timers ADD COLUMN theme TEXT NOT NULL DEFAULT 'light'
  CHECK (theme IN ('dark', 'light'));
```

`src/lib/interest.ts` の `Timer` 型にも `theme` を追加。

```ts
export interface Timer {
  id: string;
  slug: string;
  name: string | null;
  theme: 'dark' | 'light';
  created_at: number;
}
```

### 5.3 UI変更

**タイマー作成フォーム（`src/app/HomeClient.tsx`）**:
- 「タイマー名」フィールドの近くに「テーマ」切替UIを追加
- **iOS風トグルスイッチ**で「ライト ⇔ ダーク」を切り替える
  - 左右にアイコン（☀️ / 🌙）を配置し、どちら側がアクティブか視覚的にわかる形
  - スイッチのON/OFF値が `'light' | 'dark'` にマッピングされる
  - 例: スイッチOFF（左） = light、スイッチON（右） = dark
- 選択状態は React state（`useState`）で管理
- **フォームの状態変化がトップページの見た目に即座に反映される**（プレビュー）
  - 具体的には、`useState` で持つ `theme` を `<body>` の `data-theme` 属性や className に反映
  - これはトップページ `/` のみの挙動。タイマー表示画面ではSSR時の値で固定
- 初期値は `'light'`

**スイッチ実装のポイント**:
- 既存コンポーネントライブラリは導入しない（Tailwindで自作）
- アクセシビリティ: `role="switch"` と `aria-checked` を付与、キーボード操作対応
- フォーカスリングを既存UIに合わせる
- トランジション（`transition-all`）で滑らかな切替感を演出

**タイマー作成API（`/api/timers` 相当）**:
- リクエストボディに `theme` を受け付ける
- バリデーション: `'dark' | 'light'` 以外は 400
- 未指定の場合は `'light'` をデフォルトとして保存

**タイマー表示画面（`/timer/[slug]`）**:
- SSRの段階でDBから取得した `timer.theme` を `<html data-theme="...">` or body クラスに反映
- **クライアントサイドの切替は行わない**（FOUC防止・URL共有先での一貫性）
- **トグルスイッチも表示しない**（閲覧者は切り替えられない）

**`layout.tsx` の扱い**:
- ルートレイアウトの `<body>` は **クライアントコンポーネント経由でテーマを適用**する必要あり
- または、トップページ `/` は動的レンダリングとし、ページ内でテーマを管理
- 具体的な実装パターンは Claude Code の判断に委ねるが、**トップページでの状態変化をDOM反映する仕組み**が必要

### 5.4 実装方式（採用済み）

CSS 変数方式を採用。既存の Tailwind クラスを大幅書き換えせずに、`<html data-theme="...">` の付与だけでテーマ切替が反映される。

**ライトテーマの配色コンセプト**:
落ち着いた弁護士・司法書士サイト風。温かみのあるオフホワイトの本体に、純白のカードが軽く浮き上がる。長文読み物で疲れず、ブランドの厳格さを保つ配色。

カードの階層感は背景色差（`#faf8f4` → `#ffffff`）とわずかな暖色グレーの境界線 (`#e2dccf`) で作る。ネイビーカードなど濃色カードは圧迫感があり操作性を損なうため採用しない。

**実装例**:

```css
/* globals.css (抜粋) */
:root,
[data-theme="light"] {
  /* 本体（オフホワイト基調） */
  --bg-base: #faf8f4;          /* 温かみのあるオフホワイト */
  --bg-card: #ffffff;          /* 純白のカード */
  --bg-elevated: #f2ede2;      /* 入力欄・段差のあるサーフェス */
  --border-default: #e2dccf;   /* カードの境界線（暖色グレー） */
  --border-strong: #cec7b7;

  --text-primary: #1a1815;     /* 見出し（ほぼ墨） */
  --text-secondary: #3f3c36;   /* 本文（長文で疲れない、AAA 10:1） */
  --text-tertiary: #6b6860;    /* 補助 */
  --text-muted: #96928a;

  --accent-text: #991b1b;      /* red-800 深紅（AA 9.4:1 on #ffffff） */
  --accent-cta: #991b1b;
  --accent-cta-hover: #7f1d1d; /* red-900 */
  --principal-text: #1d4ed8;   /* 元本=blue-700 */
  --interest-text: #92400e;    /* 利息=amber-800 */
  --success-text: #15803d;     /* green-700 */
}

[data-theme="dark"] {
  /* 本体=zinc-950、カード=zinc-900 */
  --bg-base: #09090b;
  --bg-card: #18181b;
  --bg-elevated: #27272a;
  --border-default: #27272a;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --accent-text: #f87171;       /* red-400 */
  --accent-cta: #dc2626;
  --accent-cta-hover: #b91c1c;
  --principal-text: #60a5fa;    /* blue-400 */
  --interest-text: #fb923c;     /* orange-400 */
  --success-text: #4ade80;      /* green-400 */
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 150ms, color 150ms;
}
```

**設計上の注意点**:
- ライトテーマとダークテーマで「カードの階層性」は同じ方向（カード背景が本体より明るい／本体より暗い）ではなく、**どちらも本体よりわずかに明るい or 同階層**で設計する。
  - ライト: 本体 `#faf8f4`（オフホワイト） → カード `#ffffff`（純白）で軽く浮き上がる
  - ダーク: 本体 `#09090b`（zinc-950） → カード `#18181b`（zinc-900）で軽く浮き上がる
- ライトテーマで濃色カード（ネイビー等）を使うと、カード内で text-primary を on-card 系に差し替える必要が出て実装が複雑化する。白カードならこの切替は不要で、同じ rt-* 意味論トークンがそのまま使える。

Tailwind 側では `arbitrary value` で CSS 変数を使う、もしくは以下のように拡張:

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'rt-bg': 'var(--bg-base)',
      'rt-card': 'var(--bg-card)',
      'rt-border': 'var(--border-default)',
      'rt-text-primary': 'var(--text-primary)',
      'rt-text-secondary': 'var(--text-secondary)',
      'rt-text-tertiary': 'var(--text-tertiary)',
      'rt-accent-bg': 'var(--accent-bg)',
      'rt-accent-border': 'var(--accent-border)',
      'rt-accent-text': 'var(--accent-text)',
      'rt-accent-cta': 'var(--accent-cta)',
    }
  }
}
```

既存クラス（`bg-zinc-950`, `bg-zinc-900`, `border-zinc-800` 等）を
`bg-rt-bg`, `bg-rt-card`, `border-rt-border` 等に置換していく。

**`data-theme` の適用場所**:

```tsx
// src/app/timer/[slug]/layout.tsx または page.tsx でサーバーサイドで
<html lang="ja" data-theme={timer.theme}>
```

または body に付ける:

```tsx
<body data-theme={timer.theme} className="min-h-screen bg-rt-bg font-sans">
```

**トップページでのプレビュー実装**:

```tsx
// HomeClient.tsx 内
const [theme, setTheme] = useState<'light' | 'dark'>('light');

useEffect(() => {
  // body の data-theme 属性を書き換えてプレビュー
  document.body.setAttribute('data-theme', theme);
  return () => {
    // コンポーネントアンマウント時にクリーンアップは不要
    // （ページ遷移時はタイマー表示画面側でSSR適用されるため）
  };
}, [theme]);
```

### 5.5 トップページ `/` の扱い

- **初期表示はライト基調**（`data-theme="light"`）
- フォーム内のトグルスイッチで切替可能、切替は**即座にプレビュー反映**される
- タイマー作成ボタンを押すと、選択中のテーマ値がフォーム送信に含まれてDBに保存される
- ユーザーがトップページに戻ってきた場合は再度ライトにリセット（前回選択の記憶は不要）

### 5.6 コラムページ `/column/*` の扱い

- **ライト基調固定**
- テーマトグルは表示しない（コラムはタイマーに紐付かないため）
- 将来的に必要なら OS 設定に従う仕組みを追加検討

### 5.7 広告カードのテーマ対応

- `AffiliateCard.tsx` のスタイルも CSS 変数ベースに書き直す
- ダーク背景・ライト背景のどちらでも視認性・訴求力が落ちないデザインにする
- CTAボタン色は両テーマで統一（`--accent-cta: #dc2626`）

---

## 6. 配置仕様

### 6.1 タイマー表示画面 `/timer/[slug]`

**初期設定**（実験1 `timer-placement-v1` の control）:
- 配置位置: ページ最下部（タイマー・返済履歴UIの下）
- 表示カテゴリ: 債務整理 + おまとめローン

**表示するセクション**（上から順に）:

1. **おまとめローンセクション**
   - タイトル: 「複数の借金をまとめて金利を下げる」
   - 導入文: 「複数の借金をひとつにまとめることで、月々の返済額・総利息を減らせる可能性があります。」
   - 条件: タイマー内のエントリ数が **2件以上**のときのみ表示
   - カード件数: バリアント設定に従う（初期3件）

2. **債務整理セクション**
   - タイトル: 「返済が厳しい方へ：無料の借金相談」
   - 導入文: 「利息が膨らみ返済が困難な場合、弁護士・司法書士への相談で解決できるケースがあります。相談は無料です。」
   - 条件: 常時表示
   - カード件数: バリアント設定に従う（初期3件）

**カードローン / 消費者金融 / クレジットカード表示時**:
- 上記2セクションの**後**に配置
- タイトル: 「低金利で借り換え」「金利の見直しを検討」など、借入を煽らない表現
- 各カードの下に免責注記を必ず表示

**`placement` 値**:
- おまとめローン: `timer-loan-consolidation`
- 債務整理: `timer-debt-consolidation`
- カードローン: `timer-card-loan`
- 消費者金融: `timer-consumer-finance`
- クレジットカード: `timer-credit-card`

### 6.2 コラムページ `/column/配下`

**初期作成する3記事**:

| URL | タイトル | 主要キーワード | 誘導先カテゴリ |
|---|---|---|---|
| `/column/saimu-seiri` | 債務整理とは？種類・費用・デメリットを解説 | 債務整理, 任意整理, 個人再生, 自己破産 | 債務整理 |
| `/column/omatome-loan` | おまとめローンの仕組みとメリット・デメリット | おまとめローン, 借金 一本化, 金利 下げる | おまとめローン |
| `/column/kinri-hikaku` | カードローン金利の仕組みと利息を減らす方法 | カードローン 金利, 利息 計算, 金利 高い | 債務整理・おまとめ |

**各記事の構成**:
1. 冒頭に「本ページにはプロモーションが含まれます」
2. 導入（問題提起）
3. 本文（1500〜3000文字）
4. 記事中盤に AffiliateSection を1回挿入（**メインカテゴリ**）
5. 本文後半
6. 記事末尾に AffiliateSection をもう1回挿入（**補助カテゴリ**）
7. 関連記事へのリンク
8. 利息タイマー本体へのリンク

**2 段構え配置の方針（メインカテゴリ + 補助カテゴリ）**:

コラム記事の AffiliateSection は「メインカテゴリ（記事テーマと一致）+ 補助カテゴリ（読者の別選択肢を提示）」の 2 段構成とする。同じカテゴリを連続で出すと繰り返し感が強く読者が疲れるため、状況の異なる読者層を幅広くカバーする配分にする。

| 記事 | 中盤（メイン） | 末尾（補助） | 想定する読者状況の分岐 |
|---|---|---|---|
| saimu-seiri | debt-consolidation | loan-consolidation | 深刻な読者 → 相談 / 様子見の読者 → おまとめ |
| omatome-loan | loan-consolidation | debt-consolidation | おまとめ検討層 → 借換え / 審査が通らない層 → 債務整理 |
| kinri-hikaku | card-loan | loan-consolidation | 新規借入検討 → 商品比較 / 既に複数借入 → おまとめ |

補助セクションの動機づけ文は「もし xxx の場合は」「xxx という選択肢もあります」のように柔らかく接続し、押し付けがましい誘導は避ける。

**メタデータ要件**:
- `metadata.title`: 記事タイトル + ` | 利息タイマー`
- `metadata.description`: 記事の要約（120〜160文字）
- `openGraph`, `twitter` もレイアウトの既存パターンに沿って設定
- `alternates.canonical` を記事 URL で明示

**構造化データ**:
- 各記事に `Article` スキーマの JSON-LD
- FAQ セクションには `FAQPage` の JSON-LD

### 6.3 sitemap.ts の更新

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://rate-time.com';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/column/saimu-seiri`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/column/omatome-loan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/column/kinri-hikaku`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
```

### 6.4 robots.ts の更新

```ts
disallow: ['/timer/', '/api/', '/admin/'], // /admin/ を追加
```

---

## 7. 法務・ポリシー対応

### 7.1 追加が必要なページ

| パス | 内容 |
|---|---|
| `/privacy` | プライバシーポリシー |
| `/terms` | 利用規約 |
| `/disclosure` | 広告に関する表示 |

### 7.2 プライバシーポリシーに含める項目

- サイトがアフィリエイトプログラムに参加していること
- Cookie を利用していること（`rt_vid`, `rt_exp_*` の目的を明記）
- アクセス解析・A/Bテストのために閲覧情報を収集していること
- ユーザーが入力した借入情報はタイマー機能のみに使用
- 第三者への提供を行わないこと

### 7.3 カードローン等を扱う場合の追加表記

- 貸金業法に基づく注意喚起: 「借り過ぎに注意しましょう」
- 各サービスの貸金業登録番号を表示（ASP提供素材にあれば使う）
- 返済シミュレーション結果の免責: 「本ツールの計算結果は概算であり、実際の返済額と異なる場合があります」

### 7.4 ステマ規制対応チェックリスト

- [ ] 各アフィリエイトセクションに「広告」「PR」表記
- [ ] コラム記事冒頭に「本ページにはプロモーションが含まれます」
- [ ] プライバシーポリシーにアフィリエイト参加の明記
- [ ] 体験談・口コミを捏造しない

### 7.5 広告表示の設計原則（ノイズ最小化）

景表法・ステマ規制への対応は過剰に重ねて表示するとサイトのトーンを損なう。以下の方針で最小限・控えめに実装する。

- **広告ラベルは AffiliateCard 単位で 1 箇所**に集約。カード右上に極小の「PR」テキスト（text-[10px] text-rt-text-muted tracking-wide）を配置するのみ
- セクション全体での「当サイトはアフィリエイトプログラムに参加しています」表示は**実装しない**。アフィリエイト参加の包括的な開示は `/privacy` と `/disclosure` の 2 ページに集約する
- **広告主名をカード上に表示しない**。`AffiliateOffer.advertiser` は内部メタデータとして保持するが UI には出さず、提携一覧は `/disclosure` で開示する
- リスクカテゴリ（card-loan / consumer-finance / credit-card）の `disclaimer` はカード本体末尾に残す（貸金業法・利用者保護の観点で必要）
- コラム記事冒頭の「本ページにはプロモーションが含まれます」は維持（記事全体が広告を含む場合の景表法要件）

「最小限だが読者が注意深く見れば広告と判別できる」レベルを維持する（NewsPicks / 日経電子版等のネイティブ広告の慣行に準拠）。

---

## 8. 実装順序

### Phase 1: 基盤整備
1. `src/lib/affiliates.ts` の型定義と空の配列を作成
2. `src/lib/experiments.ts` の型定義と初期実験定義（status: 'draft'）
3. `migrations/002_ab_testing.sql` を作成し Neon に適用
4. `src/middleware.ts` でのバリアント割当ロジック
5. 計測API `/api/affiliates/impression` と `/api/affiliates/click`

### Phase 2: UIコンポーネント
6. `src/components/affiliate/AffiliateCard.tsx`
7. `src/components/affiliate/AffiliateSection.tsx`
8. 各種ポリシーページとフッター

### Phase 3: 配置実装
9. `/timer/[slug]` にアフィリエイトセクションを追加
10. `/column/saimu-seiri` 作成
11. `/column/omatome-loan` 作成
12. `/column/kinri-hikaku` 作成
13. sitemap.ts / robots.ts 更新

### Phase 4: 管理画面
14. `/admin/experiments` 一覧と詳細画面
15. 認証の実装（ADMIN_SECRET ベース）

### Phase 5: 運用開始（実験1〜4）
16. ASP に登録・オファーを `affiliateOffers` に追加
17. 実験1 `timer-placement-v1` を `active` に変更
18. 1〜2週間ごとに結果を確認し、勝ちバリアントを固定 → 次の実験へ
19. 実験1〜4 を順次実施

### Phase 6: テーマ機能実装（実験1〜4完了後）
20. `migrations/003_timer_theme.sql` 適用（`theme` カラム追加）
21. CSS変数ベースのテーマ切替実装
22. `Timer` 型・DB読取/書込ロジック更新
23. タイマー作成フォームにテーマ選択UI追加
24. タイマー表示画面でのテーマ適用（SSR）
25. 広告カードのテーマ対応

### Phase 7: テーマ初期値実験（Phase 6完了後）
26. `migrations/004_theme_selected_by_user.sql` 適用
27. 実験5 `timer-default-theme-v1` を active に

### 実験実施の順序（重要）
1. `timer-placement-v1` → 配置位置を決定
2. `timer-category-order-v1` → カテゴリ順序を決定
3. `timer-limit-v1` → 表示件数を決定
4. `timer-category-mix-v1` → カテゴリ種類を決定（リスク高いため実験1〜3の後）
5. `timer-default-theme-v1` → テーマ初期値を決定（テーマ機能実装後）

---

## 9. 将来検討事項（今は実装しない）

- CV通知をASPからWebhook受信してLTV分析
- PostHog等の外部ツールへの移行（PVが月10万超えたら検討）
- 多変量テスト（複数変数同時）
- ユーザー属性（借入総額等）に応じた動的出し分け
- A/Aテスト検証機能
- OSのシステム設定に従うテーマ自動選択（`prefers-color-scheme`）
- コラムページへのテーマ選択機能の拡張

---

## 10. 禁止事項まとめ

- ❌ FX・バイナリーオプション・CFD等の投機性金融商品
- ❌ ギャンブル系・オンラインカジノ
- ❌ 情報商材系
- ❌ リボ払いを積極訴求するクレカ
- ❌ 「今すぐ借りられる」等の借金を煽るコピー
- ❌ 「広告」「PR」表記の省略
- ❌ `rel="sponsored nofollow noopener"` の省略
- ❌ 免責注記の省略（リスクカテゴリ）
- ❌ ランディングページ `/` の主要UIへの広告混在
- ❌ タイマー機能・返済履歴UIより上への広告配置（ただし実験1の top バリアント時のみ許容）
- ❌ 体験談・口コミの捏造
- ❌ 複数実験の同時実行
- ❌ 管理画面 `/admin/*` の公開
- ❌ タイマー表示画面（`/timer/[slug]`）でのクライアントサイド動的切替（FOUC防止・作成者の意思尊重）
  - ※ トップページ `/` でのプレビュー目的での切替は許容
- ❌ タイマー閲覧画面での閲覧者によるテーマ変更（作成者が決めたテーマを尊重）

---

## 11. v1 → v2 → v3 → v4 の変更点

| 項目 | v1（初版） | v2 | v3 | v4（現行） |
|---|---|---|---|---|
| 扱うカテゴリ | 債務整理、おまとめローンのみ | + カードローン、消費者金融、クレジットカード | v2と同じ | v2と同じ |
| A/Bテスト | なし | Neon DB ベースで実装 | + テーマ初期値実験を追加 | v3と同じ |
| 計測 | なし | インプレッション・クリック | v2と同じ | v2と同じ |
| リスクカテゴリ対応 | - | 免責注記・訴求コピー制約を追加 | v2と同じ | v2と同じ |
| 配置 | タイマー画面下部固定 | A/Bテストで上部・両方も検証 | v2と同じ | v2と同じ |
| テーマ | ダーク固定 | - | ダーク/ライト選択可、デフォルト dark | **デフォルトをlightに変更、トグルスイッチ、トップでプレビュー可** |

---

## 12. Claude Routines 連携 API（日次レポート）

Claude Routines 等の外部サービスから日次 KPI を取得するための読取り専用 API。
将来的に複数プロジェクト（rate-time 以外）でも同じスキーマを使うため、汎用的な JSON スキーマとして設計。

### 12.1 エンドポイント

```
GET /api/admin/report/daily?date=YYYY-MM-DD
Authorization: Bearer <ROUTINE_API_TOKEN>
```

- `date`: 集計対象日（JST）。省略時は JST 前日
- 認証: `Authorization: Bearer <ROUTINE_API_TOKEN>` ヘッダ必須（定数時間比較）

### 12.2 認証方式

- 環境変数 `ROUTINE_API_TOKEN` が未設定の場合 → `404 Not Found`（存在自体を隠す）
- Bearer Token が一致しない場合 → `401 Unauthorized`
- 既存の `/admin/*` / `/api/admin/*` は Basic 認証のまま。`/api/admin/report/*` のみ Bearer に分離（middleware で判定）

### 12.3 レスポンス JSON スキーマ

```json
{
  "project": "rate-time",
  "date": "2026-04-24",
  "generated_at": "2026-04-25T00:05:12.345Z",
  "kpis": {
    "impressions": 1234,
    "clicks": 24,
    "ctr": 0.0195,
    "unique_visitors": 987
  },
  "experiments": [
    {
      "id": "timer-placement-v1",
      "name": "配置位置テスト",
      "status": "active",
      "variants": [
        {
          "id": "timer-placement-v1__control",
          "weight": 1,
          "impressions": 410,
          "clicks": 8,
          "ctr": 0.0195,
          "unique_visitors": 330
        }
      ]
    }
  ],
  "offers": [
    {
      "id": "istowl-nini-seiri",
      "category": "debt-consolidation",
      "advertiser": "弁護士法人イストワール法律事務所",
      "impressions": 650,
      "clicks": 12,
      "ctr": 0.0185
    }
  ],
  "anomalies": [
    {
      "type": "impressions_drop",
      "severity": "high",
      "message": "インプレッション数が前日比で 58% 減少しました",
      "context": { "yesterday": 2000, "today": 840, "drop_pct": 58 }
    }
  ],
  "comparison_to_yesterday": {
    "impressions_delta_pct": -58.0,
    "clicks_delta_pct": -45.2,
    "ctr_delta_pct": 28.7
  }
}
```

**エラーレスポンス**:

| ステータス | `{ error }` | 条件 |
|---|---|---|
| 404 | - | `ROUTINE_API_TOKEN` 未設定 |
| 401 | `unauthorized` | Bearer Token 不一致 |
| 400 | `invalid_date` | date が YYYY-MM-DD 形式でない |
| 500 | `database_error` | DB クエリ失敗 |

### 12.4 CTR・比較値の精度

- `ctr`: `clicks / impressions`。impressions=0 なら 0。精度は 0.0001（=0.01%）
- `*_delta_pct`: `(today - yesterday) / yesterday * 100`。yesterday=0 なら 0。小数 2 桁

### 12.5 異常値検知ルール

1. **`impressions_drop`** (severity: high): インプレッション数が前日比 50% 以上減少
2. **`no_clicks`** (severity: medium): その日 impressions ≥ 10 で clicks = 0
3. **`variant_no_impressions`** (severity: high): active 実験で合計 impressions ≥ 10 かつ特定バリアント = 0
   （割当ロジックのバグ検知）

### 12.6 per-offer インプレッションの計算方法

impressions テーブルは placement 単位で記録され、offer_id を持たない。per-offer の impressions は以下の方法で推定:

- `placementToCategory(placement)` で placement を category に変換（`timer-<category>` はパターンマッチ、コラム placement は手動マップ）
- 各 offer の impressions = その offer の category と一致する全 placement の impressions 合計
- 1 セクション表示はそのカテゴリの全 offer に 1 インプレッションずつ、という現行の表示仕様に一致

将来 impressions テーブルに `category` カラムを追加すればこのマッピングは不要になる。

### 12.7 将来の複数プロジェクト展開

`project` フィールドで識別、他フィールドは共通スキーマ。Routines 側は project ごとに表示フォーマットを切り替えなくてもよい設計。異常値検知ルールはプロジェクト共通でよいが、閾値調整が必要なら severity の基準をプロジェクトごとに上書きする。

### 12.8 必要な環境変数

| 変数 | 用途 |
|---|---|
| `DATABASE_URL` | Neon Postgres 接続（既存、必須） |
| `ADMIN_USER` / `ADMIN_PASSWORD` | `/admin/*` と `/api/admin/*`（レポート API を除く）の Basic 認証 |
| `ROUTINE_API_TOKEN` | `/api/admin/report/*` の Bearer 認証（未設定時は 404） |

本番環境（Vercel）では Project Settings → Environment Variables から設定。ローカル開発では `.env.local` に記載（`.gitignore` 済み）。

---

## 13. 広告フォーマット A/B テスト（ad-format-v1）

現行のテキストカード表示に加えて、タイマー画面限定で **スティッキーフッターバナー**（320×50 の画像広告）を追加し、フォーマット間の CTR を比較する実験。

### 13.1 実験仕様

| 実験 ID | `ad-format-v1` |
|---|---|
| 対象ページ | `/timer/[slug]` のみ（コラム・トップ・ポリシーは対象外） |
| バリアント | `text-only` / `banner-only` / `text-and-banner`（均等割り当て weight 1） |
| 検証対象 | モバイル中心のサイトでフォーマット別 CTR を計測 |
| 同時実行ルール | 実験は 1 度に 1 つ active（`timer-category-mix-v1` を paused に切替えてから投入） |

### 13.2 バナーとテキストの URL 分離

`AffiliateOffer` 型にバナー用フィールドを追加:

```ts
interface AffiliateOffer {
  // ... 既存フィールド ...
  href: string;                          // テキストリンク用 URL
  banner?: {
    href: string;                        // バナー専用 URL（ASP で別計測）
    imageUrl: string;                    // 画像 URL（A8.net CDN）
    width: number;                       // 320
    height: number;                      // 50
  };
}
```

A8.net のトラッキング上、バナークリックとテキストクリックは**別計測**されるため、各 offer には 2 種類の URL を保持し、クリック経路に応じて使い分ける。

### 13.3 StickyFooterBanner の設計

**ファイル**: `src/components/affiliate/StickyFooterBanner.tsx`

- `position: fixed; bottom: 0; left: 0; right: 0;`、`z-50`
- 背景は `bg-rt-card` で上辺にシャドウ、`env(safe-area-inset-bottom)` で iOS ホームバー回避
- PR ラベルを左上に極小（`text-[9px] text-rt-text-muted tracking-wide`）
- 右上に閉じるボタン（40×40 タップターゲット）
- インプレッション計測: マウント時に 1 回だけ `/api/affiliates/impression` に `sendBeacon`
  （画面下部に常時可視のため IntersectionObserver は不要）
- 閉じるボタン押下時は React state で非表示化。**sessionStorage / localStorage は使わない**
  （同一マウント内のみ有効、ページ遷移やリロードで再表示される）

### 13.4 表示するバナーオファーの選び方

- タイマー内 `entries.length >= 2` → `loan-consolidation` カテゴリ
- それ以外 → `debt-consolidation` カテゴリ
- カテゴリ内から `slug` 由来の決定的ハッシュで 1 offer を選択
  （同じ slug = 同じバナー、リロードでも安定。異なる slug 間ではローテーション）

### 13.5 TimerClient 側の表示制御

`experimentId === 'ad-format-v1'` の場合のみ variantId を解釈:

| variantId | テキストカード | バナー |
|---|---|---|
| `ad-format-v1__text-only` | 表示 | 非表示 |
| `ad-format-v1__banner-only` | 非表示 | 表示 |
| `ad-format-v1__text-and-banner` | 表示 | 表示 |
| 未定義 or 別実験 | 表示（従来通り） | 非表示（安全側） |

`AffiliateSection` コンポーネント本体には変更を加えず、親 `TimerClient` 側で条件付きレンダリングする（コラム側への副作用を避けるため）。

### 13.6 placement 命名規則（バナー計測用）

- テキストカード: 従来通り `timer-<category>` / `column-<slug>-<mid|bottom>`
- バナー: `timer-footer-banner-<category>` — admin-queries.ts の `placementToCategory` でパース済み

### 13.7 DB 変更

`migrations/004_ad_format_experiment.sql` を適用する:
1. `timer-category-mix-v1` を `paused` に
2. `ad-format-v1` を `active` で INSERT
3. 3 variants を INSERT

マイグレーションは自動適用されない。ユーザーが Neon SQL Editor で手動実行する。

### 13.8 運用切替の反映ラグ

middleware の `getActiveExperiment()` は 30 秒 TTL キャッシュ（§4.5 参照）。DB を切替えてから最大 30 秒でバリアント割当が `ad-format-v1` に切り替わる。
