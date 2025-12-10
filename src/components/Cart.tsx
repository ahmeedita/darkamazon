import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, CreditCard, Gift, Banknote, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { toast } from 'sonner';
import { CryptoPaymentModal } from './CryptoPaymentModal';

export function Cart() {
  const { items, removeItem, clearCart, total, itemCount } = useCart();
  const { addOrder } = useOrders();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentOrderId(orderId);
    
    // Create order with pending status
    addOrder([...items], total);
    
    // Show crypto payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentInitiated = () => {
    setIsCheckingOut(true);
    
    // Clear cart after payment initiated
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
    }, 1000);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'giftcard':
        return <Gift className="w-5 h-5 text-primary" />;
      case 'transfer':
        return <Banknote className="w-5 h-5 text-primary" />;
      default:
        return <CreditCard className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="relative text-foreground hover:text-primary">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-card border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-foreground font-display flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm">Add items to get started</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        {item.details && (
                          <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full btn-gold text-lg py-6"
                  >
                    {isCheckingOut ? 'Processing...' : 'Pay with Crypto'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="w-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Secure crypto payment • Instant delivery after confirmation
                  </p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CryptoPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        orderId={currentOrderId}
        onPaymentInitiated={handlePaymentInitiated}
      />
    </>
  );
}
