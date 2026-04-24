import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';

const TITLE = 'カードローン金利の仕組みと利息を減らす方法';
const DESCRIPTION =
  'カードローンの金利帯、実質年率と金利の違い、利息の計算式、単利と複利の違いを具体的な数字で解説。繰上返済・借換え・無利息期間など、利息を実際に減らすための実務を整理します。';
const URL = 'https://rate-time.com/column/kinri-hikaku';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['カードローン 金利', '利息 計算', '金利 高い', '実質年率', '繰上返済'],
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
      name: '金利と実質年率は同じですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '意味が異なります。金利は借入元本にかかる利息の割合のみを指し、実質年率は事務手数料や保証料など諸費用を含めて年利換算した数値です。貸金業法では広告表示で実質年率の明示が義務付けられているため、「3.0%〜18.0%」のような表記は実質年率です。商品比較は実質年率同士で行うのが正確です。',
      },
    },
    {
      '@type': 'Question',
      name: '利息はどのタイミングで計算されますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '多くのカードローンは「日割り」で計算されます。計算式は「借入残高 × 実質年率 ÷ 365 × 経過日数」で、毎日利息が積み上がる仕組みです。このため、給料日前後に繰上返済で元金を減らすと、その後の利息発生額が減ります。',
      },
    },
    {
      '@type': 'Question',
      name: '最低返済額を払っていれば問題ありませんか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '返済遅延にはなりませんが、最低返済額は利息＋わずかな元金で構成されていることが多く、このペースだと元金がほとんど減らず、総支払額が大きく膨らみます。可能な範囲で毎月の返済額を上乗せするか、余裕がある月に繰上返済を組み合わせるのが、利息を抑える上で効果的です。',
      },
    },
    {
      '@type': 'Question',
      name: '無利息期間があれば利息は本当にゼロですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '初回借入から30日・60日といった無利息期間中は利息がゼロ、というのは事実ですが、期間経過後から通常の金利が適用されるため、短期で完済できる見込みがない場合には効果が限定的です。長期借入を前提にするなら、金利そのものが低い商品を選ぶ方が合理的です。',
      },
    },
    {
      '@type': 'Question',
      name: 'どうしても返済が追いつかない場合はどうすればいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '複数社からの借入なら、おまとめローンで金利を下げて1本化する方法があります。収入に対して借入が大きすぎる、延滞が始まっている、という段階では、任意整理や個人再生などの債務整理で将来利息をカット・元金を圧縮するほうが現実的な場合があります。法律事務所の無料相談で、どの手段が適しているかの目安を聞けます。',
      },
    },
  ],
};

