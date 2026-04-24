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
