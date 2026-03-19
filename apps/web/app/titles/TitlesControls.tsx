'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TitlesControls({
  years,
  defaultYear,
}: {
  years: string[];
  defaultYear: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const currentYear = sp.get('year') || defaultYear;
  const currentKeyword = sp.get('keyword') || '';

  const [keyword, setKeyword] = useState(currentKeyword);

  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);

  function setParams(next: Record<string, string | null>) {
    const nextSp = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v) nextSp.delete(k);
      else nextSp.set(k, v);
    }
    const qs = nextSp.toString();
    router.push(qs ? `/titles?${qs}` : '/titles');
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
        maxWidth: 920,
      }}
    >
      <style>{`
        .controls-row-top { display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap; }
        .controls-row-bottom { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; justify-content: flex-start; margin-top: 4px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        .search-input { flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; color: #0f172a; outline: none; transition: border-color 0.2s; background: #f8fafc; }
        .search-input:focus { border-color: #4f46e5; background: #fff; }
        .btn-apply { padding: 12px 24px; border: none; background: #0f172a; color: #fff; border-radius: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .btn-apply:hover { background: #334155; }
        .btn-clear { padding: 12px 20px; border: 1px solid #e2e8f0; background: #fff; border-radius: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: background 0.2s; }
        .btn-clear:hover { background: #f8fafc; }
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
          placeholder="Search for an H1B job (e.g., Software Engineer)"
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

      </div>
    </div>
  );
}
