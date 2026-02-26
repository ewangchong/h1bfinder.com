'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

function RankingsControlsInner({
  defaultYear,
  years,
  titles,
}: {
  defaultYear: string;
  years: string[];
  titles: { title: string; slug: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [year, setYear] = useState(searchParams.get('year') || defaultYear);
  const [state, setState] = useState(searchParams.get('state') || '');
  const [jobTitle, setJobTitle] = useState(searchParams.get('job_title') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'approvals');

  const applyFilters = useCallback(
    (e?: React.FormEvent, overrideSortBy?: string) => {
      if (e) e.preventDefault();
      const params = new URLSearchParams(searchParams);

      if (year) params.set('year', year);
      else params.delete('year');

      if (state) params.set('state', state);
      else params.delete('state');

      if (jobTitle) params.set('job_title', jobTitle);
      else params.delete('job_title');

      const currentSort = overrideSortBy || sortBy;
      if (currentSort && currentSort !== 'approvals') params.set('sortBy', currentSort);
      else params.delete('sortBy');

      // Preserve existing limit if present
      const limit = searchParams.get('limit');
      if (limit) params.set('limit', limit);

      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [year, state, jobTitle, sortBy, router, searchParams]
  );

  return (
    <form
      onSubmit={applyFilters}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: '#f8fafc',
        padding: '20px 24px',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        marginBottom: 24,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>Fiscal Year</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {years.map((y) => {
            const isActive = year === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: isActive ? '1px solid #111' : '1px solid #ddd',
                  background: isActive ? '#111' : '#fff',
                  color: isActive ? '#fff' : '#444',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>State Location</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #ccc',
              fontSize: 14,
              backgroundColor: '#fff',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px top 50%',
              backgroundSize: '10px auto'
            }}
          >
            <option value="">All States Nationwide</option>
            <option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="CA">California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="HI">Hawaii</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="PA">Pennsylvania</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VA">Virginia</option><option value="WA">Washington</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>Top Job Titles</label>
          <select
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #ccc',
              fontSize: 14,
              backgroundColor: '#fff',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px top 50%',
              backgroundSize: '10px auto',
              textOverflow: 'ellipsis'
            }}
          >
            <option value="">All Job Titles</option>
            {titles.map(t => (
              <option key={t.slug} value={t.title}>{t.title}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>Sort Sponsors By</label>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: 10, overflow: 'hidden', height: 41 }}>
            <button
              type="button"
              onClick={() => {
                setSortBy('approvals');
                applyFilters(undefined, 'approvals');
              }}
              style={{
                flex: 1,
                border: 'none',
                background: sortBy === 'approvals' ? '#eef2ff' : '#fff',
                color: sortBy === 'approvals' ? '#4f46e5' : '#666',
                fontWeight: sortBy === 'approvals' ? 700 : 500,
                borderRight: '1px solid #ccc',
                cursor: 'pointer',
                fontSize: 14,
                transition: 'background 0.2s',
              }}
            >
              Total Approvals
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('salary');
                applyFilters(undefined, 'salary');
              }}
              style={{
                flex: 1,
                border: 'none',
                background: sortBy === 'salary' ? '#ecfdf5' : '#fff',
                color: sortBy === 'salary' ? '#059669' : '#666',
                fontWeight: sortBy === 'salary' ? 700 : 500,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'background 0.2s',
              }}
            >
              Average Salary
            </button>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 32px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(to right, #4f46e5, #3b82f6)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            cursor: isPending ? 'wait' : 'pointer',
            opacity: isPending ? 0.8 : 1,
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
            transition: 'opacity 0.2s'
          }}
        >
          {isPending ? 'Updating...' : 'Apply Filters'}
        </button>
      </div>
    </form>
  );
}

import { Suspense } from 'react';

export default function RankingsControls(props: { defaultYear: string; years: string[]; titles: { title: string; slug: string }[] }) {
  return (
    <Suspense fallback={<div style={{ padding: 14, marginBottom: 20, background: '#f8fafc', borderRadius: 16 }}>Loading controls...</div>}>
      <RankingsControlsInner {...props} />
    </Suspense>
  );
}