import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, MapPin, Building, Calendar, Shield, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    bin: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    bank: string;
    country: string;
    balance: string;
    price: number;
    successRate: number;
    tier: 'basic' | 'standard' | 'premium';
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { addItem } = useCart();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'success-high';
      case 'standard': return 'success-medium';
      case 'basic': return 'success-low';
      default: return 'success-low';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'premium': return 'Premium';
      case 'standard': return 'Standard';
      case 'basic': return 'Basic';
      default: return 'Basic';
    }
  };

  const getPrice = (tier: string) => {
    switch (tier) {
      case 'premium': return 30;
      case 'standard': return 19.99;
      case 'basic': return 15;
      default: return 15;
    }
  };

  const handleAddToCart = () => {
    const price = getPrice(product.tier);
    addItem({
      id: product.id,
      type: 'card',
      name: `${getTierLabel(product.tier)} Card - ${product.bank}`,
      price: price,
      details: `${product.country} • ${product.balance}`,
    });
    toast.success('Added to cart!');
  };

  return (
    <Card className="card-premium p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <Badge className={`${getTierColor(product.tier)} bg-transparent border-current`}>
            {getTierLabel(product.tier)} - {product.successRate}%
          </Badge>
        </div>
        <span className="font-display text-xl font-bold text-primary">
          ${getPrice(product.tier).toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Card Details</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary hover:text-accent"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {showDetails ? (
          <div className="bg-muted/30 p-4 rounded-lg space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BIN:</span>
              <span className="text-foreground font-medium">{product.bin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry:</span>
              <span className="text-foreground font-medium">{product.expiryMonth}/{product.expiryYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CVV:</span>
              <span className="text-foreground font-medium">{product.cvv}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click to reveal card details</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{product.bank}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{product.country}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Balance: {product.balance}</span>
          </div>
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
        Instant delivery after checkout
      </p>
    </Card>
  );
}