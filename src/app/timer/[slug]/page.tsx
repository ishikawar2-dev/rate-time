import { notFound } from 'next/navigation';
import { getTimerWithEntries } from '@/lib/db';
import { TimerClient } from './TimerClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TimerPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTimerWithEntries(slug);
  if (!data) notFound();

  return <TimerClient timer={data} initialEntries={data.entries} />;
}
