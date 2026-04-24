'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { DailyReportRow, ReportAnomaly, ReportExperiment, ReportOffer } from '@/types/report';
import { StatusBadge, formatDate, formatNumber } from '../../_shared';

interface Props {
  row: DailyReportRow;
}

function formatCtrPct(ctr: number): string {
  return `${(ctr * 100).toFixed(2)}%`;
}

function formatDeltaBadge(pct: number | null | undefined): { text: string; cls: string } {
  if (pct == null) return { text: '—', cls: 'text-zinc-500' };
  if (pct === 0) return { text: '±0%', cls: 'text-zinc-500' };
  if (pct > 0) return { text: `↑ ${pct.toFixed(1)}%`, cls: 'text-green-400' };
  return { text: `↓ ${Math.abs(pct).toFixed(1)}%`, cls: 'text-red-400' };
}

const SEVERITY_CLASSES: Record<ReportAnomaly['severity'], string> = {
  low: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  high: 'bg-red-900/40 text-red-400 border-red-800',
};

export function ReportDetailClient({ row }: Props) {
  const rp = row.report_json;
  const [sortKey, setSortKey] = useState<'ctr' | 'clicks' | 'impressions'>('ctr');
  const [rawOpen, setRawOpen] = useState(false);

  const sortedOffers = useMemo(() => {
    return [...(rp.offers ?? [])].sort((a, b) => {
      if (sortKey === 'ctr') return b.ctr - a.ctr;
      if (sortKey === 'clicks') return b.clicks - a.clicks;
      return b.impressions - a.impressions;
    });
  }, [rp.offers, sortKey]);

  const comp = rp.comparison_to_yesterday;
  const impDelta = formatDeltaBadge(comp?.impressions_delta_pct);
  const clkDelta = formatDeltaBadge(comp?.clicks_delta_pct);
  const ctrDelta = formatDeltaBadge(comp?.ctr_delta_pct);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href="/admin/reports"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← 一覧に戻る
        </Link>
      </div>

      {/* 基本情報 */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{rp.date}</h1>
            <p className="text-xs text-zinc-500 mt-1">
              project: <code className="text-zinc-400">{rp.project}</code>
            </p>
          </div>
          <dl className="text-xs text-zinc-500 text-right">
            <div>generated_at: <span className="text-zinc-300 tabular-nums">{formatDate(new Date(rp.generated_at).getTime())}</span></div>
            <div>saved_at: <span className="text-zinc-300 tabular-nums">{formatDate(new Date(row.created_at).getTime())}</span></div>
          </dl>
        </div>
      </section>

      {/* KPI カード */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="インプレッション" value={formatNumber(rp.kpis?.impressions ?? 0)} delta={impDelta} />
        <KpiCard label="クリック" value={formatNumber(rp.kpis?.clicks ?? 0)} delta={clkDelta} />
        <KpiCard label="CTR" value={formatCtrPct(rp.kpis?.ctr ?? 0)} delta={ctrDelta} />
        <KpiCard label="ユニークビジタ" value={formatNumber(rp.kpis?.unique_visitors ?? 0)} />
      </section>

      {/* 実験 */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-300">実験バリアント集計</h2>
        </div>
        {(rp.experiments ?? []).length === 0 ? (
          <p className="px-5 py-8 text-center text-zinc-500 text-sm">実験データがありません</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {rp.experiments.map((exp) => (
              <ExperimentBlock key={exp.id} exp={exp} />
            ))}
          </div>
        )}
      </section>

      {/* オファー */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300">オファー別集計</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">並び順:</span>
            {(['ctr', 'clicks', 'impressions'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  sortKey === k
                    ? 'bg-zinc-700 border-zinc-600 text-zinc-100'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {sortedOffers.length === 0 ? (
          <p className="px-5 py-8 text-center text-zinc-500 text-sm">オファーデータがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/50 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">オファー</th>
                  <th className="px-4 py-3 text-left font-semibold">カテゴリ</th>
                  <th className="px-4 py-3 text-right font-semibold">imp</th>
                  <th className="px-4 py-3 text-right font-semibold">clicks</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
                </tr>
              </thead>
              <tbody>
                {sortedOffers.map((o) => (
                  <OfferRow key={o.id} offer={o} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 異常値 */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-300 mb-4">異常値</h2>
        {(rp.anomalies ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">異常値はありません ✅</p>
        ) : (
          <ul className="space-y-3">
            {rp.anomalies.map((a, i) => (
              <li key={i} className="border border-zinc-800 bg-zinc-950/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${SEVERITY_CLASSES[a.severity]}`}
                  >
                    {a.severity}
                  </span>
                  <code className="text-xs text-zinc-500">{a.type}</code>
                </div>
                <p className="text-sm text-zinc-200">{a.message}</p>
                {Object.keys(a.context ?? {}).length > 0 ? (
                  <pre className="mt-2 text-[11px] text-zinc-500 bg-zinc-950 border border-zinc-800 rounded p-2 overflow-x-auto">
                    {JSON.stringify(a.context, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Raw Data */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setRawOpen((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
        >
          <h2 className="text-sm font-bold text-zinc-300">Raw Data (JSON)</h2>
          <span className="text-zinc-400 text-sm">{rawOpen ? '▲' : '▼'}</span>
        </button>
        {rawOpen ? (
          <pre className="px-5 py-4 text-[11px] text-zinc-400 bg-zinc-950/50 border-t border-zinc-800 overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(rp, null, 2)}
          </pre>
        ) : null}
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: { text: string; cls: string };
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
      {delta ? <p className={`text-xs mt-1 tabular-nums ${delta.cls}`}>{delta.text}</p> : null}
    </div>
  );
}

function ExperimentBlock({ exp }: { exp: ReportExperiment }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <h3 className="font-semibold text-zinc-200">{exp.name}</h3>
        <StatusBadge status={exp.status} />
        <code className="text-xs text-zinc-500">{exp.id}</code>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="py-2 text-left font-semibold">variant</th>
              <th className="py-2 text-right font-semibold">weight</th>
              <th className="py-2 text-right font-semibold">imp</th>
              <th className="py-2 text-right font-semibold">clicks</th>
              <th className="py-2 text-right font-semibold">CTR</th>
              <th className="py-2 text-right font-semibold">uniq</th>
            </tr>
          </thead>
          <tbody>
            {exp.variants.map((v) => (
              <tr key={v.id} className="border-b border-zinc-800/50 last:border-b-0">
                <td className="py-2 text-zinc-300">
                  <code className="text-xs">{v.id}</code>
                </td>
                <td className="py-2 text-right text-zinc-400 tabular-nums">{v.weight}</td>
                <td className="py-2 text-right text-zinc-200 tabular-nums">
                  {formatNumber(v.impressions)}
                </td>
                <td className="py-2 text-right text-zinc-200 tabular-nums">
                  {formatNumber(v.clicks)}
                </td>
                <td className="py-2 text-right text-zinc-200 tabular-nums">{formatCtrPct(v.ctr)}</td>
                <td className="py-2 text-right text-zinc-400 tabular-nums">
                  {formatNumber(v.unique_visitors)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfferRow({ offer }: { offer: ReportOffer }) {
  return (
    <tr className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30">
      <td className="px-4 py-3">
        <code className="text-xs text-zinc-300">{offer.id}</code>
        {offer.advertiser ? (
          <p className="text-xs text-zinc-500 mt-0.5">{offer.advertiser}</p>
        ) : null}
      </td>
      <td className="px-4 py-3 text-zinc-400 text-xs">{offer.category}</td>
      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums">
        {formatNumber(offer.impressions)}
      </td>
      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums">
        {formatNumber(offer.clicks)}
      </td>
      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums">{formatCtrPct(offer.ctr)}</td>
    </tr>
  );
}
