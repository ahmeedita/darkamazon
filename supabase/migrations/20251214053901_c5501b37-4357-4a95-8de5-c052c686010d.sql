-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
  delivery_email TEXT,
  recipient_email TEXT,
  payment_address TEXT,
  payment_currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '2 hours')
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
USING (user_id = (SELECT id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can insert own orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
USING (user_id = (SELECT id FROM public.profiles WHERE id = user_id));

-- Cart items RLS policies
CREATE POLICY "Users can view own cart"
ON public.cart_items FOR SELECT
USING (user_id = (SELECT id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can insert to own cart"
ON public.cart_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own cart"
ON public.cart_items FOR UPDATE
USING (user_id = (SELECT id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can delete from own cart"
ON public.cart_items FOR DELETE
USING (user_id = (SELECT id FROM public.profiles WHERE id = user_id));

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- Function to cancel expired orders
CREATE OR REPLACE FUNCTION public.cancel_expired_orders()
RETURNS void AS $$
BEGIN
  UPDATE public.orders
  SET status = 'canceled'
  WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Schedule cron job to cancel expired orders every 5 minutes
SELECT cron.schedule(
  'cancel-expired-orders',
  '*/5 * * * *',
  $$SELECT public.cancel_expired_orders()$$
);