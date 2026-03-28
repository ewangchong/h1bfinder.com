import Link from 'next/link';
import type { Metadata } from 'next';
import RankingsControls from './RankingsControls';
import HomeHeroActions from './HomeHeroActions';
import HomeLeadCapture from './HomeLeadCapture';
import HomeQuickSearch from './HomeQuickSearch';
import HomeRecentSearches from './HomeRecentSearches';
import { getAvailableYears, listCompanies, getTitles } from '@/lib/h1bApi';
import { STATES } from '@/lib/states';

export const metadata: Metadata = {
  title: 'H1B Finder | Find Sponsors That Actually Sponsor H1B Visas',
  description: 'Search 4M+ official DOL records. Find H1B-friendly sponsors, jobs, and salary history. Generate a personalized H1B action plan today.',
  keywords: ['h1b sponsor companies', 'companies that sponsor h1b', 'h1b jobs by company', 'top h1b sponsors', 'h1b database', 'h1b plan'],
  alternates: { canonical: '/' },
};

const JOURNEY_PATHS = [
  {
    href: '/plan',
    kicker: 'Recommended First Step',
    title: 'Get Your Personalized H1B Plan',
    copy: 'Answer a few questions to receive a tailored roadmap, recommended sponsors, and a step-by-step checklist based on your specific role and location.',
    linkLabel: 'Generate My Plan',
  },
  {
    href: '/companies',
    kicker: 'Data Research',
    title: 'Browse H1B-Friendly Employers',
    copy: 'Access filing history for over 50,000 sponsors. Compare approval counts, salary benchmarks, and consistency across recent fiscal years.',
    linkLabel: 'Filter Sponsors',
  },
  {
    href: '/titles',
    kicker: 'Skill Validation',
    title: 'Identify High-Demand Jobs',
    copy: 'Discover which roles have the strongest historical sponsorship signals to focus your applications where you have the best chance of success.',
    linkLabel: 'Explore Jobs',
  },
];

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
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'H1B Finder',
    url: 'https://h1bfinder.com',
  };

  return (
    <div className="landing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <section className="landing-hero">
        <div className="landing-hero-eyebrow">4M+ records • FY2025 Data • Official DOL Source</div>
        <h1 className="landing-hero-title">
          Find employers that actually
          <br />
          <span className="landing-hero-highlight">sponsor H1B visas.</span>
        </h1>
        <p className="landing-hero-copy">
          Stop applying blindly. Search verified filing history to identify H1B-friendly employers, salary benchmarks, and jobs before you wasting time on applications.
        </p>

        <HomeHeroActions />
        
        <div id="quick-search" className="landing-search-wrap">
          <HomeQuickSearch />
          <HomeRecentSearches />
        </div>
      </section>

      <HomeLeadCapture />

      <section className="landing-proof-strip">
        <div className="landing-proof-metric">
          <div className="landing-proof-value">4M+</div>
          <div className="landing-proof-label">Official Records</div>
        </div>
        <div className="landing-proof-divider" />
        <div className="landing-proof-metric">
          <div className="landing-proof-value">3 Paths</div>
          <div className="landing-proof-label">Plan • Research • Map</div>
        </div>
        <div className="landing-proof-divider" />
        <div className="landing-proof-metric">
          <div className="landing-proof-value">FY2025</div>
          <div className="landing-proof-label">Latest Official Data</div>
        </div>
      </section>

      <section className="landing-path-grid">
        {JOURNEY_PATHS.map((path) => (
          <Link key={path.href} href={path.href} className="landing-path-card">
            <div className="landing-path-kicker">{path.kicker}</div>
            <div className="landing-path-title">{path.title}</div>
            <div className="landing-path-copy">{path.copy}</div>
            <div className="landing-path-link">{path.linkLabel} →</div>
          </Link>
        ))}
      </section>

      <section className="landing-module-grid">
        <div>
          <div className="landing-module-head">
            <div>
              <h2 className="landing-module-title">Top Sponsors</h2>
              <div className="landing-module-copy">Employers with high historical filing volumes</div>
            </div>
            <Link href="/companies" className="landing-module-link">See all sponsors →</Link>
          </div>
          <div className="landing-card-stack">
            {topCompanies.map((c) => (
              <Link key={c.id} href={`/companies/${c.slug || c.id}-h1b-sponsorship`} className="landing-stat-card">
                <div className="landing-card-title">{c.name}</div>
                <div className="landing-card-stats">
                  <div><span style={{ color: '#64748b' }}>Filed:</span> <strong style={{color: '#0f172a'}}>{c.h1b_applications_filed?.toLocaleString() || '0'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Approved:</span> <strong style={{color: '#10b981'}}>{c.h1b_applications_approved?.toLocaleString() || '0'}</strong></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="landing-module-head">
            <div>
              <h2 className="landing-module-title">Top Jobs</h2>
              <div className="landing-module-copy">Roles showing strongest sponsorship demand</div>
            </div>
            <Link href="/titles" className="landing-module-link">See all jobs →</Link>
          </div>
          <div className="landing-card-stack">
            {topTitles.map((t) => (
              <Link key={t.slug} href={`/titles/${t.slug}-h1b-sponsors?year=${year}`} className="landing-stat-card">
                <div className="landing-card-title">{t.title}</div>
                <div className="landing-card-stats">
                  <div><span style={{ color: '#64748b' }}>Filings:</span> <strong style={{color: '#0f172a'}}>{t.filings.toLocaleString()}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Latest:</span> <strong style={{color: '#0f172a'}}>FY{t.last_year}</strong></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </section>

      <section className="landing-module-section">
        <div className="landing-module-head" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: 32 }}>
          <div>
            <h2 className="landing-module-title" style={{ fontSize: 32 }}>H1B Sponsorship Hubs</h2>
            <div className="landing-module-copy">Geographic centers with the highest historical filing volume</div>
          </div>
        </div>
        <div className="landing-states-grid">
          {[
            'California', 'Texas', 'New York', 'Washington', 'New Jersey', 
            'Illinois', 'Massachusetts', 'Georgia', 'Pennsylvania', 'Michigan', 
            'Florida', 'Virginia', 'North Carolina', 'Ohio', 'Maryland'
          ].map((stateName, idx) => {
            const s = STATES.find(x => x.name === stateName);
            if (!s) return null;
            return (
              <Link 
                key={s.code} 
                href={`/states/${s.name.toLowerCase().replace(/ /g, '-')}-h1b-sponsors`}
                className="landing-state-card"
              >
                <div className="landing-state-rank">{idx + 1}</div>
                <div className="landing-state-info">
                  <div className="landing-state-name">{s.name}</div>
                  <div className="landing-state-code">{s.code} • Major Hub</div>
                </div>
                <div className="landing-state-action">View Data →</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="landing-teaser-grid">
        <Link href="/plan" className="landing-teaser-card">
          <div className="landing-teaser-kicker landing-teaser-kicker-indigo">Recommended</div>
          <div className="landing-teaser-title">Start with a roadmap</div>
          <div className="landing-teaser-copy">Unsure where to start? Our H1B Plan Generator builds a customized search strategy based on your role and location. →</div>
        </Link>
        <Link href="/chat" className="landing-teaser-card">
          <div className="landing-teaser-kicker landing-teaser-kicker-sky">AI Assistant</div>
          <div className="landing-teaser-title">Chat with our datasets</div>
          <div className="landing-teaser-copy">Ask specific questions about sponsor trends or salary benchmarks using our AI-agent chat interface. →</div>
        </Link>
      </section>

      <section id="faq" className="landing-faq">
        <div className="landing-faq-container">
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em'}}>Frequently Asked Questions</h2>
          <div className="landing-faq-grid">
            <div className="landing-faq-item">
              <h3>What is H1B Finder?</h3>
              <p>H1B Finder is a data tool designed to help international job seekers find H1B-friendly sponsors. We aggregate millions of official Department of Labor disclosure records into a searchable interface.</p>
            </div>
            <div className="landing-faq-item">
              <h3>Which employers sponsor the most H1B visas?</h3>
              <p>Employers like Amazon, Google, Microsoft, and large consulting firms (Infosys, Tata) are historically top sponsors. You can browse our <Link href="/companies" style={{color: '#4f46e5', fontWeight: 700}}>Top Sponsors</Link> page for the latest rankings.</p>
            </div>
            <div className="landing-faq-item">
              <h3>Does an LCA filing guarantee a job opening?</h3>
              <p>No. A Labor Condition Application (LCA) filing reflects a company's intent to sponsor for a specific role at a point in time. It is a historical signal of sponsorship friendliness, not a live job board.</p>
            </div>
            <div className="landing-faq-item">
              <h3>How do I get a personalized H1B plan?</h3>
              <p>Visit our <Link href="/plan" style={{color: '#4f46e5', fontWeight: 700}}>My Plan</Link> page. Answer a few questions about your background and target state, and we will generate a tailored search roadmap for you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-power-users">
        <div className="landing-power-users-inner">
          <span className="landing-power-users-eyebrow">For Developers & AI Agents</span>
          <h2 className="landing-power-users-title">OpenClaw Integration</h2>
          <p className="landing-power-users-copy">Use H1B Finder intelligence in your own terminal or AI agents via OpenClaw skills.</p>
          
          <div className="landing-terminal" style={{ textAlign: 'left', background: '#0f172a', border: '1px solid #334155' }}>
            <div className="landing-terminal-lights">
              <div className="landing-terminal-light landing-terminal-light-red" />
              <div className="landing-terminal-light landing-terminal-light-amber" />
              <div className="landing-terminal-light landing-terminal-light-green" />
            </div>
            <div className="landing-terminal-command">
              <span className="landing-terminal-prompt">&gt;</span>{' '}
              <span className="landing-terminal-value">claw install h1b-finder</span>
            </div>
            <div className="landing-terminal-examples" style={{ color: '#64748b' }}>
              <div><strong className="landing-terminal-label">Integration:</strong> Connect verified H1B data to your local AI coding agents</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
