import type { Metadata } from 'next';
import Link from 'next/link';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';

const TITLE = '債務整理とは？種類・費用・デメリットを解説';
const DESCRIPTION =
  '任意整理・個人再生・自己破産の3つの債務整理手続きについて、費用相場・ブラック期間・生活への影響を実務的な数字で解説。借金が減らずに悩む人向けの選択肢ガイド。';
const URL = 'https://rate-time.com/column/saimu-seiri';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: ['債務整理', '任意整理', '個人再生', '自己破産', '借金 減らす', 'ブラックリスト'],
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
      name: '債務整理は自分でもできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '任意整理は制度上、本人での手続きも可能です。ただし貸金業者との交渉は容易ではなく、弁護士・司法書士が代理人として入る場合と比べて和解内容が不利になりやすい傾向があります。個人再生・自己破産は書類作成や裁判所対応が煩雑で、代理人を立てるのが一般的です。',
      },
    },
    {
      '@type': 'Question',
      name: '家族に知られずに債務整理できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '任意整理は家族への通知が基本的になく、同居家族にも気づかれにくい手続きです。個人再生・自己破産は裁判所からの郵便や官報掲載があるため、郵便物の取り扱いまで含めた事前の設計が必要になります。',
      },
    },
    {
      '@type': 'Question',
      name: '保証人がついている借金はどうなりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '任意整理で保証人付きの借入を整理すると、保証人に請求が回ります。実務ではこれを避けるため、保証人がいる借入を任意整理の対象から外し、それ以外の借入だけを整理する組み立てが多く行われます。',
      },
    },
    {
      '@type': 'Question',
      name: '債務整理の費用が払えない場合は？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '法テラス（日本司法支援センター）の民事法律扶助制度を利用すると、弁護士・司法書士費用の立替払いと分割返済が可能です。収入要件に通れば、手持ちの費用がなくても手続きを開始できます。',
      },
    },
    {
      '@type': 'Question',
      name: '債務整理後、何年でまたカードを作れますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '信用情報機関の登録期間（任意整理で約5年、個人再生・自己破産で5〜10年）が経過すれば、審査を受けられるようになります。ただし同じ会社では社内データが残るため、発行が通りにくい傾向があります。',
      },
    },
  ],
};

