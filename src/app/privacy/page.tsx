import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '利息タイマーのプライバシーポリシー。Cookie の利用方針、アフィリエイトプログラムへの参加、入力情報の取り扱いについて記載しています。',
  alternates: { canonical: 'https://rate-time.com/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-zinc-300">
      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors inline-block mb-6">
        ← 利息タイマーに戻る
      </Link>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">プライバシーポリシー</h1>
      <p className="text-xs text-zinc-500 mb-8">最終更新日: 2026-04-24</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">1. 取得する情報</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          利息タイマー（以下「当サイト」）は、サービス提供のために以下の情報を取得します。
        </p>
        <ul className="text-sm leading-relaxed text-zinc-400 list-disc pl-5 mt-2 space-y-1">
          <li>タイマー作成時に入力された借入情報（元金・金利・開始日など）</li>
          <li>Cookie による訪問者識別子（`rt_vid`）</li>
          <li>A/Bテスト用のバリアント割当情報（`rt_exp_*`）</li>
          <li>ページ閲覧ログ（アクセス日時、User-Agent、リファラ、閲覧ページ）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">2. 利用目的</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          取得した情報は以下の目的で利用します。
        </p>
        <ul className="text-sm leading-relaxed text-zinc-400 list-disc pl-5 mt-2 space-y-1">
          <li>タイマー機能・返済履歴管理機能の提供</li>
          <li>当サイトの利用状況分析および品質改善のためのA/Bテスト</li>
          <li>不正アクセス防止および利用規約違反への対応</li>
        </ul>
        <p className="text-sm leading-relaxed text-zinc-400 mt-3">
          タイマーに入力された借入情報は、タイマー機能の提供以外の目的には利用しません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">3. Cookie の利用</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          当サイトは以下の Cookie を利用します。
        </p>
        <ul className="text-sm leading-relaxed text-zinc-400 list-disc pl-5 mt-2 space-y-1">
          <li><code className="text-zinc-300">rt_vid</code>: 訪問者識別のためのランダムな UUID（有効期限 1 年）。個人を特定する情報は含みません。</li>
          <li><code className="text-zinc-300">rt_exp_*</code>: A/Bテストのバリアント割当を記録するための識別子（有効期限 90 日）。</li>
        </ul>
        <p className="text-sm leading-relaxed text-zinc-400 mt-3">
          これらの Cookie はブラウザ設定から削除・無効化できます。無効化するとA/Bテストの一貫した割当が行われなくなる場合があります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">4. アフィリエイトプログラムへの参加</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          当サイトは各種アフィリエイトプログラムに参加しており、紹介先サービスを経由して契約等が成立した場合に紹介報酬を受け取ることがあります。
          アフィリエイトリンクには「広告」または「PR」表記を明示し、利用者に誤認を与えないよう努めます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">5. 第三者提供</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          当サイトは取得した情報を、法令に基づく場合を除き、利用者本人の同意なく第三者へ提供しません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">6. 改定</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          本ポリシーは、法令の変更や当サイトのサービス内容の変更に応じて予告なく改定することがあります。重要な変更がある場合は当ページ上で告知します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-zinc-200 mb-3">7. お問い合わせ</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          本ポリシーに関するお問い合わせは、サイト運営者までご連絡ください。
        </p>
      </section>
    </main>
  );
}
