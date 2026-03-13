-- Create source_type enum
DO $$ BEGIN
  CREATE TYPE public.source_type AS ENUM ('public_media', 'user_submitted', 'auction');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create vehicle_plate_registry table
CREATE TABLE IF NOT EXISTS public.vehicle_plate_registry (
  plate_number TEXT PRIMARY KEY,
  state_code TEXT,
  rto_region TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_type TEXT,
  fuel_type TEXT,
  notes TEXT,
  source_type public.source_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_plate_registry ENABLE ROW LEVEL SECURITY;

-- Policies: deny by default, allow read to service role only
DROP POLICY IF EXISTS "Service role can read vehicle registry" ON public.vehicle_plate_registry;
CREATE POLICY "Service role can read vehicle registry"
  ON public.vehicle_plate_registry
  FOR SELECT
  TO service_role
  USING (true);

-- Optional: allow inserts via service role (e.g., admin backfills)
DROP POLICY IF EXISTS "Service role can insert vehicle registry" ON public.vehicle_plate_registry;
CREATE POLICY "Service role can insert vehicle registry"
  ON public.vehicle_plate_registry
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Helpful index
CREATE INDEX IF NOT EXISTS vehicle_plate_registry_state_idx ON public.vehicle_plate_registry (state_code);

