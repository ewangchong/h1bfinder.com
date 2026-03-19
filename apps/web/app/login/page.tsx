import Link from 'next/link';

function apiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.H1B_API_BASE_URL || '';
  return raw.replace(/\/$/, '');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const sp = await searchParams;
  const base = apiBaseUrl();
  const loginHref = `${base}/api/v1/auth/google/start?return_to=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/login')}`;

  let config: { success?: boolean; data?: { google_enabled?: boolean } } | null = null;
  try {
    const res = await fetch(`${base}/api/v1/auth/status`, { cache: 'no-store' });
    config = await res.json();
  } catch {
    config = null;
  }

  const googleEnabled = Boolean(config?.data?.google_enabled);

  return (
    <div style={{ maxWidth: 720, margin: '48px auto', padding: 24 }}>
      <div className="auth-card">
        <div className="auth-card-kicker">Members</div>
        <h1 className="auth-card-title">Sign in to save your H1B research flow</h1>
        <p className="auth-card-copy">
          Minimal version is now wired for Google OAuth and backend session persistence. After login, your member state is kept in Postgres-backed sessions.
        </p>

        {sp.auth_error ? (
          <div className="auth-card-alert">
            Google sign-in did not complete: <strong>{sp.auth_error}</strong>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a
            href={googleEnabled ? loginHref : undefined}
            className={`auth-status-button auth-status-button-primary${googleEnabled ? '' : ' auth-status-button-disabled'}`}
            aria-disabled={!googleEnabled}
          >
            Continue with Google
          </a>
          <Link href="/" className="auth-status-button auth-status-button-secondary">
            Back to home
          </Link>
        </div>

        {!googleEnabled ? (
          <div className="auth-card-note">
            Google OAuth is not fully configured yet. Please set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, and <code>GOOGLE_REDIRECT_URI</code> in the backend environment.
          </div>
        ) : (
          <div className="auth-card-note">
            If you are testing locally, make sure the Google OAuth redirect URI matches your backend callback exactly.
          </div>
        )}
      </div>
    </div>
  );
}
