-- Ensure pgcrypto available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add id column if missing and make it primary key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='id'
  ) THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN id UUID DEFAULT gen_random_uuid();
  END IF;

  -- Drop existing PK if it's on plate_number and set new PK on id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema='public' AND tc.table_name='vehicle_plate_registry'
      AND tc.constraint_type='PRIMARY KEY' AND kcu.column_name='plate_number'
  ) THEN
    ALTER TABLE public.vehicle_plate_registry DROP CONSTRAINT IF EXISTS vehicle_plate_registry_pkey;
  END IF;

  -- Add PK on id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='vehicle_plate_registry' 
      AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE public.vehicle_plate_registry ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Ensure plate_number is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='vehicle_plate_registry' AND indexname='vehicle_plate_registry_plate_number_key'
  ) THEN
    ALTER TABLE public.vehicle_plate_registry ADD CONSTRAINT vehicle_plate_registry_plate_number_key UNIQUE (plate_number);
  END IF;
END $$;

-- Rename and add columns to match new schema
ALTER TABLE public.vehicle_plate_registry
  RENAME COLUMN IF EXISTS state_code TO state;

ALTER TABLE public.vehicle_plate_registry
  RENAME COLUMN IF EXISTS rto_region TO rto_code;

ALTER TABLE public.vehicle_plate_registry
  RENAME COLUMN IF EXISTS vehicle_make TO vehicle_brand;

-- Add missing columns if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='owner_name') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN owner_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='owner_type') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN owner_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='vehicle_brand') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN vehicle_brand TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='vehicle_model') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN vehicle_model TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='vehicle_year') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN vehicle_year INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='rto_code') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN rto_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='state') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN state TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='source_url') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN source_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='verified') THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Ensure created_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='vehicle_plate_registry' AND column_name='created_at'
  ) THEN
    ALTER TABLE public.vehicle_plate_registry ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

