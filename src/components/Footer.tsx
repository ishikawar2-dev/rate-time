import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-rt-border bg-rt-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* コラム（前面・目立つ） */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-rt-text-secondary uppercase tracking-wide mb-2">
            コラム
          </p>
          <nav aria-label="コラム記事" className="flex flex-col sm:flex-row flex-wrap gap-y-2 gap-x-5 mb-3">
            <Link href="/column/kinri-keisan" className="text-sm text-rt-text-secondary hover:text-rt-text-primary transition-colors">
              金利計算の方法
            </Link>
            <Link href="/column/shakkin-heranai" className="text-sm text-rt-text-secondary hover:text-rt-text-primary transition-colors">
              借金が減らない理由
            </Link>
            <Link href="/column/kinri-hikaku" className="text-sm text-rt-text-secondary hover:text-rt-text-primary transition-colors">
              カードローン金利入門
            </Link>
            <Link href="/column/omatome-loan" className="text-sm text-rt-text-secondary hover:text-rt-text-primary transition-colors">
              おまとめローン
            </Link>
            <Link href="/column/saimu-seiri" className="text-sm text-rt-text-secondary hover:text-rt-text-primary transition-colors">
              債務整理ガイド
            </Link>
          </nav>
          <nav aria-label="コラム記事（サブ）" className="flex flex-col sm:flex-row flex-wrap gap-y-1 gap-x-5">
            <Link href="/column/jisshitsu-nenritsu" className="text-xs text-rt-text-muted hover:text-rt-text-tertiary transition-colors">
              実質年率とは
            </Link>
            <Link href="/column/fukuri-tanri-chigai" className="text-xs text-rt-text-muted hover:text-rt-text-tertiary transition-colors">
              複利と単利の違い
            </Link>
            <Link href="/column/timer-katsuyou" className="text-xs text-rt-text-muted hover:text-rt-text-tertiary transition-colors">
              利息タイマーの使い方
            </Link>
          </nav>
        </div>

        <hr className="border-rt-border mb-4" />

        {/* ポリシー系（控えめ・一行） */}
        <nav aria-label="サイト情報" className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-rt-text-muted">
          <Link href="/" className="hover:text-rt-text-tertiary transition-colors">利息タイマー</Link>
          <Link href="/privacy" className="hover:text-rt-text-tertiary transition-colors">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:text-rt-text-tertiary transition-colors">利用規約</Link>
          <Link href="/disclosure" className="hover:text-rt-text-tertiary transition-colors">広告に関する表示</Link>
        </nav>

        {/* アフィリエイト表記（ステマ規制対応） */}
        <p className="text-xs text-rt-text-muted leading-relaxed">
          ※当サイトには広告が含まれます。
        </p>

        {/* ツール免責 */}
        <p className="text-xs text-rt-text-muted leading-relaxed mt-1">
          ※本ツールの計算結果は概算であり、実際の返済額と異なる場合があります。
        </p>

        <p className="mt-2 text-xs text-rt-text-muted">
          &copy; {new Date().getFullYear()} 利息タイマー
        </p>

      </div>
    </footer>
  );
}
