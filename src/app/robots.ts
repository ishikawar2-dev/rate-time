import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/timer/', '/api/', '/admin/'],
      },
    ],
    sitemap: 'https://rate-time.com/sitemap.xml',
  };
}
