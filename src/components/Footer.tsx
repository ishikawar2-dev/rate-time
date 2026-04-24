import Link from 'next/link';

/**
 * 全ページ共通のフッター。テーマ（rt-*）に連動するため、
 * body の data-theme 属性に応じて配色が切り替わる。
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-rt-border bg-rt-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 text-xs text-rt-text-tertiary">
        <nav aria-label="サイトナビゲーション" className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          <Link href="/" className="text-rt-text-secondary hover:text-rt-text-primary transition-colors">
            利息タイマー
          </Link>
          <Link href="/privacy" className="hover:text-rt-text-secondary transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-rt-text-secondary transition-colors">
            利用規約
          </Link>
          <Link href="/disclosure" className="hover:text-rt-text-secondary transition-colors">
            広告に関する表示
          </Link>
        </nav>
        <p className="leading-relaxed">
          当サイトはアフィリエイトプログラムに参加しており、紹介報酬を得ることがあります。
          本ツールの計算結果は概算であり、実際の返済額と異なる場合があります。
        </p>
        <p className="mt-3 text-rt-text-muted">
          &copy; {new Date().getFullYear()} 利息タイマー
        </p>
      </div>
    </footer>
  );
}
