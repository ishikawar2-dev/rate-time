import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';
import { getExperimentContext } from '@/lib/experiment-context';

const TITLE = '金利計算の方法｜年率から1日の利息を出す式と返済シミュレーションの読み方';
const DESCRIPTION =
  'カードローンの年率から1日あたりの利息を計算する式、元利均等返済の仕組み、返済シミュレーションの読み方を具体的な数字で解説。月々の返済額を1万円増やすと総額がどう変わるかも検証します。';
const URL = 'https://rate-time.com/column/kinri-keisan';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['金利 計算', '利息 計算式', '年率 日割り', '返済シミュレーション', '元利均等返済', '総返済額'],
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
  datePublished: '2026-04-10',
  dateModified: '2026-04-10',
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
      name: '日割り計算と月割り計算はどちらが使われますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '消費者金融・銀行カードローンのほとんどは日割り計算（年利÷365×経過日数）を採用しています。月割り（年利÷12）を使う商品もゼロではありませんが、現在のカードローンは日割りが主流です。契約書や各社アプリの「契約内容」画面で確認できます。',
      },
    },
    {
      '@type': 'Question',
      name: '元利均等返済と元金均等返済はどう違いますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '元利均等返済は毎月の返済総額（元金＋利息）が一定になる方式です。序盤は利息の割合が高く、返済が進むにつれ元金の減りが加速します。元金均等返済は毎月返済する元金額が固定されるため、残高が減るにつれ返済額も軽くなります。カードローンは元利均等または残高スライド型が一般的です。',
      },
    },
    {
      '@type': 'Question',
      name: '返済シミュレーションと実際の返済額が違うのはなぜですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'シミュレーションは「今日から返済を開始した場合」の概算です。実際には借入日から初回引落日までの日数分の利息が加算され、端数処理も商品ごとに異なります。途中で繰上返済や追加借入があれば数字も変わります。あくまで返済計画の目安として使い、実際の金額は各社の明細やアプリで確認してください。',
      },
    },
    {
      '@type': 'Question',
      name: '繰上返済で利息はどれくらい減りますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '元金100万円・年率15%を3年返済中に、1年後の時点で50万円を繰上返済すると、残り2年の利息が概算で約9万円減ります。繰上返済は元金を直接減らすため、その日から毎日の利息発生額が下がります。元金が多いうちほど効果が大きく、早い段階での繰上返済が有利です。',
      },
    },
    {
      '@type': 'Question',
      name: '自分で計算した利息と明細の金額が合わない場合はどうすればよいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '多くの場合、前回返済日から今回返済日までの日数の差や端数処理の違いが原因です。うるう年（366日）を使う商品もあります。「残高×年率÷365×日数」の日数部分を実際のカレンダーで数え直すと一致することが多いです。大きなずれが続く場合は、カード会社・消費者金融の窓口に明細の内訳を確認してください。',
      },
    },
  ],
};

