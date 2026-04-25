import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';
import { getExperimentContext } from '@/lib/experiment-context';

const TITLE = '借金は本当に複利？単利との違いと"雪だるま"の正体';
const DESCRIPTION =
  '「カードローンは複利で増える」という誤解を正します。カードローンは法律上単利計算ですが、それでも雪だるま式に見える理由を計算式で解説。単利・複利の正しい理解と返済戦略への活かし方を説明します。';
const URL = 'https://rate-time.com/column/fukuri-tanri-chigai';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['複利 単利 違い', 'カードローン 複利', '借金 雪だるま', '利息制限法 単利', '複利 計算', '借金 複利 誤解'],
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    url: URL,
    siteName: '利息タイマー',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/favicon.png', width: 1024, height: 1024, alt: TITLE }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/favicon.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  mainEntityOfPage: URL,
  inLanguage: 'ja',
  datePublished: '2026-04-18',
  dateModified: '2026-04-18',
  author: { '@type': 'Person', name: 'AKASHI' },
  publisher: {
    '@type': 'Organization',
    name: '利息タイマー',
    logo: { '@type': 'ImageObject', url: 'https://rate-time.com/favicon.png' },
  },
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'カードローンは単利ですか複利ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'カードローンは単利計算です。利息制限法第5条は「利息の利息（重利）」の受領を禁じており、発生した利息にさらに利息をつけることは法律上できません。毎月きちんと返済していれば、利息が元金に組み込まれて雪だるま式に膨らむ「複利」の仕組みは働きません。',
      },
    },
    {
      '@type': 'Question',
      name: '単利なのに借金が雪だるまになるのはなぜですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '最低返済額だけを払い続けると、1回の返済の大部分が利息に充当され、元金がほとんど減らないからです。元金が減らなければ翌月もほぼ同額の利息が発生し続けます。これは複利とは別の仕組みで、「元金の減りが遅すぎるため利息が止まらない」という状態です。返済額を増やすか繰上返済をすることで元金を減らせれば、利息の発生も止められます。',
      },
    },
    {
      '@type': 'Question',
      name: '単利と複利で5年後の残高はどれくらい差がありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '100万円を年率10%で5年間まったく返済しなかった場合、単利では利息は毎年10万円で5年で50万円（残高150万円）、複利（年1回計算）では約161万円になります。差は約11万円です。ただしカードローンでは実際に返済しながら使うため、この純粋な差が直接影響するわけではありません。',
      },
    },
    {
      '@type': 'Question',
      name: '延滞すると複利になりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '延滞しても複利にはなりません。ただし返済が遅れると「遅延損害金」が別途発生します。遅延損害金は利息とは別の概念で、消費者金融では年率20%が上限（利息制限法第4条）です。遅延損害金が発生した状態では通常の利息に加えて損害金も積み上がるため、実質的な負担が大きくなります。延滞は早急に解消するのが原則です。',
      },
    },
    {
      '@type': 'Question',
      name: '「72の法則」は借金返済にも使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '72の法則は「72÷金利（%）＝元本が2倍になる年数」を概算する複利計算の目安です。借金は単利計算のため厳密には当てはまりませんが、「高い金利がいかに速く返済総額を増やすか」を直感的に把握する参考にはなります。年率18%であれば72÷18＝4年で、複利なら残高が2倍になるペースです。このスピード感を意識すると、早期返済の優先度が判断しやすくなります。',
      },
    },
  ],
};

