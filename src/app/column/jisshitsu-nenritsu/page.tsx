import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';
import { getExperimentContext } from '@/lib/experiment-context';

const TITLE = '実質年率とは何か｜名目金利との違いと金融商品を正しく比較する方法';
const DESCRIPTION =
  '実質年率（APR）と名目金利の違い、貸金業法の広告義務、カードローンで両者が一致する理由を解説。APR・APYの使い分けや、実質年率が低くても注意すべきケースも整理します。';
const URL = 'https://rate-time.com/column/jisshitsu-nenritsu';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['実質年率 とは', '名目金利 違い', 'APR とは', '貸金業法 広告', '金利 比較', '実質年率 名目金利'],
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
  datePublished: '2026-04-15',
  dateModified: '2026-04-15',
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
      name: '実質年率と名目金利はどちらが実際の負担を表しますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '実質年率のほうが実際の負担に近い数値です。名目金利は純粋な利息のみを指すのに対し、実質年率は事務手数料・保証料などの諸費用を年利換算して含んでいます。貸金業法では広告表示に実質年率の明示が義務付けられており、商品比較は実質年率同士で行うのが正確です。',
      },
    },
    {
      '@type': 'Question',
      name: 'カードローンの広告にある「年3.0%〜18.0%」は実質年率ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、貸金業法により金利の広告表示は実質年率で行うことが義務付けられているため、カードローン広告の「年○%〜△%」は実質年率の表示です。ただし「3.0%〜」の下限は高限度額ユーザー向けであることが多く、一般的な借入では上限金利に近い水準が適用されます。',
      },
    },
    {
      '@type': 'Question',
      name: 'APRとAPYはどう違いますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'APR（Annual Percentage Rate）は実質年率に相当し、借入コストを年換算した数値です。APY（Annual Percentage Yield）は複利効果を加味した実質的な年利回りで、主に預金や投資商品で使われます。借入商品（カードローン・ローン）はAPR、貯蓄・投資商品はAPYで比較するのが適切です。日本のカードローン広告では「実質年率（＝APRに相当）」が使われています。',
      },
    },
    {
      '@type': 'Question',
      name: 'カードローンで実質年率と名目金利が同じになるのはなぜですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'カードローンの場合、事務手数料や保証料が商品設計に別途含まれないことが多いため、諸費用分の加算がなく、結果として名目金利と実質年率が一致するケースが大半です。ただし一部の商品では保証料が別に設定されていることもあるため、契約時に確認することをおすすめします。',
      },
    },
    {
      '@type': 'Question',
      name: '実質年率が低い商品が必ずしも有利とは限らないのはなぜですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '返済期間の設定によって総利息は大きく変わるためです。実質年率が低くても、返済期間を長くとれば総支払額は増えます。また、繰上返済に違約金が発生する商品や、残高スライド型で最低返済額が低すぎる商品は、元金の減りが遅くなる点に注意が必要です。実質年率と合わせて返済期間・総返済額・繰上返済の条件を確認するのが正確な比較になります。',
      },
    },
  ],
};

