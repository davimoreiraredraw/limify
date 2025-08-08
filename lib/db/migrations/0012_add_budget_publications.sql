CREATE TABLE IF NOT EXISTS budget_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  header_title TEXT NOT NULL,
  header_subtitle TEXT NOT NULL,
  header_image TEXT,
  deliverables TEXT,
  phases TEXT,
  investment TEXT,
  about TEXT,
  about_years_experience INTEGER DEFAULT 0,
  about_completed_projects INTEGER DEFAULT 0,
  team TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
); 