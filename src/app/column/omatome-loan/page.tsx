import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';
import { getExperimentContext } from '@/lib/experiment-context';

const TITLE = 'おまとめローンの仕組みとメリット・デメリット';
const DESCRIPTION =
  '複数社の借入を1本化するおまとめローンの仕組み、銀行系と消費者金融系の金利差、審査の現実、向かない人の特徴までを実務的に解説。借金の一本化で本当に月々の返済は軽くなるのか。';
const URL = 'https://rate-time.com/column/omatome-loan';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['おまとめローン', '借金 一本化', '金利 下げる', '借り換え', '総量規制'],
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
  author: { '@type': 'Organization', name: '利息タイマー' },
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
      name: 'おまとめローンに総量規制は適用されますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '貸金業法上の「顧客に一方的に有利となる借換え」に該当する商品は、総量規制（年収の3分の1制限）の例外扱いとなります。ただしすべてのおまとめ用商品が例外になるわけではなく、商品ごとに確認が必要です。銀行のおまとめローンは銀行法の商品のため、もともと総量規制の対象外です。',
      },
    },
    {
      '@type': 'Question',
      name: '審査はどれくらいの年収・勤続年数で通りますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '画一的な基準は公開されていませんが、実務上よく言われる目安として、安定した勤続1年以上・年収200万円以上・他社借入件数が少ないほど通りやすい傾向があります。公務員や大企業勤務は相対的に通りやすく、自営業は勤続（開業）年数と確定申告内容が重視されやすい、という構造です。',
      },
    },
    {
      '@type': 'Question',
      name: '延滞履歴があるとおまとめローンは通りませんか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '現在進行形の延滞や、過去数年以内の長期延滞がある場合、新規のローン審査は通りにくくなります。信用情報を改善するには時間がかかるため、既に返済に行き詰まっている状態では、おまとめローンではなく債務整理のほうが現実的な選択肢になることがあります。',
      },
    },
    {
      '@type': 'Question',
      name: '本当に月々の返済は楽になりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '金利が下がる効果で「総返済額」は減る可能性が高い一方、返済期間を長くとる契約にすると「月々の返済額」はかえって小さく見えるだけで総額は増える、というパターンもあります。契約前に、金利・返済期間・総返済額を並べて比較することが重要です。利息タイマーなどで数字を可視化して確認するのが確実です。',
      },
    },
    {
      '@type': 'Question',
      name: 'おまとめローンで解決しない場合は？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '審査に通らない、通っても金利低下効果が薄い、収入に対して借入総額が大きすぎる、といった状況では、任意整理や個人再生といった債務整理で将来利息をカット・元金を圧縮する方が合理的なケースがあります。法律事務所の無料相談で、どちらが適しているかの目安を聞けます。',
      },
    },
  ],
};

