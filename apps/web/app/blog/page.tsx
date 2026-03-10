import Link from 'next/link';
import type { Metadata } from 'next';
import { blogPosts } from './posts';

export const metadata: Metadata = {
  title: 'H1B Insights & Guides',
  description: 'Data-backed guides and analysis for H1B job seekers and sponsors.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 80 }}>
      
      {/* 1. Page Header / Hero */}
      <div style={{ textAlign: 'center', padding: '64px 20px 48px' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#4f46e5",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            background: "#eef2ff",
            padding: "6px 14px",
            borderRadius: 999,
          }}>
            Editorial
          </span>
        </div>
        <h1 style={{ 
          margin: 0, 
          fontSize: "clamp(32px, 5vw, 48px)", 
          letterSpacing: "-0.04em",
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.1
        }}>
          H1B Insights & Guides
        </h1>
        <p style={{
          margin: '18px auto 0',
          maxWidth: 640,
          color: '#475569',
          lineHeight: 1.7,
          fontSize: 'clamp(15px, 2vw, 17px)',
          fontWeight: 500
        }}>
          Data-backed analysis to help you navigate the H1B landscape. We break down sponsor quality, role-level demand, and search strategies.
        </p>

        <div style={{ marginTop: 32 }}>
          <Link href="/companies" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "#f8fafc",
            color: "#475569",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            border: "1px solid #e2e8f0",
            transition: "all 0.2s"
          }}>
            <span>Ready to search? Explore Top Sponsors</span>
            <span style={{ color: "#94a3b8" }}>→</span>
          </Link>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        
        {/* 2. Product Utility / Topics Row */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {featuredTopics.map((topic) => (
              <Link key={topic.title} href={topic.href} style={topicCardStyle}>
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 12, 
                  background: topic.accent, 
                  color: topic.tone, 
                  display: 'grid', 
                  placeItems: 'center', 
                  fontSize: 18, 
                  fontWeight: 900 
                }}>
                  {topic.title[0]}
                </div>
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.02em' }}>{topic.title}</h3>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>{topic.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Main Content Area / Articles */}
        <section>
          <div style={{ 
            marginBottom: 24, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: 16
          }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Recent Intelligence</h2>
            <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Showing {blogPosts.length} Guides
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {blogPosts.map((post) => (
              <article key={post.title} style={postCardStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {post.category}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#eef2ff',
                      color: '#4f46e5',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {post.status}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p style={{ margin: '10px 0 0', color: '#64748b', lineHeight: 1.7, fontSize: 15, fontWeight: 500 }}>{post.description}</p>
                  <div style={{ marginTop: 16 }}>
                    <Link href={`/blog/${post.slug}`} style={{ fontSize: 14, fontWeight: 800, textDecoration: 'none', color: '#4f46e5' }}>
                      Read article →
                    </Link>
                  </div>
                </div>
                <div style={{ 
                  color: '#94a3b8', 
                  fontSize: 13, 
                  fontWeight: 600, 
                  textAlign: 'right',
                  minWidth: 80
                }}>
                  {post.readingTime}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Cross-Nav / Status Strip */}
        <div style={{ 
          marginTop: 48, 
          padding: '24px', 
          borderRadius: 20, 
          background: '#fff', 
          border: '1px dashed #cbd5e1', 
          color: '#64748b', 
          lineHeight: 1.7,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 500
        }}>
          New guides are published weekly. For live filtering of the 4M+ records, explore the {' '}
          <Link href="/companies" style={{ borderBottom: '1px solid #94a3b8', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>Top Sponsors</Link> or {' '}
          <Link href="/titles" style={{ borderBottom: '1px solid #94a3b8', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>Top Roles</Link> dashboards.
        </div>

        {/* Footer Disclaimer Strip */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, maxWidth: 800, margin: "0 auto" }}>
             H1B Finder Editorial provides educational content and data analysis. We are not a law firm or recruitment agency. Information is based on public LCA disclosure interpretation.
          </p>
        </div>
      </div>
    </div>
  );
}

const featuredTopics = [
  {
    title: 'Company Deep Dives',
    description: 'Break down whether a sponsor is truly dependable, not just noisy.',
    href: '/companies',
    accent: '#eff6ff',
    tone: '#1d4ed8',
  },
  {
    title: 'Role Playbooks',
    description: 'Understand which titles are still attracting sustained H1B demand.',
    href: '/titles',
    accent: '#f0fdf4',
    tone: '#15803d',
  },
  {
    title: 'Search Strategy',
    description: 'Use public filing data to aim at sponsors with real historical intent.',
    href: '/',
    accent: '#fffbeb',
    tone: '#b45309',
  },
] as const;

const topicCardStyle: React.CSSProperties = {
  padding: '24px',
  borderRadius: 24,
  textDecoration: 'none',
  background: '#fff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const postCardStyle: React.CSSProperties = {
  padding: '28px',
  borderRadius: 24,
  border: '1px solid #e2e8f0',
  background: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  alignItems: 'start',
  flexWrap: 'wrap-reverse'
};
