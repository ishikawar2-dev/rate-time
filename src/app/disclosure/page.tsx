import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '広告に関する表示',
  description: '利息タイマーにおけるアフィリエイトプログラムへの参加、広告表示の方針、取り扱うカテゴリと取り扱わないカテゴリについて記載しています。',
  alternates: { canonical: 'https://rate-time.com/disclosure' },
  robots: { index: true, follow: true },
};

export default function DisclosurePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-zinc-300">
      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors inline-block mb-6">
        ← 利息タイマーに戻る
      </Link>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">広告に関する表示</h1>
      <p className="text-xs text-zinc-500 mb-8">最終更新日: 2026-04-24</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">アフィリエイトプログラムへの参加</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          利息タイマー（以下「当サイト」）は、各種アフィリエイトプログラムに参加しており、紹介先サービスを経由して契約等が成立した場合に紹介報酬を受け取ることがあります。
          受領する報酬は、当サイトの運営・維持・コンテンツ品質向上のために利用されます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">広告表示の方針</h2>
        <ul className="text-sm leading-relaxed text-zinc-400 list-disc pl-5 space-y-2">
          <li>アフィリエイトリンクを含むセクションの直前には必ず「広告」または「PR」の表記を行います（ステマ規制対応）。</li>
          <li>コラム記事で商品・サービスを紹介する場合は、記事冒頭に「本ページにはプロモーションが含まれます」と明示します。</li>
          <li>アフィリエイトリンクには <code className="text-zinc-300">rel=&quot;sponsored nofollow noopener&quot;</code> を付与し、検索エンジンに対しても広告であることを明示します。</li>
          <li>利用者に誤認を与えないよう、体験談・口コミを捏造することはありません。</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">取り扱うカテゴリ</h2>
        <p className="text-sm leading-relaxed text-zinc-400 mb-2">
          当サイトで紹介するアフィリエイト案件は、以下のカテゴリに限定します。
        </p>
        <ul className="text-sm leading-relaxed text-zinc-400 list-disc pl-5 space-y-1">
          <li>債務整理（弁護士・司法書士による無料相談）</li>
          <li>おまとめローン</li>
          <li>カードローン</li>
          <li>消費者金融</li>
          <li>クレジットカード</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">取り扱わないカテゴリ</h2>
        <p className="text-sm leading-relaxed text-zinc-400 mb-2">
          利用者の利益を損なう可能性が高い、以下のカテゴリは取り扱いません。
        </p>
        <ul className="text-sm leading-relaxed text-zinc-400 list-disc pl-5 space-y-1">
          <li>FX・バイナリーオプション・CFD などの投機性金融商品</li>
          <li>オンラインカジノ・競馬情報商材などのギャンブル系</li>
          <li>「借金から抜け出す方法」等の高額情報商材</li>
          <li>リボ払いを積極的に訴求するクレジットカード</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-zinc-200 mb-3">カードローン等に関する注意</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          当サイトではカードローン・消費者金融・クレジットカードを紹介する場合がありますが、これらの利用は慎重に検討してください。
          借入は計画的に行い、返済が困難と感じた場合は債務整理などの専門家相談を優先することを推奨します。
        </p>
        <p className="text-sm leading-relaxed text-zinc-400 mt-3">
          借り過ぎに注意しましょう。各サービスの契約条件・金利・返済期間は、必ず提供元の公式情報をご確認ください。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-zinc-200 mb-3">計算結果の免責</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          本ツールが表示する利息額は概算であり、実際の返済額・手数料・遅延損害金を完全には反映しません。実際の契約内容は紹介先サービス提供者との間で確認してください。
        </p>
      </section>
    </main>
  );
}
