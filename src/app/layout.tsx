import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://rate-time.com';
const SITE_NAME = '利息タイマー';
const TITLE = '利息タイマー | リアルタイム利息・借金返済シミュレーター';
const DESCRIPTION =
  '借金・カードローン・消費者金融・友人間の貸し借りの利息をリアルタイムで計算・可視化。単利・複利に対応した無料の返済管理ツール。URLを共有して返済状況を一目で確認できます。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    '利息計算',
    '借金',
    'ローン',
    '金利',
    '複利',
    '単利',
    '返済シミュレーション',
    'カードローン',
    '消費者金融',
    '利息タイマー',
    'リアルタイム',
    '利息 計算 ツール',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-zinc-950 font-sans">
        {children}
      </body>
    </html>
  );
}
