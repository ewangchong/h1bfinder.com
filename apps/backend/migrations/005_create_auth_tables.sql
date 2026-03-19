CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  name text,
  avatar_url text,
  google_sub text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  last_login_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_google_sub
  ON app_users (google_sub);

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_email_lower
  ON app_users (lower(email));

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_sessions_token
  ON auth_sessions (session_token);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
  ON auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at
  ON auth_sessions (expires_at);
