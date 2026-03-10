import Link from 'next/link';
import type { Metadata } from 'next';
import RankingsControls from './RankingsControls';
import { getAvailableYears, listCompanies, getTitles } from '@/lib/h1bApi';

export const metadata: Metadata = {
  title: 'H1B Finder: The Verified AI Skill for Your Career',
  description: 'Grounded in 4M+ records from DOL. Bring verified H1B insights directly into your OpenClaw workspace.',
  keywords: ['h1b', 'h1b sponsor', 'h1b database', 'h1b jobs', 'h1b visa', 'openclaw', 'ai agent'],
  alternates: { canonical: '/' },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const sp = await searchParams;
  const years = (await getAvailableYears()).map(String);
  const year = sp.year || years[0] || '2025';

  const [companiesRes, titlesRes, allTitlesRes] = await Promise.allSettled([
    listCompanies({ year, size: 4, sortBy: 'filed', sortDirection: 'DESC' }),
    getTitles({ year, limit: 4 }),
    getTitles({ year, limit: 50 })
  ]);

  const topCompanies = companiesRes.status === 'fulfilled' ? companiesRes.value.content : [];
  const topTitles = titlesRes.status === 'fulfilled' ? titlesRes.value : [];
  const allTitles = allTitlesRes.status === 'fulfilled' ? allTitlesRes.value.map(t => ({ title: t.title, slug: t.slug })) : [];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* 1. Hero */}
      <section style={{ textAlign: 'center', padding: '64px 20px 48px' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(36px, 6vw, 64px)',
          letterSpacing: '-0.04em',
          fontWeight: 900,
          lineHeight: 1.1,
          color: '#0f172a'
        }}>
          Give Your AI Agent<br />
          <span style={{ 
            background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Verified H1B Intelligence</span>
        </h1>
        <p style={{
          margin: '20px auto 32px',
          maxWidth: 640,
          color: '#475569',
          lineHeight: 1.6,
          fontSize: 'clamp(18px, 2.5vw, 20px)',
          fontWeight: 500
        }}>
          Stop searching manually. Install the official OpenClaw skill to query millions of DOL sponsorship records directly from your workspace.
        </p>

        {/* Terminal Block */}
        <div style={{
          margin: '0 auto',
          background: '#020617',
          borderRadius: 16,
          padding: '24px',
          textAlign: 'left',
          maxWidth: 580,
          border: '1px solid #1e293b',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          </div>
          <div style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: 16 }}>
            <span style={{ color: '#a1a1aa' }}>$</span> <span style={{ color: '#818cf8', fontWeight: 700 }}>npx clawhub install h1b-finder</span>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e293b', color: '#94a3b8', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><strong style={{color: '#f8fafc'}}>Example:</strong> "Which Austin companies sponsor Data Scientists?"</div>
            <div><strong style={{color: '#f8fafc'}}>Example:</strong> "Compare H1B salaries for Meta and Apple"</div>
          </div>
        </div>

        {/* Hero CTAs */}
        <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" style={{ 
            background: '#4f46e5', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 16, transition: 'background 0.2s', border: '1px solid #4f46e5'
          }}>Install Skill</a>
          <Link href="/companies" style={{ 
            background: '#fff', color: '#0f172a', padding: '14px 28px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>Explore Sponsors</Link>
        </div>
      </section>

      {/* 2. Proof Strip */}
      <section style={{ 
        display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', 
        padding: '32px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>4M+</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Official DOL Records</div>
        </div>
        <div style={{ width: 1, background: '#e2e8f0', margin: '0 16px' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>FY2025</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Latest Data Included</div>
        </div>
        <div style={{ width: 1, background: '#e2e8f0', margin: '0 16px' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>100%</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Verified Sponsor Signal</div>
        </div>
      </section>

      {/* 3. Lightweight Search Demo */}
      <section style={{ padding: '48px 20px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Test the Database</h2>
        <p style={{ color: '#475569', marginBottom: 24 }}>Search public LCA disclosures directly on the web before integrating the agent.</p>
        <RankingsControls defaultYear={year} years={years} titles={allTitles} />
      </section>

      {/* 4. Flagship Modules */}
      <section style={{ padding: '24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
        
        {/* Top Sponsors */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#0f172a' }}>Top Sponsors</h2>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Employers filing the most H1B cases</div>
            </div>
            <Link href="/companies" style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {topCompanies.map((c) => (
              <Link key={c.id} href={`/companies/${c.slug || c.id}`} style={{
                display: 'block', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', textDecoration: 'none', color: '#0f172a', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <div><span style={{ color: '#64748b' }}>Filed:</span> <strong style={{color: '#0f172a'}}>{c.h1b_applications_filed?.toLocaleString() || '0'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Approved:</span> <strong style={{color: '#10b981'}}>{c.h1b_applications_approved?.toLocaleString() || '0'}</strong></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Jobs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#0f172a' }}>Top Jobs</h2>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Roles with the highest sponsorship demand</div>
            </div>
            <Link href="/titles" style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {topTitles.map((t) => (
              <Link key={t.slug} href={`/titles/${t.slug}?year=${year}`} style={{
                display: 'block', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', textDecoration: 'none', color: '#0f172a', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <div><span style={{ color: '#64748b' }}>Filings:</span> <strong style={{color: '#0f172a'}}>{t.filings.toLocaleString()}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Latest:</span> <strong style={{color: '#0f172a'}}>FY{t.last_year}</strong></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* 5. Teasers (Deprioritized) */}
      <section style={{ padding: '48px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <Link href="/plan" style={{
          display: 'block', padding: 24, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a'
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Action Plan</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>My Plan Generator</div>
          <div style={{ color: '#475569', fontSize: 14, lineHeight: 1.5 }}>Generate a personalized step-by-step roadmap from OPT to H1B based on your target role and timeline. →</div>
        </Link>
        <Link href="/chat" style={{
          display: 'block', padding: 24, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a'
        }}>
           <div style={{ fontSize: 12, fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ask the Data</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Web AI Chat</div>
          <div style={{ color: '#475569', fontSize: 14, lineHeight: 1.5 }}>Don't have an OpenClaw workspace yet? Try our basic web-based AI assistant to ask questions naturally. →</div>
        </Link>
      </section>

    </div>
  );
}
