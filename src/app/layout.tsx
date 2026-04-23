import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '利息タイマー',
  description: 'リアルタイムで利息が計算される借金・ローン返済管理アプリ',
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
