import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';
import { getExperimentContext } from '@/lib/experiment-context';

const TITLE = '借金が全然減らない理由｜最低返済額の罠と元金を着実に減らす実践法';
const DESCRIPTION =
  '毎月返済しているのに元金が減らない仕組みを解説。リボ払い・カードローンの最低返済額の設定、完済まで何年かかるかの計算、元金を速く減らす3つの実践と、おまとめ・債務整理という選択肢を整理します。';
const URL = 'https://rate-time.com/column/shakkin-heranai';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['借金 減らない', '最低返済額 仕組み', 'リボ払い 元金', '繰上返済 効果', '借金 完済', 'カードローン 元金 減らない'],
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
  datePublished: '2026-04-22',
  dateModified: '2026-04-22',
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
      name: '最低返済額だけ払い続けると完済まで何年かかりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '残高スライド型（残高の1%＋利息）で残高50万円・年率18%の場合、最低返済額のみの返済では完済まで15年以上かかることがあります（概算）。これは元金の減りが月数千円程度にとどまり、利息分が返済の大部分を占め続けるためです。月々の返済額を増やすほど完済は速まり、総利息も大きく減ります。',
      },
    },
    {
      '@type': 'Question',
      name: '繰上返済はどのタイミングで行うのが効果的ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '繰上返済は早いほど効果が大きいです。利息は残高に対して日割りで発生するため、元金を早く減らすほど「利息が発生しなくなる期間」が長くなります。ボーナスや臨時収入が入ったタイミングが特に有効です。借入先によっては電話・アプリ・ATMで随時追加返済できる場合があります。少額でも早期の繰上返済は効果的です。',
      },
    },
    {
      '@type': 'Question',
      name: 'リボ払いと元利均等返済は何が違いますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'リボ払い（残高スライド型）は残高に応じて最低返済額が変動するため、残高が減るにつれ返済額も下がります。元利均等返済は毎月の返済額を固定するため、返済が進むにつれ元金の減りが加速します。リボ払いは月々の負担が軽く見えますが、最低返済額だけ払い続けると完済が大幅に遅れます。',
      },
    },
    {
      '@type': 'Question',
      name: '借金が全然減らない場合、まず何をすべきですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'まず「現在の借入残高・金利・毎月の返済額」を整理し、このペースで完済まで何年かかるかを試算することです。利息タイマーや金融庁の返済シミュレーターで確認できます。完済まで10年以上かかるようなら、返済額を増やす・おまとめで金利を下げる・債務整理を検討する、という優先順位で改善策を検討することをおすすめします。個別状況により最適解は異なります。',
      },
    },
    {
      '@type': 'Question',
      name: 'おまとめローンと債務整理のどちらが向いていますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '現在延滞がなく毎月の返済は続けられているなら、まずおまとめローンで金利を下げる選択肢が検討できます。すでに延滞が始まっている・収入に対して借入が大きすぎる・複数社からの借入で返済に行き詰まっている、という状況では債務整理（任意整理・個人再生）が現実的になります。どちらが適しているかは借入総額・収入・延滞の有無によって異なるため、法律事務所の無料相談で確認するのが確実です。',
      },
    },
  ],
};