export default async function JisshitsuNenritsuPage() {
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
            実質年率とは何か｜名目金利との違いと金融商品を正しく比較する方法
          </h1>
          <p className="text-xs text-rt-text-muted mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-15
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              カードローンの広告には「実質年率 3.0%〜18.0%」のような表記が並んでいる。その下には「ご利用限度額や審査結果によって異なります」という注記があって、結局自分は何%で借りているのかわかりにくい。そもそも「実質年率」というのは何を意味するのか、「金利」と何が違うのか——金融商品を比べようとすると、この疑問にぶつかることが多い。
            </p>
            <p className="text-sm leading-relaxed">
              以下では、実質年率と名目金利の違い、貸金業法が定める広告義務の背景、カードローンで両者がほぼ一致する理由、そして実質年率が低くても注意が必要なケースを整理していく。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">「実質年率」が広告に使われる理由</h2>
            <p className="text-sm leading-relaxed mb-3">
              貸金業法第12条の8は、貸金業者が広告で金利を表示する際、実質年率で示すことを義務付けている。この規定は2010年の改正貸金業法で整備されたもので、消費者が異なる金融商品を横並びで比較できるようにすることが目的だ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              改正以前は、名目の金利だけを大きく表示して手数料・保証料を別枠で示す商品も存在し、実際の負担が見えにくかった。実質年率の表示義務化によって、消費者は「この商品を利用すると年率で見て何%分のコストがかかるか」を統一した基準で比べられるようになった。
            </p>
            <p className="text-sm leading-relaxed">
              銀行は貸金業法ではなく銀行法の規制下にあるため、厳密には実質年率の表示義務が異なるが、実務上は同様の形式で表示していることが多い。消費者側としては、カードローン・消費者金融・銀行ローンを比べる際に「実質年率同士で比較する」という習慣を持つのが確実だ。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">名目金利（表面金利）との違い</h2>
            <p className="text-sm leading-relaxed mb-3">
              名目金利とは、借入元本に対してかかる純粋な利息の割合のことだ。「年利15%」と言えば、100万円に対して1年分の利息は15万円、という計算になる。これは諸費用を一切含んでいない「利息だけ」の数字だ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              実質年率（APR：Annual Percentage Rate）は、名目金利に加えて、借入に伴う事務手数料・保証料・その他諸費用を年利換算して含めた数値だ。たとえば名目金利10%の商品に1%分の事務手数料が加わると、実質年率はおおよそ11%になる。
            </p>
            <p className="text-sm leading-relaxed">
              日常の金利比較で使うべきは実質年率の方だ。名目金利だけを並べると手数料の差が見えなくなり、実際のコスト比較として不正確になる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">カードローンで実質年率と名目金利が同じになる理由</h2>
            <p className="text-sm leading-relaxed mb-3">
              多くのカードローンでは、実質年率と名目金利の数字が一致している。なぜかというと、カードローンには事務手数料や保証料が商品設計に別途含まれていないケースが大半だからだ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              不動産担保ローンや事業性融資では、保証会社への保証料・火災保険料・登記費用などが借入に付随して発生し、これらを加算すると実質年率は名目金利を大幅に上回ることがある。一方カードローンは無担保・無保証人が前提で、諸費用の乗せ方が異なる。
            </p>
            <p className="text-sm leading-relaxed">
              ただし一部の商品では保証料を別徴収しているケースもあるため、契約書の「実質年率」欄の数字を名目金利と照らし合わせておくことが重要だ。両者がずれていれば、何らかの諸費用が加算されているサインになる。
            </p>
          </section>

          <AffiliateSection
            category="card-loan"
            title="実質年率の低い商品を比較する"
            leadText="金利帯・審査スピード・無利息期間など実務的な条件で比較できる商品をまとめています。"
            placement="column-jisshitsu-nenritsu-mid"
            motivationText="実質年率の違いは「毎月の利息がいくら違うか」という計算で実感しやすい。年率18%と12%では100万円あたり年6万円の差になる。複数の候補を実質年率で並べて比較した上で申し込みに進むのが、総支払額を抑える基本的な手順だ。比較自体は信用情報に影響しないため、まず条件を確認するところから始められる。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">APR・APY——用語の整理</h2>
            <p className="text-sm leading-relaxed mb-3">
              英語の金融用語として APR（Annual Percentage Rate）と APY（Annual Percentage Yield）が出てくることがある。日本のカードローンで使われる「実質年率」は APR に相当する。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              APRは借入コストを年換算した数値で、複利効果は加味しない。一方 APY は複利計算を含んだ実質的な年利回りで、主に預金や投資商品で「元本に利息が加わり、その合計にさらに利息がつく」効果を表すために使われる。
            </p>
            <p className="text-sm leading-relaxed">
              使い分けの目安として、借入商品（カードローン・ローン・クレジット）は APR＝実質年率で比較し、貯蓄・投資商品は APY で比較する、という整理が実務的だ。カードローンを選ぶときに APY の数字が出てきたら、それは預金側の話であり借入コストとは別物だと認識しておくとよい。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">実質年率が低くても注意すべきケース</h2>
            <p className="text-sm leading-relaxed mb-3">
              実質年率は金融商品を比較する上で重要な指標だが、それだけを見て判断すると見落としが生まれることがある。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              1つ目は「返済期間の設定」による落とし穴だ。実質年率が低くても、返済期間を長くとれば総支払額は増える。月々の返済額が小さく見えても、10年かけて返す設定では総利息が膨らむ。実質年率と合わせて「総返済額」を必ず確認することが重要だ。<Link href="/column/kinri-keisan" className="text-rt-text-secondary underline underline-offset-4 decoration-rt-border-strong hover:text-rt-text-primary">金利計算の方法</Link>で具体的な試算を確認できる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              2つ目は「繰上返済の条件」だ。実質年率が低い商品でも、繰上返済に手数料や違約金が設定されている場合、余剰資金で早期完済しようとするとコストがかかる。残高が多いうちに大きく繰上返済したいと考えているなら、繰上返済の条件も事前に確認しておくべきだ。
            </p>
            <p className="text-sm leading-relaxed">
              3つ目は「適用金利の範囲」だ。「年3%〜18%」のような幅のある表示では、自分の借入に実際に何%が適用されるかが申し込みの結果まで分からない。一般的に、借入限度額が高くなるほど低い金利が適用されやすく、少額の借入では上限に近い金利が適用されることが多い。申し込み前に「自分は何%になるか」の目安を確認する手段として、仮審査や事前照会を活用するとよい。
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
            title="高い実質年率の借入を、まとめて低い金利に切り替える"
            leadText="複数社の借入を低金利の1本に統合すると、実質年率の差が総支払額の削減に直結します。"
            placement="column-jisshitsu-nenritsu-bottom"
            motivationText="実質年率の違いが「実際にいくら違うか」を計算式で理解したら、次は自分の借入状況に当てはめてみるのが自然な流れだ。複数社から年18%前後で借りているなら、おまとめローンで年10%前後の1本に切り替えることで、総利息を大幅に削れる可能性がある。まず条件を確認するだけなら信用情報への影響はない。"
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
                <span className="text-rt-text-muted"> — 実質年率から実際の利息額を計算する</span>
              </li>
              <li>
                <Link href="/column/kinri-hikaku" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  カードローン金利の仕組みと利息を減らす方法
                </Link>
                <span className="text-rt-text-muted"> — カードローンの金利帯と利息を減らす実務</span>
              </li>
              <li>
                <Link href="/column/timer-katsuyou" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  リアルタイム利息を"見る"効果｜利息タイマーの使い方
                </Link>
                <span className="text-rt-text-muted"> — 実質年率の違いを秒単位で体感する</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-rt-text-primary mb-3">実質年率の違いを数字で確認する</h2>
            <p className="text-sm leading-relaxed mb-4 text-rt-text-tertiary">
              元金と実質年率を入力すると、今この瞬間に積み上がっている利息をリアルタイムで表示できる。年率の違いが1日・1ヶ月・1年でどれほど差になるかを実感するのに役立てほしい。
            </p>
            <Link
              href="/"
              className="inline-block bg-rt-accent-cta hover:bg-rt-accent-cta-hover text-white font-bold text-sm py-2.5 px-5 rounded-lg transition-colors"
            >
              利息タイマーで確認する →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
