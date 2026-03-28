import type { MetadataRoute } from 'next';
import { blogPosts } from './blog/posts';
import { listCompanies, getTitles } from '@/lib/h1bApi';
import { STATES } from '@/lib/states';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://h1bfinder.com';

  let topCompanies: any[] = [];
  try {
    const res = await listCompanies({ size: 1000, sortBy: 'filed', sortDirection: 'DESC' });
    topCompanies = res.content || [];
  } catch (e) {
    console.error('Failed to load companies for sitemap', e);
  }

  let topTitles: any[] = [];
  try {
     topTitles = await getTitles({ limit: 1000 });
  } catch (e) {
    console.error('Failed to load titles for sitemap', e);
  }

  const companyUrls: MetadataRoute.Sitemap = topCompanies.filter(c => c.slug).map(c => ({
    url: `${siteUrl}/companies/${c.slug}-h1b-sponsorship`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }));

  const titleUrls: MetadataRoute.Sitemap = topTitles.filter(t => t.slug).map(t => ({
    url: `${siteUrl}/titles/${t.slug}-h1b-sponsors`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }));

  return [
    { url: `${siteUrl}/`, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    { url: `${siteUrl}/companies`, lastModified: new Date() },
    { url: `${siteUrl}/jobs`, lastModified: new Date() },
    { url: `${siteUrl}/titles`, lastModified: new Date() },
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...companyUrls,
    ...titleUrls,
    ...STATES.map(s => ({
      url: `${siteUrl}/states/${s.name.toLowerCase().replace(/ /g, '-')}-h1b-sponsors`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
    })),
    { url: `${siteUrl}/guides/how-to-find-h1b-sponsors`, lastModified: new Date() },
    { url: `${siteUrl}/guides/cap-exempt-h1b-sponsors`, lastModified: new Date() },
    { url: `${siteUrl}/guides/highest-paying-h1b-sponsors`, lastModified: new Date() },
    { url: `${siteUrl}/guides/h1b-sponsors-in-texas`, lastModified: new Date() }
  ];
}
