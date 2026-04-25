'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyReportRow } from '@/types/report';
import type { ReportRangeSummary } from '@/lib/admin-queries';
import { formatNumber } from '../_shared';

interface Props {
  project: string;
  from: string; // YYYY-MM-DD
  to: string;
  reports: DailyReportRow[];
  summary: ReportRangeSummary;
}

function todayJST(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
}

function shiftDate(date: string, days: number): string {
  const t = new Date(`${date}T00:00:00+09:00`).getTime() + days * 24 * 3600 * 1000;
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date(t));
}

function formatCtrPct(ctr: number): string {
  return `${(ctr * 100).toFixed(2)}%`;
}

function formatDelta(pct: number | null | undefined): { text: string; sign: 'up' | 'down' | 'flat' } {
  if (pct == null || pct === 0) return { text: '±0%', sign: 'flat' };
  const sign = pct > 0 ? 'up' : 'down';
  const arrow = pct > 0 ? '↑' : '↓';
  return { text: `${arrow}${Math.abs(pct).toFixed(1)}%`, sign };
}

export function ReportsListClient({ project, from, to, reports, summary }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fromInput, setFromInput] = useState(from);
  const [toInput, setToInput] = useState(to);

  // チャート用データ（日付昇順、ctr は %）
  const chartData = useMemo(() => {
    return [...reports]
      .reverse()
      .map((r) => ({
        date: r.date,
        impressions: r.report_json.kpis?.impressions ?? 0,
        clicks: r.report_json.kpis?.clicks ?? 0,
        ctrPct: Math.round((r.report_json.kpis?.ctr ?? 0) * 100 * 100) / 100,
        hasAnomaly: (r.report_json.anomalies?.length ?? 0) > 0,
      }));
  }, [reports]);

  const applyRange = (nextFrom: string, nextTo: string) => {
    const params = new URLSearchParams();
    params.set('from', nextFrom);
    params.set('to', nextTo);
    if (project !== 'rate-time') params.set('project', project);
    startTransition(() => {
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  const applyPreset = (days: number) => {
    const t = todayJST();
    const f = shiftDate(t, -(days - 1));
    setFromInput(f);
    setToInput(t);
    applyRange(f, t);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-zinc-100">日次レポート履歴</h1>
        <p className="text-xs text-zinc-500">
          期間: {from} 〜 {to}（{summary.reportCount} 件）
        </p>
      </div>

      {/* フィルタ */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-300 mb-3">期間</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => applyPreset(d)}
              disabled={isPending}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-sm font-semibold py-1.5 px-3 rounded-lg border border-zinc-700 transition-colors"
            >
              直近{d}日
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">from</span>
            <input
              type="date"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">to</span>
            <input
              type="date"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </label>
          <button
            type="button"
            onClick={() => applyRange(fromInput, toInput)}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            適用
          </button>
        </div>
      </section>

      {/* サマリーカード */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">総インプレッション</p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">
            {formatNumber(summary.totalImpressions)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">総クリック</p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">
            {formatNumber(summary.totalClicks)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">平均 CTR</p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">
            {formatCtrPct(summary.averageCtr)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">異常値発生日数</p>
          <p
            className={`text-2xl font-bold tabular-nums ${
              summary.anomalyDays > 0 ? 'text-red-400' : 'text-zinc-100'
            }`}
          >
            {summary.anomalyDays}
          </p>
        </div>
      </section>

      {/* 推移グラフ */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-300 mb-4">日次推移</h2>
        {chartData.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-10">
            期間内のレポートがありません。Routines からの送信を確認してください。
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis
                  yAxisId="left"
                  stroke="#71717a"
                  fontSize={11}
                  allowDecimals={false}
                  label={{ value: 'imp/clicks', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#71717a"
                  fontSize={11}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'CTR', angle: 90, position: 'insideRight', fill: '#71717a', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(value, name) => {
                    const n = typeof value === 'number' ? value : Number(value);
                    if (name === 'CTR') return [`${n.toFixed(2)}%`, name as string];
                    return [formatNumber(n), name as string];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions"
                  name="インプレッション"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  name="クリック"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ctrPct"
                  name="CTR"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                {chartData
                  .filter((d) => d.hasAnomaly)
                  .map((d) => (
                    <ReferenceDot
                      key={d.date}
                      x={d.date}
                      y={d.impressions}
                      r={6}
                      fill="#ef4444"
                      stroke="#991b1b"
                      yAxisId="left"
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 日別テーブル */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-300">日別レポート</h2>
        </div>
        {reports.length === 0 ? (
          <p className="px-5 py-8 text-center text-zinc-500 text-sm">
            期間内のレポートがありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/50 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">日付</th>
                  <th className="px-4 py-3 text-right font-semibold">imp</th>
                  <th className="px-4 py-3 text-right font-semibold">前日比</th>
                  <th className="px-4 py-3 text-right font-semibold">clicks</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
                  <th className="px-4 py-3 text-left font-semibold">active 実験</th>
                  <th className="px-4 py-3 text-center font-semibold">anomaly</th>
                  <th className="px-4 py-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const rp = r.report_json;
                  const activeExps = (rp.experiments ?? []).filter((e) => e.status === 'active');
                  const anomalyCount = rp.anomalies?.length ?? 0;
                  const delta = formatDelta(rp.comparison_to_yesterday?.impressions_delta_pct);
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30 ${
                        anomalyCount > 0 ? 'border-l-2 border-l-red-600' : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <td className="px-4 py-3 text-zinc-200 tabular-nums">{r.date}</td>
                      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums">
                        {formatNumber(rp.kpis?.impressions ?? 0)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums text-xs ${
                          delta.sign === 'up'
                            ? 'text-green-400'
                            : delta.sign === 'down'
                              ? 'text-red-400'
                              : 'text-zinc-500'
                        }`}
                      >
                        {delta.text}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums">
                        {formatNumber(rp.kpis?.clicks ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums">
                        {formatCtrPct(rp.kpis?.ctr ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {activeExps.length === 0
                          ? '—'
                          : activeExps.map((e) => e.id).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {anomalyCount > 0 ? (
                          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800">
                            {anomalyCount}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/reports/${r.date}${project !== 'rate-time' ? `?project=${encodeURIComponent(project)}` : ''}`}
                          className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                        >
                          詳細 →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-5 py-3 text-xs text-zinc-600 bg-zinc-950/30 border-t border-zinc-800">
          保存は POST /api/admin/report/save で Vercel Cron から送信されます。最新の保存時刻は各行の詳細ページで確認できます。
        </p>
      </section>

    </main>
  );
}
