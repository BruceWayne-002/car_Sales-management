
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create auctions table
CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  mileage INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  base_price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  winner_id UUID REFERENCES public.profiles(id),
  winning_bid NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create auctions" ON public.auctions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own active auctions" ON public.auctions FOR UPDATE USING (auth.uid() = seller_id);

CREATE TRIGGER update_auctions_updated_at
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bids" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Enable realtime for bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true);

CREATE POLICY "Anyone can view car images" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "Authenticated users can upload car images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own car images" ON storage.objects FOR DELETE USING (bucket_id = 'car-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Helper function to get highest bid
CREATE OR REPLACE FUNCTION public.get_highest_bid(p_auction_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(amount), 0) FROM public.bids WHERE auction_id = p_auction_id;
$$;

-- Helper function to get bid count
CREATE OR REPLACE FUNCTION public.get_bid_count(p_auction_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.bids WHERE auction_id = p_auction_id;
$$;

-- Validation trigger for bids
CREATE OR REPLACE FUNCTION public.validate_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction RECORD;
  v_highest_bid NUMERIC;
BEGIN
  SELECT * INTO v_auction FROM public.auctions WHERE id = NEW.auction_id;
  
  IF v_auction IS NULL THEN
    RAISE EXCEPTION 'Auction not found';
  END IF;
  
  IF v_auction.status != 'active' THEN
    RAISE EXCEPTION 'Auction is no longer active';
  END IF;
  
  IF v_auction.end_time <= now() THEN
    RAISE EXCEPTION 'Auction has ended';
  END IF;
  
  IF v_auction.seller_id = NEW.bidder_id THEN
    RAISE EXCEPTION 'You cannot bid on your own auction';
  END IF;
  
  SELECT COALESCE(MAX(amount), 0) INTO v_highest_bid FROM public.bids WHERE auction_id = NEW.auction_id;
  
  IF NEW.amount <= v_highest_bid THEN
    RAISE EXCEPTION 'Bid must be higher than current highest bid of %', v_highest_bid;
  END IF;
  
  IF NEW.amount <= v_auction.base_price AND v_highest_bid = 0 THEN
    RAISE EXCEPTION 'Bid must be higher than base price of %', v_auction.base_price;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_bid_before_insert
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bid();
