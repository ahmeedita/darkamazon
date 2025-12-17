import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle, XCircle, Package, CreditCard, X } from 'lucide-react';
import { TorLogo } from '@/components/TorLogo';
import { useOrders, Order } from '@/contexts/OrderContext';
import { CryptoPaymentModal } from '@/components/CryptoPaymentModal';
import { releaseCards } from '@/lib/cardGenerator';
import { toast } from 'sonner';

type FilterType = 'all' | 'pending' | 'completed' | 'canceled';

interface PaymentDetails {
  crypto: string;
  address: string;
  expiresAt: string;
}

export default function Orders() {
  const { getFilteredOrders, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState<FilterType>('all');
  const [, setTick] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  // Force re-render every second for countdown updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const orders = getFilteredOrders(filter);

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Canceled</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleResumePayment = (order: Order) => {
    // Try to get stored payment details
    const storedPayment = localStorage.getItem(`payment_${order.id}`);
    if (storedPayment) {
      setPaymentDetails(JSON.parse(storedPayment));
    } else {
      setPaymentDetails(null);
    }
    setSelectedOrder(order);
  };

  const handleCancelOrder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    releaseCards(order.id);
    updateOrderStatus(order.id, 'canceled');
    localStorage.removeItem(`payment_${order.id}`);
    toast.success('Order canceled successfully');
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'canceled', label: 'Canceled' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <TorLogo className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <h1 className="font-display text-lg md:text-2xl font-bold text-primary">torbuy</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Premium Marketplace</p>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-border text-xs md:text-sm" size="sm">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
              My Orders
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Track your order status and payment confirmation
            </p>
          </div>

          <div className="flex justify-center mb-6 md:mb-8">
            <div className="flex flex-wrap justify-center gap-1 bg-card rounded-lg p-1 border border-border">
              {filterButtons.map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => setFilter(key)}
                  variant={filter === key ? 'default' : 'ghost'}
                  className={`${filter === key ? 'btn-gold' : 'text-muted-foreground hover:text-foreground'} text-xs md:text-sm px-2 md:px-3`}
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {orders.length === 0 ? (
            <Card className="card-premium p-12 text-center max-w-md mx-auto">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No Orders Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${filter} orders found.`}
              </p>
              <Link to="/">
                <Button className="btn-gold">Start Shopping</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {orders.map(order => (
                <Card 
                  key={order.id} 
                  className={`card-premium p-6 ${order.status === 'pending' ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
                  onClick={() => order.status === 'pending' && handleResumePayment(order)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm text-foreground">{order.id.slice(0, 20)}...</p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} {item.details && `(${item.details})`}
                          </span>
                          <span className="text-primary font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-display text-xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs border-red-500/50 text-red-500 hover:bg-red-500/10"
                            onClick={(e) => handleCancelOrder(order, e)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            className="btn-gold text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumePayment(order);
                            }}
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Complete Payment
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-500">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono text-lg font-bold">
                            {getTimeRemaining(order.expiresAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to resume payment
                        </p>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="text-right">
                        <p className="text-sm text-green-500 font-medium">Payment Confirmed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {order.status === 'canceled' && (
                      <div className="text-right">
                        <p className="text-sm text-red-500 font-medium">Order Canceled</p>
                        <p className="text-xs text-muted-foreground">
                          Payment not received in time
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal for resuming payment */}
      {selectedOrder && (
        <CryptoPaymentModal
          isOpen={!!selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setPaymentDetails(null);
          }}
          total={selectedOrder.total}
          orderId={selectedOrder.id}
          onPaymentInitiated={() => {
            setSelectedOrder(null);
            setPaymentDetails(null);
          }}
          deliveryEmail=""
          initialCrypto={paymentDetails?.crypto}
          initialAddress={paymentDetails?.address}
          initialExpiresAt={paymentDetails?.expiresAt}
        />
      )}
    </div>
  );
}