export default async function OmatomeLoanPage() {
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
            おまとめローンの仕組みとメリット・デメリット
          </h1>
          <p className="text-xs text-rt-text-muted mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-24
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              A社の返済日が25日、B社が5日、C社が15日、クレカのリボ払いが27日。月に4回ATMに向かい、残高を見ながら次の給料日までの生活費を組み直す。どの借入も年15〜18%前後の金利で、毎月払っている額のかなりの部分が利息に吸われている —
              検索語として「おまとめローン」にたどり着く人の多くは、こういう状況を抱えている。
            </p>
            <p className="text-sm leading-relaxed">
              おまとめローンは、複数社の借入を1本にまとめて借り換える金融商品だ。正しく使えば金利が下がって総返済額が減るが、商品選びや返済期間の設定を間違えると「月々は楽になったのに総額は増えた」という落とし穴もある。以下では仕組みと実務的な効果、向いている人・向いていない人を具体的な数字で見ていく。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">なぜ金利が下がるのか</h2>
            <p className="text-sm leading-relaxed mb-3">
              おまとめローンで金利が下がる理由は、主に2つある。1つ目は、利息制限法の仕組み上、借入総額が大きくなると上限金利が下がることだ。元金10万円未満で年20%、10万〜100万円で年18%、100万円以上で年15%、という段階になっている。たとえば30万円×3社を借りている人が90万円を1本化すると、90万円なので上限金利は18%のままだが、これを大きい元金の1本化（たとえば250万円の借り換え）まで持っていけると、法的な上限金利が15%まで下がる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              2つ目は、1社・1契約になることで信用情報上のリスクが整理され、商品としてより低金利帯の商品を提供できるようになる点だ。複数社からの借入は金融機関から見て「多重債務リスク」が高く映るため、その結果としてそれぞれの金利が高止まりしている。1本化によってこのリスクが解消されれば、より低い金利が提示できる、という構造になる。
            </p>
            <p className="text-sm leading-relaxed">
              商品によって金利帯は大きく異なる。銀行系のおまとめローン（銀行法の商品）は年3〜15%程度、消費者金融系のおまとめ専用商品は年15〜18%が目安になる。借入条件によって実際の適用金利は変わるが、現在年18%で借りている人が銀行系の10%前後で借り換えられれば、金利差は約8ポイントになる。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">実際、どれくらい減るのか</h2>
            <p className="text-sm leading-relaxed mb-3">
              数字で見たほうが早い。カードローン3社から合計150万円を年18%で借りていて、月々の返済が約5万円というケースを考える。この状態を続けると、利息だけで毎月約2.2万円が出ていき、元金の減りは月2.8万円ペース。完済まで約55ヶ月、総支払額は約277万円になる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              これを年10%のおまとめローン150万円・5年返済（元利均等）に切り替えると、月々の返済は約3.2万円、総支払額は約191万円。総額でおおよそ86万円、利息だけで見ると約1万円/月の差が出る計算になる。実際の商品では事務手数料や保証料が乗るため、単純に試算通りにはならないが、金利差が大きい借り換えでは十分に意味のある金額になる。
            </p>
            <p className="text-sm leading-relaxed">
              逆に注意したいのは、返済期間を延ばし過ぎるケースだ。月々の返済を小さく見せるために10年返済にすると、月々は2万円を切って楽に見えるが、総支払額はかえって増える場合がある。契約前に「金利」「返済期間」「総返済額」を必ず並べて比較することが重要だ。
            </p>
          </section>

          <AffiliateSection
            category="loan-consolidation"
            title="金利を下げられるか、まず試算してみる"
            leadText="借入内容を入力するだけで、金利と返済期間から月々と総額の目安を確認できます。"
            placement="column-omatome-loan-mid"
            motivationText="複数社への返済が毎月の生活を圧迫しているなら、まず現在の金利と借換え後の金利の差を数字で見てみるところから始めるのが現実的だ。審査に申し込む前に、借入内容と希望条件を入れるだけで試算できるサービスを使えば、ペースと総額のイメージがつかみやすい。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">銀行系 vs 消費者金融系 — どちらを選ぶべきか</h2>
            <p className="text-sm leading-relaxed mb-3">
              おまとめローンは、銀行が提供するものと、消費者金融が提供する「おまとめ専用商品」の2系統に大きく分かれる。金利と審査基準、そして総量規制との関係で性格が異なる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              銀行系は金利が低い代わりに審査基準が厳しい傾向がある。一般的には年収・勤続年数・既存借入状況・信用情報が総合的に見られ、延滞履歴があると通りにくい。消費者金融系のおまとめ専用商品は金利が高めだが、その分審査の幅が広く、他社借入件数が多い人でも通るケースがある。
            </p>
            <p className="text-sm leading-relaxed">
              総量規制との関係にも違いがある。銀行のおまとめローンは銀行法の商品で、もともと総量規制（貸金業法の年収3分の1制限）の対象外だ。消費者金融のおまとめ専用商品は、貸金業法上の「顧客に一方的に有利となる借換え」に該当する場合に限り例外扱いとなる。このため、年収3分の1を超えるような総借入があっても、商品設計と条件次第でおまとめ申込自体は可能、という仕組みになっている。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">審査で実際に見られる点</h2>
            <p className="text-sm leading-relaxed mb-3">
              各社とも審査基準を公開していないが、信用情報と属性情報から総合的に判断されている。属性情報としてよく重視されるのが、年収・勤続年数・雇用形態・居住形態・他社借入件数と残高だ。実務上の目安として、勤続1年以上・年収200万円以上・他社借入件数が5件未満、あたりが最低ラインとして語られることが多い。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              信用情報では、直近の延滞、債務整理の履歴、短期間に多数の申込（いわゆる「申込ブラック」）が見られる。延滞から時間が経過していれば回復するが、現在進行形の延滞がある状態では、おまとめローンの審査は相当厳しくなる。
            </p>
            <p className="text-sm leading-relaxed">
              複数社に同時期に申し込むのは避けたほうがいい。信用情報には申込履歴も残るため、短期間に多くの申込をすると「資金繰りに詰まっている」と判断されて否決につながりやすい。申込は1〜2社に絞って、結果を見てから次を検討する、という進め方が無難だ。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-rt-text-primary mb-3">おまとめローンが向かない人</h2>
            <p className="text-sm leading-relaxed mb-3">
              すべての多重債務者にとっておまとめローンが最適解というわけではない。向かないケースがいくつかある。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              1つ目は、現在進行形で延滞している、または過去に長期延滞・債務整理の履歴があるケース。審査に通らない可能性が高く、仮に通っても条件が悪くなる。2つ目は、借入総額が収入に対して極端に大きいケース。月々の返済余力が作れないなら、借り換えただけでは根本解決にならない。3つ目は、金利差が小さい借り換え。手数料や保証料を含めると得にならないこともある。
            </p>
            <p className="text-sm leading-relaxed">
              これらのケースでは、おまとめではなく任意整理・個人再生といった債務整理のほうが合理的な選択になることがある。任意整理なら将来の利息をカットして元金を分割返済にでき、金利負担はゼロになる。借入額が大きいなら個人再生で元金そのものを圧縮する道もある。どちらが適しているかは、借入総額・収入・延滞の有無によって変わるため、自己判断より無料相談で確認したほうが早い。
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
            title="借換え条件を確認する"
            leadText="複数社の借入を1本化した場合の金利・月々の返済額・総支払額を比較できます。"
            placement="column-omatome-loan-bottom"
            motivationText="毎月の返済先が複数あって家計が回りにくくなっているなら、まず借換えで金利がどこまで下がるかを確認してみる価値はある。申込前の試算だけなら信用情報には影響しないため、候補を絞る段階でリスクなく情報を集められる。"
            experimentId={experimentId}
            variantId={variantId}
          />

          <section className="mb-10 border-t border-rt-border pt-8">
            <h2 className="text-lg font-bold text-rt-text-primary mb-4">関連記事</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/column/saimu-seiri" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  債務整理とは？種類・費用・デメリットを解説
                </Link>
                <span className="text-rt-text-muted"> — 任意整理・個人再生・自己破産の使い分け</span>
              </li>
              <li>
                <Link href="/column/kinri-hikaku" className="text-rt-text-secondary hover:text-rt-text-primary underline underline-offset-4 decoration-rt-border-strong">
                  カードローン金利の仕組みと利息を減らす方法
                </Link>
                <span className="text-rt-text-muted"> — 利息計算の基本と返済を早めるための実務</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-rt-text-primary mb-3">借換え効果を数字で確認する</h2>
            <p className="text-sm leading-relaxed mb-4 text-rt-text-tertiary">
              現在の金利と借換え後の金利でそれぞれ利息がどう増えるかを並べて見ると、本当に得になるかどうかが一目で分かる。元金・金利・期間を入力するだけでシミュレーションできる。
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