export default function KinriHikakuPage() {
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

      <article className="text-zinc-300">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors inline-block mb-6"
          >
            ← 利息タイマーに戻る
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3 leading-tight">
            カードローン金利の仕組みと利息を減らす方法
          </h1>
          <p className="text-xs text-zinc-500 mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-24
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              1年半前に50万円借りた。毎月きちんと返済しているつもりなのに、ネットで残高を見たら45万円。1年半返して、減ったのは5万円だけ。実際の返済額を合計してみたら25万円を超えていて、その大部分がどこに消えたのかがよくわからない —
              カードローンの金利を検索するきっかけは、だいたいこういう気づきから始まる。
            </p>
            <p className="text-sm leading-relaxed">
              カードローンの利息は、元金に対して日割りで発生する。仕組み自体はシンプルだが、金利の表示方法や返済方式の違いによって「実際にいくら払っているのか」が見えにくくなっている。以下では金利と実質年率の違い、日々積み上がる利息の計算式、そして実務で効く利息の減らし方を、具体的な数字で整理していく。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">カードローンの金利は、実際いくらなのか</h2>
            <p className="text-sm leading-relaxed mb-3">
              カードローンの金利帯は、提供元によって幅がある。大手消費者金融は年3〜18%、銀行カードローンは年1〜15%程度が一般的な表示だ。ただし「3%〜」のような下限は、借入限度額が高額のケース（多くは500万円以上）で適用される金利で、一般的な借入（数十万円〜100万円程度）では上限金利に近い水準、つまり年18%前後が適用されることが実際には多い。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              利息制限法の上限は、元金10万円未満で年20%、10万〜100万円で年18%、100万円以上で年15%。大手の消費者金融はこの上限いっぱいで商品を設計している。かつて存在した「グレーゾーン金利」（出資法の上限29.2%と利息制限法の差）は2010年の改正貸金業法で撤廃されているため、現在のカードローンはこの利息制限法の上限を超えた金利では貸せない。
            </p>
            <p className="text-sm leading-relaxed">
              「年3〜18%」という表示に対して、自分が実際に何%で借りているのかは、契約時の書面かアプリの契約内容画面で必ず確認できる。ここを把握していないと、利息がどれくらい発生しているのかを見積もれない。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">金利と「実質年率」は何が違うのか</h2>
            <p className="text-sm leading-relaxed mb-3">
              広告やサイトで見かけるのは「実質年率 3.0%〜18.0%」のような表記だ。貸金業法は広告で金利を表示する際、実質年率で示すことを義務付けている。実質年率には、純粋な利息だけでなく、借入に付随する事務手数料・保証料などの費用が年利換算で含まれる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              現実問題として、カードローンの場合は事務手数料や保証料が商品設計に組み込まれていないことが多いため、表示上の「金利」と「実質年率」が一致するケースがほとんどだ。ただ、不動産担保ローンや事業性の借入など、他の金融商品と比較するときには実質年率同士で比べるのが正確だ、という点は覚えておいて損はない。
            </p>
            <p className="text-sm leading-relaxed">
              もう1点注意したいのが、キャンペーンやポイント還元と金利は別物ということ。「初回ポイント還元」や「来店プレゼント」は金利には影響しない。比較すべきは実質年率と返済条件の2点だ。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">利息はこうやって計算される</h2>
            <p className="text-sm leading-relaxed mb-3">
              カードローンの利息は、多くの場合日割りで計算される。基本の式はシンプルだ。
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-zinc-300 font-mono">
                利息 = 借入残高 × 実質年率 ÷ 365 × 経過日数
              </p>
            </div>
            <p className="text-sm leading-relaxed mb-3">
              たとえば100万円を年15%で借りている場合、1日あたりの利息は 1,000,000 × 0.15 ÷ 365 ≒ 411円。これが毎日発生していく。1ヶ月（30日）放置すれば利息だけで約1.2万円、1年なら約15万円。ここから返済のたびに、まず利息に充当され、余った分が元金の返済に回る、というのが一般的な「元利均等返済」の内部処理だ。
            </p>
            <p className="text-sm leading-relaxed">
              50万円を年18%で借りていた人が月々2万円ずつ返しているとすると、最初の月は利息が約7,500円発生する。つまり2万円の返済のうち、元金の減りは約1.25万円分だけ。「毎月2万円も返しているのに全然減らない」と感じるのは、利息がこのペースで発生しているから、という構造だ。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">単利と複利 — カードローンはどちら？</h2>
            <p className="text-sm leading-relaxed mb-3">
              利息の計算方式には「単利」と「複利」がある。単利は元金に対してのみ利息がつく方式で、100万円を年10%の単利で5年借りると、利息は毎年10万円で一定、5年で50万円。計算がシンプルで、主に住宅ローンや一部のフリーローンで使われる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              複利は、発生した利息にも次期の利息がつく方式だ。100万円を年10%の複利で5年借りて全く返済しなかった場合、残高は1年後に110万円、2年後に121万円と雪だるま式に増えていく。カードローンは多くが複利的に扱われる。正確には「毎月の請求時に利息が計上され、未払いがあれば残高に繰り入れられる」という仕組みで、返済を続けている限り純粋な複利にはならないが、返済が最低限に留まっていると実質的に複利と近い挙動になる。
            </p>
            <p className="text-sm leading-relaxed">
              これが重要な意味を持つのは、返済ペースが遅いときだ。最低返済額だけを払っている状態は、元金がほとんど減らず、翌月もほぼ同額の利息が発生するため、10年近く経っても元金の大半が残る、という帰結になる。
            </p>
          </section>

          <AffiliateSection
            category="loan-consolidation"
            title="金利を下げて利息を圧縮する"
            leadText="複数社借入の一本化や、年18%帯から低金利帯への借換えで、月々と総額を見直せます。"
            placement="column-kinri-hikaku-mid"
            motivationText="現在の金利と借換え後の金利で利息の積み上がり方を並べてみると、金利差の威力が数字で見える。年18%と年10%では、100万円残高で1日あたり約220円の差、30日で約6,600円の差になる。この差が毎月・毎年積み上がっていくことを考えると、金利の見直しは早いほど効果が大きい。"
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">利息を実際に減らす、4つの実務</h2>
            <p className="text-sm leading-relaxed mb-3">
              利息を減らす方法は、どれも「元金をどれだけ早く、どれだけ低い金利で返すか」に集約される。実務で効く順に見ていく。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              <strong className="text-zinc-200">1. 繰上返済を積み上げる</strong> — 最も即効性があるのは、余裕のある月に毎月の約定返済とは別に追加返済することだ。前述の通り、利息は残高に対して日割りで発生するので、元金を減らせばその瞬間から毎日の利息が減る。ボーナスなど大きな入金があったときに迷わず繰上返済に回すのが、総支払額を抑える基本になる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              <strong className="text-zinc-200">2. 金利の低い商品に借り換える</strong> — 複数社から年18%で借りているなら、銀行系のおまとめローンや低金利カードローンへの借り換えで、実効金利を大きく下げられる余地がある。借入条件と信用情報次第で通る通らないは変わるが、借入が100万円を超える規模では金利差の影響が大きく、検討する価値はある。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              <strong className="text-zinc-200">3. 無利息期間をうまく使う</strong> — 大手の消費者金融は「初回30日無利息」のような商品を用意している。30日以内に全額返済できる見込みがあるなら、利息ゼロで借りられる。ただし期限を過ぎれば通常の金利（年18%前後）が適用されるので、長期借入を前提とするなら金利そのものが低い商品を選んだ方が合理的だ。
            </p>
            <p className="text-sm leading-relaxed">
              <strong className="text-zinc-200">4. 返済額を増やす</strong> — 約定の最低返済額は利息＋ごくわずかな元金で設定されているケースが多い。返済可能な範囲で月々の額を増やせば、元金の減りが速くなり、総利息も減る。アプリやATMで任意の額を追加入金できる商品も多い。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">どうしても返済が追いつかないなら</h2>
            <p className="text-sm leading-relaxed mb-3">
              金利の見直しや繰上返済を工夫しても、収入と支出のバランス的にどうしても返済が追いつかない、というケースはある。月の返済額が収入の3割を超えている、延滞が一度でも発生している、複数社で借りては返すを繰り返している — そういう状態だと、利息を小さく削る努力より、そもそもの構造を作り変える方が現実的だ。
            </p>
            <p className="text-sm leading-relaxed">
              具体的には、任意整理で将来の利息をカットして元金を3〜5年の分割返済にする、借入総額が大きければ個人再生で元金を5分の1程度まで圧縮する、といった債務整理の手段がある。これらは裁判所を通すか通さないかの差はあるが、どちらも「利息の負担そのものを止めて、元金の返済に集中する」ための仕組みだ。信用情報には数年間事故情報が登録されるが、毎月利息だけを払い続ける状態を数年続けるよりも、整理して数年後に立て直すほうが結果的に早いことも多い。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-6">よくある質問</h2>
            <dl className="space-y-5 text-sm">
              {jsonLdFaq.mainEntity.map(({ name, acceptedAnswer }) => (
                <div key={name}>
                  <dt className="font-bold text-zinc-200 mb-1.5">Q. {name}</dt>
                  <dd className="text-zinc-400 leading-relaxed pl-4 border-l border-zinc-700">
                    A. {acceptedAnswer.text}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <AffiliateSection
            category="debt-consolidation"
            title="返済が厳しい段階での無料相談"
            leadText="任意整理・個人再生などの選択肢について、弁護士・司法書士に無料で相談できます。"
            placement="column-kinri-hikaku-bottom"
            motivationText="金利を下げる工夫を重ねても元金が減らない、毎月の返済で生活が回らない、そんな段階では債務整理という選択肢も視野に入れておきたい。法律事務所の無料相談では、借入内容を伝えるだけで、任意整理で解決できる規模なのか、個人再生や自己破産を検討すべき規模なのかの目安が得られる。話した内容は守秘義務で守られるため、情報収集のつもりで聞くだけでも意味がある。"
          />

          <section className="mb-10 border-t border-zinc-800 pt-8">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">関連記事</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/column/omatome-loan" className="text-zinc-300 hover:text-zinc-100 underline underline-offset-4 decoration-zinc-600">
                  おまとめローンの仕組みとメリット・デメリット
                </Link>
                <span className="text-zinc-500"> — 複数社借入を1本化して金利を下げる</span>
              </li>
              <li>
                <Link href="/column/saimu-seiri" className="text-zinc-300 hover:text-zinc-100 underline underline-offset-4 decoration-zinc-600">
                  債務整理とは？種類・費用・デメリットを解説
                </Link>
                <span className="text-zinc-500"> — 任意整理・個人再生・自己破産の使い分け</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-100 mb-3">自分の借入で利息を計算してみる</h2>
            <p className="text-sm leading-relaxed mb-4 text-zinc-400">
              元金・金利・返済条件を入力すると、今この瞬間にも発生している利息を秒単位で表示できる。実際の金額で見ると、金利差や返済ペースの意味が体感しやすくなる。
            </p>
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold text-sm py-2.5 px-5 rounded-lg transition-colors"
            >
              利息タイマーで確認する →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
