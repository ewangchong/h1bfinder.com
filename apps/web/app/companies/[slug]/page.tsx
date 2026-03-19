import Link from 'next/link';
import type { Metadata } from 'next';
import { getAvailableYears, getCompanyBySlug, getCompanyInsightsBySlug } from '@/lib/h1bApi';

type TrendPoint = { year: number; filings: number; approvals: number };

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ year?: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  let companyName = slug.replace(/-/g, ' ').toUpperCase();
  let desc = `Review H1B visa sponsorship history, salaries, and approval rates for ${companyName}. Discover top roles and locations.`;
  
  try {
    const c = await getCompanyBySlug(slug, sp.year);
    if (c && c.name) {
      companyName = c.name;
      const filed = c.h1b_applications_filed?.toLocaleString() || 'multiple';
      desc = `Review H1B visa sponsorship history for ${companyName}. See top roles, locations, and data from ${filed} recent LCA certifications.`;
    }
  } catch (e) {
    // fallback to slug
  }

  return {
    title: `${companyName} H1B Visa Sponsorships & Salaries`,
    description: desc,
    alternates: { canonical: `/companies/${slug}${sp.year ? `?year=${sp.year}` : ''}` },
  };
}

export default async function CompanyDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const requestedYear = sp.year;

  let c;
  try {
    c = await getCompanyBySlug(slug, requestedYear);
  } catch (e: any) {
    return (
      <div style={{ padding: '64px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#0f172a', fontSize: 24, fontWeight: 800 }}>Company</h1>
        <p style={{ color: '#ef4444', marginTop: 12 }}>Failed to load company.</p>
        <pre style={{ color: '#64748b', marginTop: 8, fontSize: 13, background: '#f8fafc', padding: 16, borderRadius: 12, display: 'inline-block' }}>
          {String(e?.message || e)}
        </pre>
      </div>
    );
  }

  const year = sp.year || String(c.last_h1b_filing_year || 2024);

  let insights;
  try {
    insights = await getCompanyInsightsBySlug(slug, year);
  } catch {
    insights = { top_titles: [], top_states: [], trend: [] };
  }

  const hasInsights =
    (insights.top_titles && insights.top_titles.length > 0) ||
    (insights.top_states && insights.top_states.length > 0) ||
    (insights.trend && insights.trend.length > 0);

  const filed = c.h1b_applications_filed ?? 0;
  const approved = c.h1b_applications_approved ?? 0;
  const rate = filed > 0 ? approved / filed : null;
  const stability = getSponsorStability(insights.trend ?? []);

  const hq = [c.headquarters_city, c.headquarters_state, c.headquarters_country].filter(Boolean).join(', ');

  const globalYears = (await getAvailableYears()).map(String);
  const companyYears = insights.trend?.length > 0 
    ? [...insights.trend].reverse().map((t: any) => String(t.year))
    : globalYears;

  return (
    <article style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* 1. Page Header / Hero */}
      <div style={{ 
        textAlign: 'center', 
        padding: '64px 20px 48px',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: '#f1f5f9',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 24,
            color: '#475569',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            {initials(c.name)}
          </div>
        </div>
        
        <h1 style={{ 
          margin: 0, 
          fontSize: 'clamp(32px, 5vw, 48px)', 
          letterSpacing: '-0.04em',
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.1
        }}>
          {c.name}
        </h1>
        
        <div style={{ 
          marginTop: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>{hq || 'Verified Sponsor'}</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 999,
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Active Sponsor
          </span>
        </div>

        {/* Year Toggle */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            padding: '6px', 
            background: '#f8fafc', 
            borderRadius: 999,
            border: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {companyYears.map((y) => {
              const isActive = y === year;
              return (
                <Link
                  key={y}
                  href={`/companies/${slug}?year=${y}`}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: isActive ? '#0f172a' : 'transparent',
                    color: isActive ? '#fff' : '#475569',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  FY{y}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        
        {/* 2. Key Metrics Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 16,
          marginBottom: 32
        }}>
          <BigStat label="Approval Rate" value={rate === null ? '—' : `${(rate * 100).toFixed(1)}%`} subtext={`FY${year} benchmark`} />
          <BigStat label="Total Filings" value={filed ? filed.toLocaleString() : '—'} subtext="LCA disclosure files" />
          <BigStat label="Total Approvals" value={approved ? approved.toLocaleString() : '—'} subtext="Certified applications" />
          <BigStat
            label="Sponsor Stability"
            value={stability.label}
            subtext={stability.explanation}
            valueColor={stability.color}
          />
        </div>

        {!hasInsights ? (
          <div style={{ 
            marginTop: 48, 
            textAlign: 'center', 
            color: '#64748b', 
            padding: '48px 24px',
            background: '#f8fafc',
            borderRadius: 24,
            border: '1px dashed #e2e8f0'
          }}>
            No filings detected for FY{year}. Perspective shifted? Check <Link href={`/companies/${slug}?year=${c.last_h1b_filing_year || 2023}`} style={{ fontWeight: 800, color: '#0f172a' }}>FY{c.last_h1b_filing_year || 2023}</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            
            {/* Top Titles Card */}
            <div style={cardStyle}>
              <h2 style={cardTitleStyle}>Top Roles Sponsored</h2>
              <div style={{ marginTop: 20 }}>
                {insights.top_titles.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {insights.top_titles.map((t) => (
                      <div key={t.title} style={{ 
                        padding: '16px', 
                        borderRadius: 16, 
                        border: '1px solid #f1f5f9',
                        background: '#f8fafc'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>
                            {t.title_slug ? (
                              <Link href={`/titles/${t.title_slug}?year=${year}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {t.title}
                              </Link>
                            ) : (
                              t.title
                            )}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '4px 8px', borderRadius: 8 }}>
                            {t.filings.toLocaleString()} filings
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                          {t.approvals.toLocaleString()} approvals · {t.filings > 0 ? (t.approvals/t.filings*100).toFixed(1) : 0}% rate
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8' }}>No title-specific data for this period.</div>
                )}
              </div>
            </div>

            {/* Geographic & Trend Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div style={cardStyle}>
                <h2 style={cardTitleStyle}>Geographic Focus</h2>
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {insights.top_states.length ? (
                    insights.top_states.map((s: any) => (
                      <div key={s.state} style={{ 
                        padding: '10px 16px', 
                        borderRadius: 12, 
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#0f172a'
                      }}>
                        {s.state} <span style={{ color: '#64748b', fontWeight: 500, marginLeft: 4 }}>({s.filings.toLocaleString()})</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#94a3b8' }}>No geographic data.</div>
                  )}
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={cardTitleStyle}>Multi-Year Trend</h2>
                <div style={{ marginTop: 20 }}>
                   {insights.trend.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {insights.trend.map((t: any) => (
                        <div key={t.year} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>FY{t.year}</div>
                          <div style={{ flex: 1, height: 8, background: '#f1f5f9', margin: '0 16px', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                             <div style={{ 
                               position: 'absolute', 
                               left: 0, 
                               top: 0, 
                               bottom: 0, 
                               width: `${Math.min(100, (t.filings / filed) * 100)}%`, 
                               background: '#4F46E5',
                               borderRadius: 4
                             }} />
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: '#475569', minWidth: 80, textAlign: 'right' }}>
                            {t.filings.toLocaleString()} <span style={{ color: '#94a3b8', fontWeight: 500 }}>cases</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8' }}>No historical trend data.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        <div style={{ marginTop: 64, borderTop: '1px solid #f1f5f9', paddingTop: 24, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, maxWidth: 800, margin: '0 auto' }}>
             Data is aggregated from U.S. Department of Labor (DOL) LCA disclosure records. This represents historical filing patterns and satisfies no guarantee of future sponsorship or visa eligibility. Not legal advice.
          </p>
        </div>
      </div>

    </article>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 24,
  padding: 24,
  background: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.02em'
};

function BigStat({
  label,
  value,
  subtext,
  valueColor,
}: {
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: '24px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div
        style={{
          fontWeight: 900,
          marginTop: 12,
          fontSize: 32,
          color: valueColor || '#0f172a',
          letterSpacing: '-0.04em',
        }}
      >
        {value}
      </div>
      <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, fontWeight: 500 }}>{subtext}</div>
    </div>
  );
}

function getSponsorStability(trend: TrendPoint[]) {
  if (!trend.length) {
    return {
      label: 'Moderate',
      color: '#b45309',
      explanation: 'No multi-year filing history available yet.',
    };
  }

  const sorted = [...trend].sort((a, b) => a.year - b.year);
  const lastYear = sorted[sorted.length - 1].year;
  const firstYear = Math.max(sorted[0].year, lastYear - 4);
  const filingsByYear = new Map(sorted.map((point) => [point.year, point.filings]));
  const recentSeries = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const year = firstYear + index;
    return { year, filings: filingsByYear.get(year) ?? 0 };
  });

  if (recentSeries.length < 2) {
    return {
      label: 'Moderate',
      color: '#b45309',
      explanation: `Only ${recentSeries.length} recent filing year on record.`,
    };
  }

  const filings = recentSeries.map((point) => point.filings);
  const mean = filings.reduce((sum, value) => sum + value, 0) / filings.length;
  const variance = filings.reduce((sum, value) => sum + (value - mean) ** 2, 0) / filings.length;
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const zeroYears = filings.filter((value) => value === 0).length;
  const activeYears = filings.length - zeroYears;
  const yoySwings = recentSeries
    .slice(1)
    .map((point, index) => {
      const previous = recentSeries[index].filings;
      if (previous === 0) return point.filings > 0 ? 1 : 0;
      return Math.abs(point.filings - previous) / previous;
    });
  const avgSwing = yoySwings.length
    ? yoySwings.reduce((sum, value) => sum + value, 0) / yoySwings.length
    : 0;

  if (zeroYears === 0 && activeYears >= 3 && coefficientOfVariation <= 0.35) {
    return {
      label: 'Stable',
      color: '#059669',
      explanation: `${activeYears} straight filing years with ${(avgSwing * 100).toFixed(0)}% average volume swings.`,
    };
  }

  if (zeroYears > 0 || coefficientOfVariation >= 0.75 || avgSwing >= 0.6) {
    const gapText = zeroYears > 0 ? `${zeroYears} zero/gap year${zeroYears > 1 ? 's' : ''}` : `${(avgSwing * 100).toFixed(0)}% average swings`;
    return {
      label: 'Volatile',
      color: '#dc2626',
      explanation: `${gapText} across the last ${recentSeries.length} years of filings.`,
    };
  }

  return {
    label: 'Moderate',
    color: '#b45309',
    explanation: `${activeYears} active years with ${(avgSwing * 100).toFixed(0)}% average filing swings recently.`,
  };
}

function initials(name: string) {
  const parts = name
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] || 'H';
  const b = parts[1]?.[0] || parts[0]?.[1] || 'B';
  return (a + b).toUpperCase();
}
