'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  DailyPoint,
  ExperimentInfo,
  VariantStat,
} from '@/lib/admin-queries';
import type { ExperimentConfig } from '@/lib/experiments';
import { StatusBadge, formatDate, formatNumber } from '../../_shared';

interface Props {
  info: ExperimentInfo;
  configFromCode: ExperimentConfig | null;
  variantStats: VariantStat[];
  dailyImpressions: DailyPoint[];
  dailyClicks: DailyPoint[];
  offers: string[];
  pages: string[];
  rawFilters: { from: string; to: string; offer: string; page: string };
}

// バリアント別に一定のパレットを割り当て
const CHART_COLORS = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
];

function variantColor(variantId: string, allIds: string[]): string {
  const idx = allIds.indexOf(variantId);
  return CHART_COLORS[idx % CHART_COLORS.length];
}

type PivotRow = Record<string, string | number> & { day: string };

/** 日次データを Recharts が扱いやすい wide フォーマットに変換 */
function pivotDaily(points: DailyPoint[], variantIds: string[]): PivotRow[] {
  const byDay = new Map<string, Record<string, number>>();
  for (const p of points) {
    const row = byDay.get(p.day) ?? {};
    row[p.variantId] = (row[p.variantId] ?? 0) + p.count;
    byDay.set(p.day, row);
  }
  const days = Array.from(byDay.keys()).sort();
  return days.map((day) => {
    const row = byDay.get(day)!;
    const out: PivotRow = { day };
    for (const v of variantIds) out[v] = row[v] ?? 0;
    return out;
  });
}

