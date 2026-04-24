import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Footer } from '@/components/Footer';
import { getTimerBySlug } from '@/lib/db';

const SITE_URL = 'https://rate-time.com';
const SITE_NAME = '利息タイマー';
const TITLE = '利息タイマー | 借金時計・利息シミュレーター【無料】';
const DESCRIPTION =
  '借金・カードローン・消費者金融の利息をリアルタイム計算する無料ツール。「借金タイマー」「利息時計」「借金時計」「利息シミュレーター」として利用可能。元金と金利を入力するだけで今この瞬間に増える利息を秒単位で確認できます。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    '利息タイマー',
    '利息時計',
    '借金タイマー',
    '利息シミュレーター',
    '借金時計',
    '利息計算',
    '借金',
    'ローン',
    '金利',
    '複利',
    '単利',
    '返済シミュレーション',
    'カードローン',
    '消費者金融',
    'リアルタイム',
  ],
  authors: [{ url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/favicon.png',
        width: 1024,
        height: 1024,
        alt: '利息タイマー — リアルタイム利息計算ツール',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/favicon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/**
 * pathname に応じて SSR で適用するテーマを決定する（docs/MONETIZATION.md §5）。
 *
 * - `/`（トップ）: 'light' をデフォルトで返す。クライアント側のトグルで書き換え可能
 * - `/timer/[slug]`: DB から timer.theme を取得して返す（作成者のテーマで固定表示）
 * - `/admin/*` / `/column/*` / `/privacy` / `/terms` / `/disclosure`: 'dark' を返す
 *   これらのページは rt-* クラス化していないため既存の zinc-* デザイン（ダーク）で描画されるが、
 *   body の背景および Footer を整合させるため data-theme を 'dark' に設定する
 * - x-pathname が無い（middleware matcher 外など）: 'light' をフォールバック
 */
async function resolveTheme(): Promise<'light' | 'dark'> {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/column/') ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/disclosure'
  ) {
    return 'dark';
  }

  const timerMatch = pathname.match(/^\/timer\/([^/?#]+)/);
  if (timerMatch) {
    try {
      const timer = await getTimerBySlug(timerMatch[1]);
      if (timer) return timer.theme;
    } catch {
      // DB 到達不能時はライトにフォールバック（404 でも何でも light）
    }
    return 'light';
  }

  return 'light';
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await resolveTheme();
  return (
    <html lang="ja" data-theme={theme} suppressHydrationWarning>
      <body
        data-theme={theme}
        className="min-h-screen bg-rt-bg text-rt-text-primary font-sans flex flex-col"
        suppressHydrationWarning
      >
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
