# 利息タイマー 仕様書（プロダクト）

マネタイズ・広告・A/Bテストに関する仕様は [MONETIZATION.md](./MONETIZATION.md) を参照。
本ドキュメントはタイマー本体の機能・UI 仕様を扱う。

---

## 1. タイマー作成フォーム

### 1.1 開始日入力（date モード + 「今すぐ」ボタン）

**旧仕様**: `datetime-local` による日時入力、空欄時は現在時刻。

**新仕様**: `date` による日付のみの入力 + 「今すぐ」ボタン。

#### 入力 UI

| 要素 | 仕様 |
|---|---|
| ラベル | 「開始日」（必須マーク `*` 付き） |
| 入力欄 | `<input type="date">`（OS ネイティブのデートピッカー） |
| 「今すぐ」ボタン | 右横に併置、押下で start_now 状態 ON |
| 補助テキスト | 「いつから借りましたか？『今すぐ』は現在時刻でスタートします。」 |

#### 内部 state

```ts
interface EntryFormStartDate {
  start_date: string;   // 'YYYY-MM-DD'（必須）
  start_now: boolean;   // true のとき送信時に現在時刻を使う
}
```

- date input を手動で変更: `start_date` 更新 + `start_now` を false に解除
- 「今すぐ」ボタン押下: `start_date` = 今日の日付（表示用）+ `start_now` = true
- 「今すぐ」モード中は視覚的に強調（深紅背景）

#### バリデーション

- `start_now === false && start_date === ''` のとき送信不可（「開始日を選択するか『今すぐ』を押してください」）

#### 送信時の変換

- `start_now === true` → `Date.now()`（ミリ秒）
- `start_now === false` → `new Date(\`\${start_date}T00:00:00\`).getTime()`（当日の 00:00 ローカルタイム）

### 1.2 開始日表示（互換性保持）

タイマー画面・エントリカードで、`started_at` と `timer.created_at` は**日付のみ**で表示する（時刻は省略）。

| 表示箇所 | 表示関数 |
|---|---|
| エントリの「開始: ...」 | `formatDateOnly(entry.started_at)` |
| タイマー作成日の「開始: ...」 | `formatDateOnly(timer.created_at)` |
| 返済の日時 | `formatDate(r.repaid_at)`（時刻付きのまま） |

#### 既存タイマーとの互換性

- DB スキーマは変更なし（`started_at BIGINT`、ミリ秒タイムスタンプ）
- 既存タイマーも時刻情報を保持しているが**表示上は省略**される
- 利息計算は既存の秒単位ロジックをそのまま使う（`calculateEntryBalance` 等）

### 1.3 適用範囲

新しい開始日入力 UI は以下 3 つのフォームすべてに適用:

1. トップページのタイマー作成フォーム（`src/app/HomeClient.tsx`）
2. タイマー画面の「元金を追加」フォーム（`AddEntryForm` in `TimerClient.tsx`）
3. タイマー画面の「元金を編集」モーダル（`EditEntryModal` in `TimerClient.tsx`）

---

## 2. テーマ機能

