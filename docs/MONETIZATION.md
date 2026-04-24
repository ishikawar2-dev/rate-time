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

**集計クエリ例**:

```sql
SELECT
  v.id AS variant_id,
  v.name AS variant_name,
  COUNT(DISTINCT i.visitor_id) AS unique_visitors,
  COUNT(i.id) AS impressions,
  COUNT(c.id) AS clicks,
  ROUND(COUNT(c.id)::numeric / NULLIF(COUNT(i.id), 0) * 100, 2) AS ctr_percent
FROM variants v
LEFT JOIN impressions i ON i.variant_id = v.id
LEFT JOIN clicks c ON c.variant_id = v.id
WHERE v.experiment_id = $1
GROUP BY v.id, v.name
ORDER BY v.name;
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

### 5.4 実装方式（推奨）

Claude Code 側の判断に委ねるが、以下を**強く推奨**:

**CSS変数方式を推奨する理由**:
- 既存の Tailwind クラスを大幅書き換えせずに済む
- SSR で `<html data-theme="dark">` を付与するだけで適用できるのでFOUC回避が容易
- コンポーネント側のコード変更が最小限
- トップページでのクライアント側プレビュー（`data-theme` 属性をJSで書き換え）にも対応しやすい

**実装例**（ライトをデフォルト、ダークをオーバーライド）:

```css
/* globals.css */
:root,
[data-theme="light"] {
  --bg-base: #fafafa;          /* zinc-50 */
  --bg-card: #ffffff;
  --border-default: #e4e4e7;   /* zinc-200 */
  --text-primary: #18181b;     /* zinc-900 */
  --text-secondary: #52525b;   /* zinc-600 */
  --text-tertiary: #71717a;    /* zinc-500 */
  --accent-bg: #fef2f2;         /* red-50 */
  --accent-border: #fecaca;     /* red-200 */
  --accent-text: #dc2626;       /* red-600 */
  --accent-cta: #dc2626;        /* red-600 */
  --accent-cta-hover: #b91c1c;  /* red-700 */
}

[data-theme="dark"] {
  --bg-base: #09090b;           /* zinc-950 */
  --bg-card: #18181b;           /* zinc-900 */
  --border-default: #27272a;    /* zinc-800 */
  --text-primary: #f4f4f5;      /* zinc-100 */
  --text-secondary: #a1a1aa;    /* zinc-400 */
  --text-tertiary: #71717a;     /* zinc-500 */
  --accent-bg: rgba(127, 29, 29, 0.4);    /* red-950/40 */
  --accent-border: rgba(153, 27, 27, 0.5); /* red-900/50 */
  --accent-text: #f87171;       /* red-400 */
  --accent-cta: #dc2626;        /* red-600 */
  --accent-cta-hover: #b91c1c;  /* red-700 */
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 150ms, color 150ms;
}
```

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
4. 記事中盤に AffiliateSection を1回挿入
5. 本文後半
6. 記事末尾に AffiliateSection をもう1回挿入
7. 関連記事へのリンク
8. 利息タイマー本体へのリンク

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
