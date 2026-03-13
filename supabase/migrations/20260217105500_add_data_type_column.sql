ALTER TABLE public.vehicle_plate_registry
  ADD COLUMN IF NOT EXISTS data_type TEXT;

