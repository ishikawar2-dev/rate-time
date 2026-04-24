import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '利用規約',
  description: '利息タイマーの利用規約。本ツールの利用条件、免責事項、禁止事項について定めています。',
  alternates: { canonical: 'https://rate-time.com/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-rt-text-secondary">
      <Link href="/" className="text-sm text-rt-text-tertiary hover:text-rt-text-primary transition-colors inline-block mb-6">
        ← 利息タイマーに戻る
      </Link>
      <h1 className="text-2xl font-bold text-rt-text-primary mb-2">利用規約</h1>
      <p className="text-xs text-rt-text-muted mb-8">最終更新日: 2026-04-24</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第1条（適用）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          本規約は、利息タイマー（以下「本サービス」）の提供条件および本サービス利用に関する当サイトと利用者との権利義務関係を定めます。利用者は本サービスを利用することで本規約に同意したものとみなされます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第2条（サービス内容）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          本サービスは、利用者が入力した元金・金利・開始日などの情報をもとに、利息をリアルタイムに計算・可視化するWebツールです。利用は無料で、会員登録は不要です。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第3条（計算結果の免責）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          本サービスが提示する利息額は、入力情報に基づく概算値であり、実際の契約内容・返済スケジュール・手数料・遅延損害金などを完全には反映しません。
          本サービスの計算結果に基づいて行われた判断・行動により発生した損害について、当サイトは一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第4条（禁止事項）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。
        </p>
        <ul className="text-sm leading-relaxed text-rt-text-tertiary list-disc pl-5 mt-2 space-y-1">
          <li>法令または公序良俗に違反する行為</li>
          <li>当サイトのサーバーやネットワークに過度な負荷をかける行為</li>
          <li>本サービスをリバースエンジニアリング・自動化スクリプトで大量利用する行為</li>
          <li>他者になりすまして本サービスを利用する行為</li>
          <li>第三者の権利・利益を侵害する行為</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第5条（URL 共有時の注意）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          本サービスで生成されるタイマーURLを共有する場合、利用者の責任のもとで行ってください。URL を知る第三者は当該タイマーの内容を閲覧できます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第6条（サービスの変更・中断・終了）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          当サイトは、利用者への事前通知なく本サービスの内容の変更・追加・中断・終了を行うことがあります。これにより利用者に損害が生じた場合でも、当サイトは責任を負いません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第7条（アフィリエイトリンクについて）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          本サービス内にはアフィリエイトリンク（広告）が含まれる場合があります。紹介先サービスとの契約・取引は、利用者とサービス提供者との間で直接行われるものであり、当サイトは一切関与しません。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-rt-text-primary mb-3">第8条（準拠法・管轄）</h2>
        <p className="text-sm leading-relaxed text-rt-text-tertiary">
          本規約の解釈は日本法に準拠するものとし、本サービスに関して紛争が生じた場合は、当サイト運営者所在地を管轄する裁判所を第一審の専属的合意管轄とします。
        </p>
      </section>
    </main>
  );
}
