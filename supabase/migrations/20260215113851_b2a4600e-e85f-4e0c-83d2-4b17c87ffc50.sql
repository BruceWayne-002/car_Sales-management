
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System inserts via trigger (SECURITY DEFINER), users can't insert directly
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify all users except creator when auction goes active
CREATE OR REPLACE FUNCTION public.notify_new_auction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    INSERT INTO public.notifications (user_id, title, message, link)
    SELECT
      p.id,
      '🚗 New Auction Live!',
      NEW.year || ' ' || NEW.brand || ' ' || NEW.model || ' starting at $' || NEW.base_price,
      '/auctions/' || NEW.id
    FROM public.profiles p
    WHERE p.id != NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auction_created
  AFTER INSERT ON public.auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_auction();
