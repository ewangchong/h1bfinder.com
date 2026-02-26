'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

function RankingsControlsInner({
  defaultYear,
  years,
}: {
  defaultYear: string;
  years: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [year, setYear] = useState(searchParams.get('year') || defaultYear);
  const [state, setState] = useState(searchParams.get('state') || '');
  const [jobTitle, setJobTitle] = useState(searchParams.get('job_title') || '');

  const applyFilters = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const params = new URLSearchParams(searchParams);

      if (year) params.set('year', year);
      else params.delete('year');

      if (state) params.set('state', state);
      else params.delete('state');

      if (jobTitle) params.set('job_title', jobTitle);
      else params.delete('job_title');

      startTransition(() => {
        router.push(`/rankings?${params.toString()}`);
      });
    },
    [year, state, jobTitle, router, searchParams]
  );

  return (
    <form
      onSubmit={applyFilters}
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#f9f9f9',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Year</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>State (e.g., CA)</label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="All States"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', width: 100 }}
          maxLength={2}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Job Title (e.g., Data Engineer)</label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Any Title"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', width: 200 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', marginTop: 20 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#111',
            color: '#fff',
            fontWeight: 700,
            cursor: isPending ? 'wait' : 'pointer',
            opacity: isPending ? 0.7 : 1
          }}
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}

import { Suspense } from 'react';

export default function RankingsControls(props: { defaultYear: string; years: string[] }) {
  return (
    <Suspense fallback={<div style={{ padding: 14, marginBottom: 20, background: '#f9f9f9', borderRadius: 12 }}>Loading controls...</div>}>
      <RankingsControlsInner {...props} />
    </Suspense>
  );
}