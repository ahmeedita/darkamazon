-- Add DELETE policy for orders (GDPR compliance)
CREATE POLICY "Users can delete own orders" 
ON public.orders 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Drop the unused verify_backup_phrase function (backup phrases removed)
DROP FUNCTION IF EXISTS public.verify_backup_phrase(TEXT);

-- Add database constraints for input validation
ALTER TABLE public.profiles 
ADD CONSTRAINT username_length CHECK (char_length(username) >= 1 AND char_length(username) <= 50);

-- Add index for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);