export default function SaimuSeiriPage() {
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
            債務整理とは？種類・費用・デメリットを解説
          </h1>
          <p className="text-xs text-zinc-500 mb-8">
            本ページにはプロモーションが含まれます / 最終更新: 2026-04-24
          </p>

          <section className="mb-10">
            <p className="text-sm leading-relaxed mb-4">
              毎月返済しているのに、元金がなかなか減らない。給料が入った瞬間に返済用の口座に移し、残った数万円で月末までしのぐ。気づけばカードローンの利息で返済の大半が消えていて、元金は借りた時とほとんど同じ。夜、家族が寝静まった後にATMの履歴を見返して、どうしてこうなったのか考え直している —
              そんな状況なら、「債務整理」という選択肢を知っておいたほうがいい。
            </p>
            <p className="text-sm leading-relaxed">
              債務整理と聞くと自己破産のような重い手続きをイメージしやすいが、実際には借金を今後どう整理していくかを法的に決めるための方法論で、中身はいくつかに分かれている。将来の利息をカットするだけで解決するケースもあれば、元金を大きく圧縮できるケースもある。以下では、それぞれの特徴・費用・生活への影響を、実務で出てくる具体的な数字とあわせて整理していく。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">債務整理には3つの道がある</h2>
            <p className="text-sm leading-relaxed mb-3">
              債務整理には大きく「任意整理」「個人再生」「自己破産」の3つがある。どれを選ぶかは、借金の総額と、今の収入で返済を続けられるかどうかで決まってくる。順番としては、返済が続けられるなら任意整理、総額が大きくて住宅を残したいなら個人再生、収入から見てどうしても返せないなら自己破産、というのが実務的な使い分けだ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              任意整理は最も軽い手続きで、裁判所を通さず貸金業者と直接交渉する。将来の利息をカットし、元金を3〜5年で分割返済する内容で合意を取る方法で、借入先を選んで整理できるのが大きな特徴だ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              個人再生は裁判所を通じた手続きで、借金を原則5分の1程度まで圧縮した上で3〜5年で返済する。住宅ローンを対象外にできる特則があるため、持ち家を維持したまま他の借金を大幅に減らせるのが魅力になる。ただし、継続的かつ安定した収入があることが前提だ。
            </p>
            <p className="text-sm leading-relaxed">
              自己破産は返済義務そのものを免除してもらう手続き。収入からどう頑張っても返せないほど借金が膨らんでいる場合の、いわば最終手段にあたる。財産の一部を処分する必要があるほか、手続き中の職業制限などはあるが、「一生仕事ができなくなる」ような誤解されがちなデメリットはない。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">任意整理って、具体的に何が減るの？</h2>
            <p className="text-sm leading-relaxed mb-3">
              任意整理は実務上、もっともよく選ばれる方法だ。減らすのは主に「将来の利息」で、残っている元金に対する今後の利息を原則ゼロにしてもらい、元金を分割で返していく。利息制限法の上限は元金10万円未満で年20%、10万〜100万円で年18%、100万円以上で年15%だが、カードローン金利はこの上限近くに張り付いているのが普通だ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              仮に年15〜18%のカードローン残高が200万円残っているケースで任意整理をすると、将来利息がカットされるため、単純に元金200万円を3年で割った月々約5.6万円で返済が組める。利息を払い続けていた時期と比べて、月々の返済負担は数万円単位で軽くなることも珍しくない。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              費用は事務所によって幅があるが、相場として1社あたり着手金2〜5万円、和解成立後に減額報酬として「減った金額の10%前後」という構造が多い。借入先が3社なら合計10〜20万円、分割払いに対応する事務所もある。
            </p>
            <p className="text-sm leading-relaxed">
              デメリットでよく挙げられるのは、信用情報機関への事故情報登録 — いわゆる「ブラック」だ。和解成立から約5年間、新規のクレジットカードや各種ローンの審査に通らなくなる。ただ、毎月利息だけを払い続けて元金が減らない状態を数年続けるより、整理してしまって5年を経過した方が早く立て直せる、というのも現実的な見方だ。すべての借入を対象にする必要はなく、保証人がついている借入や住宅ローンは対象から外す、という組み立てもできる。
            </p>
          </section>

          <AffiliateSection
            category="debt-consolidation"
            title="無料相談で自分のケースを確認する"
            leadText="借入総額と返済状況を伝えるだけで、どの手続きが使えるかの目安が分かります。"
            placement="column-saimu-seiri-mid"
            motivationText="ひとりで抱え込んで毎月利息だけを払い続けるのは、精神面でも金銭面でも消耗が大きい。多くの法律事務所は初回の相談を無料で受け付けており、話を聞くだけなら費用はかからない。借金の総額と返済状況を伝えれば、任意整理で解決できる規模かどうか、その場でおおよその見立てを示してもらえる。相談という選択肢があることを知っておくだけでも、次の一手が見えやすくなる。"
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">自己破産はやっぱり避けたい — 他の道はある？</h2>
            <p className="text-sm leading-relaxed mb-3">
              任意整理では返済しきれない、でも自己破産は避けたい。そのあいだに位置するのが個人再生だ。裁判所を通じた手続きで、借金を大幅に圧縮できる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              圧縮の度合いは借金総額に応じて段階的に決まる仕組みで、500万円以下なら最低弁済額は100万円、500〜1500万円なら5分の1、という目安がある。これを3〜5年で返済していく。年15%のカードローンで元金500万円残っているケースなら、100万円まで圧縮されて月々約2.8万円（3年返済）、というのが概算のイメージだ。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              個人再生が注目される最大の理由は、住宅ローン特則が使える点にある。住宅ローンだけは約束通り払い続けることで、家を手放さずに他の借金を圧縮できる。持ち家があり、家族の生活を維持したい場合に有力な選択肢になる。
            </p>
            <p className="text-sm leading-relaxed">
              手続き費用は任意整理よりかなり重い。弁護士費用で30〜50万円、裁判所への予納金が数万〜十数万円で、合計40〜60万円が目安だ。また継続的かつ反復的な収入が要件とされるため、給与所得者か、個人事業主でも収入の安定が確認できることが前提になる。官報への氏名掲載はあるが、近所の人が官報を日常的に読むことは実際にはほとんどない、というのが実務家の一般的な見方だ。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">自己破産で誤解されがちなこと</h2>
            <p className="text-sm leading-relaxed mb-3">
              借金が収入から見てどう考えても返せない水準まで膨らんでいる場合、最後の選択肢が自己破産になる。裁判所に破産を申し立て、免責が認められれば、税金や養育費など一部を除いた借金の支払い義務が消える。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              費用は手続きの種類で変わる。目立った財産がない「同時廃止」なら弁護士費用と裁判所費用で20〜40万円、一定以上の財産がある「管財事件」になると管財人への予納金20万円が加わって合計50万円〜が目安になる。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              生活への影響で気にされやすいのが職業制限だ。弁護士・税理士・警備員・生命保険募集人などは破産手続き中に資格が制限されるが、これは「手続き中」に限った話で、免責確定後に制限は解ける。「一生できなくなる仕事」ではない。持ち家や高額の預貯金、一定以上の価値の自動車は処分対象になる一方、生活必需品や当面の生活費相当の現金は手元に残せる制度になっている。
            </p>
            <p className="text-sm leading-relaxed">
              広く流布している誤解として「戸籍や住民票に載る」「選挙権がなくなる」があるが、どちらも事実ではない。戸籍・住民票に破産の記録が残ることはないし、選挙権も失われない。
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-zinc-100 mb-3">ブラックリストって実際どれくらい影響するの？</h2>
            <p className="text-sm leading-relaxed mb-3">
              債務整理をすると信用情報機関に事故情報が登録される。登録期間は手続きと機関によって異なり、任意整理は和解成立から約5年、個人再生と自己破産は手続き開始から5〜10年。この期間中は、新規のクレジットカード発行、各種ローン審査、携帯電話本体の分割購入などで影響が出る。
            </p>
            <p className="text-sm leading-relaxed mb-3">
              ただし、これは「借金を整理した上で、数年間は新たに借りられない」という状態であって、生活そのものが立ち行かなくなるわけではない。デビットカードやプリペイドカードは問題なく使えるし、家族カードも影響を受けない。賃貸契約も保証会社を選べば通る。自動車は現金一括か家族名義で対応する人が多い。
            </p>
            <p className="text-sm leading-relaxed">
              登録期間を過ぎれば情報は削除される。債務整理で一度整理した人が、数年後には通常の金融取引に戻っているケースは実務では珍しくない。
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
            title="まずは無料相談で状況を話してみる"
            leadText="秘密保持は徹底されており、相談内容が外に漏れることはありません。"
            placement="column-saimu-seiri-bottom"
            motivationText="債務整理は「返せなくなった人」が最後にやる手続きではない。利息が重くて元金が減らない、延滞まであと一歩、そんな段階から使える選択肢だ。初回無料の相談枠を使って、自分のケースにどの手続きが合うのかを聞いてみる価値はある。法律事務所の多くは守秘義務を徹底しているため、話した内容が外に漏れることはない。"
          />

          <section className="mb-10 border-t border-zinc-800 pt-8">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">関連記事</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/column/omatome-loan" className="text-zinc-300 hover:text-zinc-100 underline underline-offset-4 decoration-zinc-600">
                  おまとめローンの仕組みとメリット・デメリット
                </Link>
                <span className="text-zinc-500"> — 複数社の借金を1本にまとめて金利を下げる方法</span>
              </li>
              <li>
                <Link href="/column/kinri-hikaku" className="text-zinc-300 hover:text-zinc-100 underline underline-offset-4 decoration-zinc-600">
                  カードローン金利の仕組みと利息を減らす方法
                </Link>
                <span className="text-zinc-500"> — 利息の計算式と返済を早めるための実務</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-100 mb-3">実際に利息を計算してみる</h2>
            <p className="text-sm leading-relaxed mb-4 text-zinc-400">
              自分の借入で今この瞬間にも膨らんでいる利息を数字で見ると、返済の優先順位を立て直しやすい。元金と金利を入力するだけで、秒単位の利息をリアルタイム表示できる。
            </p>
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold text-sm py-2.5 px-5 rounded-lg transition-colors"
            >
              利息タイマーを使ってみる →
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
