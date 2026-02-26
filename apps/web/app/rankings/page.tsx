import Link from 'next/link';
import type { Metadata } from 'next';
import { getAvailableYears, getRankings } from '@/lib/h1bApi';
import RankingsControls from './RankingsControls';

export const metadata: Metadata = {
  title: 'H1B Top Sponsors Rankings',
  description: 'Discover the top H1B visa sponsors by year, location, and job title.',
  alternates: { canonical: '/rankings' },
};

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    state?: string;
    city?: string;
    job_title?: string;
  }>;
}) {
  const sp = await searchParams;
  const years = (await getAvailableYears()).map(String);
  const year = sp.year || years[0] || '2025'; // Fallback to latest

  let rankings;
  try {
    rankings = await getRankings({
      year,
      state: sp.state,
      city: sp.city,
      job_title: sp.job_title,
      limit: 100, // Top 100 for rankings
    });
  } catch (e: any) {
    return (
      <div>
        <h1 style={{ margin: 0 }}>H1B Sponsor Rankings</h1>
        <p style={{ color: '#b00' }}>Failed to load rankings from API. Check H1B_API_BASE_URL.</p>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#555' }}>{String(e?.message || e)}</pre>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.02em' }}>H1B Sponsor Leaderboard</h1>
        <p style={{ margin: '10px auto 0', maxWidth: 760, color: '#555', lineHeight: 1.6 }}>
          Find the top H1B sponsoring companies for your specific role and location. 
          Ranked by number of approved applications.
        </p>
      </div>

      <RankingsControls defaultYear={year} years={years} />

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>
          Top {rankings.length} Sponsors
          {sp.state ? ` in ${sp.state}` : ''}
          {sp.job_title ? ` for "${sp.job_title}"` : ''}
          {` (FY${year})`}
        </div>
      </div>

      {rankings.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#777', background: '#fafafa', borderRadius: 12 }}>
          No sponsors found matching these filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rankings.map((r, i) => (
            <RankingCard key={r.employer_norm + i} rank={i + 1} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function RankingCard({ rank, r }: { rank: number; r: any }) {
  const avgSalary = Number(r.avg_salary);
  const formattedSalary = isNaN(avgSalary) || avgSalary === 0 
    ? 'N/A' 
    : '$' + avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        border: '1px solid #eee',
        borderRadius: 14,
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ 
        width: 36, 
        fontWeight: 900, 
        fontSize: 20, 
        color: rank <= 3 ? '#eab308' : '#aaa',
        textAlign: 'center'
      }}>
        #{rank}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {r.company_slug ? (
          <Link 
            href={`/companies/${r.company_slug}`} 
            style={{ fontWeight: 800, fontSize: 16, color: '#111', textDecoration: 'none' }}
          >
            {r.company_name}
          </Link>
        ) : (
          <div style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>{r.company_name}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approvals</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#059669' }}>
            {r.approvals.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 80 }}>
          <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Salary</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            {formattedSalary}
          </div>
        </div>
      </div>
    </div>
  );
}