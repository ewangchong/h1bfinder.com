'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type RecentSearch = {
  query: string;
  type: string;
  created_at: string;
};

type RecentSearchesResponse = {
  success: boolean;
  data: RecentSearch[];
};

function apiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, '') : '';
}

export default function HomeRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const base = apiBaseUrl();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`${base}/api/v1/user/recent-searches`, { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        const json = (await res.json()) as RecentSearchesResponse;
        if (active && json.success) {
          setSearches(json.data);
        }
      } catch {
        // Silently fail (user likely not logged in or endpoint not ready)
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [base]);

  const defaultSearches: RecentSearch[] = [
    { query: 'Amazon', type: 'company', created_at: '' },
    { query: 'Software Engineer', type: 'job_title', created_at: '' },
    { query: 'Google', type: 'company', created_at: '' },
  ];

  const displaySearches = searches.length > 0 ? searches : defaultSearches;
  const label = searches.length > 0 ? 'Your Recent:' : 'Popular:';

  if (loading) return <div className="recent-searches-container" style={{ opacity: 0.5 }}><span className="recent-searches-label">Loading history...</span></div>;

  return (
    <div className="recent-searches-container">
      <span className="recent-searches-label">{label}</span>
      <div className="recent-searches-list">
        {displaySearches.map((s, i) => (
          <Link
            key={`${s.query}-${i}`}
            href={s.type === 'job_title' ? `/titles/${s.query.toLowerCase().replace(/\s+/g, '-')}` : `/companies?keyword=${encodeURIComponent(s.query)}`}
            className="recent-search-chip"
          >
            {s.query}
          </Link>
        ))}
      </div>
    </div>
  );
}
