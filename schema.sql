-- HF Traders — database schema
-- Run via `npm run db:setup` (see scripts/migrate.js)

CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  type          TEXT NOT NULL,
  grade         TEXT NOT NULL,
  availability  TEXT NOT NULL,
  description   TEXT NOT NULL,
  image_url     TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  admin_reply TEXT,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  full_name      TEXT NOT NULL,
  company_name   TEXT,
  business_type  TEXT,
  email          TEXT UNIQUE NOT NULL,
  phone          TEXT,
  address        TEXT,
  password_hash  TEXT NOT NULL,
  avatar_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id            SERIAL PRIMARY KEY,
  product_id    TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  company       TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',
  admin_reply   TEXT,
  replied_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_plan_inquiries (
  id            SERIAL PRIMARY KEY,
  plan_name     TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  company_name  TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',
  admin_reply   TEXT,
  replied_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_product_id ON quotes(product_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Safe upgrades for databases created before these columns existed.
-- CREATE TABLE IF NOT EXISTS above won't add columns to an already-existing
-- table, so these run every time and simply no-op if already applied.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE business_plan_inquiries ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE business_plan_inquiries ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
