'use client';

import { FormEvent, useMemo, useState } from 'react';

type TabKey = 'sponsors' | 'jobs' | 'location';

const TABS: Array<{ key: TabKey; label: string; placeholder: string }> = [
  { key: 'sponsors', label: 'Sponsor', placeholder: 'e.g. Amazon, Capital One, EY' },
  { key: 'jobs', label: 'Job', placeholder: 'e.g. Data Scientist, Software Engineer' },
  { key: 'location', label: 'Location', placeholder: 'e.g. Virginia, Austin, CA' },
];
import { STATES } from '@/lib/states';

export default function HomeQuickSearch() {
  const [tab, setTab] = useState<TabKey>('sponsors');
  const [q, setQ] = useState('');

  const activeTab = useMemo(() => TABS.find((t) => t.key === tab)!, [tab]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = q.trim();

    if (tab === 'sponsors') {
      window.location.href = value ? `/companies?keyword=${encodeURIComponent(value)}` : '/companies';
      return;
    }

    if (tab === 'jobs') {
      window.location.href = value ? `/titles?keyword=${encodeURIComponent(value)}` : '/titles';
      return;
    }

    // location query matches states
    if (tab === 'location') {
      if (!value) {
        window.location.href = '/plan';
        return;
      }
      
      const v = value.toLowerCase();
      const matchedState = STATES.find(s => 
        s.name.toLowerCase() === v || 
        s.code.toLowerCase() === v || 
        s.name.toLowerCase().includes(v)
      ) || STATES.find(s => s.code.toLowerCase() === 'ca'); // Fallback to CA if totally confused

      if (matchedState) {
        const stateSlug = matchedState.name.toLowerCase().replace(/ /g, '-');
        window.location.href = `/states/${stateSlug}-h1b-sponsors`;
      }
      return;
    }
  }

  return (
    <div style={{ marginTop: 24, border: '1px solid #e5e7eb', borderRadius: 16, padding: 12, background: '#fff' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              border: '1px solid #e5e7eb',
              background: tab === t.key ? '#111827' : '#fff',
              color: tab === t.key ? '#fff' : '#111827',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={activeTab.placeholder}
          style={{
            flex: 1,
            border: '1px solid #d1d5db',
            borderRadius: 12,
            padding: '11px 12px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            border: '1px solid #111827',
            borderRadius: 12,
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            padding: '0 16px',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
