import Link from 'next/link';
import { listExperiments } from '@/lib/admin-queries';
import { StatusBadge, formatCtr, formatDate, formatNumber } from '../_shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ExperimentsListPage() {
  const rows = await listExperiments();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-100">実験一覧</h1>
        <span className="text-xs text-zinc-500">{rows.length} 件</span>
      </div>

      {rows.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          実験がまだ DB に登録されていません。
          <br />
          <span className="text-xs">
            （<code className="text-zinc-400">migrations/002_ab_testing.sql</code> の適用が必要です）
          </span>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/50 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID / 名前</th>
                  <th className="px-4 py-3 text-left font-semibold">ステータス</th>
                  <th className="px-4 py-3 text-left font-semibold">開始</th>
                  <th className="px-4 py-3 text-right font-semibold">variants</th>
                  <th className="px-4 py-3 text-right font-semibold">impressions</th>
                  <th className="px-4 py-3 text-right font-semibold">clicks</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
                  <th className="px-4 py-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-200">{r.name}</div>
                      <code className="text-xs text-zinc-500">{r.id}</code>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {r.started_at != null ? formatDate(r.started_at) : <span className="text-zinc-600">未開始</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                      {formatNumber(r.variant_count)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                      {formatNumber(r.impression_count)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                      {formatNumber(r.click_count)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                      {formatCtr(r.impression_count, r.click_count)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/experiments/${encodeURIComponent(r.id)}`}
                        className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                      >
                        詳細 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
