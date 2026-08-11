import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface PhysicalCardProps {
  product: { id: string; value: number; price: number };
}

export function PhysicalCard({ product }: PhysicalCardProps) {
  const { addItem, items } = useCart();
  const isInCart = items.some((item) => item.id === product.id);

  const handleAdd = () => {
    if (isInCart) return toast.error('This physical card is already in your cart');
    addItem({
      id: product.id,
      type: 'physical',
      name: `Physical Card - $${product.value.toLocaleString()} balance`,
      price: product.price,
      details: 'Ships to your address after payment',
    });
    toast.success('Physical card added to cart');
  };

  return (
    <Card className="card-premium p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <Badge className="bg-primary/10 text-primary border-primary/30">Physical Card</Badge>
        </div>
        <span className="font-display text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
        <img src="/physical-card.png" alt="Physical torbuy card" className="mx-auto h-32 w-full rounded-lg object-cover" />
        <p className="mt-3 font-semibold text-foreground">${product.value.toLocaleString()} loaded balance</p>
        <p className="mt-1 text-sm text-muted-foreground">Physical delivery with address verification</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" /> Shipping address required at checkout
      </div>
      <Button onClick={handleAdd} disabled={isInCart} className={`w-full ${isInCart ? 'bg-muted text-muted-foreground' : 'btn-gold'}`}>
        <ShoppingCart className="mr-2 h-5 w-5" />{isInCart ? 'In Cart' : 'Add to Cart'}
      </Button>
    </Card>
  );
}
