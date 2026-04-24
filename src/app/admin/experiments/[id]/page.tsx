import { notFound } from 'next/navigation';
import {
  getDailyClicks,
  getDailyImpressions,
  getDistinctOffers,
  getDistinctPages,
  getExperimentInfo,
  getVariantStats,
  type FilterParams,
} from '@/lib/admin-queries';
import { getExperimentById } from '@/lib/experiments';
import { ExperimentDetail } from './ExperimentDetail';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseFilters(sp: Record<string, string | string[] | undefined>): FilterParams {
  const str = (v: string | string[] | undefined): string | null => {
    if (typeof v !== 'string' || v.length === 0) return null;
    return v;
  };
  const dateStart = (s: string | null): number | null => {
    if (!s) return null;
    // 'YYYY-MM-DD' を JST 00:00:00 の UNIX ms として解釈
    const d = new Date(`${s}T00:00:00+09:00`);
    return isNaN(d.getTime()) ? null : d.getTime();
  };
  const dateEnd = (s: string | null): number | null => {
    if (!s) return null;
    // 'YYYY-MM-DD' を JST 23:59:59.999 の UNIX ms として解釈
    const d = new Date(`${s}T23:59:59.999+09:00`);
    return isNaN(d.getTime()) ? null : d.getTime();
  };
  return {
    from: dateStart(str(sp.from)),
    to: dateEnd(str(sp.to)),
    offer: str(sp.offer),
    page: str(sp.page),
  };
}

export default async function ExperimentDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const info = await getExperimentInfo(id);
  if (!info) notFound();

  const configFromCode = getExperimentById(id);

  const [variantStats, dailyImpressions, dailyClicks, offers, pages] = await Promise.all([
    getVariantStats(id, filters),
    getDailyImpressions(id, filters),
    getDailyClicks(id, filters),
    getDistinctOffers(id),
    getDistinctPages(id),
  ]);

  return (
    <ExperimentDetail
      info={info}
      configFromCode={configFromCode}
      variantStats={variantStats}
      dailyImpressions={dailyImpressions}
      dailyClicks={dailyClicks}
      offers={offers}
      pages={pages}
      rawFilters={{
        from: typeof sp.from === 'string' ? sp.from : '',
        to: typeof sp.to === 'string' ? sp.to : '',
        offer: typeof sp.offer === 'string' ? sp.offer : '',
        page: typeof sp.page === 'string' ? sp.page : '',
      }}
    />
  );
}
