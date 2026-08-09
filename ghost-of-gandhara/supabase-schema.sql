-- Run this in the Supabase SQL Editor (Database -> SQL Editor -> New query)
-- Then create your admin user via Supabase Auth dashboard.

-- Published prose books
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters belonging to a book
CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, slug)
);

-- Published lyric poems
CREATE TABLE poems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site-wide settings (hero background, etc.)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Seed default hero background
INSERT INTO site_settings (key, value)
VALUES ('hero_background_url', '/hero-bg.jpg')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Public read published books" ON books
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Public read chapters of published books" ON chapters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.published = TRUE)
  );

CREATE POLICY "Public read published poems" ON poems
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Public read settings" ON site_settings
  FOR SELECT USING (true);

-- Authenticated admin can manage everything
-- IMPORTANT: For a single-admin site, replace the placeholder email below with your own.
CREATE POLICY "Admin manage books" ON books
  FOR ALL TO authenticated
  USING (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL')
  WITH CHECK (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL');

CREATE POLICY "Admin manage chapters" ON chapters
  FOR ALL TO authenticated
  USING (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL')
  WITH CHECK (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL');

CREATE POLICY "Admin manage poems" ON poems
  FOR ALL TO authenticated
  USING (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL')
  WITH CHECK (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL');

CREATE POLICY "Admin manage settings" ON site_settings
  FOR ALL TO authenticated
  USING (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL')
  WITH CHECK (auth.email() = 'REPLACE_WITH_ADMIN_EMAIL');

-- If you already created the tables without the new columns, run these ALTER statements instead:
-- ALTER TABLE poems ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
-- (site_settings is a new table; run the CREATE TABLE block above)
