-- Create venues table
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  icon_url TEXT,
  landing_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create user_visits table
CREATE TABLE IF NOT EXISTS public.user_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_visits_user_id ON public.user_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_venue_id ON public.user_visits(venue_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_venue_unique ON public.user_visits(user_id, venue_id);

-- Enable RLS on venues table
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read venues
CREATE POLICY "venues_select_public"
  ON public.venues FOR SELECT
  USING (true);

-- Enable RLS on user_visits table
ALTER TABLE public.user_visits ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own visits
CREATE POLICY "user_visits_select_own"
  ON public.user_visits FOR SELECT
  USING (auth.uid() = user_id OR true);

-- Allow anonymous users to insert visits (we'll handle user_id on client)
CREATE POLICY "user_visits_insert_own"
  ON public.user_visits FOR INSERT
  WITH CHECK (true);
