import Link from 'next/link';

export const metadata = {
  title: '管理画面',
  robots: { index: false, follow: false },
};

/**
 * /admin/* 共通レイアウト。認証は middleware 側で完了している前提。
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-zinc-200">利息タイマー 管理</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/experiments"
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                実験一覧
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            サイトへ戻る →
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
