import HomeClient from './HomeClient';

const jsonLdApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '利息タイマー',
  alternativeName: ['借金時計', '利息時計', '借金タイマー', '利息シミュレーター'],
  description:
    '借金・カードローン・消費者金融・友人間の貸し借りの利息をリアルタイムで計算・可視化する無料の返済管理ツール。借金時計・利息時計・利息シミュレーターとしても利用可能。',
  url: 'https://rate-time.com',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  inLanguage: 'ja',
  featureList: [
    'リアルタイム利息計算',
    '単利・複利対応',
    '年利・月利・日利対応',
    'URL共有機能',
    '返済履歴管理',
  ],
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '利息タイマーは無料ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、完全無料でご利用いただけます。登録・ログインも不要です。',
      },
    },
    {
      '@type': 'Question',
      name: 'カードローンの利息計算に使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい。年利を入力し利息タイプを「複利」に設定することで、一般的なカードローン・消費者金融の利息をシミュレーションできます。',
      },
    },
    {
      '@type': 'Question',
      name: '複数の借金をまとめて管理できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '1つのタイマーに複数の元金を追加できます。カードローン・フリーローン・友人への借金など、種類ごとに項目を分けて一括管理が可能です。',
      },
    },
    {
      '@type': 'Question',
      name: '生成したURLは誰でも閲覧できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'URLを知っている人だけが閲覧できます。URLは十分にランダムな文字列で生成されるため、第三者が推測してアクセスすることはできません。',
      },
    },
    {
      '@type': 'Question',
      name: '「借金時計」「利息時計」「借金タイマー」としても使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい。利息タイマーは「借金時計」「利息時計」「借金タイマー」とも呼ばれる同種のツールです。借金が秒単位でリアルタイムに増える様子を時計のように可視化します。',
      },
    },
    {
      '@type': 'Question',
      name: '利息シミュレーターとして将来の利息を計算できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい。利息シミュレーターとして、開始日・元金・金利を設定することで将来の利息額を事前に確認できます。返済計画を立てるのに役立ちます。',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <main>
        <HomeClient />

        {/* SEO コンテンツセクション */}
        <article className="max-w-2xl mx-auto px-4 pb-24 text-zinc-400">
          <section className="border-t border-zinc-800 pt-12 mb-12">
            <h2 className="text-xl font-bold text-zinc-200 mb-4">利息タイマーとは？</h2>
            <p className="text-sm leading-relaxed mb-3">
              利息タイマーは、<strong className="text-zinc-300">借金・カードローン・消費者金融・友人間の貸し借り</strong>
              などの利息をリアルタイムで計算・可視化する無料のWebツールです。
              「<strong className="text-zinc-300">借金タイマー</strong>」「<strong className="text-zinc-300">利息時計</strong>」「<strong className="text-zinc-300">借金時計</strong>」とも呼ばれており、
              元金と金利を入力するだけで、今この瞬間に積み上がっている利息を秒単位で確認できます。
            </p>
            <p className="text-sm leading-relaxed">
              生成されたURLを返済相手と共有することで、返済の動機づけや状況の透明化に役立てられます。
              年利・月利・日利、単利・複利に対応しており、あらゆる借金の利息計算に対応しています。
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-zinc-200 mb-4">使い方</h2>
            <ol className="text-sm space-y-4 list-none">
              {(
                [
                  ['元金を入力', '借入金額を円単位で入力します。複数の借金がある場合は「元金を追加」で項目を増やせます。'],
                  ['金利を設定', '年利・月利・日利のいずれかで金利を入力します。消費者金融は年利15〜18%が一般的です。'],
                  ['利息タイプを選択', '単利（元金のみに利息がつく）か複利（利息にも利息がつく）を選びます。カードローンは多くが複利です。'],
                  ['タイマーを生成・共有', 'ボタンを押すとURLが発行されます。このURLを共有することでリアルタイムの利息を双方で確認できます。'],
                ] as [string, string][]
              ).map(([title, desc], i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/60 border border-red-800 text-xs flex items-center justify-center text-red-400 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-zinc-300">{title}</strong>
                    <span className="text-zinc-500"> — {desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-zinc-200 mb-4">利息シミュレーター・借金時計として使う</h2>
            <p className="text-sm leading-relaxed mb-3">
              利息タイマーは<strong className="text-zinc-300">利息シミュレーター</strong>としても利用できます。
              開始日・元金・金利を入力することで、将来の利息がどのように増加するかを事前にシミュレーションし、
              返済計画を立てるのに役立てられます。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              また、<strong className="text-zinc-300">借金時計</strong>・<strong className="text-zinc-300">利息時計</strong>として、
              リアルタイムで増え続ける利息を視覚的に確認できます。返済が遅れるほど利息が積み上がる現実を
              数値と時間の経過で体感できるため、早期返済の強い動機づけになります。
            </p>
            <p className="text-sm leading-relaxed">
              友人・家族への貸し借りでも使える<strong className="text-zinc-300">借金タイマー</strong>として、
              URLを共有するだけで双方がリアルタイムの返済額を確認できます。
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-zinc-200 mb-4">単利と複利の違い</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="font-bold text-zinc-200 mb-2">単利</h3>
                <p className="text-zinc-500 leading-relaxed">
                  元金に対してのみ利息が発生します。100万円を年利10%で借りた場合、毎年10万円の利息が一定で発生します。
                  計算がシンプルで、短期の貸し借りや一部のフリーローンで使われます。
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="font-bold text-zinc-200 mb-2">複利</h3>
                <p className="text-zinc-500 leading-relaxed">
                  元金と発生した利息の合計に対して利息が発生します。長期になるほど利息が雪だるま式に膨らみます。
                  カードローン・消費者金融は多くが複利計算です。
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-zinc-200 mb-4">対応している金利タイプ</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {(
                [
                  ['年利', '1年間に発生する利息の割合。銀行ローン・消費者金融・カードローンはほぼすべて年利表示です。'],
                  ['月利', '1ヶ月ごとに発生する利息の割合。友人間の貸し借りや一部の短期ローンで使われます。'],
                  ['日利', '1日ごとに発生する利息の割合。超短期の借入や一部の商品で使われます。'],
                ] as [string, string][]
              ).map(([term, def]) => (
                <div key={term} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <dt className="font-bold text-zinc-200 mb-1">{term}</dt>
                  <dd className="text-zinc-500 leading-relaxed">{def}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-200 mb-6">よくある質問</h2>
            <dl className="space-y-6 text-sm">
              {jsonLdFaq.mainEntity.map(({ name, acceptedAnswer }) => (
                <div key={name}>
                  <dt className="font-bold text-zinc-300 mb-1">Q. {name}</dt>
                  <dd className="text-zinc-500 leading-relaxed pl-4 border-l border-zinc-700">
                    A. {acceptedAnswer.text}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </article>
      </main>
    </>
  );
}
