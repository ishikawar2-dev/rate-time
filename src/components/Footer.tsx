import Link from 'next/link';

/**
 * 全ページ共通のフッター。
 * プライバシーポリシー・利用規約・広告に関する表示へのリンクを提供する。
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-8 text-xs text-zinc-500">
        <nav aria-label="サイトポリシー" className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">
            利用規約
          </Link>
          <Link href="/disclosure" className="hover:text-zinc-300 transition-colors">
            広告に関する表示
          </Link>
        </nav>
        <p className="leading-relaxed">
          当サイトはアフィリエイトプログラムに参加しており、紹介報酬を得ることがあります。
          本ツールの計算結果は概算であり、実際の返済額と異なる場合があります。
        </p>
        <p className="mt-3 text-zinc-600">
          &copy; {new Date().getFullYear()} 利息タイマー
        </p>
      </div>
    </footer>
  );
}