（参照: [MONETIZATION.md §5](./MONETIZATION.md#5-テーマ機能ダークライト)）

タイマー作成時に light/dark を選択し、`timers.theme` カラムに保存。URL 共有先でも同じテーマで表示される。

---

## 3. 複数プロジェクト共通 Routines API

Claude Routines 等の外部サービスから各プロジェクトの日次 KPI を取得するための共通 API 仕様。rate-time を皮切りに、将来別プロジェクトでも同じスキーマを踏襲する前提で設計する。

### 3.1 エンドポイント契約

```
GET /api/admin/report/daily?date=YYYY-MM-DD
Authorization: Bearer <ROUTINE_API_TOKEN>
```

### 3.2 共通レスポンス JSON スキーマ

全プロジェクト共通のトップレベル構造:

```ts
interface DailyReport {
  project: string;            // プロジェクト識別子（例 "rate-time"）
  date: string;               // 集計対象日 YYYY-MM-DD（JST）
  generated_at: string;       // ISO 8601 UTC

  kpis: {
    impressions: number;
    clicks: number;
    ctr: number;              // 0.0001 精度の小数
    unique_visitors: number;
  };

  experiments: Array<{
    id: string;
    name: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    variants: Array<{
      id: string;
      weight: number;
      impressions: number;
      clicks: number;
      ctr: number;
      unique_visitors: number;
    }>;
  }>;

  offers: Array<{
    id: string;
    category: string;         // プロジェクト固有のカテゴリ識別子
    advertiser: string | null;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;

  anomalies: Array<{
    type: string;             // 'impressions_drop' | 'no_clicks' | 'variant_no_impressions' | （将来拡張）
    severity: 'low' | 'medium' | 'high';
    message: string;          // 人間が読める説明（プロジェクトのロケール）
    context: Record<string, unknown>;
  }>;

  comparison_to_yesterday: {
    impressions_delta_pct: number;
    clicks_delta_pct: number;
    ctr_delta_pct: number;
  };
}
```

### 3.3 プロジェクト固有の拡張方針

- `offers[].category` はプロジェクト固有の値が入る（rate-time では債務整理カテゴリ等）
- `anomalies[].type` は新しい検知ルールを追加する場合に拡張可能。Routines 側は未知の type を unknown として扱う
- `experiments[].status` は共通の 4 値（draft/active/paused/completed）に揃える

### 3.4 認証仕様

- 環境変数 `ROUTINE_API_TOKEN` を各プロジェクトで個別に発行
- `Authorization: Bearer <token>` ヘッダで送信
- 定数時間比較で照合、未設定時は 404、不一致は 401
- Basic 認証の `/admin/*` とは別系統（併用可能）

### 3.5 実装詳細（rate-time 固有）

実装詳細は [MONETIZATION.md §12](./MONETIZATION.md#12-claude-routines-連携-api日次レポート) を参照。

### 3.6 日次レポートの永続化（共通スキーマ）

Routines が生成した `DailyReport` を DB に保存するための共通契約:

**POST /api/admin/report/save**:
- 認証: `Authorization: Bearer <ROUTINE_API_TOKEN>`（GET /daily と同じ）
- リクエストボディ: `ReportPayload`（§3.2 と同スキーマ）
- レスポンス: `201 { id: number, saved_at: string }`
- DB: `daily_reports (project, date)` を一意キーとし UPSERT

**DB テーブル** `daily_reports`:

| カラム | 型 | 説明 |
|---|---|---|
| id | SERIAL | PK |
| project | VARCHAR(50) | プロジェクト識別子 |
| date | DATE | JST 日付 |
| generated_at | TIMESTAMPTZ | Routines 生成時刻 |
| report_json | JSONB | ReportPayload 全体 |
| created_at | TIMESTAMPTZ | 保存時刻 |

UNIQUE(project, date) で同日 2 回目以降は上書き。

**管理画面**:
各プロジェクトで `/admin/reports` と `/admin/reports/[date]` を提供し、履歴の可視化・異常値確認を行う。チャート・テーブル形式はプロジェクト共通の UX とする。

---

## 4. バリアント ID と UI 制御の共通仕様

A/B テストで「特定の variantId のとき特定の UI を出す/隠す」制御を行う場合の共通作法。

### 4.1 variantId の構造

全プロジェクト共通で `<experiment_id>__<variant_name>` 形式。

例: `ad-format-v1__text-only`、`timer-placement-v1__control`

### 4.2 variantId による表示制御の置き場

実験が特定のページに限定される場合（例: ad-format-v1 はタイマー画面のみ）、**親ページコンポーネントで条件分岐**して子コンポーネント（AffiliateSection 等）を条件付きレンダリングする。

```tsx
const adFormatVariant =
  experimentId === 'ad-format-v1' && variantId?.startsWith('ad-format-v1__')
    ? variantId.slice('ad-format-v1__'.length)
    : null;

const showTextCards =
  adFormatVariant === null ||
  adFormatVariant === 'text-only' ||
  adFormatVariant === 'text-and-banner';

{showTextCards && <AffiliateSection ... />}
```

子コンポーネント内で variantId をパースすると、他ページで同じコンポーネントを使っている場合に副作用が発生する。親側判定にすれば影響範囲を閉じ込められる。

### 4.3 実験未定義時のデフォルト

`variantId === null || undefined` のケースでは、**従来動作 = 安全側**にフォールバック。
例: ad-format-v1 なら「テキスト表示・バナー非表示」がデフォルト。
