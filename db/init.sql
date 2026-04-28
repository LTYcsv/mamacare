CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  name             TEXT,
  age              TEXT,
  week             INTEGER DEFAULT 8,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name    TEXT,
  spec    TEXT,
  phone   TEXT,
  clinic  TEXT,
  addr    TEXT
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  emoji      TEXT,
  mood_label TEXT,
  text       TEXT,
  symptoms   TEXT[],
  activity   TEXT,
  diet       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);
