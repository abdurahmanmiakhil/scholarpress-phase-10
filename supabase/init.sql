-- ==============================================================================
-- ScholarPress Database Migration: init.sql
-- Single-Author Educational & Research Publishing Platform
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom Types & Enums
DO $$ BEGIN
  CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Utility Trigger: Automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. Tables
-- ==============================================================================

-- PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TAGS
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ARTICLES
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  abstract TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  cover_image_url TEXT,
  status article_status NOT NULL DEFAULT 'draft',
  reading_time_minutes INTEGER NOT NULL DEFAULT 1 CHECK (reading_time_minutes >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIVOT: ARTICLE <-> CATEGORIES
CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- PIVOT: ARTICLE <-> TAGS
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ==============================================================================
-- 5. Indexes for Performance
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_status_published_at 
  ON public.articles(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_slug 
  ON public.articles(slug);

CREATE INDEX IF NOT EXISTS idx_articles_author_id 
  ON public.articles(author_id);

CREATE INDEX IF NOT EXISTS idx_categories_slug 
  ON public.categories(slug);

CREATE INDEX IF NOT EXISTS idx_tags_slug 
  ON public.tags(slug);

CREATE INDEX IF NOT EXISTS idx_article_categories_category_id 
  ON public.article_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id 
  ON public.article_tags(tag_id);

-- ==============================================================================
-- 6. Triggers
-- ==============================================================================

-- Trigger to touch updated_at on profiles
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to touch updated_at on articles
DROP TRIGGER IF EXISTS tr_articles_updated_at ON public.articles;
CREATE TRIGGER tr_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Automatically create public.profiles entry upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view author profiles" ON public.profiles;
CREATE POLICY "Public can view author profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authors can insert own profile" ON public.profiles;
CREATE POLICY "Authors can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Authors can update own profile" ON public.profiles;
CREATE POLICY "Authors can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- CATEGORIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- TAGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
CREATE POLICY "Public can view tags"
  ON public.tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags"
  ON public.tags FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- ARTICLES POLICIES
-- ------------------------------------------------------------------------------
-- Public can ONLY read published articles whose published_at date has arrived
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles"
  ON public.articles FOR SELECT
  USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND published_at <= NOW()
  );

-- Authenticated author has full view access (Drafts, Scheduled, Archived)
DROP POLICY IF EXISTS "Admins can view all articles" ON public.articles;
CREATE POLICY "Admins can view all articles"
  ON public.articles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated author can create articles with their own author_id
DROP POLICY IF EXISTS "Admins can insert articles" ON public.articles;
CREATE POLICY "Admins can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = author_id
  );

-- Authenticated author can update any of their articles
DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated author can delete articles
DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- PIVOT TABLES POLICIES (Article-Categories & Article-Tags)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view article_categories for visible articles" ON public.article_categories;
CREATE POLICY "Public can view article_categories for visible articles"
  ON public.article_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_categories.article_id
        AND a.status = 'published'
        AND a.published_at <= NOW()
    )
    OR auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can manage article_categories" ON public.article_categories;
CREATE POLICY "Admins can manage article_categories"
  ON public.article_categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view article_tags for visible articles" ON public.article_tags;
CREATE POLICY "Public can view article_tags for visible articles"
  ON public.article_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_tags.article_id
        AND a.status = 'published'
        AND a.published_at <= NOW()
    )
    OR auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can manage article_tags" ON public.article_tags;
CREATE POLICY "Admins can manage article_tags"
  ON public.article_tags FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- 8. Supabase Storage Configuration (article-covers)
-- ==============================================================================

-- Create public storage bucket for article cover & inline content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-covers', 'article-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public can read article covers" ON storage.objects;
CREATE POLICY "Public can read article covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-covers');

DROP POLICY IF EXISTS "Admins can upload article covers" ON storage.objects;
CREATE POLICY "Admins can upload article covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-covers'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can update article covers" ON storage.objects;
CREATE POLICY "Admins can update article covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'article-covers'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'article-covers'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins can delete article covers" ON storage.objects;
CREATE POLICY "Admins can delete article covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'article-covers'
    AND auth.role() = 'authenticated'
  );

-- ==============================================================================
-- 9. Seed Default Taxonomies (Academic & Research)
-- ==============================================================================

INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Computer Science', 'computer-science', 'Theoretical and applied computational principles and architectures.'),
  ('Artificial Intelligence', 'artificial-intelligence', 'Machine learning models, neural systems, and reasoning mechanisms.'),
  ('Systems & Security', 'systems-and-security', 'Distributed computing, database internals, and cryptographic security.'),
  ('Philosophy of Science', 'philosophy-of-science', 'Epistemology, scientific methodology, and computational philosophy.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug)
VALUES
  ('Next.js', 'nextjs'),
  ('PostgreSQL', 'postgresql'),
  ('Architecture', 'architecture'),
  ('Distributed Systems', 'distributed-systems'),
  ('Security', 'security'),
  ('Algorithms', 'algorithms'),
  ('Peer Review', 'peer-review')
ON CONFLICT (slug) DO NOTHING;

