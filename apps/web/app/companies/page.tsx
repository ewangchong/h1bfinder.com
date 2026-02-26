import Link from 'next/link';
import type { Metadata } from 'next';
import { getAvailableYears, listCompanies, type Company } from '@/lib/h1bApi';
import CompaniesControls from './CompaniesControls';
import PaginationControls from './PaginationControls';

export const metadata: Metadata = {
  title: 'H1B Sponsor Companies',
  description: 'Explore companies with proven H1B sponsorship track records (based on public DOL LCA disclosure data).',
  alternates: { canonical: '/companies' },
};

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{
    keyword?: string;
    sortBy?: 'filed' | 'name';
    sortDirection?: 'ASC' | 'DESC';
    page?: string;
    size?: string;
    year?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page || 0) || 0);
  const size = Math.min(100, Math.max(1, Number(sp.size || 24) || 24));

  const years = (await getAvailableYears()).map(String);
  const year = sp.year || years[0] || '2024';

  let companies;
  try {
    companies = await listCompanies({
      page,
      size,
      keyword: sp.keyword,
      sortBy: sp.sortBy,
      sortDirection: sp.sortDirection,
      year,
    });
  } catch (e: any) {
    return (
      <div>
        <h1 style={{ margin: 0 }}>Companies</h1>
        <p style={{ color: '#b00' }}>Failed to load companies from API. Check H1B_API_BASE_URL and backend status.</p>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#555' }}>{String(e?.message || e)}</pre>
      </div>
    );
  }

  const totalSponsors = companies.total_elements;

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.02em' }}>H1B Sponsor Companies</h1>
        <p style={{ margin: '10px auto 0', maxWidth: 760, color: '#555', lineHeight: 1.6 }}>
          Browse sponsors by year using public DOL LCA disclosure data. Always confirm sponsorship details with the employer.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CompaniesControls defaultYear={year} years={years} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            {totalSponsors.toLocaleString()} sponsors (FY{year})
          </div>
          <div style={{ color: '#666', fontSize: 13 }}>Companies with H1B sponsorship signals</div>
        </div>
        <div style={{ color: '#666', fontSize: 13 }}>
          Showing {companies.content.length} / {totalSponsors.toLocaleString()}
        </div>
      </div>

      <div
        className="grid3"
        style={{
          marginTop: 14,
          display: 'grid',
          gap: 14,
        }}
      >
        {companies.content.map((c) => (
          <CompanyCard key={c.id} c={c} />
        ))}
      </div>

      <PaginationControls page={companies.page} totalPages={companies.total_pages} />

      <div style={{ marginTop: 18, color: '#777', fontSize: 12, lineHeight: 1.5 }}>
        Data source: DOL LCA disclosure files (FY2020–FY2024) aggregated by employer name. Not legal advice.
      </div>

      <style>{`
        /* Default: 2 columns. Large screens: 3 columns. Phones: 1 column. */
        @media (min-width: 1100px) {
          .grid3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .grid3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function CompanyCard({ c }: { c: Company }) {
  const filed = c.h1b_applications_filed ?? 0;
  const approved = c.h1b_applications_approved ?? 0;
  const rate = filed > 0 ? approved / filed : null;

  return (
    <Link
      href={`/companies/${c.slug || c.id}`}
      style={{
        display: 'block',
        border: '1px solid #eee',
        borderRadius: 14,
        padding: 14,
        textDecoration: 'none',
        color: '#111',
        background: '#fff',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            aria-hidden
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#EEF2FF',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              color: '#3730A3',
              flex: '0 0 auto',
            }}
          >
            {initials(c.name)}
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            background: '#ECFDF3',
            color: '#027A48',
            border: '1px solid #D1FADF',
            flex: '0 0 auto',
          }}
        >
          Active
        </span>
      </div>

      <div style={{ marginTop: 10, fontWeight: 900, whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.25 }}>
        {c.name}
      </div>


      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
        <InlineStat label="Rate" value={rate === null ? '—' : pct(rate)} />
        <InlineStat label="Filed" value={filed ? filed.toLocaleString() : '—'} />
        <InlineStat label="Approved" value={approved ? approved.toLocaleString() : '—'} />
      </div>
    </Link>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: '1px solid #F0F0F0',
        borderRadius: 12,
        padding: '8px 10px',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      <div style={{ color: '#666', fontSize: 11 }}>{label}</div>
      <div style={{ fontWeight: 900, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
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