export default async function KinriKeisanPage() {
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
            金利計算の方法｜年率から1日の利息を出す式と返済シミュレーションの読み方
          </h1>
          <p className="text-xs text-rt-text-muted mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-10
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              「年率15%と18%って、実際いくら違うんだろう」——そう思いながらも計算の仕方がわからないまま、なんとなく借り続けている。毎月返済しているのに残高がほとんど変わらないのはなぜか、繰上返済をするといくら得になるのか、返済シミュレーションの数字が何を意味しているのか。金利の計算式を一度理解すれば、これらの疑問はすべて自分で答えが出せるようになる。
            </p>
            <p className="text-sm leading-relaxed">
              以下では、カードローンの利息計算に必要な基本式、元利均等返済の仕組み、返済シミュレーションの読み方、そして月々の返済額を増やした場合の効果を、具体的な数字で整理していく。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">年率から1日あたりの利息を計算する</h2>
            <p className="text-sm leading-relaxed mb-3">
              カードローンの利息は、ほとんどの場合「日割り計算」で発生する。式はシンプルだ。
            </p>
            <div className="bg-rt-card border border-rt-border rounded-xl p-4 mb-4">
              <p className="text-sm text-rt-text-secondary font-mono">
                1日あたりの利息 ＝ 借入残高 × 年率 ÷ 365
              </p>
            </div>
            <p className="text-sm leading-relaxed mb-3">
              年率15%で100万円借りている場合、1日の利息は 1,000,000 × 0.15 ÷ 365 ≒ 411円。これが毎日積み上がり、返済日に「今日まで積み上がった利息＋元金の一部」がまとめて引き落とされる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              年率18%の場合は 1,000,000 × 0.18 ÷ 365 ≒ 493円/日。年率15%との差は1日あたり約82円で、1ヶ月なら約2,460円、1年では約3万円の差になる。「3%の差」は少なく聞こえるが、100万円規模の借入が3年続けば約9万円の差になる。
            </p>
            <p className="text-sm leading-relaxed">
              なお、うるう年は366日で計算する商品もある。契約書か各社アプリの「契約内容」画面に記載があるので確認しておくと正確な計算ができる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">具体的にいくら？ケース別の計算例</h2>
            <p className="text-sm leading-relaxed mb-3">
              借入残高ごとに、年率15%と18%で1ヶ月（30日）に発生する利息を比較してみる。
            </p>
            <div className="bg-rt-card border border-rt-border rounded-xl p-4 mb-4 overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-rt-text-primary border-b border-rt-border">
                    <th className="text-left py-1 pr-4">借入残高</th>
                    <th className="text-right py-1 pr-4">年率15%（月）</th>
                    <th className="text-right py-1">年率18%（月）</th>
                  </tr>
                </thead>
                <tbody className="text-rt-text-tertiary">
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">50万円</td>
                    <td className="text-right py-1 pr-4">約6,164円</td>
                    <td className="text-right py-1">約7,397円</td>
                  </tr>
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">100万円</td>
                    <td className="text-right py-1 pr-4">約12,329円</td>
                    <td className="text-right py-1">約14,795円</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">200万円</td>
                    <td className="text-right py-1 pr-4">約24,658円</td>
                    <td className="text-right py-1">約29,589円</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed">
              200万円・年率18%の場合、1ヶ月で約3万円が利息として発生している。月々の返済が5万円なら元金の減りは約2万円——これが「返済しているのに残高が減らない感覚」の正体だ。利息タイマーに元金と金利を入力すると、今この瞬間に積み上がっている利息を秒単位で確認できる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">元利均等返済と元金均等返済の違い</h2>
            <p className="text-sm leading-relaxed mb-3">
              返済方式には大きく「元利均等返済」と「元金均等返済」がある。カードローンで主に使われるのは元利均等返済、または残高スライド型だ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              元利均等返済は、毎月の返済総額（元金＋利息）が一定になる方式。ただし内訳は毎月変化する。借入直後は元金が多く利息の発生額も大きいため、1回の返済に占める利息の割合が高い。返済が進んで元金が減るにつれ、同じ返済額でも元金の減りが加速していく。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              元金均等返済は、毎月返済する「元金分」が一定になる方式だ。序盤の返済額は重くなるが、元金が確実に減っていくため、総支払額は元利均等より少なくなる。住宅ローンや事業性融資で見られることが多く、カードローンではほとんど使われない。
            </p>
            <p className="text-sm leading-relaxed">
              カードローンに多い「残高スライド型」は、残高の大きさに応じて最低返済額が決まる方式だ。残高が減るにつれ最低返済額も下がるため「楽に返せる」ように見えるが、元金の減りが遅く、最低返済額だけを払い続けると完済まで非常に長い年月がかかる。詳しくは「<Link href="/column/shakkin-heranai" className="text-rt-text-secondary underline underline-offset-4 decoration-rt-border-strong hover:text-rt-text-primary">借金が全然減らない理由</Link>」で解説している。
            </p>
          </section>

          <AffiliateSection
            category="card-loan"
            title="金利の低い商品に切り替える"
            leadText="借入金利を数ポイント下げるだけで、総支払額は数万〜数十万円単位で変わります。"
            placement="column-kinri-keisan-mid"
            motivationText="計算式を理解すると「今の金利は高すぎないか」という視点が自然に生まれる。年率18%と10%では、100万円・3年返済で総利息に約17万円以上の差が出る。現在の借入金利を確認した上で、乗り換えの余地があるかを比べてみる価値はある。申し込み前の比較は信用情報に影響しないため、まず候補を絞るところから始められる。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">返済シミュレーションの数字はどう読むか</h2>
            <p className="text-sm leading-relaxed mb-3">
              各社のウェブサイトや金融庁のツールでは、元金・金利・返済期間を入力すると月々の返済額と総利息が計算できる。この数字の正しい読み方には2つのポイントがある。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              1つ目は「総返済額」と「総利息」を必ず確認すること。月々の返済額が小さく見えても、返済期間が長ければ総利息は膨らむ。100万円・年15%で月々2万円返済の場合、完済まで約64ヶ月かかり総利息は約28万円。月々3万円に増やせば約38ヶ月・総利息約15万円——差は約13万円になる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              2つ目は「返済開始日のズレ」を理解すること。シミュレーションは今日から返済を始める理想値で、実際には借入日から初回引落日まで数日〜数十日のズレがある。この期間の利息が最初の返済額に上乗せされるため、1回目だけ返済額が多くなることがある。
            </p>
            <p className="text-sm leading-relaxed">
              残高スライド型の場合、元金が減るにつれ最低返済額も下がる。シミュレーションで「最低返済額だけ払い続けた場合」と「返済額を一定に固定した場合」を比べると、完済までの年数と総利息の差の大きさが実感できる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">月々の返済額を1万円増やすと総額はどう変わるか</h2>
            <p className="text-sm leading-relaxed mb-3">
              元金100万円・年率15%のケースで、月々の返済額を変えた場合の完済期間と総利息を比較する。
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
                    <td className="py-1 pr-4">2万円</td>
                    <td className="text-right py-1 pr-4">約64ヶ月</td>
                    <td className="text-right py-1">約28万円</td>
                  </tr>
                  <tr className="border-b border-rt-border">
                    <td className="py-1 pr-4">3万円</td>
                    <td className="text-right py-1 pr-4">約38ヶ月</td>
                    <td className="text-right py-1">約15万円</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">4万円</td>
                    <td className="text-right py-1 pr-4">約28ヶ月</td>
                    <td className="text-right py-1">約10万円</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed mb-3">
              月々2万円から3万円に1万円増やすだけで、完済は26ヶ月早まり総利息は約13万円減る。毎月の負担は1万円増えるが、2年以上早く終わり利息で13万円の節約になる計算だ。4万円にすれば2万円返済との比較で約36ヶ月短縮・約18万円の節約になる。
            </p>
            <p className="text-sm leading-relaxed">
              ここに繰上返済を組み合わせると効果はさらに大きい。ボーナスや臨時収入のタイミングで10万円を繰上返済すれば、その後毎日発生する利息が年率15%で約41円ずつ減る。繰上返済が早ければ早いほど「利息に払わずに済む期間」が長くなる。利息タイマーで元金の金額を変えながら1日あたりの差を見ると、繰上返済の効果を感覚的につかみやすい。
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
            title="複数の借入があるなら、おまとめで金利をまとめる"
            leadText="複数社の借入を1本化すると、金利差の効果が計算しやすくなり管理もシンプルになります。"
            placement="column-kinri-keisan-bottom"
            motivationText="複数社から借りている場合、それぞれの金利を個別に計算して合計するのは手間がかかる。おまとめローンで1本化すれば「この金利で、あと何ヶ月返せば完済か」という計算が格段に見やすくなる。金利が下がればそのまま総支払額の削減につながるため、複数社への返済が続いている状況なら、おまとめの条件を比べてみる価値はある。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10 border-t border-rt-border pt-8">
            <h2 className="text-lg font-bold text-rt-text-primary mb-4">関連記事</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/column/jisshitsu-nenritsu" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  実質年率とは何か｜名目金利との違いと正しい比較方法
                </Link>
                <span className="text-rt-text-muted"> — 「実質年率3%〜」の表示が何を意味するか</span>
              </li>
              <li>
                <Link href="/column/shakkin-heranai" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  借金が全然減らない理由｜最低返済額の罠と元金を減らす実践法
                </Link>
                <span className="text-rt-text-muted"> — 毎月返しているのに減らない仕組みを解説</span>
              </li>
              <li>
                <Link href="/column/kinri-hikaku" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  カードローン金利の仕組みと利息を減らす方法
                </Link>
                <span className="text-rt-text-muted"> — 金利帯の全体像と利息を減らす4つの実務</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-rt-text-primary mb-3">自分の借入で今日の利息を確認する</h2>
            <p className="text-sm leading-relaxed mb-4 text-rt-text-tertiary">
              元金と金利を入力すると、今この瞬間にも積み上がっている利息を秒単位でリアルタイム表示できる。計算式の理解を実際の数字で確かめるのに使ってみてほしい。
            </p>
            <Link
              href="/"
              className="inline-block bg-rt-accent-cta hover:bg-rt-accent-cta-hover text-white font-bold text-sm py-2.5 px-5 rounded-lg transition-colors"
            >
              利息タイマーで試算する →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
