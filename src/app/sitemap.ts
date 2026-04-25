import type { MetadataRoute } from 'next';

const BASE = 'https://rate-time.com';

// コラムを更新したらここの日付を更新する
const PAGE_DATES = {
  '/': '2026-04-25',
  '/column/saimu-seiri': '2026-04-25',
  '/column/omatome-loan': '2026-04-25',
  '/column/kinri-hikaku': '2026-04-25',
  '/privacy': '2026-04-25',
  '/terms': '2026-04-25',
  '/disclosure': '2026-04-25',
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/`,
      lastModified: new Date(PAGE_DATES['/']),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/column/saimu-seiri`,
      lastModified: new Date(PAGE_DATES['/column/saimu-seiri']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/column/omatome-loan`,
      lastModified: new Date(PAGE_DATES['/column/omatome-loan']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/column/kinri-hikaku`,
      lastModified: new Date(PAGE_DATES['/column/kinri-hikaku']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(PAGE_DATES['/privacy']),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(PAGE_DATES['/terms']),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/disclosure`,
      lastModified: new Date(PAGE_DATES['/disclosure']),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
