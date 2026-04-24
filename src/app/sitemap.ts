import type { MetadataRoute } from 'next';

const BASE = 'https://rate-time.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: BASE, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/column/saimu-seiri`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/column/omatome-loan`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/column/kinri-hikaku`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/disclosure`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
