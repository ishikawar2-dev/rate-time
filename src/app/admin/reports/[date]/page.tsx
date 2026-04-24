import { notFound } from 'next/navigation';
import { getDailyReportByDate } from '@/lib/admin-queries';
import { ReportDetailClient } from './ReportDetailClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{ date: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminReportDetailPage({ params, searchParams }: PageProps) {
  const { date } = await params;
  const sp = await searchParams;
  const project = (typeof sp.project === 'string' && sp.project.length > 0) ? sp.project : 'rate-time';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const row = await getDailyReportByDate(project, date);
  if (!row) {
    notFound();
  }

  return <ReportDetailClient row={row} />;
}