export function ExperimentDetail({
  info,
  configFromCode,
  variantStats,
  dailyImpressions,
  dailyClicks,
  offers,
  pages,
  rawFilters,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [from, setFrom] = useState(rawFilters.from);
  const [to, setTo] = useState(rawFilters.to);
  const [offer, setOffer] = useState(rawFilters.offer);
  const [page, setPage] = useState(rawFilters.page);

  const variantIds = variantStats.map((v) => v.id);
  const bestCtr = variantStats.reduce<number | null>((max, v) => {
    if (v.impressions === 0 || v.ctr == null) return max;
    return max == null || v.ctr > max ? v.ctr : max;
  }, null);

  const impressionsData = pivotDaily(dailyImpressions, variantIds);
  const clicksData = pivotDaily(dailyClicks, variantIds);

  const applyFilters = (overrides?: Partial<typeof rawFilters>) => {
    const params = new URLSearchParams();
    const next = { from, to, offer, page, ...overrides };
    if (next.from) params.set('from', next.from);
    if (next.to) params.set('to', next.to);
    if (next.offer) params.set('offer', next.offer);
    if (next.page) params.set('page', next.page);
    const qs = params.toString();
    startTransition(() => {
      router.push(`/admin/experiments/${encodeURIComponent(info.id)}${qs ? `?${qs}` : ''}`);
    });
  };

  const resetFilters = () => {
    setFrom('');
    setTo('');
    setOffer('');
    setPage('');
    applyFilters({ from: '', to: '', offer: '', page: '' });
  };

  const doMutation = async (action: 'activate' | 'pause') => {
    setMutationError(null);
    setMutating(true);
    try {
      const res = await fetch(
        `/api/admin/experiments/${encodeURIComponent(info.id)}/${action}`,
        { method: 'POST' },
      );
      if (res.ok) {
        router.refresh();
      } else {
        const msg = await res.text();
        setMutationError(msg || `${action} に失敗しました`);
      }
    } catch (e) {
      setMutationError(`${action} に失敗しました: ${(e as Error).message}`);
    } finally {
      setMutating(false);
    }
  };

  const showActivate = info.status === 'draft' || info.status === 'paused';
  const showPause = info.status === 'active';

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* パンくず */}
      <div>
        <Link
          href="/admin/experiments"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← 実験一覧
        </Link>
      </div>

      {/* 基本情報 */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-zinc-100">{info.name}</h1>
              <StatusBadge status={info.status} />
            </div>
            <code className="text-xs text-zinc-500">{info.id}</code>
            {info.description ? (
              <p className="text-sm text-zinc-400 mt-3 max-w-2xl leading-relaxed">
                {info.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            {showActivate ? (
              <button
                onClick={() => doMutation('activate')}
                disabled={mutating}
                className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {info.status === 'draft' ? '開始する' : '再開する'}
              </button>
            ) : null}
            {showPause ? (
              <button
                onClick={() => doMutation('pause')}
                disabled={mutating}
                className="bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                一時停止する
              </button>
            ) : null}
            {mutationError ? (
              <p className="text-xs text-red-400 max-w-xs text-right">{mutationError}</p>
            ) : null}
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-xs">
          <div>
            <dt className="text-zinc-500 mb-0.5">開始日</dt>
            <dd className="text-zinc-300 tabular-nums">
              {info.started_at != null ? formatDate(info.started_at) : '未開始'}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 mb-0.5">終了日</dt>
            <dd className="text-zinc-300 tabular-nums">
              {info.ended_at != null ? formatDate(info.ended_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 mb-0.5">作成日</dt>
            <dd className="text-zinc-300 tabular-nums">{formatDate(info.created_at)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 mb-0.5">コード側定義</dt>
            <dd className={configFromCode ? 'text-zinc-300' : 'text-red-400'}>
              {configFromCode ? '存在' : 'experiments.ts に無し'}
            </dd>
          </div>
        </dl>
      </section>

      {/* フィルタ */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-300 mb-4">フィルタ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">開始日（from）</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">終了日（to）</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">オファー</span>
            <select
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="">すべて</option>
              {offers.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">ページ</span>
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="">すべて</option>
              {pages.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => applyFilters()}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            適用
          </button>
          <button
            onClick={resetFilters}
            disabled={isPending}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-sm font-semibold py-2 px-4 rounded-lg border border-zinc-700 transition-colors"
          >
            リセット
          </button>
        </div>
      </section>

      {/* バリアント別集計 */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-300">バリアント別集計</h2>
        </div>
        {variantStats.length === 0 ? (
          <p className="px-5 py-8 text-center text-zinc-500 text-sm">
            この実験にはバリアントが登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/50 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold"></th>
                  <th className="px-4 py-3 text-left font-semibold">name</th>
                  <th className="px-4 py-3 text-right font-semibold">weight</th>
                  <th className="px-4 py-3 text-right font-semibold">unique visitors</th>
                  <th className="px-4 py-3 text-right font-semibold">impressions</th>
                  <th className="px-4 py-3 text-right font-semibold">clicks</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
                </tr>
              </thead>
              <tbody>
                {variantStats.map((v) => {
                  const color = variantColor(v.id, variantIds);
                  const isBest =
                    bestCtr != null && v.ctr != null && v.ctr === bestCtr && v.impressions > 0;
                  return (
                    <tr
                      key={v.id}
                      className={`border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30 ${
                        isBest ? 'border-l-2 border-l-green-500' : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <td className="pl-3 pr-0 py-3">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-200">{v.name}</div>
                        <code className="text-xs text-zinc-500">{v.id}</code>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">{v.weight}</td>
                      <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                        {formatNumber(v.unique_visitors)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                        {formatNumber(v.impressions)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                        {formatNumber(v.clicks)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums font-semibold ${
                          isBest ? 'text-green-400' : 'text-zinc-300'
                        }`}
                      >
                        {v.ctr != null ? `${v.ctr.toFixed(2)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-5 py-3 text-xs text-zinc-600 bg-zinc-950/30 border-t border-zinc-800">
          判定目安: 各バリアント 1000 インプレッション以上かつ CTR 差が十分に大きいこと（docs/MONETIZATION.md §4.8）。
        </p>
      </section>

      {/* グラフ: インプレッション */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-300 mb-4">日次インプレッション推移</h2>
        {impressionsData.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-10">データがありません</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impressionsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {variantIds.map((vid) => (
                  <Line
                    key={vid}
                    type="monotone"
                    dataKey={vid}
                    name={variantStats.find((v) => v.id === vid)?.name ?? vid}
                    stroke={variantColor(vid, variantIds)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* グラフ: クリック */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-zinc-300 mb-4">日次クリック推移</h2>
        {clicksData.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-10">データがありません</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clicksData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {variantIds.map((vid) => (
                  <Line
                    key={vid}
                    type="monotone"
                    dataKey={vid}
                    name={variantStats.find((v) => v.id === vid)?.name ?? vid}
                    stroke={variantColor(vid, variantIds)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  );
}
