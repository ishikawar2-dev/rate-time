# SEO 設定

## サイトマップ管理

`src/app/sitemap.ts` の `PAGE_DATES` 定数で各ページの最終更新日を管理する。

### コラムを更新したら

1. `src/app/column/<slug>/page.tsx` を編集
2. `src/app/sitemap.ts` の `PAGE_DATES['/column/<slug>']` を今日の日付に更新
3. コミット

### priority の設計

| priority | 対象 |
|----------|------|
| 1.0 | トップページ |
| 0.8 | コラム（SEO評価対象） |
| 0.3 | ポリシー系（インデックスはOKだが評価対象としない） |

> Google は priority をほぼ無視するが、意図を明示する慣習として設定する。

### changeFrequency

| changeFrequency | 対象 |
|-----------------|------|
| daily | トップ（タイマー追加・実験データ反映） |
| monthly | コラム |
| yearly | ポリシー系 |

## robots 設定

各ページの `metadata` で `robots` を明示する。レイアウト継承に依存しない（事故防止）。

```typescript
// インデックスさせるページ
robots: { index: true, follow: true }

// インデックスさせないページ
robots: { index: false, follow: false }
```

## インデックス対象一覧

| ページ | インデックス | priority | サイトマップ |
|--------|------------|----------|------------|
| `/` | ✅ | 1.0 | ✅ |
| `/column/saimu-seiri` | ✅ | 0.8 | ✅ |
| `/column/omatome-loan` | ✅ | 0.8 | ✅ |
| `/column/kinri-hikaku` | ✅ | 0.8 | ✅ |
| `/privacy` | ✅（低優先度） | 0.3 | ✅ |
| `/terms` | ✅（低優先度） | 0.3 | ✅ |
| `/disclosure` | ✅（低優先度） | 0.3 | ✅ |
| `/timer/[slug]` | ❌ | - | ❌ |
| `/admin/*` | ❌ | - | ❌ |
| `/api/*` | ❌ | - | ❌ |

## Google Search Console

サイトマップ構造を変更した場合、Search Console からサイトマップを再送信すると反映が速くなる。
ただし急がない場合は次回クロール時に自動反映される。
