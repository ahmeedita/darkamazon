import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from './CartContext';
import { releaseCards } from '@/lib/cardGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'canceled';
  createdAt: number;
  expiresAt: number;
  deliveryEmail?: string;
  recipientEmail?: string;
  paymentAddress?: string;
  paymentCurrency?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, orderId?: string, deliveryEmail?: string, recipientEmail?: string) => Promise<string>;
  updateOrderStatus: (id: string, status: 'pending' | 'completed' | 'canceled') => Promise<void>;
  updateOrderPayment: (id: string, paymentAddress: string, paymentCurrency: string) => Promise<void>;
  getFilteredOrders: (filter: 'all' | 'pending' | 'completed' | 'canceled') => Order[];
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  // Load orders from database
  useEffect(() => {
    if (!profile?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const orderList: Order[] = (data || []).map(order => ({
          id: order.order_id,
          items: (Array.isArray(order.items) ? order.items : []) as unknown as CartItem[],
          total: Number(order.total),
          status: order.status as 'pending' | 'completed' | 'canceled',
          createdAt: new Date(order.created_at).getTime(),
          expiresAt: new Date(order.expires_at).getTime(),
          deliveryEmail: order.delivery_email || undefined,
          recipientEmail: order.recipient_email || undefined,
          paymentAddress: order.payment_address || undefined,
          paymentCurrency: order.payment_currency || undefined,
        }));

        setOrders(orderList);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [profile?.id]);

  // Cancel expired pending orders: update the UI immediately AND persist the
  // cancellation to the database so it survives a page refresh.
  useEffect(() => {
    const checkExpiredOrders = async () => {
      const now = Date.now();
      const expired = orders.filter(
        order => order.status === 'pending' && order.expiresAt <= now
      );
      if (expired.length === 0) return;

      // Release any reserved cards and flip local status right away.
      expired.forEach(order => releaseCards(order.id));
      setOrders(prev =>
        prev.map(order =>
          order.status === 'pending' && order.expiresAt <= now
            ? { ...order, status: 'canceled' as const }
            : order
        )
      );

      // Persist to the database so a refresh doesn't resurrect it as pending.
      if (profile?.id) {
        for (const order of expired) {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'canceled' })
            .eq('order_id', order.id)
            .eq('user_id', profile.id)
            .eq('status', 'pending');
          if (error) {
            console.error('Error canceling expired order:', error);
          }
        }
      }
    };

    checkExpiredOrders();
    const interval = setInterval(checkExpiredOrders, 15000);
    return () => clearInterval(interval);
  }, [orders, profile?.id]);

  const addOrder = async (
    items: CartItem[], 
    total: number, 
    orderId?: string,
    deliveryEmail?: string,
    recipientEmail?: string
  ): Promise<string> => {
    const now = Date.now();
    const id = orderId || `order_${now}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = now + (2 * 60 * 60 * 1000); // 2 hours

    const newOrder: Order = {
      id,
      items,
      total,
      status: 'pending',
      createdAt: now,
      expiresAt,
      deliveryEmail,
      recipientEmail,
    };

    // Optimistic update
    setOrders(prev => [newOrder, ...prev]);

    if (profile?.id) {
      try {
        const insertData = {
          user_id: profile.id,
          order_id: id,
          items: JSON.parse(JSON.stringify(items)),
          total,
          status: 'pending' as const,
          delivery_email: deliveryEmail || null,
          recipient_email: recipientEmail || null,
          expires_at: new Date(expiresAt).toISOString(),
        };

        const { error } = await supabase
          .from('orders')
          .insert([insertData]);

        if (error) {
          // Rollback on error
          setOrders(prev => prev.filter(o => o.id !== id));
          throw error;
        }
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    }

    return id;
  };

  const updateOrderStatus = async (id: string, status: 'pending' | 'completed' | 'canceled') => {
    const previousOrder = orders.find(o => o.id === id);
    
    // Optimistic update
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));

    if (profile?.id) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('order_id', id)
          .eq('user_id', profile.id);

        if (error) {
          // Rollback on error
          if (previousOrder) {
            setOrders(prev => prev.map(order => 
              order.id === id ? previousOrder : order
            ));
          }
          throw error;
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    }
  };

  const updateOrderPayment = async (id: string, paymentAddress: string, paymentCurrency: string) => {
    // Optimistic update
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, paymentAddress, paymentCurrency } : order
    ));

    if (profile?.id) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            payment_address: paymentAddress,
            payment_currency: paymentCurrency 
          })
          .eq('order_id', id)
          .eq('user_id', profile.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating order payment:', error);
      }
    }
  };

  const getFilteredOrders = (filter: 'all' | 'pending' | 'completed' | 'canceled') => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, updateOrderPayment, getFilteredOrders, loading }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
