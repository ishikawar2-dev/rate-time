import type { MetadataRoute } from 'next';

const BASE = 'https://rate-time.com';

// コラムを更新したらここの日付を更新する
const PAGE_DATES = {
  '/': '2026-04-25',
  '/column/saimu-seiri': '2026-04-25',
  '/column/omatome-loan': '2026-04-25',
  '/column/kinri-hikaku': '2026-04-25',
  '/column/kinri-keisan': '2026-04-10',
  '/column/jisshitsu-nenritsu': '2026-04-15',
  '/column/fukuri-tanri-chigai': '2026-04-18',
  '/column/shakkin-heranai': '2026-04-22',
  '/column/timer-katsuyou': '2026-04-25',
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
      url: `${BASE}/column/kinri-keisan`,
      lastModified: new Date(PAGE_DATES['/column/kinri-keisan']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/column/jisshitsu-nenritsu`,
      lastModified: new Date(PAGE_DATES['/column/jisshitsu-nenritsu']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/column/fukuri-tanri-chigai`,
      lastModified: new Date(PAGE_DATES['/column/fukuri-tanri-chigai']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/column/shakkin-heranai`,
      lastModified: new Date(PAGE_DATES['/column/shakkin-heranai']),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/column/timer-katsuyou`,
      lastModified: new Date(PAGE_DATES['/column/timer-katsuyou']),
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
