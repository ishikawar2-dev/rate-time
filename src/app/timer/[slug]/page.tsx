import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTimerWithEntries } from '@/lib/db';
import { TimerClient } from './TimerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TimerPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const editToken = typeof sp.e === 'string' ? sp.e : null;

  const data = await getTimerWithEntries(slug);
  if (!data) notFound();

  return <TimerClient timer={data} initialEntries={data.entries} editToken={editToken} />;
}
