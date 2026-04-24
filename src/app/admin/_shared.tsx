import type { ExperimentStatus } from '@/lib/experiments';

const BADGE_CLASSES: Record<ExperimentStatus, string> = {
  active: 'bg-green-900/40 text-green-400 border-green-800',
  paused: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  completed: 'bg-zinc-900 text-zinc-500 border-zinc-800',
};

const BADGE_LABELS: Record<ExperimentStatus, string> = {
  active: 'active',
  paused: 'paused',
  draft: 'draft',
  completed: 'completed',
};

export function StatusBadge({ status }: { status: ExperimentStatus }) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${BADGE_CLASSES[status]}`}
    >
      {BADGE_LABELS[status]}
    </span>
  );
}

export function formatDate(ms: number | null): string {
  if (ms == null) return '—';
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ja-JP');
}

export function formatCtr(impressions: number, clicks: number): string {
  if (impressions === 0) return '—';
  return `${((clicks / impressions) * 100).toFixed(2)}%`;
}