export default async function ShakkinHeranaiPage() {
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
            借金が全然減らない理由｜最低返済額の罠と元金を着実に減らす実践法
          </h1>
          <p className="text-xs text-rt-text-muted mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-22
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              2年前に借りた50万円、毎月2万円以上返しているのに残高が30万円台から動かない。明細を見ると「利息：7,400円」「元金充当：12,600円」と書いてある。2万円返して元金が1.2万円しか減っていない——そういう状況に気づいて「なぜこんなに遅いのか」と検索している人は多い。
            </p>
            <p className="text-sm leading-relaxed">
              結論から言えば、カードローンの最低返済額は「利息をほぼ全額払って元金をわずかに減らす」ように設計されていることが多い。この仕組みを理解せずに最低返済額だけを払い続けると、完済まで何年もかかることになる。以下では最低返済額の構造、あと何年かかるかの計算、そして元金を速く減らすための実践を整理していく。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">毎月返しているのに元金が減らない仕組み</h2>
            <p className="text-sm leading-relaxed mb-3">
              カードローンの1回の返済は、まず発生した利息に充当され、残った分が元金の返済に回る。利息を先に払う仕組みだ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              100万円を年率18%で借りている場合、1ヶ月の利息は約14,795円になる。月々2万円を返済していれば、元金の減りは 20,000 − 14,795 ＝ 5,205円だ。2万円返しても、元金は5,000円しか減らない計算になる。
            </p>
            <p className="text-sm leading-relaxed">
              この構造が「返済しているのに残高が減らない感覚」の原因だ。高い金利では毎月の利息発生額も大きく、返済の多くが利息に消えていく。<Link href="/column/kinri-keisan" className="text-rt-text-secondary underline underline-offset-4 decoration-rt-border-strong hover:text-rt-text-primary">金利計算の方法</Link>で1日あたりの利息を計算すると、数字の重さが実感できる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">最低返済額はどう設定されているか</h2>
            <p className="text-sm leading-relaxed mb-3">
              カードローンの最低返済額の設定方式として代表的なのが「残高スライド型」だ。残高の大きさに応じて最低返済額が決まり、残高が減るにつれ最低返済額も下がっていく。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              たとえば「残高の1%＋利息分」を最低返済額とする設定では、残高100万円・年率18%の場合の最低返済額は 10,000（元金1%）＋ 14,795（利息）＝ 約24,795円になる。ここで支払われる元金は1万円にとどまる。翌月の残高は99万円になり、利息は約14,647円とわずかしか下がらない。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              リボ払いも同じ構造だ。クレジットカードのリボ払いは「毎月一定額を払う」か「残高の一定割合を払う」かの設定が多く、どちらも利息が大きな割合を占め続ける。残高が減りにくいまま何年も経過し、「いつまで経っても終わらない」という状態になりやすい。
            </p>
            <p className="text-sm leading-relaxed">
              月々の最低返済額を超えた金額を返済することは多くの場合いつでも可能だ。「最低返済額だけ払えばOK」ではなく「最低返済額は下限」と理解しておくことが重要だ。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">「あと何年かかるか」を計算してみる</h2>
            <p className="text-sm leading-relaxed mb-3">
              現在のペースで完済まで何年かかるかを把握することが、返済計画を立て直す最初のステップだ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              残高50万円・年率18%のケースで、月々の返済額別に完済期間と総利息を試算すると次のようになる（概算）。
            </p>
            <div className="bg-rt-card border border-rt-border rounded-xl p-4 mb-4 overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-rt-text-primary border-b border-rt-border">
                    <th className="text-left py-1 pr-4">月々の返済額</th>
                    <th className="text-right py-1 pr-4">完済期間</th>
                    <th className="text-right py-1">総利息（概算）</th>
                  </tr>
                </thead>
                <tbody className="text-rt-text-tertiary">
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">1万円（最低水準）</td>
                    <td className="text-right py-1 pr-4">完済不可に近い</td>
                    <td className="text-right py-1">——</td>
                  </tr>
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">1.5万円</td>
                    <td className="text-right py-1 pr-4">約55ヶ月</td>
                    <td className="text-right py-1">約33万円</td>
                  </tr>
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">2万円</td>
                    <td className="text-right py-1 pr-4">約31ヶ月</td>
                    <td className="text-right py-1">約16万円</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">3万円</td>
                    <td className="text-right py-1 pr-4">約19ヶ月</td>
                    <td className="text-right py-1">約9万円</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed">
              月1万円の返済では利息分が月7,397円発生するため、元金の減りは2,603円しかない。残高スライドで最低返済額が下がっていくと、途中で「利息 ≒ 返済額」の状態になり、実質的に完済できなくなるケースもある。月1.5万円でも55ヶ月・33万円の総利息がかかる。2万円では31ヶ月・16万円——返済額を月5,000円増やすだけで、総利息が17万円減る計算だ。
            </p>
          </section>

          <AffiliateSection
            category="loan-consolidation"
            title="複数の借入をまとめて金利を下げ、元金を速く減らす"
            leadText="金利が下がると毎月の利息が減り、返済額のうち元金に充当される割合が増えます。"
            placement="column-shakkin-heranai-mid"
            motivationText="元金の減りが遅い最大の原因は「金利が高いため、毎月の返済の多くが利息に消えていく」ことだ。おまとめローンで複数社の借入を低金利の1本にまとめれば、毎月の利息発生額が減り、同じ返済額でも元金が速く減る。年率18%帯から10%帯への移行は、50万円の残高で年利息が約4万円減る計算だ。延滞がなく審査に通る状況なら、まず条件を確認してみる価値はある。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">元金を減らすための3つの実践</h2>
            <p className="text-sm leading-relaxed mb-3">
              元金の減りを速めるための方法は「元金が減るペースを上げる」か「利息の発生を止める」かのどちらかに集約される。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              <strong className="text-rt-text-primary">1. 月々の返済額を増やす</strong> — 最も確実な方法だ。最低返済額を「下限」として認識し、余力のある月は上積みして返済する。カードローンやリボ払いは任意の金額を追加返済できることが多い。月々5,000〜1万円の上積みでも、前述の通り総利息と完済期間が大きく変わる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              <strong className="text-rt-text-primary">2. 繰上返済を積み上げる</strong> — ボーナスや臨時収入が入ったタイミングで、まとめて元金を返済する。利息は残高に対して日割りで発生するため、元金を減らした瞬間から毎日の利息が減る。1年後より今返すほうが、「利息を払わずに済む期間」が1年長くなる計算だ。
            </p>
            <p className="text-sm leading-relaxed">
              <strong className="text-rt-text-primary">3. 金利の低い商品に借り換える</strong> — 複数社から年18%前後で借りているなら、銀行系おまとめローンや低金利カードローンへの借り換えで実効金利を下げられる余地がある。金利差は直接「毎月の利息発生額の差」に現れるため、借入が100万円以上ある規模では検討する価値が高い。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">それでも返済できないなら：おまとめ・債務整理という選択肢</h2>
            <p className="text-sm leading-relaxed mb-3">
              返済額を増やしたくても収入の余裕がない、または借入が収入に対して大きすぎる——そういう場合は、利息を減らす工夫より「借入構造そのものを変える」ほうが現実的なことがある。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              現在延滞がなく毎月の返済は続けられているなら、まずおまとめローンで金利と1本化を試みる価値がある。<Link href="/column/omatome-loan" className="text-rt-text-secondary underline underline-offset-4 decoration-rt-border-strong hover:text-rt-text-primary">おまとめローンの仕組みとメリット・デメリット</Link>で詳しく解説しているが、金利が下がれば毎月の元金充当分が増え、完済期間が縮む。
            </p>
            <p className="text-sm leading-relaxed">
              すでに延滞が始まっている・収入から見て返済が追いつかない・複数社の借入が収入の3分の1を超えている、という状況では、任意整理で将来利息をカットして元金だけ3〜5年で返す選択肢がある。借入総額が大きければ個人再生で元金を大幅に圧縮することも可能だ。<Link href="/column/saimu-seiri" className="text-rt-text-secondary underline underline-offset-4 decoration-rt-border-strong hover:text-rt-text-primary">債務整理とは？</Link>でそれぞれの手続きを整理している。どの手段が適しているかは個別の状況によるため、専門家への相談で確認するのが確実だ。
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
            category="debt-consolidation"
            title="返済に行き詰まっているなら、無料相談で選択肢を確認する"
            leadText="借入総額と返済状況を伝えるだけで、おまとめ・任意整理どちらが適しているかの目安が得られます。"
            placement="column-shakkin-heranai-bottom"
            motivationText="毎月返しているのに元金が減らない状態が続いているなら、返済ペースの問題だけでなく、金利や借入構造そのものを見直す段階かもしれない。法律事務所の初回相談は無料のケースが多く、借入総額と収入状況を伝えれば、おまとめで解決できるか・任意整理のほうが合理的かの目安をその場で聞ける。一人で抱えたまま利息を払い続けるより、選択肢を確認するほうが早い。"
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
                <span className="text-rt-text-muted"> — 完済まで何年かかるかを自分で計算する</span>
              </li>
              <li>
                <Link href="/column/omatome-loan" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  おまとめローンの仕組みとメリット・デメリット
                </Link>
                <span className="text-rt-text-muted"> — 複数社の借入を低金利の1本にまとめる</span>
              </li>
              <li>
                <Link href="/column/saimu-seiri" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  債務整理とは？種類・費用・デメリットを解説
                </Link>
                <span className="text-rt-text-muted"> — 利息をゼロにして元金だけ返す手続き</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-rt-text-primary mb-3">今この瞬間も増え続けている利息を見る</h2>
            <p className="text-sm leading-relaxed mb-4 text-rt-text-tertiary">
              元金と金利を入力すると、今この瞬間に積み上がっている利息を秒単位で表示できる。「1日でいくら増えているか」を数字で見ると、返済の優先度が判断しやすくなる。
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
