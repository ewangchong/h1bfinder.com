'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function CompaniesControls({
  defaultYear,
  years,
}: {
  defaultYear: string;
  years: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const currentKeyword = sp.get('keyword') || '';
  const currentSortBy = (sp.get('sortBy') || 'filed') as 'filed' | 'name';
  const currentSortDirection = (sp.get('sortDirection') || 'DESC') as 'ASC' | 'DESC';
  const currentSize = Number(sp.get('size') || '24') || 24;
  const currentYear = sp.get('year') || defaultYear;

  const [keyword, setKeyword] = useState(currentKeyword);

  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);

  const sortValue = useMemo(() => {
    return `${currentSortBy}:${currentSortDirection}`;
  }, [currentSortBy, currentSortDirection]);

  function setParams(next: Record<string, string | null>) {
    const nextSp = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') nextSp.delete(k);
      else nextSp.set(k, v);
    }
    // reset pagination once filters change
    if ('keyword' in next || 'sortBy' in next || 'sortDirection' in next || 'size' in next || 'year' in next) {
      nextSp.delete('page');
    }

    const qs = nextSp.toString();
    router.push(qs ? `/companies?${qs}` : '/companies');
    router.refresh();
  }

  return (
    <div
      className="controls-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        margin: '0 0 32px',
        padding: '24px',
        borderRadius: 24,
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.04)',
        width: '100%',
      }}
    >
      <style>{`
        .controls-row-top { display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap; }
        .controls-row-bottom { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; justify-content: space-between; margin-top: 4px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        .search-input { flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; color: #0f172a; outline: none; transition: border-color 0.2s; background: #f8fafc; }
        .search-input:focus { border-color: #4f46e5; background: #fff; }
        .btn-apply { padding: 12px 24px; border: none; background: #0f172a; color: #fff; border-radius: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .btn-apply:hover { background: #334155; }
        .btn-clear { padding: 12px 20px; border: 1px solid #e2e8f0; background: #fff; border-radius: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: background 0.2s; }
        .btn-clear:hover { background: #f8fafc; }
        .select-input { padding: 8px 32px 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; color: #0f172a; background-color: #fff; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 12px top 50%; background-size: 10px auto; }
        .control-group { display: flex; align-items: center; gap: 8px; }
        .control-label { color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        
        @media (max-width: 640px) {
          .controls-row-top { flex-direction: column; }
          .btn-apply, .btn-clear { width: 100%; }
          .controls-row-bottom { flex-direction: column; align-items: flex-start; gap: 16px; }
          .control-group { width: 100%; justify-content: space-between; }
        }
      `}</style>
      
      {/* Search Row */}
      <div className="controls-row-top">
        <input
          className="search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setParams({ keyword: keyword.trim() || null });
            }
          }}
          placeholder="Search for an employer by name..."
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-apply" onClick={() => setParams({ keyword: keyword.trim() || null })}>
            Search
          </button>
          <button className="btn-clear" onClick={() => { setKeyword(''); setParams({ keyword: null }); }}>
            Clear
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="controls-row-bottom">
        
        {/* Years Group */}
        <div className="control-group" style={{ flexWrap: 'wrap' }}>
          <span className="control-label" style={{ marginRight: 4 }}>Data Year</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[...years].sort((a,b)=>Number(b)-Number(a)).map((y) => {
              const isActive = y === currentYear;
              return (
                <button
                  key={y}
                  onClick={() => setParams({ year: y })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    background: isActive ? '#0f172a' : '#fff',
                    color: isActive ? '#fff' : '#475569',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  FY{y}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Sort Group */}
          <div className="control-group">
            <span className="control-label">Sort</span>
            <select
              className="select-input"
              value={sortValue}
              onChange={(e) => {
                const [sortBy, sortDirection] = e.target.value.split(':') as ['filed' | 'name', 'ASC' | 'DESC'];
                setParams({ sortBy, sortDirection });
              }}
            >
              <option value="filed:DESC">Most Filings</option>
              <option value="filed:ASC">Fewest Filings</option>
              <option value="name:ASC">Name (A-Z)</option>
              <option value="name:DESC">Name (Z-A)</option>
            </select>
          </div>

          {/* Page Size Group */}
          <div className="control-group">
            <span className="control-label">Show</span>
            <select
              className="select-input"
              value={String(currentSize)}
              onChange={(e) => setParams({ size: e.target.value })}
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
