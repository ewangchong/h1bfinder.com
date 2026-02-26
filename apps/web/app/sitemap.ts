import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://h1bfriend.com';

  // Phase 1: keep it small and correct. Phase 2 will expand this with programmatic pages.
  return [
    { url: `${siteUrl}/`, lastModified: new Date() },
    { url: `${siteUrl}/guides`, lastModified: new Date() },
    { url: `${siteUrl}/companies`, lastModified: new Date() },
    { url: `${siteUrl}/jobs`, lastModified: new Date() },
    { url: `${siteUrl}/guides/h1b-lottery-timeline`, lastModified: new Date() },
    { url: `${siteUrl}/guides/opt-to-h1b`, lastModified: new Date() },
  ];
}
