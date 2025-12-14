import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  type: 'card' | 'giftcard' | 'transfer';
  name: string;
  price: number;
  details?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user and listen for changes
  useEffect(() => {
    const checkUser = () => {
      const currentUser = localStorage.getItem('darkAmazon_currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        setUserId(user.id);
      } else {
        setUserId(null);
        setItems([]);
        setLoading(false);
      }
    };

    checkUser();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkAmazon_currentUser') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleUserChange = () => checkUser();
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  // Load cart from database
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadCart = async () => {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        const cartItems: CartItem[] = (data || []).map(item => ({
          id: item.product_id,
          type: item.product_type as 'card' | 'giftcard' | 'transfer',
          name: item.name,
          price: Number(item.price),
          details: item.details && typeof item.details === 'object' && 'text' in item.details 
            ? (item.details as { text: string }).text 
            : undefined,
        }));

        setItems(cartItems);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [userId]);

  const addItem = async (item: CartItem) => {
    if (!userId) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to add items to cart',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    setItems(prev => [...prev, item]);

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: item.id,
          product_type: item.type,
          name: item.name,
          price: item.price,
          details: item.details ? { text: item.details } : null,
        });

      if (error) {
        // Rollback on error
        setItems(prev => prev.filter(i => i.id !== item.id));
        if (error.code === '23505') {
          toast({
            title: 'Already in cart',
            description: 'This item is already in your cart',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const removeItem = async (id: string) => {
    if (!userId) return;

    const removedItem = items.find(item => item.id === id);
    
    // Optimistic update
    setItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index > -1) {
        const newItems = [...prev];
        newItems.splice(index, 1);
        return newItems;
      }
      return prev;
    });

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', id);

      if (error) {
        // Rollback on error
        if (removedItem) {
          setItems(prev => [...prev, removedItem]);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    const previousItems = [...items];
    
    // Optimistic update
    setItems([]);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        // Rollback on error
        setItems(previousItems);
        throw error;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
