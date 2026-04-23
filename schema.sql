CREATE TABLE IF NOT EXISTS timers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  timer_id TEXT NOT NULL REFERENCES timers(id) ON DELETE CASCADE,
  name TEXT,
  principal DOUBLE PRECISION NOT NULL,
  interest_rate DOUBLE PRECISION NOT NULL,
  rate_type TEXT NOT NULL,
  interest_type TEXT NOT NULL,
  started_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS repayments (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  item_name TEXT,
  note TEXT,
  repayment_target TEXT NOT NULL DEFAULT 'interest',
  repaid_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);
