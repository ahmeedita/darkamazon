import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from './CartContext';
import { releaseCards } from '@/lib/cardGenerator';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'canceled';
  createdAt: number;
  expiresAt: number;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, orderId?: string) => string;
  updateOrderStatus: (id: string, status: 'pending' | 'completed' | 'canceled') => void;
  getFilteredOrders: (filter: 'all' | 'pending' | 'completed' | 'canceled') => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'darkAmazon_orders';
const EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Check for expired orders and update them
  useEffect(() => {
    const checkExpiredOrders = () => {
      const now = Date.now();
      setOrders(prev => {
        const updated = prev.map(order => {
          if (order.status === 'pending' && order.expiresAt <= now) {
            // Release cards back to marketplace when order expires
            releaseCards(order.id);
            return { ...order, status: 'canceled' as const };
          }
          return order;
        });
        return updated;
      });
    };

    // Check immediately
    checkExpiredOrders();

    // Check every minute
    const interval = setInterval(checkExpiredOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (items: CartItem[], total: number, orderId?: string): string => {
    const now = Date.now();
    const id = orderId || `order_${now}_${Math.random().toString(36).substr(2, 9)}`;
    const newOrder: Order = {
      id,
      items,
      total,
      status: 'pending',
      createdAt: now,
      expiresAt: now + EXPIRY_TIME,
    };
    setOrders(prev => [newOrder, ...prev]);
    return id;
  };

  const updateOrderStatus = (id: string, status: 'pending' | 'completed' | 'canceled') => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
  };

  const getFilteredOrders = (filter: 'all' | 'pending' | 'completed' | 'canceled') => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, getFilteredOrders }}>
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
