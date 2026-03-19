'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type AuthMeResponse = {
  success: boolean;
  data: {
    authenticated: boolean;
    user: null | {
      id: string;
      email: string;
      name?: string | null;
      avatar_url?: string | null;
      last_login_at?: string | null;
    };
  };
};

type AuthStatusResponse = {
  success: boolean;
  data: {
    google_enabled: boolean;
  };
};

function apiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, '') : '';
}

export default function AuthStatus() {
  const [loading, setLoading] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [user, setUser] = useState<AuthMeResponse['data']['user']>(null);

  const base = useMemo(() => apiBaseUrl(), []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [statusRes, meRes] = await Promise.all([
          fetch(`${base}/api/v1/auth/status`, { credentials: 'include' }),
          fetch(`${base}/api/v1/auth/me`, { credentials: 'include', cache: 'no-store' }),
        ]);

        const statusJson = (await statusRes.json()) as AuthStatusResponse;
        const meJson = (await meRes.json()) as AuthMeResponse;
        if (!active) return;
        setGoogleEnabled(Boolean(statusJson?.data?.google_enabled));
        setUser(meJson?.data?.user ?? null);
      } catch {
        if (!active) return;
        setGoogleEnabled(false);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [base]);

  async function logout() {
    await fetch(`${base}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.reload();
  }

  const loginHref = `${base}/api/v1/auth/google/start?return_to=${encodeURIComponent(typeof window === 'undefined' ? '/' : window.location.href)}`;

  if (loading) {
    return <span style={{ fontSize: 13, color: '#64748b' }}>Loading…</span>;
  }

  if (user) {
    return (
      <div className="auth-status">
        <div className="auth-status-user">
          {user.avatar_url ? <img src={user.avatar_url} alt={user.name || user.email} className="auth-status-avatar" /> : null}
          <div>
            <div className="auth-status-name">{user.name || user.email}</div>
            <div className="auth-status-email">{user.email}</div>
          </div>
        </div>
        <button type="button" className="auth-status-button auth-status-button-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-status">
      <a
        href={googleEnabled ? loginHref : '/login'}
        className="auth-status-button auth-status-button-google-light"
        style={{ gap: 10 }}
      >
        <img 
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z' fill='%234285F4'/%3E%3Cpath d='M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z' fill='%2334A853'/%3E%3Cpath d='M3.964 10.707a5.41 5.41 0 010-3.414V4.961H.957a8.992 8.992 0 000 8.078l3.007-2.332z' fill='%23FBBC05'/%3E%3Cpath d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 3.166 6.656 1.584 9 1.584V3.58z' fill='%23EA4335'/%3E%3C/svg%3E" 
          alt="Google"
          width="18"
          height="18"
          style={{ flexShrink: 0 }}
        />
        Sign in with Google
      </a>
    </div>
  );
}
