'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

export default function JobsControls() {
  const router = useRouter();
  const sp = useSearchParams();

  const currentKeyword = sp.get('keyword') || '';
  const currentState = sp.get('state') || '';
  const currentYear = sp.get('year') || '';
  const currentSize = Number(sp.get('size') || '24') || 24;

  const currentSortBy = (sp.get('sortBy') || 'year') as 'year' | 'title' | 'company';
  const currentSortDirection = (sp.get('sortDirection') || 'DESC') as 'ASC' | 'DESC';

  const [keyword, setKeyword] = useState(currentKeyword);

  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);

  const sortValue = useMemo(() => `${currentSortBy}:${currentSortDirection}`, [currentSortBy, currentSortDirection]);

  function setParams(next: Record<string, string | null>) {
    const nextSp = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') nextSp.delete(k);
      else nextSp.set(k, v);
    }
    if ('keyword' in next || 'state' in next || 'year' in next || 'size' in next || 'sortBy' in next || 'sortDirection' in next) {
      nextSp.delete('page');
    }

    const qs = nextSp.toString();
    router.push(qs ? `/jobs?${qs}` : '/jobs');
    router.refresh();
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
        margin: '18px 0 10px',
        padding: 12,
        borderRadius: 14,
        border: '1px solid #eee',
        background: '#fff',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
        maxWidth: 920,
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search job title…"
        style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10, minWidth: 240 }}
      />
      <button
        onClick={() => setParams({ keyword: keyword.trim() || null })}
        style={{ padding: '10px 12px', border: '1px solid #111', background: '#111', color: '#fff', borderRadius: 10 }}
      >
        Apply
      </button>
      <button
        onClick={() => {
          setKeyword('');
          setParams({ keyword: null });
        }}
        style={{ padding: '10px 12px', border: '1px solid #ddd', background: '#fff', borderRadius: 10 }}
      >
        Clear
      </button>

      <label style={{ marginLeft: 8, color: '#555', fontSize: 14 }}>State</label>
      <select
        value={currentState}
        onChange={(e) => setParams({ state: e.target.value || null })}
        style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10, minWidth: 180 }}
      >
        <option value="">All</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.code} — {s.name}
          </option>
        ))}
      </select>

      <label style={{ marginLeft: 8, color: '#555', fontSize: 14 }}>Year</label>
      <select
        value={currentYear}
        onChange={(e) => setParams({ year: e.target.value || null })}
        style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10 }}
      >
        <option value="">All</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        <option value="2020">2020</option>
      </select>

      <label style={{ marginLeft: 8, color: '#555', fontSize: 14 }}>Sort</label>
      <select
        value={sortValue}
        onChange={(e) => {
          const [sortBy, sortDirection] = e.target.value.split(':') as ['year' | 'title' | 'company', 'ASC' | 'DESC'];
          setParams({ sortBy, sortDirection });
        }}
        style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10 }}
      >
        <option value="year:DESC">Most recent (FY desc)</option>
        <option value="year:ASC">Oldest (FY asc)</option>
        <option value="title:ASC">Title (A → Z)</option>
        <option value="company:ASC">Company (A → Z)</option>
      </select>

      <label style={{ marginLeft: 8, color: '#555', fontSize: 14 }}>Page size</label>
      <select
        value={String(currentSize)}
        onChange={(e) => setParams({ size: e.target.value })}
        style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 10 }}
      >
        <option value="12">12</option>
        <option value="24">24</option>
        <option value="48">48</option>
      </select>
    </div>
  );
}
