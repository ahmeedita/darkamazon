import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Banknote, DollarSign, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface MoneyTransferProps {
  product: {
    id: string;
    provider: string;
    value: number;
    price: number;
    tier: 'transfer';
  };
}

export function MoneyTransfer({ product }: MoneyTransferProps) {
  const { addItem } = useCart();

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'paypal': return 'text-blue-500';
      case 'western union': return 'text-yellow-500';
      case 'moneygram': return 'text-red-500';
      case 'cash app': return 'text-green-500';
      default: return 'text-primary';
    }
  };

  const getProviderBg = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'paypal': return 'bg-blue-500/10';
      case 'western union': return 'bg-yellow-500/10';
      case 'moneygram': return 'bg-red-500/10';
      case 'cash app': return 'bg-green-500/10';
      default: return 'bg-primary/10';
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      type: 'transfer',
      name: `${product.provider} Transfer`,
      price: product.price,
      details: `Value: $${product.value}`,
    });
    toast.success('Added to cart!');
  };

  return (
    <Card className="card-premium p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Banknote className={`w-5 h-5 ${getProviderColor(product.provider)}`} />
          <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
            Money Transfer
          </Badge>
        </div>
        <span className="font-display text-xl font-bold text-primary">
          ${product.price}
        </span>
      </div>

      <div className="space-y-4">
        <div className={`text-center py-6 ${getProviderBg(product.provider)} rounded-lg`}>
          <Banknote className={`w-12 h-12 mx-auto mb-3 ${getProviderColor(product.provider)}`} />
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">
            {product.provider}
          </h3>
          <p className="text-muted-foreground">Money Transfer</p>
        </div>

        <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Transfer Value:</span>
          </div>
          <span className="font-display text-2xl font-bold text-green-500">
            ${product.value}
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You pay only <span className="text-primary font-bold">${product.price}</span> for a <span className="text-green-500 font-bold">${product.value}</span> transfer
          </p>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full btn-gold text-lg py-3"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Add to Cart
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Processed within 24 hours
      </p>
    </Card>
  );
}
