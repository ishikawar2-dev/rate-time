import { getDailyReports, getReportSummary } from '@/lib/admin-queries';
import { ReportsListClient } from './ReportsListClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** JST で今日の日付を YYYY-MM-DD で返す */
function todayJST(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
}

/** 指定日の n 日前（JST）を YYYY-MM-DD で返す */
function shiftJSTDate(date: string, days: number): string {
  const t = new Date(`${date}T00:00:00+09:00`).getTime() + days * 24 * 3600 * 1000;
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date(t));
}

function validDate(s: unknown): string | null {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const project = (typeof sp.project === 'string' && sp.project.length > 0) ? sp.project : 'rate-time';

  const today = todayJST();
  const from = validDate(sp.from) ?? shiftJSTDate(today, -6); // 直近 7 日（今日含む）
  const to = validDate(sp.to) ?? today;

  const [reports, summary] = await Promise.all([
    getDailyReports(project, from, to),
    getReportSummary(project, from, to),
  ]);

  return (
    <ReportsListClient
      project={project}
      from={from}
      to={to}
      reports={reports}
      summary={summary}
    />
  );
}