export default async function FukuriTanriChigaiPage() {
  const { experimentId, variantId } = await getExperimentContext();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="text-rt-text-secondary">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="text-sm text-rt-text-tertiary hover:text-rt-text-primary transition-colors inline-block mb-6"
          >
            ← 利息タイマーに戻る
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-rt-text-primary mb-3 leading-tight">
            借金は本当に複利？単利との違いと"雪だるま"の正体
          </h1>
          <p className="text-xs text-rt-text-muted mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-18
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              「カードローンは複利で膨らむから怖い」——Web上でこの説明を目にしたことがある人は多いと思う。返済しているのに元金が減らず、利息が次の利息を生むように見える。感覚的には「複利のようだ」と感じるのは理解できる。しかし、これは正確ではない。
            </p>
            <p className="text-sm leading-relaxed">
              カードローンは法律上、単利計算が義務付けられている。複利——つまり発生した利息にさらに利息がつく仕組み——は、日本のカードローンには適用されない。それでも借金が「雪だるま式」に見える理由は別のところにある。以下では単利と複利の正確な違いを計算で示した上で、「雪だるまの正体」を解説する。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">「借金は複利で増える」は本当か？</h2>
            <p className="text-sm leading-relaxed mb-3">
              結論から言うと、カードローンは複利ではない。利息制限法第5条は「重利（利息の利息）」の受領を明示的に禁じている。貸金業者が発生した利息をさらに元金に組み込んで利息を計算することは、法律上できない。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              同様に、延滞した場合に発生する「遅延損害金」も、通常の利息とは別物だ。遅延損害金は返済が遅れたことに対するペナルティとして発生するもので、利息の利息ではない。延滞が続けば通常利息＋遅延損害金が並行して積み上がるため負担は重くなるが、これも複利の仕組みとは異なる。
            </p>
            <p className="text-sm leading-relaxed">
              ただし、カードローン各社が自社サイトや契約書でこの点を積極的に説明することは少ない。Web上では「複利で膨らむ」という不正確な説明が広まっており、混乱が生じやすい状況になっている。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">単利と複利の違い（計算で見る）</h2>
            <p className="text-sm leading-relaxed mb-3">
              単利と複利の違いを計算で確認しておこう。100万円を年率10%で5年間借りて、まったく返済しなかった場合を比較する。
            </p>
            <div className="bg-rt-card border border-rt-border rounded-xl p-4 mb-4 overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-rt-text-primary border-b border-rt-border">
                    <th className="text-left py-1 pr-4">経過年数</th>
                    <th className="text-right py-1 pr-4">単利（残高）</th>
                    <th className="text-right py-1">複利・年1回（残高）</th>
                  </tr>
                </thead>
                <tbody className="text-rt-text-tertiary">
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">1年後</td>
                    <td className="text-right py-1 pr-4">110万円</td>
                    <td className="text-right py-1">110万円</td>
                  </tr>
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">2年後</td>
                    <td className="text-right py-1 pr-4">120万円</td>
                    <td className="text-right py-1">121万円</td>
                  </tr>
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">3年後</td>
                    <td className="text-right py-1 pr-4">130万円</td>
                    <td className="text-right py-1">約133万円</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">5年後</td>
                    <td className="text-right py-1 pr-4">150万円</td>
                    <td className="text-right py-1">約161万円</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed">
              単利では利息は毎年10万円で一定。複利では1年目こそ同じだが、翌年以降は「前年の利息分を含めた残高」に対して利率がかかるため、差が広がっていく。5年後の差は約11万円だ。カードローンは単利であるため、「まったく返済しない」という状況でも複利ほどの速度では膨らまない。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">カードローンが単利でも雪だるま式に見える理由</h2>
            <p className="text-sm leading-relaxed mb-3">
              単利だと分かっていても「返済しているのに全然減らない」という実感を持つ人は多い。その理由は複利とは無関係で、「最低返済額の構造」にある。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              カードローンの最低返済額は一般的に「残高の一定割合＋利息」で設定されている。たとえば残高100万円・年率18%・最低返済額が残高の1%＋利息の場合、1ヶ月の利息は約14,795円、元金返済分は10,000円で、合計最低返済額は約24,795円になる。この返済額を毎月続けると、元金の減りは月1万円にとどまり、ペースが非常に遅い。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              残高が減るにつれ最低返済額も下がっていく（残高スライド型）ため、さらに元金の減りが鈍化する。この構造の中では、「返しているのに残高がほとんど変わらない」という状態が何年も続く。これを見て「複利のように増えている」と感じる人が多いが、正確には「単利の利息が元金の減りより速いペースで発生し続けている状態」だ。
            </p>
            <p className="text-sm leading-relaxed">
              解決策は元金を速く減らすことに尽きる。月々の返済額を増やすか、繰上返済で元金を減らせば、その日から毎日の利息発生額は下がる。詳しくは「<Link href="/column/shakkin-heranai" className="text-rt-text-secondary underline underline-offset-4 decoration-rt-border-strong hover:text-rt-text-primary">借金が全然減らない理由</Link>」で元金を減らす実践法を整理している。
            </p>
          </section>

          <AffiliateSection
            category="card-loan"
            title="金利の低い商品に借り換えて元金減少を速める"
            leadText="利息の発生スピードを下げることが、元金を速く減らすための基本です。"
            placement="column-fukuri-tanri-chigai-mid"
            motivationText="単利と複利の違いを理解した上で重要なのは、「金利が高いほど毎月の利息が多く、元金の減りが遅くなる」という事実だ。年率18%と10%では100万円あたり年6万円の利息差がある。借入条件が改善できるなら、おまとめローンや低金利商品への借り換えが元金減少を加速させる直接的な手段になる。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">利息制限法と単利の関係</h2>
            <p className="text-sm leading-relaxed mb-3">
              日本の貸金規制で単利が義務付けられている根拠は、利息制限法第5条にある。この条文は「元本に組み入れられた利息は、その後の利息計算の元本に含めてはならない」という趣旨で重利を禁じており、実質的にすべての消費者金融・カードローンに適用される。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              この規制は借り手保護の観点から設けられたものだ。もし複利が認められていれば、返済が滞ったとき（または最低返済額しか払わないとき）に利息が雪だるま式に膨らむ速度がはるかに速くなる。単利規制はこの加速を制限し、借り手が返済の見通しを立てやすくする仕組みだ。
            </p>
            <p className="text-sm leading-relaxed">
              なお、銀行は利息制限法ではなく銀行法の管轄だが、同様に重利は認められていない。銀行カードローンも実務上は単利で計算されている。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">では「複利」が出てくるのはどこか</h2>
            <p className="text-sm leading-relaxed mb-3">
              複利の概念が重要になるのは主に資産形成の文脈だ。投資信託や積立NISA・iDeCoでは、運用益が元本に加算されてさらに運用されるため、長期で保有すると複利効果によって資産が加速度的に増えていく。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              「72の法則」はこの複利効果を直感的に把握するための目安だ。「72÷金利（%）＝元本が2倍になる年数」という計算式で、年率7%なら約10年で2倍、年率4%なら約18年で2倍になる。資産運用の計画を立てるときに便利な目安だ。
            </p>
            <p className="text-sm leading-relaxed">
              逆説的だが、この「72の法則」を借金に当てはめてみると、高金利の恐ろしさが体感できる。年率18%なら72÷18＝4年で「複利なら2倍になるスピード」だ。カードローンは単利なので実際にそうはならないが、高金利の下で最低返済額だけを払い続けた場合のペースを感覚的に掴む参考にはなる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-6">よくある質問</h2>
            <dl className="space-y-5 text-sm">
              {jsonLdFaq.mainEntity.map(({ name, acceptedAnswer }) => (
                <div key={name}>
                  <dt className="font-bold text-rt-text-primary mb-1.5">Q. {name}</dt>
                  <dd className="text-rt-text-tertiary leading-relaxed pl-4 border-l border-rt-border-strong">
                    A. {acceptedAnswer.text}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <AffiliateSection
            category="loan-consolidation"
            title="元金の減りを速めるために、まず金利を下げる"
            leadText="複数社の借入を低金利の1本にまとめると、月々の利息が減り元金が速く減ります。"
            placement="column-fukuri-tanri-chigai-bottom"
            motivationText="「雪だるまの正体」は複利ではなく、高い金利と少ない返済額の組み合わせだ。であれば解決策の一つは金利を下げること。おまとめローンで複数社の借入を低金利の1本にまとめれば、毎月の利息発生額が減り、元金の減りが速くなる。自分の借入状況と条件を見比べて、改善できる余地があるか確認するのが最初のステップになる。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10 border-t border-rt-border pt-8">
            <h2 className="text-lg font-bold text-rt-text-primary mb-4">関連記事</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/column/kinri-keisan" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  金利計算の方法｜年率から1日の利息を出す式と返済シミュレーションの読み方
                </Link>
                <span className="text-rt-text-muted"> — 単利計算の実際の数字を確認する</span>
              </li>
              <li>
                <Link href="/column/shakkin-heranai" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  借金が全然減らない理由｜最低返済額の罠と元金を減らす実践法
                </Link>
                <span className="text-rt-text-muted"> — 雪だるまの正体と元金を速く減らす方法</span>
              </li>
              <li>
                <Link href="/column/kinri-hikaku" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  カードローン金利の仕組みと利息を減らす方法
                </Link>
                <span className="text-rt-text-muted"> — 利息を実際に減らす4つの実務</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-rt-text-primary mb-3">単利の利息が今どれだけ積み上がっているか確認する</h2>
            <p className="text-sm leading-relaxed mb-4 text-rt-text-tertiary">
              元金と金利を入力すると、単利計算で今この瞬間に積み上がっている利息を秒単位で表示できる。「1日でいくら増えているか」を数字で見ると、返済の優先度が判断しやすくなる。
            </p>
            <Link
              href="/"
              className="inline-block bg-rt-accent-cta hover:bg-rt-accent-cta-hover text-white font-bold text-sm py-2.5 px-5 rounded-lg transition-colors"
            >
              利息タイマーを使ってみる →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
