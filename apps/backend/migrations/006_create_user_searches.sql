CREATE TABLE IF NOT EXISTS user_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  query text NOT NULL,
  type text NOT NULL, -- 'company', 'job_title', 'location', 'general'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON user_searches (user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created_at ON user_searches (created_at DESC);
